// temporarily added by Jerry

/*globals sap, ute*/
/*globals window*/
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

        var CustomController = Controller.extend('nrg.module.billing.view.BillingCheckbook');

        CustomController.prototype.onInit = function () {
        };

        CustomController.prototype.onBeforeRendering = function () {
            this.getOwnerComponent().getCcuxApp().setTitle('BILLING');
            this._initRoutingInfo();
            var oModel = this.getOwnerComponent().getModel('comp-feeAdjs'),
                oBindingInfo,
                sPath = "/PrepayFlagS('" + this._caNum + "')",
                that = this;
            oBindingInfo = {
                success : function (oData) {
                    if (oData && oData.Prepay) {
                        if (that._coNum) {
                            that.navTo('billing.PrePayCheckBook', {bpNum: that._bpNum, caNum: that._caNum, coNum: this._coNum});
                        } else {
                            that.navTo('billing.PrePayCheckBookNoCo', {bpNum: that._bpNum, caNum: that._caNum});
                        }
                    } else {
                        that.PostPaidAccounts();
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Eligibility Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }


        };

        CustomController.prototype.PostPaidAccounts = function () {
            //var o18n = this.getOwnerComponent().getModel('comp-i18n-billing');

            this.getView().setModel(this.getOwnerComponent().getModel('comp-billing'), 'oDataSvc');
            this.getView().setModel(this.getOwnerComponent().getModel('comp-eligibility'), 'oDataEligSvc');

            //Model to keep checkbook header
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oChkbkHdr');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPaymentHdr');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPostInvoiceItems');

            // Model for eligibility alerts
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');

            //Model to keep CheckBook detail data
            /*this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPayments');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPaymentItems');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPaymentSumrys');*/


            //Start of data retriving

            this._initChkbookHdr();
            this._initPaymentHdr();
            this._initPostInvoiceItems();
            this._retrieveNotification();
        };
        CustomController.prototype.onAfterRendering = function () {

            // Update Footer
            this.getOwnerComponent().getCcuxApp().updateFooterNotification(this._bpNum, this._caNum, this._coNum, true);
            this.getOwnerComponent().getCcuxApp().updateFooterRHS(this._bpNum, this._caNum, this._coNum, true);
            this.getOwnerComponent().getCcuxApp().updateFooterCampaign(this._bpNum, this._caNum, this._coNum, true);

            // Retrieve Notification

        };

        CustomController.prototype.onExit = function () {
        };


        /*****************************************************************************************************************************************************/
        //Formatter Functions
        CustomController.prototype._formatPostClotGrn = function (sColor) {
            if (sColor === 'G') {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatPostClotRed = function (sColor) {
            if (sColor === 'R') {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatPostInv2VL = function (cIndicator, sHyperlink) {
            if (cIndicator === 'L' && !sHyperlink) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatPostInv2VR = function (cIndicator, sHyperlink) {
            if (cIndicator === 'R' && !sHyperlink) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatPostInv1V = function (cIndicator, sHyperlink) {
            if (cIndicator === 'H' && !sHyperlink) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatDppIntGrn = function (sIndicator) {
            if (sIndicator === 'G') {
                return true;
            } else {
                return false;
            }
        };
        CustomController.prototype._formatDppIntYlw = function (sIndicator) {
            if (sIndicator === 'Y') {
                return true;
            } else {
                return false;
            }
        };
        CustomController.prototype._formatDppIntRed = function (sIndicator) {
            if (sIndicator === 'R') {
                return true;
            } else {
                return false;
            }
        };
        CustomController.prototype._formatDppIntWte = function (sIndicator) {
            if (sIndicator === 'W') {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatBoolHyperLink = function (sIndicator) {
            if (sIndicator) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatBoolDP = function (sIndicator) {
            if (sIndicator === 'DP') {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatBoolLP = function (sIndicator) {
            if (sIndicator === 'LP') {return true; } else { return false; }
        };

        CustomController.prototype._formatBoolBB = function (sIndicator) {
            if (sIndicator === 'BB') {return true; } else { return false; }
        };

        CustomController.prototype._formatBoolCurChrg = function (sIndicator) { //Also used for other 'X' indicator
            if (sIndicator === 'X' || sIndicator === 'x') {
                return true;
            } else {
                return false;
            }
        };
        CustomController.prototype._formatBoolNormalPitem = function (sIndicator1, sIndicator2) {
            if (sIndicator1 || sIndicator2) {
                return false;
            } else {
                return true;
            }
        };


        CustomController.prototype._formatTwoClotBoolean = function (sSecondCallout) {
            if (sSecondCallout) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatBppBoolean = function (sCallout) {
            if (sCallout === 'BBP') {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatFirstClotBlk = function (sBbpIndicator, bCurrent, bRed) {
            if (sBbpIndicator === 'BBP') {
                return false;
            } else if (bRed) {
                return false;
            } else if (!bCurrent) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatFirstClotGrn = function (sBbpIndicator, bCurrent, bRed) {
            if (sBbpIndicator === 'BBP') {
                return false;
            } else if (bRed) {
                return false;
            } else if (bCurrent) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatFirstClotRed = function (sBbpIndicator, bCurrent, bRed) {
            if (sBbpIndicator === 'BBP') {
                return false;
            } else if (bRed) {
                return true;
            } else if (bCurrent) {
                return false;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatClotTTCurrent = function (sClot, sClr, bCurrent) {
            if (sClot === 'BBP') {
                return false;
            } else if (sClr === 'RED') {
                return false;
            } else if (bCurrent) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatClotTTDppCncl = function (sClot, sClr, bCurrent) {
            if (sClot === 'BBP') {
                return false;
            } else if (sClr === 'RED') {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatClotTTDInactive = function (sClot, sClr, bCurrent) {
            if (sClot === 'BBP') {
                return false;
            } else if (sClr === 'RED') {
                return false;
            } else if (!bCurrent) {
                return true;
            } else {
                return false;
            }
        };

        CustomController.prototype._formatNotBppBoolean = function (sCallout) {
            if (sCallout === 'BBP') {
                return false;
            } else {
                return true;
            }
        };

        CustomController.prototype._formatDate = function (oDate) {
            var sFormattedDate;

            if (!oDate) {
                return null;
            } else {
                sFormattedDate = (oDate.getMonth() + 1).toString() + '/' + oDate.getDate().toString() + '/' + oDate.getFullYear().toString().substring(2, 4);
                return sFormattedDate;
            }
        };

        CustomController.prototype._getCurDate = function () {
            var sCurDate,
                oCurDate = new Date();

            sCurDate = (oCurDate.getMonth() + 1).toString() + '/' + oCurDate.getDate().toString() + '/' + oCurDate.getFullYear().toString().substring(2, 4);

            return sCurDate;
        };

        CustomController.prototype._getPreSixMonthDate = function () {
            var sPreSixDate,
                oPreSixDate = new Date();

            oPreSixDate.setMonth(oPreSixDate.getMonth() - 6);
            sPreSixDate = (oPreSixDate.getMonth() + 1).toString() + '/' + oPreSixDate.getDate().toString() + '/' + oPreSixDate.getFullYear().toString().substring(2, 4);

            return sPreSixDate;
        };

        CustomController.prototype._formatLfRtZroVal = function (iLfRtVal) {
            if (iLfRtVal === '0.00' || iLfRtVal === '0') {
                return ' ';
            } else {
                return iLfRtVal;
            }
        };


        /*****************************************************************************************************************************************************/
        /*****************************************************************************************************************************************************/
        //Handlers
        CustomController.prototype._onPaymentHdrClicked = function (oEvent) {
            var sBindingPath,
                oPmtHdr = this.getView().getModel('oPaymentHdr');

            sBindingPath = oEvent.oSource.oBindingContexts.oPaymentHdr.getPath();
            if (oPmtHdr.getProperty(sBindingPath + '/bExpand')) {   //If the status is expand need to feed the data inside the expand area
                this._retrPayments(oPmtHdr.getProperty(sBindingPath).InvoiceNum, sBindingPath);
                this._retrPaymentItmes(oPmtHdr.getProperty(sBindingPath).InvoiceNum, sBindingPath);
                this._retrPaymentSumrys(oPmtHdr.getProperty(sBindingPath).InvoiceNum, sBindingPath);
            }
        };

        CustomController.prototype._onPaymentOptionClick = function () {
            var QuickControl = new QuickPayControl(),
                that = this;
            this.getView().addDependent(QuickControl);
            if (this._coNum) {
                QuickControl.openQuickPay(this._coNum, this._bpNum, this._caNum);
            }
            QuickControl.attachEvent("PaymentCompleted", function () {
                this._initChkbookHdr();
                this._initPaymentHdr();
                this._initPostInvoiceItems();
                this._retrieveNotification();
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

        CustomController.prototype._onLiteUpLinkClicked = function (oEvent) {
            var sLiteUpUrl = 'http://www.puc.state.tx.us/consumer/lowincome/Assistance.aspx';
            window.open(sLiteUpUrl);
        };
        /*****************************************************************************************************************************************************/

        CustomController.prototype._retrPayments = function (sInvNum, sBindingPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                sPath,
                oParameters;

            sPath = '/PaymentHdrs(\'' + sInvNum + '\')/Payments';
                //'/PaymentHdrs' + '(InvoiceNum=\'' + sInvNum + '\',Paidamt=\'0.0000\')';
                //'/PaymentHdrs(\'' + sInvNum + '\')/Payments';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oPaymentHdr').setProperty(sBindingPath + '/Payments', oData);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }

        };

        CustomController.prototype._retrPaymentItemDppTable = function (sInvNum, sOpbel, sBindingPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                sPath,
                oParameters;

            sPath = '/PaymentItems(ContractAccountNumber=\'\',InvoiceNum=\'' + sInvNum + '\',Opbel=\'' + sOpbel + '\')/DPPPlan';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oPaymentHdr').setProperty(sBindingPath + '/DpInstls', oData);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPaymentItmes = function (sInvNum, sBindingPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                sPath,
                oParameters,
                i;
                //oScrlCtaner = this.getView().byId('nrgChkbookScrollContainer');

            sPath = '/PaymentHdrs(\'' + sInvNum + '\')/PaymentItems';

            oParameters = {
                success : function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        this.getView().getModel('oPaymentHdr').setProperty(sBindingPath + '/PaymentItems', oData);

                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (oData.results[i].HyperLinkInd === 'DP') {
                                this._retrPaymentItemDppTable(oData.results[i].InvoiceNum, oData.results[i].Opbel, sBindingPath + '/PaymentItems/results/' + i.toString());
                            }
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPaymentSumrys = function (sInvNum, sBindingPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                sPath,
                oParameters;
                //oScrlCtaner = this.getView().byId('nrgChkbookScrollContainer');

            sPath = '/PaymentHdrs(\'' + sInvNum + '\')/PaymentSumry';

            oParameters = {
                success : function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        this.getView().getModel('oPaymentHdr').setProperty(sBindingPath + '/PaymentSumry', oData.results[0]);
                    }
                    //oScrlCtaner.scrollTop = oScrlCtaner.scrollHeight;
                    //oScrlCtaner.scrollTo(0, 550, 100);
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._initRoutingInfo = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;
        };

        CustomController.prototype._initChkbookHdr = function () {
            var sPath;

            sPath = '/ChkBookHdrs' + '(ContractAccountID=\'' + this._caNum + '\',InvoiceNum=\'\')';


            this._retrChkbookHdr(sPath);
        };

        CustomController.prototype._initPaymentHdr = function () {
            var sPath;

            sPath = '/ConfBuags' + '(\'' + this._caNum + '\')/PaymentHdrs';

            this._retrPaymentHdr(sPath);
        };


        CustomController.prototype._initPostInvoiceItems = function () {
            var sPath;

            sPath = '/ConfBuags' + '(\'' + this._caNum + '\')/PostInvoice';

            this._retrPostInvoiceItems(sPath);
        };

        CustomController.prototype._retrChkbookHdr = function (sPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oChkbkHdr').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPaymentHdr = function (sPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                oParameters,
                i,
                j,
                oCurDate = new Date(),
                oScrlCtaner = this.getView().byId('nrgChkbookScrollContainer');

            oParameters = {
                success : function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            oData.results[i].oCallOut = {};
                            if (oData.results[i].CallOut) {
                                oData.results[i].oCallOut = JSON.parse(oData.results[i].CallOut);
                                oData.results[i].bRed = false; //Preset to false;
                                for (j = 0; j < oData.results[i].oCallOut.CallOuts.length; j = j + 1) {
                                    if (oData.results[i].oCallOut.CallOuts[j].CallOut === 'BBP') {
                                        oData.results[i].oCallOut.CallOuts[j].BBPAmt = oData.results[i].BBPAmt;
                                        oData.results[i].oCallOut.CallOuts[j].BBPAmtAddr = oData.results[i].BBPAmtAddr;
                                        oData.results[i].oCallOut.CallOuts[j].BBPBal = oData.results[i].BBPBal;
                                        oData.results[i].oCallOut.CallOuts[j].BBPBalAddr = oData.results[i].BBPBalAddr;
                                        oData.results[i].oCallOut.CallOuts[j].BBPDefBal = oData.results[i].BBPDefBal;
                                        oData.results[i].oCallOut.CallOuts[j].BBPDefBalTxt = oData.results[i].BBPDefBalTxt;
                                    }

                                    //Checking DPP red
                                    if (oData.results[i].oCallOut.CallOuts[j].Color === 'RED') {
                                        oData.results[i].bRed = true;
                                    }

                                    //Current flags
                                    if (i === oData.results.length - 1) {
                                        oData.results[i].oCallOut.CallOuts[j].bCurrent = true;
                                    } else {
                                        oData.results[i].oCallOut.CallOuts[j].bCurrent = false;
                                    }
                                }
                                if (oData.results[i].oCallOut.CallOuts.length === 1) {
                                    oData.results[i].sCallOut = oData.results[i].oCallOut.CallOuts[0].CallOut;
                                } else if (oData.results[i].oCallOut.CallOuts.length === 2) {
                                    oData.results[i].sCallOut = oData.results[i].oCallOut.CallOuts[0].CallOut;
                                    oData.results[i].sCallOut2 = oData.results[i].oCallOut.CallOuts[1].CallOut;
                                } else {
                                    oData.results[i].sCallOut = oData.results[i].oCallOut.CallOuts.length + '+';
                                    this.getView().byId('ChkbookHdrClOt').setVisible(true);
                                }
                            }
                            if (i !== oData.results.length - 1) {
                                oData.results[i].bExpand = false;
                                oData.results[i].bExpand_0 = false;
                            } else {
                                oData.results[i].bExpand = true;
                                oData.results[i].bExpand_0 = true;
                            }
                            oData.results[i].bRegul = true;
                            oData.results[i].bAlert = false;
                        }

                        i = i - 1;  //At this moment i is the lengh of oData, need the index of the last element

                        //Check over due invoices
                        if (oData.results[i] && oData.results[i].DueDate && oData.results[i].DueDate < oCurDate) {
                            oData.results[i].bAlert = true;
                            oData.results[i].bRegul = false;
                        }

                        this.getView().getModel('oPaymentHdr').setData(oData);
                        this._retrPayments(oData.results[i].InvoiceNum, '/results/' + i);
                        this._retrPaymentSumrys(oData.results[i].InvoiceNum, '/results/' + i);
                        this._retrPaymentItmes(oData.results[i].InvoiceNum, '/results/' + i);

                        //oScrlCtaner.scrollTo(0, 1000, 1000);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPostInvoiceItems = function (sPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                oParameters,
                oScrlCtaner = this.getView().byId('nrgChkbookScrollContainer'),
                i;

            oParameters = {
                success : function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        this.getView().getModel('oPostInvoiceItems').setData(oData);

                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (oData.results[i].HyperLinkInd === 'DP') {
                                this._retrPostInvoiceItemDppTable(oData.results[i].InvoiceNum, oData.results[i].Opbel, '/results/' + i.toString());
                            }
                        }
                    }

                    oScrlCtaner.scrollTo(0, 1000, 1000);
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        CustomController.prototype._retrPostInvoiceItemDppTable = function (sInvNum, sOpbel, sBindingPath) {
            var oChbkOData = this.getView().getModel('oDataSvc'),
                sPath,
                oScrlCtaner = this.getView().byId('nrgChkbookScrollContainer'),
                oParameters;

            sPath = '/PostInvoices(ContractAccountNumber=\'' + this._caNum + '\',InvoiceNum=\'\',Opbel=\'' + sOpbel + '\')/DPPPlans';
            //sPath = '/DPPPlans(ContractAccountNumber=\'\',InvoiceNum=\'' + sInvNum + '\',Opbel=\'' + sOpbel + '\')/';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oPostInvoiceItems').setProperty(sBindingPath + '/DpInstls', oData);
                    }

                    oScrlCtaner.scrollTo(0, 1000, 1000);
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oChbkOData) {
                oChbkOData.read(sPath, oParameters);
            }
        };

        /*------------------------------------------------ UI Element Actions -----------------------------------------------*/


        CustomController.prototype._onBackToBilling = function () {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._coNum) {
                oRouter.navTo('billing.BillingInfo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('billing.BillingInfoNoCo', {bpNum: this._bpNum, caNum: this._caNum});
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
                    var container = this.getView().byId('nrgBilling-billChkBook-notifications');
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
