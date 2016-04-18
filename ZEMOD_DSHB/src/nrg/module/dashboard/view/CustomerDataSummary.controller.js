/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/core/routing/HashChanger',
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/dashboard/view/DepositToolPopup'
    ],

    function (CoreController, HashChanger, JSONModel, Filter, FilterOperator, DepositToolPopup) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.dashboard.view.CustomerDataSummary');

        Controller.prototype.onInit = function () {

        };

        Controller.prototype.onBeforeRendering = function () {
            this.getView().setModel(this.getOwnerComponent().getModel('comp-dashboard'), 'oODataSvc');
            this.getView().setModel(this.getOwnerComponent().getModel('comp-dashboard-AcctAccessPty'), 'oDataASvc');

            // Model to keep information to show
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryBpInf');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryBuagInf');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryAllBuags');

            // Model to keep information of badges
            if (this.allCoBadges) {
                this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryCoBadges');
                this.getView().getModel('oSmryCoBadges').setData(this.allCoBadges);
            } else {
                this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryCoBadges');
            }

            //Model to keep segmentation information
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryBpSegInf');

            //Model to keep Segmentation Info if it's more than 3 segmentations
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryBpAllSegInf');

            //Model to keep Assainged Accounts
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryAssignedAccounts');

            //Model to Keep Account Access Authorizations
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSmryAccessAuth');

            // Retrieve routing parameters
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            this._initRetrBpInf();
            //this._initRetrBpSegInf();

            // Check if Account Access Authorization has been labeled
            this._checkThirdPartyAuth(this._caNum);
        };

        Controller.prototype.onAfterRendering = function () {
            var oEventBus = sap.ui.getCore().getEventBus();

            // Subscribe CA change events
            oEventBus.unsubscribe("nrg.module.dashoard", "eBuagChanged", this._handleBuagChanged, this);
            oEventBus.subscribe("nrg.module.dashoard", "eBuagChanged", this._handleBuagChanged, this);
            oEventBus.unsubscribe("nrg.module.dashoard", "eBuagChangedFromCaInfo", this._handleCaInfoContractChanged, this);
            oEventBus.subscribe("nrg.module.dashoard", "eBuagChangedFromCaInfo", this._handleCaInfoContractChanged, this);
            // Subscribe CO change events
            oEventBus.unsubscribe("nrg.module.dashoard", "eCoChanged", this._handleCoChanged, this);
            oEventBus.subscribe("nrg.module.dashoard", "eCoChanged", this._handleCoChanged, this);
            this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);
        };

        /*--------------------------------------------------- CA Changes ----------------------------------------------------*/

        Controller.prototype._handleBuagChanged = function (channel, event, data) {
            this._selectBuag(data.iIndex);
        };

        Controller.prototype._handleCaInfoContractChanged = function (channel, event, data) {
            var i, oAllBuags = this.getView().getModel('oSmryAllBuags');

            for (i = 0; i < oAllBuags.getProperty('/results').length; i = i + 1) {
                if (parseInt(oAllBuags.getProperty('/results')[i].ContractAccountID, 10) === parseInt(data.caNum, 10)) {
                    this._selectBuag(i);
                    return;
                }
            }
        };

        /*--------------------------------------------------- CO Changes ----------------------------------------------------*/

        Controller.prototype._handleCoChanged = function (channel, event, data) {
            var oCoBadgesModel = this.getView().getModel('oSmryCoBadges');
            oCoBadgesModel.setData(data.coInfo.COBadges);
            this.allCoBadges = data.coInfo.COBadges;
        };

        /*-------------------------------------------------- Retrieve Info --------------------------------------------------*/

        Controller.prototype._initRetrBpInf = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                //sBpNum,
                sPath;
                //oComponentContextModel = this.getOwnerComponent().getCcuxContextManager().getContext();

            /*
            if (oComponentContextModel.getProperty('/dashboard/bpNum')) {
                sBpNum = oComponentContextModel.getProperty('/dashboard/bpNum');
            } else {
                sBpNum = oRouteInfo.parameters.bpNum;
            }*/

            sPath = '/Partners' + '(\'' + this._bpNum + '\')';

            this._retrBpInf(sPath);
            this._initRetrCaInf(this._bpNum);  //Should be triggered in Success call back of BP retriev
            this._initRetrBpSegInf(this._bpNum);
        };

        Controller.prototype._initRetrBpSegInf = function (BpNum) {
            var sPath;

            //aSplitHash = (this._retrUrlHash()).split('/');
            //iSplitHashL = aSplitHash.length;
            sPath = '/Partners' + '(\'' + BpNum + '\')/BpSegs';

            this._retrBpSegInf(sPath);
        };

        Controller.prototype._initRetrCaInf = function (BpNum) {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                sCaNum,
                sPath;

            /*if (oRouteInfo.parameters.caNum && oRouteInfo.parameters.caNum !== 0) {
                sCaNum = oRouteInfo.parameters.caNum;
                sPath = '/Buags' + '(\'' + sCaNum + '\')';
                this._bCaNumKnown = true;
            } else {
                this._bCaNumKnown = false;
            }*/
            sPath = '/Partners' + '(\'' + BpNum + '\')/Buags';
            this._retrCaInf(sPath);
        };

        Controller.prototype._initRetrAssignedAccount = function (CaNum) {
            var sPath;
            if (CaNum) {
                sPath = '/Buags' + '(\'' + CaNum + '\')/BpAssigns';
                this._retrAssignedAccount(sPath);
            }
        };

        Controller.prototype._retrAssignedAccount = function (sPath) {
            var oModel = this.getView().getModel('oODataSvc'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.results) {
                        if (oData.results.length === 0) {
                            this.getView().byId('id_AssignedAccBtn').setVisible(false);
                        } else {
                            this.getView().byId('id_AssignedAccBtn').setVisible(true);
                            this.getView().getModel('oSmryAssignedAccounts').setData(oData.results);
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };


        Controller.prototype._retrUrlHash = function () {
            //Get the hash to retrieve bp #
            var oHashChanger = new HashChanger(),
                sUrlHash = oHashChanger.getHash();

            return sUrlHash;
        };

        Controller.prototype._retrCaInf = function (sPath) {
            var oModel = this.getView().getModel('oODataSvc'),
                oParameters,
                i;

            oParameters = {
                success : function (oData) {
                    if (oData) {

                        if (this._caNum) {
                            for (i = 0; i < oData.results.length; i = i + 1) {
                                if (parseInt(oData.results[i].ContractAccountID, 10) === parseInt(this._caNum, 10)) {
                                    this.getView().getModel('oSmryBuagInf').setData(oData.results[i]);
                                }
                            }
                        } else {
                            this.getView().getModel('oSmryBuagInf').setData(oData.results[0]);
                        }

                        this._initRetrAssignedAccount(this.getView().getModel('oSmryBuagInf').getProperty('/ContractAccountID'));
                        this._caNum = this.getView().getModel('oSmryBuagInf').getProperty('/ContractAccountID');
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._selectBuag = function (iIndex) {
            if (this.getView().getModel('oSmryAllBuags').getProperty('/results').length >= iIndex) {
                this.getView().getModel('oSmryBuagInf').setData(this.getView().getModel('oSmryAllBuags').getProperty('/results')[iIndex]);
                this.getView().getModel('oSmryAllBuags').setProperty('/selectedIndex', iIndex);
                if (this.getView().getModel('oSmryBuagInf').getProperty('/ContractAccountID')) {
                    this._initRetrAssignedAccount(this.getView().getModel('oSmryBuagInf').getProperty('/ContractAccountID'));
                    this._caNum = this.getView().getModel('oSmryBuagInf').getProperty('/ContractAccountID');
                    this._checkThirdPartyAuth(this._caNum);
                }
            }
        };

        Controller.prototype._retrBpInf = function (sPath) {
            var oModel = this.getView().getModel('oODataSvc'),
                oParameters,
                i;

            oParameters = {
                urlParameters: {"$expand": "Buags"},
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oSmryBpInf').setData(oData);

                        var caIndex = 0;

                        if (this._caNum) {
                            for (i = 0; i < oData.Buags.results.length; i = i + 1) {
                                if (parseInt(oData.Buags.results[i].ContractAccountID, 10) === parseInt(this._caNum, 10)) {
                                    caIndex = i;
                                }
                            }
                        }

                        if (oData.Buags.results[caIndex]) {
                            this.getView().getModel('oSmryBuagInf').setData(oData.Buags.results[caIndex]);
                            this.getView().getModel('oSmryAllBuags').setData(oData.Buags);
                            this.getView().getModel('oSmryAllBuags').setProperty('/selectedIndex', caIndex);
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrBpSegInf = function (sPath) {
            var oModel = this.getView().getModel('oODataSvc'),
                oParameters,
                oData_ThreeOnly = {results: [] },
                i;

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        if (oData.results.length <= 3) {
                            for (i = 0; i < oData.results.length; i = i + 1) {
                                oData.results[i].moreThanThree = false;
                            }
                            this.getView().getModel('oSmryBpSegInf').setData(oData.results);
                        } else {
                            for (i = 0; i < 3; i = i + 1) {
                                if (i < 2) {
                                    oData.results[i].moreThanThree = false;
                                } else {
                                    oData.results[i].moreThanThree = true;
                                }
                                oData_ThreeOnly.results.push(oData.results[i]);
                            }
                            this.getView().getModel('oSmryBpSegInf').setData(oData_ThreeOnly.results);
                            this.getView().getModel('oSmryBpAllSegInf').setData(oData.results);
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._onAssignedAccountClick = function () {
            //sap.ui.commons.MessageBox.alert("Assigned Account Link Clicked");
            this._oAssignedPopup = ute.ui.main.Popup.create({
                content: this.getView().byId("idAssignedAccs"),
                title: 'ASSIGNED ACCOUNTS'
            });

            this._oAssignedPopup.open();
        };

        Controller.prototype._onExpandSegInfoClick = function () {
            //pop up start
            this._oSegPopup = ute.ui.main.Popup.create({
                content: this.getView().byId("idThreeSegs"),
                title: 'SEGMENTATION'
            });
            this._oSegPopup.open();
        };

        Controller.prototype._onBpNumClicked = function () {
            var oRouter = this.getOwnerComponent().getRouter();
                //sSelectedBpNum = this.getView().getModel('oSmryBpInf').getProperty('/PartnerID');

            if (this._caNum) {
                if (this._coNum) {
                    oRouter.navTo('bupa.bpInfo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
                } else {
                    oRouter.navTo('bupa.bpInfoNoCo', {bpNum: this._bpNum, caNum: this._caNum});
                }
            } else {
                oRouter.navTo('bupa.bpInfoNoCoNoCa', {bpNum: this._bpNum});
            }
        };

        Controller.prototype._onCaNumClicked = function () {
            var oRouter = this.getOwnerComponent().getRouter();
                //sSelectedBpNum = this.getView().getModel('oSmryBpInf').getProperty('/PartnerID'),
                //sSelectedCaNum = this.getView().getModel('oSmryBuagInf').getProperty('/ContractAccountID');
            if (this._coNum) {
                oRouter.navTo('bupa.caInfo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('bupa.caInfoNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        /*------------------------------------------------ UI Element Actions -----------------------------------------------*/

        Controller.prototype._onDepositToolClicked = function () {
            if (!this.DepositToolPopupCustomControl) {
                this.DepositToolPopupCustomControl = new DepositToolPopup({ title: 'DEPOSIT TOOL' });
                this.DepositToolPopupCustomControl.attachEvent("DepositToolCompleted", function () {}, this);
                this.getView().addDependent(this.DepositToolPopupCustomControl);
            }
            this.DepositToolPopupCustomControl.preparePopup();
        };

        /*------------------------------------------ Account Access Authorization -------------------------------------------*/

        Controller.prototype._checkThirdPartyAuth = function (sCaNumber) {
            var sPath = '/Buags' + '(\'' + sCaNumber + '\')',
                oModel = this.getView().getModel('oODataSvc'),
                oThirdPrtyModel = this.getView().getModel('oSmryAccessAuth'),
                bRetreiveComplete = false,
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.ThirdPrtyAuth === 'X' || oData.ThirdPrtyAuth === 'x') {
                        // Retrieve the data for the Account Access Authorization
                        this._retrThirdPartyAuth(this._caNum, function () {bRetreiveComplete = true; });
                        // Check the completion of retrieving data every 0.1 s
                        var checkRetrComplete = setInterval(function () {
                            if (bRetreiveComplete) {
                                clearInterval(checkRetrComplete);
                                this._setHoverAuthNames(oThirdPrtyModel);
                            }
                        }.bind(this), 100);
                        // Change the style of BP name
                        this.getView().byId("idBtnAuth").setVisible(true);
                        this.getView().byId("idBpName").addStyleClass("nrgDashboard-cusDataSum-bpName-AcctAccessPty");
                    } else {
                        // Change the style of BP name
                        this.getView().byId("idBtnAuth").setVisible(false);
                        this.getView().byId("idBpName").removeStyleClass("nrgDashboard-cusDataSum-bpName-AcctAccessPty");
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }

        };

        Controller.prototype._setHoverAuthNames = function (oThirdPrtyModel) {
            var aHoverAuthNames = [],
                i;

            if (oThirdPrtyModel.oData.length) {
                for (i = 0; i < 3; i = i + 1) {
                    if (oThirdPrtyModel.oData[i]) {
                        aHoverAuthNames.push({Name: oThirdPrtyModel.oData[i].AuthPrtyName});
                    }
                }
                oThirdPrtyModel.setProperty('/hoverAuthNames', aHoverAuthNames);
            }
        };

        Controller.prototype._onAuthPtyClicked = function () {
            var oThirdPrtyModel = this.getView().getModel('oSmryAccessAuth'),
                bRetreiveComplete = false,
                checkRetrComplete;

            // Display the loading indicator
            this.getOwnerComponent().getCcuxApp().setOccupied(true);

            // Retrieve the data for the Account Access Authorization
            this._retrThirdPartyAuth(this._caNum, function () {bRetreiveComplete = true; });

            // Check the completion of retrieving data every 0.1 s
            checkRetrComplete = setInterval(function () {
                if (bRetreiveComplete) {
                    // Dismiss the loading indicator
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    // Upon successfully retrieving the data, stop checking the completion of retrieving data
                    clearInterval(checkRetrComplete);
                    if (!this._oAccAuthPtyPopup) {
                        this._oAccAuthPtyPopup = ute.ui.main.Popup.create({
                            content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.dashboard.view.AcctAccessAuthPty", this),
                            title: 'ACCOUNT ACCESS AUTHORIZATION'
                        });
                        this._oAccAuthPtyPopup.addStyleClass('nrgDashboard-accAuthPtyPopup');
                        this.getView().addDependent(this._oAccAuthPtyPopup);
                    }

                    // Generate the table
                    var tableContainer = this.getView().byId('nrgDashboard-AcctAccessAuthPty-tableBody'),
                        tableContentLength,
                        j,
                        i,
                        rowElement,
                        statusElement;

                    // Remove previous content
                    tableContentLength = tableContainer.getContent().length;
                    for (j = 0; j < tableContentLength; j = j + 1) {
                        tableContainer.removeContent(0);
                    }

                    for (i = 0; i < oThirdPrtyModel.oData.length; i = i + 1) {
                        rowElement = new ute.ui.commons.Tag({elem: 'div'}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow');
                        if ((i + 1) % 2 === 0) {
                            rowElement.addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-even');
                        }
                        rowElement.addContent(new ute.ui.commons.Tag({elem: 'div', text: oThirdPrtyModel.oData[i].AuthPrtyName}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-AuthParty'));
                        rowElement.addContent(new ute.ui.commons.Tag({elem: 'div', text: oThirdPrtyModel.oData[i].LegalDoc}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-TypeLegalDoc'));
                        rowElement.addContent(new ute.ui.commons.Tag({elem: 'div', text: oThirdPrtyModel.oData[i].ReceiveDate}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-ReceivedDate'));
                        rowElement.addContent(new ute.ui.commons.Tag({elem: 'div', text: oThirdPrtyModel.oData[i].EffDate}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-EffecDate'));
                        rowElement.addContent(new ute.ui.commons.Tag({elem: 'div', text: oThirdPrtyModel.oData[i].EndDate}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-EndDate'));
                        // Different style class for different status
                        statusElement = new ute.ui.commons.Tag({elem: 'div', text: oThirdPrtyModel.oData[i].Status}).addStyleClass('nrgDashboard-AcctAccessAuthPty-tableRow-Status');
                        if (oThirdPrtyModel.oData[i].Status === 'ACTIVE') {
                            statusElement.addStyleClass('active');
                        }
                        if (oThirdPrtyModel.oData[i].Status === 'INACTIVE') {
                            statusElement.addStyleClass('inactive');
                        }
                        rowElement.addContent(statusElement);

                        tableContainer.addContent(rowElement);
                    }

                    this._oAccAuthPtyPopup.open();
                }
            }.bind(this), 100);
        };

        Controller.prototype._retrThirdPartyAuth = function (sCaNumber, fbCallback) {
            var sPath = '/Buags' + '(\'' + sCaNumber + '\')/ThirdPartyAuth',
                oModel = this.getView().getModel('oODataSvc'),
                oThirdPrtyModel = this.getView().getModel('oSmryAccessAuth'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    var i;
                    if (oData.results) {
                        oThirdPrtyModel.setData(oData.results);

                        this._setHoverAuthNames(oThirdPrtyModel);

                        for (i = 0; i < oThirdPrtyModel.oData.length; i = i + 1) {
                            oThirdPrtyModel.oData[i].ReceiveDate = this._formatThirdPartyAuthTime(oThirdPrtyModel.oData[i].ReceiveDate);
                            oThirdPrtyModel.oData[i].EffDate = this._formatThirdPartyAuthTime(oThirdPrtyModel.oData[i].EffDate);
                            oThirdPrtyModel.oData[i].EndDate = this._formatThirdPartyAuthTime(oThirdPrtyModel.oData[i].EndDate);
                        }
                    }
                    // Execute the callback function
                    if (fbCallback) {
                        fbCallback();
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._formatThirdPartyAuthTime = function (oDate) {
            if (oDate) {
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "MM/dd/yyyy"}),
                    dateStr = dateFormat.format(new Date(oDate.getTime()));
                return dateStr;
            }
        };

        Controller.prototype._onAddThirdPartyAuth = function (oEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_ACC_AUTH"
            });
        };

        Controller.prototype._formatBadge = function (cIndicator) {
            if (cIndicator === 'x' || cIndicator === 'X') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._formatSiebel = function (cIndicator) {
            if (cIndicator === 'x' || cIndicator === 'X') {
                return true;
            } else {
                return false;
            }
        };


        return Controller;
    }
);
