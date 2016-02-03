/*globals sap*/
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
                oContext,
                sPromo = "";
            i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._sContract = oRouteInfo.parameters.coNum;
            this._sOfferCode = oRouteInfo.parameters.offercodeNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            sCurrentPath = i18NModel.getProperty("nrgCpgChangeOffSet");
            sCurrentPath = "/CpgChgOfferS";
            this._sType = oRouteInfo.parameters.stype;
            this._sPromo = oRouteInfo.parameters.sPromo;
            sCurrentPath = sCurrentPath + "(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Type='" + this._sType + "',Promo='" + this._sPromo + "')";
            oContext = oModel.getContext(sCurrentPath);
            if (oContext) {
                sPromo = oContext.getProperty("Promo");
            }
            this._bindView(sCurrentPath);
            sCurrentPath = sCurrentPath + "/Scripts";
            aFilterIds = ["Promo", "TxtName"];
            aFilterValues = [sPromo, 'MAND'];
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
                NNPPopupControl = new NNPPopup();
            NNPPopupControl.attachEvent("NNPCompleted", this.invokeOverviewScript, this);
            this.getView().addDependent(NNPPopupControl);
            this._oOverviewDialog = this.getView().byId("idnrgCamOvsDialog");
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
                oOverScriptTV = this.getView().byId("idnrgCamOvsOvTv"),
                aFilterIds,
                aFilterValues,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oContext,
                dStartDate;

            sCurrentPath = "/CpgChgOfferS";
            sCurrentPath = sCurrentPath + "(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Type='" + this._sType + "',Promo='" + this._sPromo + "')";
            oContext = oModel.getContext(sCurrentPath);
            if (oContext) {
                dStartDate = oContext.getProperty("StartDate");
            }
            aFilterIds = ["Contract", "OfferCode", "TxtName", "Promo"];
            aFilterValues = [this._sContract, this._sOfferCode, "OVW", this._sPromo];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sCurrentPath = "/ScriptS";
            this._oOverviewDialog.setWidth("750px");
            this._oOverviewDialog.setHeight("auto");
            this._oOverviewDialog.setTitle("OVERVIEW SCRIPT");
            this._oOverviewDialog.setModal(true);
            this._oOverviewDialog.addStyleClass("nrgCamOvs-dialog");
            oDropDownList = this.getView().byId("idnrgCamOvsDdL");
            aContent = oDropDownList.getContent();
            oDropDownListItemTemplate = this.getView().byId("idnrgCamSSLngLtIt").clone();
            fnRecievedHandler = function () {
                aContent = oDropDownList.getContent();
                if ((aContent !== undefined) && (aContent.length > 0)) {
                    sPath = aContent[0].getBindingContext("comp-campaign").getPath();
                    oDropDownList.setSelectedKey("EN");
                    oOverScriptTV.bindElement({
                        model : "comp-campaign",
                        path : sPath
                    });

                }
                that._oOverviewDialog.open();
                obinding.detachDataReceived(fnRecievedHandler);
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
            };
            mParameters = {
                model : "comp-campaign",
                path : sCurrentPath,
                template : oDropDownListItemTemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oDropDownList.bindAggregation("content", mParameters);
            obinding = oDropDownList.getBinding("content");
            this.getView().addDependent(this._oOverviewDialog);
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
                oOverScriptTV = this.getView().byId("idnrgCamOvsOvTv"),
                sSelectedKey,
                oDropDownList = this.getView().byId("idnrgCamOvsDdL");
            sSelectedKey = oEvent.getSource().getProperty("selectedKey");
            if ((oDropDownList) && (oDropDownList.getContent())) {
                oDropDownList.getContent().forEach(function (item) {
                    var oContext = item.getBindingContext("comp-campaign");
                    if (sSelectedKey === oContext.getProperty("TxtLang")) {
                        sPath = oContext.getPath();
                    }
                });
            }
            oOverScriptTV.bindElement({
                model : "comp-campaign",
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
            sPath = "/CpgChgOfferS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Type='" + this._sType + "',Promo='" + this._sPromo + "')";
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
                    jQuery.sap.log.info("Eligibility Error occured");
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
            sPath = oEvent.getSource().getBindingContext("comp-campaign").getPath();
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
        };
        return Controller;
    }
);
