/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'nrg/base/type/Price',
        "sap/ui/model/json/JSONModel",
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/quickpay/view/QuickPayPopup',
        'nrg/module/billing/view/EligPopup'
    ],

    function (CoreController, price, JSONModel, Filter, FilterOperator, QuickPayControl, EligPopup) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.Extension');

        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxContextManager().getContext().oData;

            this.resetInfo();
            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;
            this._isExt = oRouteInfo.isExt;

            this.getView().setModel(this.getOwnerComponent().getModel('comp-dppext'), 'oDataSvc');
            this.getView().setModel(this.getOwnerComponent().getModel('comp-eligibility'), 'oDataEligSvc');
            // Model for eligibility alerts
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');
            //Model for screen control
            this.getView().setModel(new JSONModel(), 'oDppScrnControl');

            //Model for Ext Function (EXT Step I)
            this.getView().setModel(new JSONModel(), 'oExtEligible');
            this.getView().setModel(new JSONModel(), 'oExtExtensions');
            this.getView().setModel(new JSONModel(), 'oExtExtReasons');
            this.getView().setModel(new JSONModel(), 'oExtPostRequest');
            this.getView().setModel(new JSONModel({
                extDate : "",
                GrantCL : "",
                DeniedCL : "",
                ChangeCL : "",
                reason : "0000",
                pendingFlag1 : true,
                pendingFlag2 : false
            }), 'oLocalModel');

            this._initScrnControl();
            this._isExtElgble();
            this._retrieveNotification();

        };
        Controller.prototype.resetInfo = function () {
            var oContactLogArea = this.getView().byId('idnrgBilling-extDenCL');
            oContactLogArea.setValue("");
            this.getView().byId('nrgBilling-ext-dwnPayDueCreateDate-id').setValue("");
            this.getView().byId('nrgBilling-ext-dwnPayDueDate-id').setValue("");
            this.getView().byId('idnrgBillingGrantReason').removeAllContent();
            this.getView().byId('idnrgBillingChangeReason').removeAllContent();
            this._ExtensionSelected = "0000";
        };
        Controller.prototype.onAfterRendering = function () {
            this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
            this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
            this.getView().byId('nrgBilling-ext-dwnPayDueCreateDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
            this.getView().byId('nrgBilling-ext-dwnPayDueDate-id').attachBrowserEvent('select', this._handleDownPaymentDate, this);
        };

        /****************************************************************************************************************/
        //Init Functions
        /****************************************************************************************************************/
        Controller.prototype._initScrnControl = function () {
            var oScrnControl = this.getView().getModel('oDppScrnControl');

            oScrnControl.setProperty('/EXTGrant', false);
            oScrnControl.setProperty('/EXTDisplay', false);
            oScrnControl.setProperty('/EXTDenied', false);
            oScrnControl.setProperty('/EXTChange', false);
        };

        Controller.prototype._onDownPayment = function (oEvent) {
            var QuickControl = new QuickPayControl(),
                that = this;

            this.getView().addDependent(QuickControl);
            QuickControl.openQuickPay(this._coNum, this._bpNum, this._caNum);
            QuickControl.attachEvent("PaymentCompleted", function () {
                that._retrExtensions();
            }, this);

        };
        Controller.prototype._selectScrn = function (sSelectedScrn) {
            var oScrnControl = this.getView().getModel('oDppScrnControl');

            oScrnControl.setProperty('/EXTGrant', false);
            oScrnControl.setProperty('/EXTDisplay', false);
            oScrnControl.setProperty('/EXTDenied', false);
            oScrnControl.setProperty('/EXTChange', false);
            oScrnControl.setProperty('/' + sSelectedScrn, true);
            if (sSelectedScrn === 'EXTGrant') {
                this._retrExtReasons();
                this._retrExtensions();
            } else if (sSelectedScrn === 'EXTDisplay') {
                this._retrExtensions();
            } else if (sSelectedScrn === 'EXTChange') {
                this._retrExtReasons();
                this._retrExtensions();
            } else if (sSelectedScrn === 'EXTDenied') {
                this._retrExtensions();
            } else {
                return;
            }
        };

        Controller.prototype._isExtElgble = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                aFilters,
                aFilterValues,
                aFilterIds,
                oLocalModel = this.getView().getModel('oLocalModel');

            sPath = "/ExtElgbles('" + this._coNum + "')";
            oParameters = {
                success : function (oData) {
                    if (oData) {
                        oData.NewExtActive = oData.ExtActive;
                        oLocalModel.setProperty("/pendingFlag1", !oData.ExtPending);
                        oLocalModel.setProperty("/pendingFlag2", oData.ExtPending);
                        this.getView().getModel('oExtEligible').setData(oData);
                        if (this.getView().getModel('oExtEligible').getProperty('/ExtActive')) {
                            this._selectScrn('EXTDisplay');
                        } else {
                            if (this.getView().getModel('oExtEligible').getProperty('/EligibleYes')) {
                                if (this.getView().getModel('oExtEligible').getProperty('/ExtPending')) {
                                    this._selectScrn('EXTDisplay');
                                } else {
                                    this._selectScrn('EXTGrant');
                                }
                            } else {
                                this._selectScrn('EXTDenied');
                            }
                        }

                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc && this._coNum) {
                oODataSvc.read(sPath, oParameters);
            }
        };


        /****************************************************************************************************************/
        //Handler
        /****************************************************************************************************************/


        Controller.prototype._onExtDisplayOkClick = function () {    //Navigate to Checkbook if 'OK' is clicked
            this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
        };
        Controller.prototype._onExtDeniedOkClick = function () {    //Navigate to DPP setup if 'OK' is clicked
            var oModel = this.getOwnerComponent().getModel("comp-dppext"),
                that = this,
                oLocalModel = this.getView().getModel("oLocalModel");
            oModel.create("/ExtDeniedS", {
                "Contract": this._coNum,
                "ContAccount": this._caNum,
                "Partner" : this._bpNum,
                "Message" : (oLocalModel.getProperty("/DeniedCL") || "")
            }, {
                success : function (oData, oResponse) {
                    if (oData) {
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
                            message: oData.Message
                        });
                        that.navTo('billing.CheckBook', {bpNum: that._bpNum, caNum: that._caNum, coNum: that._coNum});
                    }
                },
                error : function (oError) {
                }
            });
        };

        Controller.prototype._onExtOverrideClick = function () {
            if (this.getView().getModel('oExtEligible').getProperty('/ExtActive')) {
                this._selectScrn('EXTChange');
            } else {
                this._selectScrn('EXTGrant');
            }
            this._bOverRide = true;
        };

        Controller.prototype._onExtChangeClick = function () {
            //Show Ext Edit Screen
            if (this.getView().getModel('oExtEligible').getProperty('/EligibleYes')) {
                this._selectScrn('EXTChange');
            } else {
                this._selectScrn('EXTDenied');
            }
        };
        Controller.prototype._onMain = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.BillingInfo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.BillingInfoNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };
        Controller.prototype._onCheckbook = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        Controller.prototype._handleDownPaymentDate = function (oEvent) {
            var oExtDownPayDate;
            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                oExtDownPayDate = this.getView().byId('nrgBilling-dpp-ExtGrantDate-id');

            } else {
                oExtDownPayDate = this.getView().byId('nrgBilling-dpp-ExtChangeDate-id');
            }

        };
        Controller.prototype._handleExtDateChange = function (oEvent) {
            var extDate,
                oExtensions = this.getView().getModel('oExtExtensions'),
                i,
                oLocalModel = this.getView().getModel('oLocalModel'),
                currentDate,
                total_days,
                oExtDiffDate,
                oEligble = this.getView().getModel('oExtEligible'),
                bReturn = true;

            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                oExtDiffDate = this.getView().byId('nrgBilling-dpp-ExtGrantDate-id');

            } else {
                oExtDiffDate = this.getView().byId('nrgBilling-dpp-ExtChangeDate-id');
            }
            extDate = new Date(oExtDiffDate.getValue());
            currentDate = new Date();
            extDate.setHours(currentDate.getHours());
            total_days = (extDate - currentDate) / (1000 * 60 * 60 * 24);
            if (Math.ceil(total_days) > 60) {
                ute.ui.main.Popup.Alert({
                    title: 'Extension',
                    message: 'Please correct Deferral Date. Extensions can be granted for no more than 60 calendar days beyond the current date.'
                });
                oExtDiffDate.setValue(oLocalModel.getProperty("/extDate"));
                extDate = oLocalModel.getProperty("/extDate");
                bReturn = false;
            }
            if (!oEligble.getProperty('/ExtActive')) {
                for (i = 0; i < oExtensions.oData.results.length; i = i + 1) {
                    oExtensions.setProperty('/results/' + i + '/OpenItems/DefferalDate', extDate);
                }
            }
            return bReturn;
        };

        /****************************************************************************************************************/
        //OData Call
        /****************************************************************************************************************/



        Controller.prototype._retrExtReasons = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i,
                oEligible = this.getView().getModel('oExtEligible');

            sPath = '/ExtReasons';
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oExtExtReasons').setData(oData);
                        if (this.getView().getModel('oExtEligible').getProperty('/ExtActive')) {
                            this.getView().byId('idnrgBillingChangeReason').setSelectedKey("0000");
                        } else {
                            this.getView().byId('idnrgBillingGrantReason').setSelectedKey("0000");
                        }
                    }
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrExtensions = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i,
                extDate,
                aFilters,
                aFilterValues,
                aFilterIds,
                that = this,
                oLocalModel = this.getView().getModel('oLocalModel'),
                sDwnPayValue;

            aFilterIds = ["Contract"];
            aFilterValues = [this._coNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sPath = '/Extensions';//(ContractAccountNumber=\'' + this._caNum + '\',ExtActive=false)/ExtensionSet';
            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPayGrantvalue-id');
            } else {
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPaychangevalue-id');
            }
            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    var iCount = 0;
                    if (oData && oData.results) {
                        this.getView().getModel('oExtExtensions').setData(oData);
                        if (sDwnPayValue) {
                            sDwnPayValue.setValue("0");
                        }
                        for (iCount = 0; iCount < oData.results.length; iCount = iCount + 1) {
                            if ((oData.results[iCount]) && (oData.results[iCount].OpenItems) && (oData.results[iCount].OpenItems.DefferalDate)) {
                                extDate = this._formatInvoiceDate(oData.results[iCount].OpenItems.DefferalDate.getDate(), oData.results[iCount].OpenItems.DefferalDate.getMonth() + 1, oData.results[iCount].OpenItems.DefferalDate.getFullYear());
                                oLocalModel.setProperty("/extDate", extDate);
                                break;
                            }
                        }
                        if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                            this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').setDefaultDate(extDate);
                        } else {
                            this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').setDefaultDate(extDate);
                        }
                    }
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };
        Controller.prototype._formatInvoiceDate = function (day, month, year) {
            // Pad the date and month
            if (day < 10) {day = '0' + day; }
            if (month < 10) {month = '0' + month; }
            // Format the startDate
            return month + '/' + day + '/' + year;
        };
        Controller.prototype._onExtConfirmClick = function () {
            //Send the Extension request out.
            var oEligble = this.getView().getModel('oExtEligible'),
                oExt = this.getView().getModel('oExtExtensions'),
                _popupCallback,
                that = this,
                sCurrentOpenItemDate = oExt.getProperty('/results/0/OpenItems/DefferalDate'),
                sNewDateSelected,
                bValidate = this._handleExtDateChange(),
                sDwnPayDate,
                sDwnPayValue,
                currentDate,
                total_days,
                oLocalModel = this.getView().getModel("oLocalModel"),
                oScrnControl = this.getView().getModel('oDppScrnControl'),
                sTempDate,
                oReason;


            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            if (!bValidate) {
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
                return;
            }
            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').getValue();
                sDwnPayDate = this.getView().byId('nrgBilling-ext-dwnPayDueCreateDate-id').getValue();
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPayGrantvalue-id').getValue();
                if (!sDwnPayValue) {
                    this.getView().byId('nrgBilling-ext-dwnPayGrantvalue-id').setValue("0");
                    sDwnPayValue = "0";
                }
                oReason = this.getView().byId('idnrgBillingGrantReason');
            } else {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').getValue();
                sDwnPayDate = this.getView().byId('nrgBilling-ext-dwnPayDueDate-id').getValue();
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPaychangevalue-id').getValue();
                if (!sDwnPayValue) {
                    this.getView().byId('nrgBilling-ext-dwnPaychangevalue-id').setValue("0");
                    sDwnPayValue = "0";
                }
                oReason = this.getView().byId('idnrgBillingChangeReason');
            }
            if (oReason.getSelectedKey() === "0000") {
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
                ute.ui.main.Popup.Alert({
                    title: 'Extension',
                    message: 'Please select a reason.'
                });
                return;
            }
            sTempDate = sDwnPayDate;
            if (!sCurrentOpenItemDate) {
                sCurrentOpenItemDate = oExt.getProperty('/results/1/OpenItems/DefferalDate');
            }

            if (sCurrentOpenItemDate && sNewDateSelected) {
                sCurrentOpenItemDate = new Date(sCurrentOpenItemDate);
                if (sCurrentOpenItemDate) {
                    sCurrentOpenItemDate.setHours("00");
                    sCurrentOpenItemDate.setMinutes("00");
                    sCurrentOpenItemDate.setSeconds("00");
                }
                sNewDateSelected = new Date(sNewDateSelected);
                if (sNewDateSelected) {
                    sNewDateSelected.setHours("00");
                    sNewDateSelected.setMinutes("00");
                    sNewDateSelected.setSeconds("00");
                }
                if (oEligble.getProperty('/ExtActive')) {
                    if (sCurrentOpenItemDate.getTime() === sNewDateSelected.getTime()) {
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
                            message: 'Please change a date or select Cancel to end the transaction.'
                        });
                        return;
                    }
                }
                if (sCurrentOpenItemDate.getTime() > sNewDateSelected.getTime()) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Extension',
                        message: 'Deferral date is before due date.'
                    });
                    return;
                }

            }
            if ((!isNaN(parseFloat(sDwnPayValue)) && isFinite(sDwnPayValue)) && (parseInt(sDwnPayValue, 10) > 0)) {
                if (!sDwnPayDate) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Extension',
                        message: 'Down Payment Date needs to be filled'
                    });
                    return;
                }
            }
            if (sDwnPayDate) {
                sDwnPayDate = new Date(sDwnPayDate);
                currentDate = new Date();
                sDwnPayDate.setHours(currentDate.getHours());
                total_days = (sDwnPayDate - currentDate) / (1000 * 60 * 60 * 24);
                if (Math.ceil(total_days) > 14) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Extension',
                        message: 'Due date should be less than 2 weeks in future.'
                    });
                    return;
                }
            }
            if (oEligble.getProperty('/ExtPending')) {
                if ((!isNaN(parseFloat(sDwnPayValue)) && isFinite(sDwnPayValue)) && (parseInt(sDwnPayValue, 10) === 0)) {
                    _popupCallback = function (sAction) {
                        switch (sAction) {
                        case ute.ui.main.Popup.Action.Yes:
                            that.getOwnerComponent().getCcuxApp().setOccupied(true);
                            that._postExtRequest();
                            break;
                        case ute.ui.main.Popup.Action.No:
                            that._onCheckbook();
                            break;
                        case ute.ui.main.Popup.Action.Ok:
                            break;
                        }
                    };
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Confirm({
                        title: 'Extension',
                        message: 'Customer already has a pending extension. Would you like to continue?',
                        callback: _popupCallback
                    });
                    return;
                }
                if ((!isNaN(parseFloat(sDwnPayValue)) && isFinite(sDwnPayValue)) && (parseInt(sDwnPayValue, 10) > 0)) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Extension',
                        message: 'Customer already has a pending extension'
                    });
                    return;
                }
            }
            that._postExtRequest();


        };
        Controller.prototype._postExtRequest = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oPost = this.getView().getModel('oExtPostRequest'),
                oExt = this.getView().getModel('oExtExtensions'),
                oEligble = this.getView().getModel('oExtEligible'),
                oReason,
                sDwnPayDate,
                sDwnPayValue,
                sPath,
                oParameters,
                oDataObject = {},
                that = this,
                sContactLogArea,
                sNewDateSelected,
                oLocalModel = this.getView().getModel('oLocalModel');

            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').getValue();
                sContactLogArea = oLocalModel.getProperty("/GrantCL");
                sDwnPayDate = this.getView().byId('nrgBilling-ext-dwnPayDueCreateDate-id').getValue();
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPayGrantvalue-id').getValue();
                oReason = this.getView().byId('idnrgBillingGrantReason');
            } else {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').getValue();
                sContactLogArea = oLocalModel.getProperty("/ChangeCL");
                sDwnPayDate = this.getView().byId('nrgBilling-ext-dwnPayDueDate-id').getValue();
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPaychangevalue-id').getValue();
                oReason = this.getView().byId('idnrgBillingChangeReason');
            }

            oDataObject.Contract = this._coNum;
            oDataObject.BP = this._bpNum;
            oDataObject.CA = this._caNum;
            oDataObject.Message = (sContactLogArea || "");
            oDataObject.DefDtNew = new Date(sNewDateSelected);
            if (this._bOverRide) {
                oDataObject.OverRide  = 'X';
            } else {
                oDataObject.OverRide  = 'N';
            }
            oDataObject.DwnPay  = sDwnPayValue;
            if (oDataObject.DwnPay || oDataObject.DwnPay === 0) {
                oDataObject.DwnPay = oDataObject.DwnPay.toString();
            }
            if (sDwnPayDate) {
                oDataObject.DwnPayDate = new Date(sDwnPayDate);
            }
            if (oReason.getSelectedKey()) {
                oDataObject.ExtReason = oReason.getSelectedKey();
            }
            oDataObject.ExtActive = false;
            sPath = '/ExtConfs';

            oParameters = {
                merge: false,
                success : function (oData) {
                    var sTempMsg = "";
                    if (oData) {
                        if (oData.DwnPymntMsg) {
                            sTempMsg = oData.DwnPymntMsg;
                        }
                        if (oData.Message) {
                            sTempMsg = sTempMsg + ';  ' + oData.Message;
                        }
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
                            message: sTempMsg
                        });
                        if (!oData.Error) {
                            that._onCheckbook();
                        }
                    }
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Extension',
                        message: 'Extension request failed'
                    });
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.create(sPath, oDataObject, oParameters);
            }

        };
        Controller.prototype._onEXTConfCancelClick = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };
        /****************************************************************************************************************/
        //Formatter
        /****************************************************************************************************************/

        Controller.prototype._isOdd = function (iIndex) {
            if (iIndex % 2 === 0) {
                return false;
            } else {
                return true;
            }
        };

        Controller.prototype._isEven = function (iIndex) {
            if (iIndex % 2 === 0) {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._formatDate = function (oDate) {
            var sFormattedDate;

            if (!oDate) {
                return null;
            } else {
                sFormattedDate = (oDate.getMonth() + 1).toString() + '/' + oDate.getDate().toString() + '/' + oDate.getFullYear().toString().substring(2, 4);
                return sFormattedDate;
            }
        };


        Controller.prototype._createSearchFilterObject = function (aFilterIds, aFilterValues, sFilterOperator) {
            var aFilters = [],
                iCount;
            if (!sFilterOperator) {
                sFilterOperator = FilterOperator.EQ;
            }
            if (aFilterIds !== undefined) {
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
                }
            }
            return aFilters;
        };
        /*-------------------------------------- Notificatiob Area (Jerry 11/18/2015) ---------------------------------------*/

        Controller.prototype._retrieveNotification = function () {
            var sPath = '/EligCheckS(\'' + this._coNum + '\')',
                oModel = this.getView().getModel('oDataEligSvc'),
                oEligModel = this.getView().getModel('oEligibility'),
                oParameters,
                alert,
                i;

            oParameters = {
                success : function (oData) {
                    oEligModel.setData(oData);
                    var container = this.getView().byId('idnrgBilling-ext-notifications');
                    if (container && container.getContent() && container.getContent().length > 0) {
                        container.removeAllContent();
                    }
                // If already has eligibility alerts, then skip
                    this._eligibilityAlerts = [];

                    // Check ABP
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.ABPElig) ? "Eligible for ABP" : "Not eligible for ABP",
                        linkPress: this._openEligABPPopup.bind(this)
                    });
                    this._eligibilityAlerts.push(alert);

                    // Check EXTN
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.EXTNElig) ? "Eligible for EXTN" : "Not eligible for EXTN",
                        linkPress: this._openEligEXTNPopup.bind(this)
                    });
                    this._eligibilityAlerts.push(alert);

                    // Check RBB
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.RBBElig) ? "Eligible for Retro-AB" : "Not eligible for Retro-AB",
                        linkPress: this._openEligRBBPopup.bind(this)
                    });
                    this._eligibilityAlerts.push(alert);

                    // Check DPP
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.DPPElig) ? "Eligible for DPP" : "Not eligible for DPP"
                    });

                    this._eligibilityAlerts.push(alert);

                    // Insert all alerts to DOM
                    for (i = 0; i < this._eligibilityAlerts.length; i = i + 1) {
                        this._eligibilityAlerts[i].placeAt(container);
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel && this._coNum) {
                oModel.read(sPath, oParameters);
            }
        };
        Controller.prototype._openEligABPPopup = function () {
            if (!this.EligABPPopupCustomControl) {
                this.EligABPPopupCustomControl = new EligPopup({ eligType: "ABP" });
                this.EligABPPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligABPPopupCustomControl);
                this.EligABPPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - AVERAGE BILLING PLAN');
            }
            this.EligABPPopupCustomControl.prepare();
        };

        Controller.prototype._openEligEXTNPopup = function () {
            if (!this.EligEXTNPopupCustomControl) {
                this.EligEXTNPopupCustomControl = new EligPopup({ eligType: "EXTN" });
                this.EligEXTNPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligEXTNPopupCustomControl);
                this.EligEXTNPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - EXTENSION');
            }
            this.EligEXTNPopupCustomControl.prepare();
        };

        Controller.prototype._openEligRBBPopup = function () {
            if (!this.EligRBBPopupCustomControl) {
                this.EligRBBPopupCustomControl = new EligPopup({ eligType: "RBB" });
                this.EligRBBPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligRBBPopupCustomControl);
                this.EligRBBPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - RETRO BILLING PLAN');
            }
            this.EligRBBPopupCustomControl.prepare();
        };
        return Controller;
    }
);
