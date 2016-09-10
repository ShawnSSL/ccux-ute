/*global sap*/
/*globals ute*/
/*globals $*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/base/EventProvider',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/nnp/view/NNPPopup'
    ],

    function (EventProvider, Filter, FilterOperator, NNPPopup) {
        'use strict';

        var AppFooter = EventProvider.extend('nrg.module.app.view.AppFooter', {
            constructor: function (oController, oApp) {
                EventProvider.apply(this);

                this._oController = oController;
                this._oApp = oApp;
            },

            metadata: {
                publicMethods: [
                    'init',
                    'reset',
                    'setExpanded',
                    'isExpanded'
                ]
            }
        });

        AppFooter.prototype.init = function () {
            this._registerEvents();
        };

        /*----------------- Footer Initiate ---------------*/

        AppFooter.prototype._initFooterContent = function () {
            this._oController.getView().setModel(this._oController.getView().getModel('main-app'), 'oMainODataSvc');
            this._oController.getView().setModel(this._oController.getView().getModel('noti-app'), 'oNotiODataSvc');
            this._oController.getView().setModel(this._oController.getView().getModel('rhs-app'), 'oRHSODataSvc');
            this._oController.getView().setModel(this._oController.getView().getModel('comp-app'), 'oCompODataSvc');
            this._oController.getView().setModel(this._oController.getView().getModel('elig-app'), 'oDataEligSvc');

            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oFooterNotification');
            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oFooterRHS');
            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oFooterCampaign');
            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oFooterRouting');
            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oFooterBpInfo');
            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oBpInfo');
            this._oController.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');

            this.footerElement = {};

            // Notification
            this.footerElement.notiEmptySec = this._oController.getView().byId('nrgAppFtrDetails-notification-emptySection');
            this.footerElement.notiAlertSec = this._oController.getView().byId('nrgAppFtrDetails-notification-alertSection');
            this.footerElement.notiEmptySec.setVisible(true);
            this.footerElement.notiAlertSec.setVisible(false);

            // RHS
            this.footerElement.rhsEmptySec = this._oController.getView().byId('nrgAppFtrDetails-rhs-emptySection');
            this.footerElement.rhsProdSec = this._oController.getView().byId('nrgAppFtrDetails-rhs-productSection');
            this.footerElement.rhsEmptySec.setVisible(true);
            this.footerElement.rhsProdSec.setVisible(false);

            // Campaign
            this.footerElement.campEmptySec = this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-emptySection');
            this.footerElement.campOfferSec = this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers');
            this.footerElement.campBtnSec = this._oController.getView().byId('nrgAppFtrDetails-campaignButton');
            this.footerElement.campEmptySec.setVisible(true);
            this.footerElement.campOfferSec.setVisible(false);
            this.footerElement.campBtnSec.setVisible(false);

        };

        /*------------------ Data Retrieve ----------------*/

        AppFooter.prototype._retrieveBpInfo = function (sBpNum, fnCallback) {
            var oModel = this._oController.getView().getModel('oMainODataSvc'),
                oBpInfoModel = this._oController.getView().getModel('oBpInfo'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')',
                oParameters;

            oParameters = {
                success : function (oData) {
                    oBpInfoModel.setData(oData);
                    if (fnCallback) { fnCallback(); }
                }.bind(this),
                error: function (oError) {
                    // Handle error
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        AppFooter.prototype._retrieveEligibility = function (fnCallback) {
            var oRouting = this._oController.getView().getModel('oFooterRouting'),
                sPath = '/EligCheckS(\'' + oRouting.oData.CoNumber + '\')',
                oModel = this._oController.getView().getModel('oDataEligSvc'),
                oEligModel = this._oController.getView().getModel('oEligibility'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    oEligModel.setData(oData);
                    if (fnCallback) {
                        fnCallback();
                    }
                }.bind(this),
                error: function (oError) {
                    
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /*---------------- UI Element Action --------------*/

        AppFooter.prototype._onM2mLinkPress = function (oControlEvent) {
            // if (!this.m2mPopup) {
            //     this.m2mPopup = ute.ui.main.Popup.create({
            //         content: sap.ui.xmlfragment(this._oController.getView().sId, "nrg.module.app.view.AlertM2mPopup", this),
            //         title: 'Multi-Month Invoice'
            //     });
            //     this.m2mPopup.addStyleClass('nrgApp-m2mPopup');
            //     this._oController.getView().addDependent(this.m2mPopup);
            // }
            // // Open the popup
            // this.m2mPopup.open();







            var oWebUiManager = this._oController.getOwnerComponent().getCcuxWebUiManager(),
                oRouter = this._oController.getOwnerComponent().getRouter(),
                oRouting = this._oController.getView().getModel('oFooterRouting'),
                oRetrDone = false,
                checkRetrComplete;

            // Display the loading indicator
            this._oController.getOwnerComponent().getCcuxApp().setOccupied(true);
            // Retrieve Notification
            this._retrieveEligibility(function () {oRetrDone = true; });
            // Check retrieval done
            checkRetrComplete = setInterval(function () {
                if (oRetrDone) {
                    var oEligibilityModel = this._oController.getView().getModel('oEligibility');
                    // Dismiss the loading indicator
                    this._oController.getOwnerComponent().getCcuxApp().setOccupied(false);
                    // Upon successfully retrieving the data, stop checking the completion of retrieving data
                    clearInterval(checkRetrComplete);
                    // Check active or not
                    if (!oEligibilityModel.oData.DPPActv) {
                        // Go to DPP page
                        oRouter.navTo('billing.DefferedPmtPlan', {bpNum: oRouting.oData.BpNumber, caNum: oRouting.oData.CaNumber, coNum: oRouting.oData.CoNumber});
                    } else {
                        // Go to transaction launcher
                        oWebUiManager.notifyWebUi('openIndex', {
                            LINK_ID: "Z_DPP"
                        });
                    }
                }
            }.bind(this), 100);
        };

        // Invalid Email Address
        AppFooter.prototype._onSmtpLinkPress = function (oControlEvent) {
            var NNPPopupControl = new NNPPopup(),
                oRouting = this._oController.getView().getModel('oFooterRouting'),
                bpNum = oRouting.oData.BpNumber,
                caNum = oRouting.oData.CaNumber,
                coNum = oRouting.oData.CoNumber,
                oBpInfoModel = this._oController.getView().getModel('oBpInfo'),
                bRetrBpComplete = false,
                checkBpInfoRetrComplete;

            // Retrieve BP info
            this._retrieveBpInfo(bpNum, function () { bRetrBpComplete = true; });
            // Check the completion of BP info retrieval
            checkBpInfoRetrComplete = setInterval(function () {
                if (bRetrBpComplete) {
                    NNPPopupControl.attachEvent("NNPCompleted", function () {
                        // Update Footer
                        this._updateAllFooterComponents(bpNum, caNum, coNum, false);
                        // Rerender the whole page
                        this._oController.getView().rerender();
                        // Dismiss the loading spinner
                        this._oController.getOwnerComponent().getCcuxApp().setOccupied(false);
                    }, this);
                    // Open the NNP popup
                    this._oController.getView().addDependent(NNPPopupControl);
                    NNPPopupControl.openNNP(bpNum, oBpInfoModel.oData.Email, oBpInfoModel.oData.EmailConsum);
                    // Clear the interval check
                    clearInterval(checkBpInfoRetrComplete);
                }
            }.bind(this), 100);
        };

        AppFooter.prototype._onMailLinkPress = function (oControlEvent) {
            if (!this.invalidMailingAddrPopup) {
                this.invalidMailingAddrPopup = ute.ui.main.Popup.create({
                    content: sap.ui.xmlfragment(this._oController.getView().sId, "nrg.module.app.view.AlertInvMailAddrPopup", this),
                    title: 'Invalid Mailing Address'
                });
                this.invalidMailingAddrPopup.addStyleClass('nrgApp-invalidMailingAddrPopup');
                this._oController.getView().addDependent(this.invalidMailingAddrPopup);
            }
            // Open the popup
            this.invalidMailingAddrPopup.open();
        };

        AppFooter.prototype._onSmsLinkPress = function (oControlEvent) {
            if (!this.invalidSmsPopup) {
                this.invalidSmsPopup = ute.ui.main.Popup.create({
                    content: sap.ui.xmlfragment(this._oController.getView().sId, "nrg.module.app.view.AlertInvSmsPopup", this),
                    title: 'Invalid SMS Number'
                });
                this.invalidSmsPopup.addStyleClass('nrgApp-invalidSmsPopup');
                this._oController.getView().addDependent(this.invalidSmsPopup);
            }
            // Open the popup
            this.invalidSmsPopup.open();
        };

        AppFooter.prototype._onOamLinkPress = function (oControlEvent) {
            var oNotificationModel = this._oController.getView().getModel('oFooterNotification'),
                i;

            for (i = 0; i < oNotificationModel.oData.length; i = i + 1) {
                if (oNotificationModel.oData[i].FilterType === 'OAM') {
                    oNotificationModel.setProperty('/ErrorMessage', oNotificationModel.oData[i].MessageText);
                }
            }

            if (!this.oamPopup) {
                this.oamPopup = ute.ui.main.Popup.create({
                    content: sap.ui.xmlfragment(this._oController.getView().sId, "nrg.module.app.view.AlertOamPopup", this),
                    title: 'Invalid OAM Email'
                });
                this.oamPopup.addStyleClass('nrgApp-oamPopup');
                this._oController.getView().addDependent(this.oamPopup);
            }
            // Open the popup
            this.oamPopup.open();
        };

        AppFooter.prototype._onInvMailAddrCloseClick = function (oEvent) {
            this.invalidMailingAddrPopup.close();
        };

        AppFooter.prototype._onInvSmsCloseClick = function (oEvent) {
            this.invalidSmsPopup.close();
        };

        AppFooter.prototype._onM2mCloseClick = function (oEvent) {
            this.m2mPopup.close();
        };

        AppFooter.prototype._onOamCloseClick = function (oEvent) {
            this.oamPopup.close();
        };

        /*------------------ Footer Update ----------------*/

        AppFooter.prototype._updateAllFooterComponents = function (sBpNum, sCaNum, sCoNum, bNotReredner) {
            this.updateFooterNotification(sBpNum, sCaNum, sCoNum, bNotReredner);
            this.updateFooterRHS(sBpNum, sCaNum, sCoNum, bNotReredner);
            this.updateFooterCampaign(sBpNum, sCaNum, sCoNum, bNotReredner);
        };

        AppFooter.prototype.updateFooterNotification = function (sBpNumber, sCaNumber, sCoNumber, bNotReredner) {

            this._updateRouting(sBpNumber, sCaNumber, sCoNumber);

            var sPath = '/AlertsSet',
                aFilters = [],
                oModel = this._oController.getView().getModel('oNotiODataSvc'),
                oNotificationModel = this._oController.getView().getModel('oFooterNotification'),
                oParameters,
                i;
            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNumber}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNumber}));
            aFilters.push(new Filter({ path: 'Identifier', operator: FilterOperator.EQ, value1: 'FOOTER'}));



            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length) {
                        oNotificationModel.setData(oData.results);

                        var notification = [],
                            notificationLinkPressActions = {
                                'M2M': this._onM2mLinkPress.bind(this),
                                'SMTP': this._onSmtpLinkPress.bind(this),
                                'MAIL': this._onMailLinkPress.bind(this),
                                'SMS': this._onSmsLinkPress.bind(this),
                                'OAM': this._onOamLinkPress.bind(this)
                            },
                            notificationContainer = this._oController.getView().byId("nrgAppFtrDetails-notification-scrollContent"),
                            j;

                        for (i = 0; i < oNotificationModel.oData.length; i = i + 1) {
                            notification.push(
                                new ute.ui.app.FooterNotificationItem({
                                    link: true,
                                    design: 'Error',
                                    text: oNotificationModel.oData[i].MessageText,
                                    linkPress: notificationLinkPressActions[oNotificationModel.oData[i].FilterType]
                                })
                            );
                        }

                        if (!this.notificationCenter) {
                            // First time render goes here
                            this.notificationCenter = new ute.ui.app.FooterNotificationCenter("nrgAppFtrDetails-notification-notificationCenter", {content: notification});
                            this.notificationCenter.placeAt(notificationContainer);
                        } else {
                            // Second time render goes here
                            this.notificationCenter.destroyAggregation('content', bNotReredner);
                            for (j = 0; j < notification.length; j = j + 1) {
                                this.notificationCenter.addAggregation('content', notification[j], bNotReredner);
                            }
                        }

                        this.footerElement.notiEmptySec.setVisible(false);
                        this.footerElement.notiAlertSec.setVisible(true);
                    } else {
                        this.footerElement.notiEmptySec.setVisible(true);
                        this.footerElement.notiAlertSec.setVisible(false);
                    }
                }.bind(this),
                error: function (oError) {
                    this.footerElement.notiEmptySec.setVisible(true);
                    this.footerElement.notiAlertSec.setVisible(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        AppFooter.prototype._onRhsCurrenItemSelect = function (oControlEvent) {

        }.bind(this);

        AppFooter.prototype._onRhsCurrenDropdownClick = function (oControlEvent) {
            var rhsSection = this._oController.getView().byId("nrgAppFtrDetails-rhs");
            if ($('#nrgAppFtrDetails-rhs-currentDropdown-picker').height() > 200) {
                if (rhsSection.hasStyleClass('scrollBarAppear')) {
                    rhsSection.removeStyleClass('scrollBarAppear');
                } else {
                    rhsSection.addStyleClass('scrollBarAppear');
                }
            }
        };

        AppFooter.prototype.updateFooterRHS = function (sBpNumber, sCaNumber, sCoNumber) {
            this._updateRouting(sBpNumber, sCaNumber, sCoNumber);

            var sPath = '/FooterS',
                aFilters = [],
                oModel = this._oController.getView().getModel('oRHSODataSvc'),
                oRHSModel = this._oController.getView().getModel('oFooterRHS'),
                oParameters,
                bCurrentFlag = false,
                bPendingFlag = false,
                bHistoryFlag = false;
            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNumber}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNumber}));

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    var iCurrentIndex = 0,
                        aCurrent = [],
                        dropdownContainer = this._oController.getView().byId("nrgAppFtrDetails-rhs-currentItem"),
                        i,
                        oTag,
                        j;
                    if (oData.results.length > 0) {
                        // Generate a dropdwon for RHS current products
                        if (!this.rhsDropdown) {

                            // Get all objects for Current
                            for (i = 0; i < oData.results.length; i = i + 1) {
                                if (oData.results[i].Type === 'C') {
                                    bCurrentFlag = true;
                                    oTag = new ute.ui.commons.Tag({elem: 'span', text: oData.results[i].ProdName});
                                    aCurrent.push(new ute.ui.main.DropdownItem({key: iCurrentIndex = iCurrentIndex + 1, content: oTag}).addStyleClass("nrgAppFtrDetails-rhs-currentDropdownItem"));
                                }
                            }
                            this.rhsDropdown = new ute.ui.main.Dropdown("nrgAppFtrDetails-rhs-currentDropdown", {content: aCurrent, selectedKey: 0, select: this._onRhsCurrenItemSelect}).addStyleClass("nrgAppFtrDetails-rhs-itemContent");
                            this.rhsDropdown.attachBrowserEvent("click", this._onRhsCurrenDropdownClick.bind(this));
                            this.rhsDropdown.placeAt(dropdownContainer);
                        }

                        for (j = 0; j < oData.results.length; j = j + 1) {
                            // Get first object for Pending
                            if (oData.results[j].Type === 'P') {
                                bPendingFlag = true;
                                this._oController.getView().byId("nrgAppFtrDetails-rhs-pendingItemContent").setText(oData.results[j].ProdName);
                            }
                            // Get first object for History
                            if (oData.results[j].Type === 'H') {
                                bHistoryFlag = true;
                                this._oController.getView().byId("nrgAppFtrDetails-rhs-historyItemContent").setText(oData.results[j].ProdName);
                            }
                        }

                        if (bCurrentFlag === false) { this._oController.getView().byId("nrgAppFtrDetails-rhs-currentItemContent").setText('None'); }
                        if (bPendingFlag === false) { this._oController.getView().byId("nrgAppFtrDetails-rhs-pendingItemContent").setText('None'); }
                        if (bHistoryFlag === false) { this._oController.getView().byId("nrgAppFtrDetails-rhs-historyItemContent").setText('None'); }

                        this.footerElement.rhsEmptySec.setVisible(false);
                        this.footerElement.rhsProdSec.setVisible(true);

                    } else {

                        if (bCurrentFlag === false) { this._oController.getView().byId("nrgAppFtrDetails-rhs-currentItemContent").setText('None'); }
                        if (bPendingFlag === false) { this._oController.getView().byId("nrgAppFtrDetails-rhs-pendingItemContent").setText('None'); }
                        if (bHistoryFlag === false) { this._oController.getView().byId("nrgAppFtrDetails-rhs-historyItemContent").setText('None'); }

                        this.footerElement.rhsEmptySec.setVisible(false);
                        this.footerElement.rhsProdSec.setVisible(true);
                    }
                }.bind(this),
                error: function (oError) {
                    this.footerElement.rhsEmptySec.setVisible(true);
                    this.footerElement.rhsProdSec.setVisible(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        AppFooter.prototype._updateRouting = function (sBpNumber, sCaNumber, sCoNumber) {
            var oRouting = this._oController.getView().getModel('oFooterRouting');
            oRouting.setProperty('/BpNumber', sBpNumber);
            oRouting.setProperty('/CaNumber', sCaNumber);
            oRouting.setProperty('/CoNumber', sCoNumber);
        };

        AppFooter.prototype.updateFooterCampaign = function (sBpNumber, sCaNumber, sCoNumber) {
            this._updateRouting(sBpNumber, sCaNumber, sCoNumber);
            this._updateFooterCampaignContract(sCoNumber);
            this._updateFooterCampaignButton(sCoNumber);
        };

        AppFooter.prototype._updateFooterCampaignContract = function (sCoNumber) {
            var sPath = '/CpgFtrS',
                aFilters = [],
                oModel = this._oController.getView().getModel('oCompODataSvc'),
                oCampaignModel = this._oController.getView().getModel('oFooterCampaign'),
                oParameters;
            if (!sCoNumber) {
                return;
            }
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sCoNumber}));


            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    var i;
                    if (oData.results.length > 0) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (oData.results[i].Type === 'C') {
                                oCampaignModel.setProperty('/Current', oData.results[i]);

                                if (oCampaignModel.oData.Current.OfferTitle !== 'None' && oCampaignModel.oData.Current.OfferTitle !== '') {
                                    this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-currentItem').addStyleClass('hasValue');
                                }
                                this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-currentItem').setText(oCampaignModel.oData.Current.OfferTitle);
                                this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-startDateValue').setText(this._formatCampaignTime(oCampaignModel.oData.Current.StartDate));
                                this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-endDateValue').setText(this._formatCampaignTime(oCampaignModel.oData.Current.EndDate));
                            }
                            if (oData.results[i].Type === 'PE') {
                                oCampaignModel.setProperty('/Pending', oData.results[i]);

                                if (oCampaignModel.oData.Pending.OfferTitle !== 'None' && oCampaignModel.oData.Pending.OfferTitle !== '') {
                                    this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-pendingItem').addStyleClass('hasValue');
                                }
                                this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-pendingItem').setText(oCampaignModel.oData.Pending.OfferTitle);
                            }
                            if (oData.results[i].Type === 'H') {
                                oCampaignModel.setProperty('/History', oData.results[i]);

                                if (oCampaignModel.oData.History.OfferTitle !== 'None' && oCampaignModel.oData.History.OfferTitle !== '') {
                                    this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-historyItem').addStyleClass('hasValue');
                                }
                                this._oController.getView().byId('nrgAppFtrDetails-eligibleOffers-historyItem').setText(oCampaignModel.oData.History.OfferTitle);
                            }
                        }
                        this.footerElement.campEmptySec.setVisible(false);
                        this.footerElement.campOfferSec.setVisible(true);
                        this.footerElement.campBtnSec.setVisible(true);
                    } else {
                        this.footerElement.campEmptySec.setVisible(true);
                        this.footerElement.campOfferSec.setVisible(false);
                        this.footerElement.campBtnSec.setVisible(false);
                    }
                }.bind(this),
                error: function (oError) {
                    this.footerElement.campEmptySec.setVisible(true);
                    this.footerElement.campOfferSec.setVisible(false);
                    this.footerElement.campBtnSec.setVisible(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        AppFooter.prototype._updateFooterCampaignButton = function (sCoNumber) {
            if (!sCoNumber) {
                return;
            }
            var sPath = '/ButtonS(' + sCoNumber + ')',
                oModel = this._oController.getView().getModel('oCompODataSvc'),
                oCampaignModel = this._oController.getView().getModel('oFooterCampaign'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.Contract) {
                        if (oData.FirstBill === 'x' || oData.FirstBill === 'X') {
                            oCampaignModel.setProperty('/CampaignButtonText', 'Eligible offers Available');
                            oCampaignModel.setProperty('/CampaignFirstBill', true);
                        } else {
                            oCampaignModel.setProperty('/CampaignButtonText', 'No Eligible offers Available');
                            oCampaignModel.setProperty('/CampaignFirstBill', false);
                        }
                        this._oController.getView().byId('nrgAppFtrDetails-campaignButton-itemTitle').setText(oCampaignModel.oData.CampaignButtonText);
                        oCampaignModel.setProperty('/CampaignButtonType', oData.InitTab);
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        AppFooter.prototype._formatCampaignTime = function (oDate) {
            if (oDate) {
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "MM/yyyy"}),
                    dateStr = dateFormat.format(new Date(oDate.getTime()));
                return dateStr;
            }
        };

        AppFooter.prototype.onCampaignBtnClick = function () {
            var oCampaignModel = this._oController.getView().getModel('oFooterCampaign'),
                oRouter = this._oController.getOwnerComponent().getRouter(),
                oRouting = this._oController.getView().getModel('oFooterRouting');

            if (oCampaignModel.getProperty('/CampaignFirstBill')) {
                oRouter.navTo('campaignoffers', {bpNum: oRouting.oData.BpNumber, caNum: oRouting.oData.CaNumber, coNum: oRouting.oData.CoNumber, typeV: oCampaignModel.getProperty('/CampaignButtonType')});
            } else {
                ute.ui.main.Popup.Alert({
                    title: 'No First Bill',
                    message: 'Customer has to completed at least One Month Invoice'
                });
            }
        };

        AppFooter.prototype.onCampaignItemClick = function (oControlEvent) {
            var oRouter = this._oController.getOwnerComponent().getRouter(),
                oRouting = this._oController.getView().getModel('oFooterRouting'),
                item = oControlEvent.getSource().getDomRef().childNodes[0];

            if ($(item).hasClass('currentItem') && $(item).hasClass('hasValue')) {
                oRouter.navTo('campaign', {bpNum: oRouting.oData.BpNumber, caNum: oRouting.oData.CaNumber, coNum: oRouting.oData.CoNumber, typeV: 'C'});
            }

            if ($(item).hasClass('pendingItem') && $(item).hasClass('hasValue')) {
                oRouter.navTo('campaign', {bpNum: oRouting.oData.BpNumber, caNum: oRouting.oData.CaNumber, coNum: oRouting.oData.CoNumber, typeV: 'PE'});
            }

            if ($(item).hasClass('historyItem') && $(item).hasClass('hasValue')) {
                oRouter.navTo('campaignhistory', {bpNum: oRouting.oData.BpNumber, caNum: oRouting.oData.CaNumber, coNum: oRouting.oData.CoNumber});
            }

        };

































        AppFooter.prototype.reset = function () {
            var oView = this._oController.getView();
            oView.byId('appFtr').removeStyleClass('uteAppFtr-open');
            this._getSubmenu().close();
        };

        AppFooter.prototype.setExpanded = function (bExpanded) {
            bExpanded = !!bExpanded;

            if (bExpanded) {
                this._getSubmenu().open();
            } else {
                this._getSubmenu().close();
            }
        };

        AppFooter.prototype.isExpanded = function () {
            return this._getSubmenu().isOpen();
        };

        AppFooter.prototype._registerEvents = function () {
            var oView = this._oController.getView();
            oView.byId('appFtrCaret').attachEvent('click', this._onFooterCaretClick, this);
        };

        AppFooter.prototype._onFooterCaretClick = function (oControlEvent) {
            var oView = this._oController.getView();
            oView.byId('appFtr').toggleStyleClass('uteAppFtr-open');
            this._getSubmenu().open();
        };

        AppFooter.prototype._onFooterSubmenuCaretClick = function (oControlEvent) {
            var oView = this._oController.getView();
            oView.byId('appFtr').toggleStyleClass('uteAppFtr-open');
            this._getSubmenu().close();
        };

        AppFooter.prototype._getSubmenu = function () {
            var oView;

            if (!this._oSubmenu) {
                oView = this._oController.getView();
                this._oSubmenu = sap.ui.xmlfragment(oView.getId(), 'nrg.module.app.view.AppFooterDetails', this._oController);
                this._oSubmenu.setPosition(oView.byId('appFtr'), '0 0');
                oView.addDependent(this._oSubmenu);
                oView.byId('appFtrSMenuCaret').attachEvent('click', this._onFooterSubmenuCaretClick, this);

                // Initialize the oData model in footer
                this._oApp._initFooterContent();
            }

            return this._oSubmenu;
        };

        return AppFooter;
    }
);
