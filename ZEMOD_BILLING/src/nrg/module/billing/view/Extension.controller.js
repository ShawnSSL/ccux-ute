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


            this._initScrnControl();
            this._startScrnControl();
        };

        Controller.prototype.onAfterRendering = function () {
            this.getView().byId('nrgBilling-dpp-ExtNewDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
            this.getView().byId('nrgBilling-dpp-DppStartDate-id').attachBrowserEvent('select', this._handleDppStartDateChange, this);
            this.getView().byId('nrgBilling-dpp-DppDueDate-id').attachBrowserEvent('select', this._handleDppFirstDueDateChange, this);
        };



        /****************************************************************************************************************/
        //Init Functions
        /****************************************************************************************************************/
        Controller.prototype._initScrnControl = function () {
            var oScrnControl = this.getView().getModel('oDppScrnControl');

            oScrnControl.setProperty('/EXTGrant', false);
            oScrnControl.setProperty('/EXTDenied', false);
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
        Controller.prototype._startScrnControl = function () {
            var oScrnControl = this.getView().getModel('oDppScrnControl'),
                oHashChanger = new HashChanger(),
				sUrlHash = oHashChanger.getHash(),
                aSplitHash = sUrlHash.split('/');
            this._isExtElgble();

            //oScrnControl.setProperty('/StepOne', true);
        };

        Controller.prototype._selectScrn = function (sSelectedScrn) {
            var oScrnControl = this.getView().getModel('oDppScrnControl');

            oScrnControl.setProperty('/EXTGrant', false);
            oScrnControl.setProperty('/EXTDenied', false);
            oScrnControl.setProperty('/' + sSelectedScrn, true);
            if (sSelectedScrn === 'EXTGrant') {
                this._retrExtReasons();
                this._retrExtensions();
            } else if (sSelectedScrn === 'EXTDenied') {
                this._retrExtensions();
            } else {
                return;
            }
        };

        /****************************************************************************************************************/
        //Formatter
        /****************************************************************************************************************/
        Controller.prototype._postiveXFormatter = function (cIndicator) {
            if (cIndicator === 'X' || cIndicator === 'x') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._negativeXFormatter = function (cIndicator) {
            if (cIndicator === 'X' || cIndicator === 'x') {
                return false;
            } else {
                return true;
            }
        };


        Controller.prototype._reverseBooleanFormatter = function (bIndicator) {
            return !bIndicator;
        };

        Controller.prototype._formatShowDownPayment = function (ExtOverride, bExtActive, EligibleYes) {
            if (EligibleYes) {
                if (bExtActive) {
                    return false;
                } else {
                    if (ExtOverride) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                if (ExtOverride) {
                    if (!bExtActive) { return true; } else { return false; }
                } else {
                    return false;
                }
            }

        };
        Controller.prototype._formatShowConfirm = function (ExtOverride, bExtActive, EligibleYes) {
            if (EligibleYes) {
                if (!bExtActive) { return true; } else { return false; }
            }
            if (ExtOverride) {
                if (!bExtActive) { return true; } else { return false; }
            } else {
                return false;
            }
        };
        Controller.prototype._formatShowChangeExt = function (ExtOverride, bExtActive, EligibleYes) {
            if (EligibleYes) {
                if (bExtActive) { return true; } else { return false; }
            }
            if (ExtOverride) {
                if (bExtActive) { return true; } else { return false; }
            } else {
                return false;
            }
        };

        Controller.prototype._formatShowChangDwnPmt = function (sDwnPay, bExtActive) {
            if (sDwnPay === 'X' || sDwnPay === 'x') {
                if (!bExtActive) { return true; } else { return false; }
            } else {
                return false;
            }
        };

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

        Controller.prototype._formatInvoiceDate = function (day, month, year) {
            // Pad the date and month
            if (day < 10) {day = '0' + day; }
            if (month < 10) {month = '0' + month; }
            // Format the startDate
            return month + '/' + day + '/' + year;
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

        /****************************************************************************************************************/
        //Handler
        /****************************************************************************************************************/
        Controller.prototype._onComEmailCheck = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            oDPPComunication.setProperty('/eMailCheck', true);
            oDPPComunication.setProperty('/FaxCheck', false);
            oDPPComunication.setProperty('/AddrCheck', false);
        };

        Controller.prototype._onComFaxCheck = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            oDPPComunication.setProperty('/eMailCheck', false);
            oDPPComunication.setProperty('/FaxCheck', true);
            oDPPComunication.setProperty('/AddrCheck', false);
        };

        Controller.prototype._onComAddrCheck = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            oDPPComunication.setProperty('/eMailCheck', false);
            oDPPComunication.setProperty('/FaxCheck', false);
            oDPPComunication.setProperty('/AddrCheck', true);
        };

        Controller.prototype._onExtDeniedOkClick = function () {    //Navigate to DPP setup if 'OK' is clicked
            var oModel = this.getOwnerComponent().getModel("comp-dppext"),
                that = this,
                oContactLogArea = this.getView().byId('idnrgBilling-extDenCL');
            oModel.create("/ExtDeniedS", {
                "Contract": this._coNum,
                "ContAccount": this._caNum,
                "Partner" : this._bpNum,
                "Message" : (oContactLogArea.getValue() || "")
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
            this._selectScrn('EXTGrant');
            this._bOverRide = true;
        };

        Controller.prototype._onDppExtChangeClick = function () {
            //Show Ext Edit Screen
            var oExtElgble = this.getView().getModel('oExtEligible');

            oExtElgble.setProperty('/ExtActive', false);
        };



        Controller.prototype._onReasonSelect = function (oEvent) {
            //this.getView().getModel('oDppReasons').setData(oData);
            //this.getView().getModel('oDppReasons').setProperty('/selectedKey', '0000');
            var oDppReason = this.getView().getModel('oDppReasons'),
                i;

            for (i = 0; i < oDppReason.oData.length; i = i + 1) {
                if (oDppReason.oData[i].ReasonCode === oEvent.mParameters.selectedKey) {
                    oDppReason.setProperty('/selectedReason', oDppReason.oData[i].Reason);
                }
            }
        };

        Controller.prototype._onExtReasonSelect = function (oEvent) {
            this._extReason = oEvent.mParameters.Reason;
        };

        Controller.prototype._onSelectAllCheck = function (oEvent) {
            var oSetUps = this.getView().getModel('oDppSetUps'),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    oSetUps.setProperty('/results/' + i + '/OpenItems/bSelected', true);
                }
            } else {
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    oSetUps.setProperty('/results/' + i + '/OpenItems/bSelected', false);
                }
            }
        };

        Controller.prototype._onStepTwoInstlChange = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                iTempTol = 0,
                iDifTol = 0,
                i;

            for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                iTempTol = iTempTol + parseFloat(oDppConfs.getProperty('/results/' + i + '/ConfirmdItems/Amount'));
            }

            iDifTol = parseFloat(oDppConfs.getProperty('/results/0/TotOutStd')) - iTempTol;
            oDppConfs.setProperty('/results/0/DiffTot', iDifTol.toString());
            oDppConfs.setProperty('/results/0/DppTot', iTempTol.toString());
        };

        Controller.prototype._formatPadZero = function (sNum, iSize) {
            while (sNum.length < iSize) {
                sNum = '0' + sNum;
            }
            return sNum;
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
            var extDate = new Date(this.getView().byId('nrgBilling-dpp-ExtNewDate-id').getValue()),
                oExtensions = this.getView().getModel('oExtExtensions'),
                i;

            for (i = 0; i < oExtensions.oData.results.length; i = i + 1) {
                oExtensions.setProperty('/results/' + i + '/OpenItems/DefferalDate', extDate);
            }
            //this.getView().byId('nrgBilling-dpp-ExtNewDate-id')
        };

        Controller.prototype._handleDppFirstDueDateChange = function (oEvent) {
            var oDppFirstInslDate = new Date(this.getView().byId('nrgBilling-dpp-DppDueDate-id').getValue());

            this.getView().getModel('oDppConfs').setProperty('/results/0/ConfirmdItems/DueDate', oDppFirstInslDate);
        };

        /****************************************************************************************************************/
        //OData Call
        /****************************************************************************************************************/

        Controller.prototype._isExtElgble = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                aFilters,
                aFilterValues,
                aFilterIds;

            //aFilterIds = ["Contract"];
            //aFilterValues = [this._coNum];
            //aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/ExtElgbles('" + this._coNum + "')";  //(ContractAccountNumber=\'' + this._caNum + '\',ExtActive=false)';

            oParameters = {
                //filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        oData.NewExtActive = oData.ExtActive;
                        this.getView().getModel('oExtEligible').setData(oData);
                        if (this.getView().getModel('oExtEligible').getProperty('/EligibleYes')) {
                            this._selectScrn('EXTGrant');
                        } else {
                            this._selectScrn('EXTDenied');
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


        Controller.prototype._retrExtReasons = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i;

            sPath = '/ExtReasons';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oExtExtReasons').setData(oData);
                        this.getView().getModel('oExtExtReasons').setProperty('/selectedKey', '2800');
                    }
                }.bind(this),
                error: function (oError) {
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
                aFilterIds;

            aFilterIds = ["Contract"];
            aFilterValues = [this._coNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);

            sPath = '/Extensions';//(ContractAccountNumber=\'' + this._caNum + '\',ExtActive=false)/ExtensionSet';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oExtExtensions').setData(oData);
                        this.getView().getModel('oExtExtensions').setProperty('/results/0/iDwnPay', 0);
                        extDate = this._formatInvoiceDate(oData.results[0].OpenItems.DefferalDate.getDate(), oData.results[0].OpenItems.DefferalDate.getMonth() + 1, oData.results[0].OpenItems.DefferalDate.getFullYear());
                        this.getView().byId('nrgBilling-dpp-ExtNewDate-id').setDefaultDate(extDate);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };
        Controller.prototype._postExtRequest = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oPost = this.getView().getModel('oExtPostRequest'),
                oExt = this.getView().getModel('oExtExtensions'),
                oEligble = this.getView().getModel('oExtEligible'),
                oReason = this.getView().getModel('oExtExtReasons'),
                sDwnPayDate = this.getView().byId('nrgBilling-ext-dwnPayDueDate-id').getValue(),
                sDwnPayValue = this.getView().byId('nrgBilling-ext-dwnPayvalue-id').getValue(),
                sPath,
                oParameters,
                oDataObject = {},
                that = this,
                oContactLogArea = this.getView().byId('idnrgBilling-ExtAccCL'),
                sNewDateSelected = this.getView().byId('nrgBilling-dpp-ExtNewDate-id').getValue();


            oDataObject.Contract = this._coNum;
            oDataObject.BP = this._bpNum;
            oDataObject.CA = this._caNum;
            oDataObject.Message = (oContactLogArea.getValue() || "");
            oDataObject.DefDtNew = sNewDateSelected;
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

        return Controller;
    }
);
