/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'jquery.sap.global',
        'nrg/base/type/Price',
        'sap/ui/core/routing/HashChanger',
        "sap/ui/model/json/JSONModel",
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/quickpay/view/QuickPayPopup'
    ],

    function (CoreController, jQuery, price, HashChanger, JSONModel, Filter, FilterOperator, QuickPayControl) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.Extension');

        Controller.prototype.onInit = function () {
        };


        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxContextManager().getContext().oData;

            this.resetInfo();
            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;
            this._isExt = oRouteInfo.isExt;

            this.getView().setModel(this.getOwnerComponent().getModel('comp-dppext'), 'oDataSvc');

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
                ChangeCL : ""
            }), 'oLocalModel');

            this._initScrnControl();
            this._isExtElgble();

        };
        Controller.prototype.resetInfo = function () {
            var oContactLogArea = this.getView().byId('idnrgBilling-extDenCL');
            oContactLogArea.setValue("");
        };
        Controller.prototype.onAfterRendering = function () {
            this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
            this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
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
                aFilterIds;

            sPath = "/ExtElgbles('" + this._coNum + "')";
            oParameters = {
                success : function (oData) {
                    if (oData) {
                        oData.NewExtActive = oData.ExtActive;
                        this.getView().getModel('oExtEligible').setData(oData);
                        if (this.getView().getModel('oExtEligible').getProperty('/ExtActive')) {
                            this._selectScrn('EXTDisplay');
                        } else {
                            if (this.getView().getModel('oExtEligible').getProperty('/EligibleYes')) {
                                this._selectScrn('EXTGrant');
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
        };

        Controller.prototype._onExtChangeClick = function () {
            //Show Ext Edit Screen
            if (this.getView().getModel('oExtEligible').getProperty('/EligibleYes')) {
                this._selectScrn('EXTChange');
            } else {
                this._selectScrn('EXTDenied');
            }
        };
        Controller.prototype._onExtReasonSelect = function (oEvent) {
            this._extReason = oEvent.mParameters.Reason;
        };
        Controller.prototype._onMain = function (oEvent) {
            if (this._coNum) {
                this.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };
        Controller.prototype._onCheckbook = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
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
                i;

            sPath = '/ExtReasons';
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oExtExtReasons').setData(oData);
                        this.getView().getModel('oExtExtReasons').setProperty('/selectedKey', '2800');
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
                oLocalModel = this.getView().getModel('oLocalModel');

            aFilterIds = ["Contract"];
            aFilterValues = [this._coNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sPath = '/Extensions';//(ContractAccountNumber=\'' + this._caNum + '\',ExtActive=false)/ExtensionSet';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    var iCount = 0;
                    if (oData && oData.results) {
                        this.getView().getModel('oExtExtensions').setData(oData);
                        this.getView().getModel('oExtExtensions').setProperty('/results/0/iDwnPay', 0);
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
                sNewDateSelected;

            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').getValue();

            } else {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').getValue();
            }
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
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'Please change a date or select Cancel to end the transaction.'
                        });
                        return;
                    }
                    if (sCurrentOpenItemDate.getTime() > sNewDateSelected.getTime()) {
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'Deferral date is before due date.'
                        });
                        return;
                    }
                }
            }
            if (oEligble.getProperty('/ExtPending')) {
                if (oExt.getProperty('/results/0/iDwnPay') === 0) {
                    _popupCallback = function (sAction) {
                        switch (sAction) {
                        case ute.ui.main.Popup.Action.Yes:
                            that._postExtRequest();
                            break;
                        case ute.ui.main.Popup.Action.No:
                            that._onCheckbook();
                            break;
                        case ute.ui.main.Popup.Action.Ok:
                            break;
                        }
                    };
                    ute.ui.main.Popup.Confirm({
                        title: 'PENDING EXTENSION',
                        message: 'Customer already has a pending extension. Would you like to continue?',
                        callback: _popupCallback
                    });

                }
                if (oExt.getProperty('/results/0/iDwnPay') > 0) {
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Customer already has a pending extension'
                    });
                }
            } else {

                that._postExtRequest();
            }

        };
        Controller.prototype._postExtRequest = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oPost = this.getView().getModel('oExtPostRequest'),
                oExt = this.getView().getModel('oExtExtensions'),
                oEligble = this.getView().getModel('oExtEligible'),
                oReason = this.getView().getModel('oExtExtReasons'),
                sDwnPayDate = this.getView().byId('nrgBilling-ext-dwnPayDueDate-id').getValue(),
                sDwnPayValue,
                sPath,
                oParameters,
                oDataObject = {},
                that = this,
                sContactLogArea,
                sNewDateSelected,
                oLocalModel = this.getView().getModel('oLocalModel'),
                bValidate = false;

            bValidate = this._handleExtDateChange();
            if (!bValidate) {
                return;
            }
            if (this.getView().getModel('oDppScrnControl').getProperty("/EXTGrant")) {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtGrantDate-id').getValue();
                sContactLogArea = oLocalModel.getProperty("/GrantCL");
            } else {
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtChangeDate-id').getValue();
                sContactLogArea = oLocalModel.getProperty("/ChangeCL");
            }

            oDataObject.Contract = this._coNum;
            oDataObject.BP = this._bpNum;
            oDataObject.CA = this._caNum;
            oDataObject.Message = (sContactLogArea || "");
            oDataObject.DefDtNew = new Date(sNewDateSelected);
            if (this._bOverRide) {
                oDataObject.OverRide  = 'X';
            } else {
                oDataObject.OverRide  = '';
            }
            oDataObject.DwnPay  = oExt.getProperty('/results/0/iDwnPay');
            if (oDataObject.DwnPay || oDataObject.DwnPay === 0) {
                oDataObject.DwnPay = oDataObject.DwnPay.toString();
            }
            if (sDwnPayDate) {
                oDataObject.DwnPayDate = new Date(sDwnPayDate);
            }
            if (oReason.getProperty("/selectedKey")) {
                oDataObject.ExtReason = oReason.getProperty("/selectedKey");
            }
            if (this._extReason) {
                oDataObject.ExtReason = this._extReason;
            }
            oDataObject.ExtActive = false;
            sPath = '/ExtConfs';

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData) {
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
                            message: oData.Message
                        });
                        if (!oData.Error) {
                            that._onCheckbook();
                        }
                    }
                }.bind(this),
                error: function (oError) {
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

        return Controller;
    }
);
