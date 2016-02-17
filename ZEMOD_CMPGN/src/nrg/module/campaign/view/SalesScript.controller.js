/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'ute/ui/commons/Dialog',
        "sap/ui/model/json/JSONModel",
        'nrg/module/nnp/view/NNPPopup'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, Dialog, JSONModel, NNPPopup) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.campaign.view.SalesScript');

        /* =========================================================== */
		/* lifecycle method- Init                                      */
		/* =========================================================== */
        Controller.prototype.onInit = function () {
        };

        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        Controller.prototype.onAfterRendering = function () {
            // Update Footer
            this.getOwnerComponent().getCcuxApp().updateFooter(this._sBP, this._sCA, this._sContract);
        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
			var oModel = this.getOwnerComponent().getModel('comp-campaign'),
                mParameters,
                aFilters,
                sCurrentPath,
                oDropDownList,
                oDropDownListItemTemplate,
                aFilterIds,
                aFilterValues,
                oMandDiscloureTV,
                fnRecievedHandler,
                that = this,
                aContent,
                sPath,
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                i18NModel,
                oRejectRsns = that.getView().byId('idnrgRejectRsnsMD'),
                oRejectsRsnsTemp = that.getView().byId('idnrgRejectRsnsTempl');
            // To Avoid reloading after NNP opens up
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEditEmailNNP');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEditEmailValidate');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oLocalModel');
            // To Avoid reloading after NNP opens up
            this.getView().setModel(this.getOwnerComponent().getModel('comp-dashboard'), 'oODataSvc');// This is to just to make NNP not to relaod.
            i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._sContract = oRouteInfo.parameters.coNum;
            this._sOfferCode = oRouteInfo.parameters.offercodeNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this._sType = oRouteInfo.parameters.stype;
            this._sPromo = oRouteInfo.parameters.sPromo;
            sCurrentPath = "/CpgChgOfferS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Promo='" + this._sPromo + "',Type='" + this._sType + "')";
            this._bindView(sCurrentPath);
            sCurrentPath = sCurrentPath + "/Scripts";
            aFilterIds = ["TxtName"];
            aFilterValues = ['MAND'];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oDropDownList = this.getView().byId("idnrgCamSSDdL");
            oDropDownListItemTemplate = this.getView().byId("idnrgCamSSLngLtIt").clone();
            oMandDiscloureTV = this.getView().byId("idCamSSMdTv");
            fnRecievedHandler = function (oEvent) {
                aContent = oDropDownList.getContent();
                if ((aContent !== undefined) && (aContent.length > 0)) {
                    sPath = aContent[0].getBindingContext("comp-campaign").getPath();
                    oDropDownList.setSelectedKey("EN");
                    oMandDiscloureTV.bindElement({
                        model : "comp-campaign",
                        path : sPath
                    });
                }
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
            };
            mParameters = {
                model : "comp-campaign",
                path : sCurrentPath,
                template : oDropDownListItemTemplate,
                filters : aFilters,
               // parameters : {expand : "Scripts"},
                events: {dataReceived : fnRecievedHandler}
            };
            oDropDownList.bindAggregation("content", mParameters);
            sCurrentPath = "/RejectRsnS";
            mParameters = {
                model : "comp-campaign",
                path : sCurrentPath,
                template : oRejectsRsnsTemp
            };
            oRejectRsns.bindAggregation("content", mParameters);
        };

        /**
		 * Binds the view to the object path. Makes sure that view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 *
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		Controller.prototype._bindView = function (sObjectPath) {
            this.getView().bindElement({
                model : "comp-campaign",
                path : sObjectPath
            });

        };

       /**
		 * Assign the filter objects based on the input selection
		 *
		 * @function
		 * @param {Array} aFilterIds to be used as sPath for Filters
         * @param {Array} aFilterValues for each sPath
		 * @private
		 */
        Controller.prototype._createSearchFilterObject = function (aFilterIds, aFilterValues) {
            var aFilters = [],
                iCount;

            for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
            }
            return aFilters;
        };
        /**
		 * Action to be taken when the User clicks on Accept of Sales Script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAccept = function (oEvent) {
            var sCurrentPath,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oBindingInfo,
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sCurrentPath = "/PrepayS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Scored=false)";
            oBindingInfo = {
                success : function (oData) {
                    if (oData) {
                        if (oData.Flag === 'N') {
                            that.onNNP();
                        }
                        if (oData.Flag === 'E') {
                            sap.ui.commons.MessageBox.alert(oData.Script);
                        }
                        if (oData.Flag === 'Y') {
                            if (!that._oSwapFragment) {
                                that._oSwapFragment = sap.ui.xmlfragment("SwapScripts", "nrg.module.campaign.view.SwapScript", that);
                            }
                            if (that._oSwapDialog === undefined) {
                                that._oSwapDialog = new ute.ui.main.Popup.create({
                                    title: 'SWAP DEPOSIT SCRIPT',
                                    content: this._oSwapFragment
                                });
                                that._oSwapDialog.setShowCloseButton(false);
                            }
                            var oDescription = sap.ui.core.Fragment.byId("SwapScripts", "idnrgSwapDesc");
                            oDescription.setText(oData.Script);
                            that._oSwapDialog.open();
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(true);

                }.bind(this)
            };
            if (oModel) {
                oModel.read(sCurrentPath, oBindingInfo);
            }

        };
        /**
		 * Action to be taken when the User clicks on Yes of the swap script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onSwapYes = function (oEvent) {
            var sCurrentPath,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oBindingInfo,
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sCurrentPath = "/DepositS(Contract='" + this._sContract + "')";
            oBindingInfo = {
                success : function (oData) {
                    if (oData) {
                        if (oData.Proceed) {
                            that.onNNP();
                            that._oSwapDialog.close();
                        } else {
                            // launch transaction launcher
                            var oWebUiManager = that.getOwnerComponent().getCcuxWebUiManager();
                            oWebUiManager.notifyWebUi('openIndex', {
                                LINK_ID: "Z_OT_PAYMT"
                            });
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(true);

                }.bind(this)
            };
            if (oModel) {
                oModel.read(sCurrentPath, oBindingInfo);
            }
        };
        /**
		 * Action to be taken when the User clicks on No of the swap script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onSwapNo = function (oEvent) {
            this._oSwapDialog.close();
        };
        /**
		 * Action to be taken when the User clicks on Other Deposit Alternatives of swap script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onSwapOther = function (oEvent) {
            this._oSwapDialog.close();
            this.onNNP();
        };
        /**
		 * Action to be taken after Swap Script query to launch NNP
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onNNP = function (oEvent) {
            var sCurrentPath,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oBindingInfo,
                NNPPopupControl = new NNPPopup();
            NNPPopupControl.attachEvent("NNPCompleted", this.invokeOverviewScript, this);
            this.getView().addDependent(NNPPopupControl);
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sCurrentPath = "/NNPS('" + this._sBP + "')";
            oBindingInfo = {
                success : function (oData) {
                    NNPPopupControl.openNNP(oData.BP, oData.Email, oData.ConsNum);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(true);
                    jQuery.sap.log.info("NNP Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sCurrentPath, oBindingInfo);
            }

        };
        /**
		 * Action to be taken when the User clicks on Accept of Sales Script and NNP is executed
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.invokeOverviewScript = function (oEvent) {
            var sCurrentPath,
                oDropDownList,
                oDropDownListItemTemplate,
                mParameters,
                aFilters,
                aContent,
                obinding,
                sPath,
                that = this,
                fnRecievedHandler,
                oOverScriptTV,// need to point it to fragment
                aFilterIds,
                aFilterValues,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oContext,
                dStartDate,
                oRejectRsns,
                oRejectsRsnsTemp = that.getView().byId('idnrgRejectRsnsTempl');

            if (!this._oDialogFragment) {
                this._oDialogFragment = sap.ui.xmlfragment("OverViewScripts", "nrg.module.campaign.view.OverviewScript", this);
            }
            this._oDialogFragment.setModel(oModel, 'view-campaign');
            if (this._oOverviewDialog === undefined) {
                this._oOverviewDialog = new ute.ui.main.Popup.create({
                    title: 'OVERVIEW SCRIPT',
                    close: this._handleDialogClosed,
                    content: this._oDialogFragment
                });
                this._oOverviewDialog.setShowCloseButton(false);
            }
            sCurrentPath = "/CpgChgOfferS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Promo='" + this._sPromo + "',Type='" + this._sType + "')";
            sCurrentPath = sCurrentPath + "/Scripts";
            aFilterIds = ["TxtName"];
            aFilterValues = ["OVW"];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            this._oOverviewDialog.setWidth("750px");
            this._oOverviewDialog.setHeight("auto");
            this._oOverviewDialog.addStyleClass("nrgCamOvs-dialog");

            oOverScriptTV = sap.ui.core.Fragment.byId("OverViewScripts", "idnrgCamOvsOvTv");

            oDropDownList = sap.ui.core.Fragment.byId("OverViewScripts", "idnrgCamOvsDdL");
            aContent = oDropDownList.getContent();
            oDropDownListItemTemplate = this.getView().byId("idnrgCamSSLngLtItOv").clone();
            fnRecievedHandler = function () {
                aContent = oDropDownList.getContent();
                if ((aContent !== undefined) && (aContent.length > 0)) {
                    sPath = aContent[0].getBindingContext("view-campaign").getPath();
                    oDropDownList.setSelectedKey("EN");
                    oOverScriptTV.bindElement({
                        model : "view-campaign",
                        path : sPath
                    });

                }
                that._oOverviewDialog.open();
                obinding.detachDataReceived(fnRecievedHandler);
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
            };
            mParameters = {
                model : "view-campaign",
                path : sCurrentPath,
                template : oDropDownListItemTemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oDropDownList.bindAggregation("content", mParameters);
            obinding = oDropDownList.getBinding("content");
            //this.getView().addDependent(this._oOverviewDialog);
            oRejectRsns = sap.ui.core.Fragment.byId('OverViewScripts', 'idnrgRejectRsnsOV');
            oRejectsRsnsTemp = that.getView().byId('idnrgRejectRsnsTemplOV');
            sCurrentPath = "/RejectRsnS";
            mParameters = {
                model : "view-campaign",
                path : sCurrentPath,
                template : oRejectsRsnsTemp
            };
            oRejectRsns.bindAggregation("content", mParameters);
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
        };
        /**
		 * Back to Overview page function
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.backToOverview = function (oEvent) {
            this.navTo("campaign", {bpNum: this._sBP, caNum: this._sCA, coNum : this._sContract, typeV: "C"});
        };
        /**
		 * Formats the Type value to display "English" and "Spanish"
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.formatType = function (sType) {
            var i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            if (sType === "EN") {
                return i18NModel.getProperty("nrgCmpSSEN");
            } else {
                return i18NModel.getProperty("nrgCmpSSES");
            }
        };
        /**
		 * Change the binding if the language is selected for Mandatory Discription
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.onMandLngSelected = function (oEvent) {
            var sPath,
                oMandDiscloureTV = this.getView().byId("idCamSSMdTv"),
                sSelectedKey,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oDropDownList = this.getView().byId("idnrgCamSSDdL");
            sSelectedKey = oEvent.getSource().getProperty("selectedKey");
            if ((oDropDownList) && (oDropDownList.getContent())) {
                oDropDownList.getContent().forEach(function (item) {
                    var oContext = item.getBindingContext("comp-campaign");
                    if (sSelectedKey === oContext.getProperty("TxtLang")) {
                        sPath = oContext.getPath();
                    }
                });
            }
            if (sPath) {
                oMandDiscloureTV.bindElement({
                    model : "comp-campaign",
                    path : sPath
                });
            }

        };
        /**
		 * Change the binding if the language is selected for Overview script
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.onOvwLngSelected = function (oEvent) {
            var sPath,
                oOverScriptTV = sap.ui.core.Fragment.byId("OverViewScripts", "idnrgCamOvsOvTv"),
                sSelectedKey,
                oDropDownList = sap.ui.core.Fragment.byId("OverViewScripts", "idnrgCamOvsDdL");
            sSelectedKey = oEvent.getSource().getProperty("selectedKey");
            if ((oDropDownList) && (oDropDownList.getContent())) {
                oDropDownList.getContent().forEach(function (item) {
                    var oContext = item.getBindingContext("view-campaign");
                    if (sSelectedKey === oContext.getProperty("TxtLang")) {
                        sPath = oContext.getPath();
                    }
                });
            }
            oOverScriptTV.bindElement({
                model : "view-campaign",
                path : sPath
            });
        };
        /**
		 * Handler for the Rejection Reason Selected
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.onRejectionReason = function (oEvent) {

        };
        /**
		 * Handle when user clicked on Accepting Overview Script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onOvsAccept = function (oEvent) {
            var oModel,
                mParameters,
                sCampaignCode,
                //sEndDate,
                sOfferCode,
                sOfferTitle,
                sPromo,
                /*sStartDate,*/
                sContract,
                sPath,
                oContext,
                that = this,
                sPromoRank,
                sBrand,
                sCA,
                sType,
                oLocalModel,
                sLpCode,
                sLpFirstName,
                sLpLastName,
                sLPRefId,
                sEffectDate;
            oModel = this.getOwnerComponent().getModel('comp-campaign');
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sPath = "/CpgChgOfferS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Promo='" + this._sPromo + "',Type='" + this._sType + "')";
            oContext = oModel.getContext(sPath);
            sCampaignCode = oContext.getProperty("Campaign");
            //sEndDate = oContext.getProperty("EndDate");
            sEffectDate = oContext.getProperty("EffectDate");
            sOfferCode = oContext.getProperty("OfferCode");
            sOfferTitle = oContext.getProperty("OfferTitle");
            sPromo = oContext.getProperty("Promo");
            /*sStartDate = oContext.getProperty("StartDate");*/
            sContract = oContext.getProperty("Contract");
            sPromoRank = oContext.getProperty("PromoRank");
            sBrand = oContext.getProperty("Brand");
            sType = oContext.getProperty("Type");
            oLocalModel = this.getOwnerComponent().getModel('comp-campLocal'); // Model set in Offers Controller page after checking loyality code
            sLpCode = oLocalModel.getProperty("/LPCode");
            sLpFirstName = oLocalModel.getProperty("/firstName");
            sLpLastName = oLocalModel.getProperty("/lastName");
            sLPRefId = oLocalModel.getProperty("/lprefId");
            sCA = this._sCA;
            mParameters = {
                method : "POST",
                urlParameters : {"CampaignCode" : sCampaignCode,
                                         "EffectDate" : sEffectDate,
                                        "LP_Code" : sLpCode,
                                        "LP_FirstName" : sLpFirstName,
                                        "LP_LastName" : sLpLastName,
                                        "LP_RefID" : sLPRefId,
                                        "OfferCode" : sOfferCode,
                                        "OfferTitle" : sOfferTitle,
                                        "PromoCode" : sPromo,
                                       /* "StartDate" : sStartDate,*/
                                        "Contract" : sContract,
                                        "PromoRank" : sPromoRank,
                                        "Brand" : sBrand,
                                        "CA" : sCA,
                                        "Type": sType,
                                        "BP": this._sBP,
                                        "BusinessRole" : "ZU_CALL_CTR",
                                        "ESID": ''},
                success : function (oData) {
                    var oWebUiManager;
                    if ((oData !== undefined) && (oData.Code === "S")) {
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        sap.ui.commons.MessageBox.alert("SWAP is completed");
                        oWebUiManager = that.getOwnerComponent().getCcuxWebUiManager();
                        oWebUiManager.notifyWebUi('openIndex', {
                            LINK_ID: "ZVASOPTSLN"
                        });
                        this.navTo("campaign", {bpNum: that._sBP, caNum: that._sCA, coNum : that._sContract, typeV : "P"});
                    } else {
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        sap.ui.commons.MessageBox.alert("SWAP Failed");
                        this.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum: that._sContract, typeV : "P"});
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::" + oData.Code);
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Error occured in the backend");
                }.bind(this)
            };
            oModel.callFunction("/AcceptCampaign", mParameters); // callback function for error
            this._oOverviewDialog.close();

        };
        /**
		 * Handle when user clicked on Declining Overview Script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onOvsDecline = function (oEvent) {
            this._oOverviewDialog.close();
            this.navTo("campaignoffers", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV : "P"});
        };

        /**
		 * Event Handler function for Disposition Reason selected
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onDisposition = function (oEvent) {
            var sPath,
                mParameters,
                oContext,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                sBrand,
                sCampaignCode,
                sCA,
                sOfferCode,
                sDispoCode,
                sPromoRank,
                sContract,
                sType,
                sPromo,
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sPath = "/CpgChgOfferS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Promo='" + this._sPromo + "',Type='" + this._sType + "')";
            oContext = oModel.getContext(sPath);
            sCampaignCode = oContext.getProperty("Campaign");
            sBrand = oContext.getProperty("Brand");
            sOfferCode = oContext.getProperty("OfferCode");
            sCA = this._sCA;
            sPromo = oContext.getProperty("Promo");
            sDispoCode = oEvent.mParameters.selectedKey;
            sPromoRank = oContext.getProperty("PromoRank");
            sContract = oContext.getProperty("Contract");
            sType = oContext.getProperty("Type");
            mParameters = {
                method : "POST",
                urlParameters : {"Brand" : sBrand,
                                         "CA" : sCA,
                                        "CampaignCode" : sCampaignCode,
                                        "Contract" : sContract,
                                        "DispoCode" : sDispoCode,
                                        "OfferCode" : sOfferCode,
                                        "PromoCode" : sPromo,
                                        "PromoRank" : sPromoRank,
                                        "Type" : sType},
                success : function (oData) {
                    if ((oData !== undefined) && (oData.Code === "S")) {
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                        sap.ui.commons.MessageBox.alert("Disposition process is completed");
                        this.navTo("campaign", {bpNum: that._sBP, caNum: that._sCA, coNum : that._sContract, typeV : "C"});
                    } else {
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                        sap.ui.commons.MessageBox.alert("Disposition process is Failed");
                        this.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum: that._sContract, typeV : "P"});
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::" + oData.Code);
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    sap.ui.commons.MessageBox.alert("Disposition process is Failed");
                }.bind(this)
            };
            oModel.callFunction("/RejectCampaign", mParameters); // callback function for error
            this._oOverviewDialog.close();
        };
        return Controller;
    }
);
