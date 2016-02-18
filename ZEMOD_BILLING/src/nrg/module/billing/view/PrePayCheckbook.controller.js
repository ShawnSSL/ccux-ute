/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'nrg/base/view/BaseController',
        'nrg/base/type/Price',
        'nrg/module/quickpay/view/QuickPayPopup',
        'nrg/module/billing/view/EligPopup'
    ],

    function (jQuery, Controller, Type_Price, QuickPayControl, EligPopup) {
        'use strict';

        var CustomController = Controller.extend('nrg.module.billing.view.PrePayCheckbook');

        CustomController.prototype.onInit = function () {
            this.getOwnerComponent().getCcuxApp().setTitle('BILLING');
        };

        CustomController.prototype.onBeforeRendering = function () {
            this.getView().setModel(this.getOwnerComponent().getModel('comp-billing'), 'oDataSvc');
            this.getView().setModel(this.getOwnerComponent().getModel('comp-eligibility'), 'oDataEligSvc');

            //Model to keep checkbook header
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPpChkbkHdr');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPpPmtHdr');
            // Model for eligibility alerts
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');
            this._initRoutingInfo();
            this._initPpChkbookHdr();
            this._initPpPmtHdr();
            this._retrieveNotification();
        };
        /**********************************************************************************************************************************************************/
        //Init functions
        /**********************************************************************************************************************************************************/
        CustomController.prototype._initRoutingInfo = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;
        };
        CustomController.prototype.onAfterRendering = function () {

            // Update Footer
            this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);

            // Retrieve Notification

        };
        /**********************************************************************************************************************************************************/
        //Formatters
        /**********************************************************************************************************************************************************/
        CustomController.prototype._formatDate = function (oDate) {
            var sFormattedDate;

            if (!oDate) {
                return null;
            } else {
                sFormattedDate = (oDate.getMonth() + 1).toString() + '/' + oDate.getDate().toString() + '/' + oDate.getFullYear().toString().substring(2, 4);
                return sFormattedDate;
            }
        };

        CustomController.prototype._formatBoolCredit = function (sAccBal) {
            if (parseInt(sAccBal, 10) > 0) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatBoolDebit = function (sAccBal) {
            if (parseInt(sAccBal, 10) <= 0) {
                return true;
            } else {
                return false;
            }
        };


        /**********************************************************************************************************************************************************/
        //Handlers
        /**********************************************************************************************************************************************************/
        CustomController.prototype._onPpPmtHdrClicked = function (oEvent) {
            var sBindingPath,
                oPpPmtHdr = this.getView().getModel('oPpPmtHdr');

            sBindingPath = oEvent.oSource.oBindingContexts.oPpPmtHdr.getPath();

            if (oPpPmtHdr.getProperty(sBindingPath + '/bExpand')) {
                this._retrPpPmtItmes(oPpPmtHdr.getProperty(sBindingPath).ActKey, sBindingPath);
            }
            return;
        };

        CustomController.prototype._onPaymentOptionsClick = function () {
            var QuickControl = new QuickPayControl(),
                that = this;
            this.getView().addDependent(QuickControl);
            if (this._coNum) {
                QuickControl.openQuickPay(this._coNum, this._bpNum, this._caNum);
            }
            QuickControl.attachEvent("PaymentCompleted", function () {
                this._initPpChkbookHdr();
                this._initPpPmtHdr();
            }, this);
        };

        CustomController.prototype._onHighBillFactorClick = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum) {
                oRouter.navTo('billing.HighBill', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('billing.HighBillNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };


        CustomController.prototype._onBackToBilling = function () {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._coNum) {
                oRouter.navTo('billing.BillingPrePaid', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('billing.BillingPrePaidNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };



        CustomController.prototype._initPpChkbookHdr = function () {
            var sPath;

            sPath = '/PrePayHeaders(ContractAccountNumber=\'' + this._caNum + '\',InvNumber=\'\')';
            this._retrPpChkbookHdr(sPath);
        };

        CustomController.prototype._initPpPmtHdr = function () {
            var sPath;

            sPath = '/ConfBuags(\'' + this._caNum + '\')/PrePayPmtHdrs';
            //sPath = '/PrePayPmtHdrs(ContractAccountNumber=\'' + this._caNum + '\',ActKey=\'000001\')';


            this._retrPpPmtHdr(sPath);
        };


        /**********************************************************************************************************************************************************/
        //OData Communication Functions
        /**********************************************************************************************************************************************************/
        CustomController.prototype._retrPpPmtItmes = function (sActKey, sBindingPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath;

            sPath = '/PrePayPmtHdrs(ContractAccountNumber=\'' + this._caNum + '\',ActKey=\'' + sActKey + '\')/PrePayPmtItems';
            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oPpPmtHdr').setProperty(sBindingPath + '/PpPmtItmes', oData);
                    }
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPpChkbookHdr = function (sPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oPpChkbkHdr').setData(oData);
                    }
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPpPmtHdr = function (sPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                oParameters,
                i;

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (i !== oData.results.length - 1) {
                                oData.results[i].bExpand = false;
                            } else {
                                oData.results[i].bExpand = true;
                                this._retrPpPmtItmes(oData.results[i].ActKey, '/results/' + i.toString());
                            }
                        }
                        this.getView().getModel('oPpPmtHdr').setData(oData);
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }

        };

        /*-------------------------------------- Notificatiob Area (Jerry 11/18/2015) ---------------------------------------*/

        CustomController.prototype._retrieveNotification = function () {
            var sPath = '/EligCheckS(\'' + this._coNum + '\')',
                oModel = this.getView().getModel('oDataEligSvc'),
                oEligModel = this.getView().getModel('oEligibility'),
                oParameters,
                alert,
                i;

            oParameters = {
                success : function (oData) {
                    oEligModel.setData(oData);
                    var container = this.getView().byId('idnrgBilling-ppChkBk-notifications');
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
        CustomController.prototype._openEligABPPopup = function () {
            if (!this.EligABPPopupCustomControl) {
                this.EligABPPopupCustomControl = new EligPopup({ eligType: "ABP" });
                this.EligABPPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligABPPopupCustomControl);
                this.EligABPPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - AVERAGE BILLING PLAN');
            }
            this.EligABPPopupCustomControl.prepare();
        };

        CustomController.prototype._openEligEXTNPopup = function () {
            if (!this.EligEXTNPopupCustomControl) {
                this.EligEXTNPopupCustomControl = new EligPopup({ eligType: "EXTN" });
                this.EligEXTNPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligEXTNPopupCustomControl);
                this.EligEXTNPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - EXTENSION');
            }
            this.EligEXTNPopupCustomControl.prepare();
        };

        CustomController.prototype._openEligRBBPopup = function () {
            if (!this.EligRBBPopupCustomControl) {
                this.EligRBBPopupCustomControl = new EligPopup({ eligType: "RBB" });
                this.EligRBBPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligRBBPopupCustomControl);
                this.EligRBBPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - RETRO BILLING PLAN');
            }
            this.EligRBBPopupCustomControl.prepare();
        };
        return CustomController;
    }
);
