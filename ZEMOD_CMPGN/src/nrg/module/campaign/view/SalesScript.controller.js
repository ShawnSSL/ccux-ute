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
        'nrg/module/nnp/view/NNPPopup',
        'sap/ui/model/odata/ODataUtils'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, Dialog, JSONModel, NNPPopup, ODataUtils) {
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
            //this.getOwnerComponent().getCcuxApp().updateFooter(this._sBP, this._sCA, this._sContract);
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
                oRejectsRsnsTemp = that.getView().byId('idnrgRejectRsnsTempl'),
                oContext;
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
            if (this._sBP !== oRouteInfo.parameters.bpNum) {
                this._sBP = oRouteInfo.parameters.bpNum;
                //Model to hold credit info
                this._bFirstTime = true;
                this._bScored = false;
                this.getView().setModel(new sap.ui.model.json.JSONModel(), 'view-credit');
            }
            this._sCA = oRouteInfo.parameters.caNum;
            this._sType = oRouteInfo.parameters.stype;
            this._sPromo = oRouteInfo.parameters.sPromo;
            sCurrentPath = "/CpgChgOfferS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Promo='" + this._sPromo + "',Type='" + this._sType + "')";
            oContext = oModel.getContext(sCurrentPath);
            this._bindView(sCurrentPath);
            sCurrentPath = sCurrentPath + "/Scripts";

//            aFilterIds = ['BP', 'EffectiveDate', 'EndDate', 'CurrOffer', 'CampaignCode', 'TxtName', 'AvailDate'];
//            aFilterValues = [this._sBP, oContext.getProperty("EffectDate"), oContext.getProperty("EndDate"), oContext.getProperty("CurrOffer"), oContext.getProperty("Campaign"), "OVW"];
     /*       aFilterValues = [this._sBP, oContext.getProperty("EffectDate"), new Date("12/31/9999"), oContext.getProperty("CurrOffer"), oContext.getProperty("Campaign"), 'MAND', oContext.getProperty('AvailDate')];*/


            /*aFilterIds = ['BP', 'EffectiveDate', 'EndDate', 'CurrOffer', 'CampaignCode', 'TxtName', 'AvailDate'];
            aFilterValues = [this._sBP, oContext.getProperty("EffectDate"), oContext.getProperty("EndDate"), oContext.getProperty("CurrOffer"), oContext.getProperty("Campaign"), 'MAND', oContext.getProperty('AvailDate')];*/   //20160627 Canel CYP changes first
            aFilterIds = ['BP', 'EffectiveDate', 'EndDate', 'CurrOffer', 'CampaignCode', 'TxtName'];
            aFilterValues = [this._sBP, oContext.getProperty("EffectDate"), oContext.getProperty("EndDate"), oContext.getProperty("CurrOffer"), oContext.getProperty("Campaign"), 'MAND'];

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
                parameters : {batchGroupId : "1"},
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
                that = this,
                oCreditModel = that.getView().getModel('view-credit');


            if (!this._bScored) {
                this._bScored = false;
            }
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sCurrentPath = "/PrepayS(Contract='" + this._sContract + "',OfferCode='" + this._sOfferCode + "',Scored=" + ODataUtils.formatValue(this._bScored, 'Edm.Boolean') + ")";
            oBindingInfo = {
                success : function (oData) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oData) {
                        if (that._bFirstTime || (that._bScored !== oData.Scored)) {
                            oCreditModel.setData(oData);
                            that._bScored = oData.Scored;
                            that._bFirstTime = false;
                        } else {
                            oCreditModel.setProperty("/DisconnReqDep", oData.DisconnReqDep);
                            oCreditModel.setProperty("/DepAmt", oData.DepAmt);
                        }
                        sCurrentPath = "/PrepayS(Contract='" + that._sContract + "',OfferCode='" + that._sOfferCode + "',Scored=" + ODataUtils.formatValue(that._bScored, 'Edm.Boolean') + ")";
                        if (oData.Flag === 'N') {
                            that.onNNP();
                            return;
                        }
                        if (oData.Flag === 'E') {
                            ute.ui.main.Popup.Alert({
                                title: 'Change Campaign',
                                message: oData.Script
                            });
                            return;
                        }
                        if (oData.Flag === 'Y') {
                            if (!that._oSwapFragment) {
                                that._oSwapFragment = sap.ui.xmlfragment("SwapScripts", "nrg.module.campaign.view.SwapScript", that);
                                that._oSwapFragment.setModel(oModel, 'comp-campaign');
                            }
                            if (that._oSwapDialog === undefined) {
                                that._oSwapDialog = new ute.ui.main.Popup.create({
                                    title: 'SWAP DEPOSIT SCRIPT',
                                    content: this._oSwapFragment
                                });
                                that._oSwapDialog.addStyleClass("nrgCamOvs-dialog");
                                that._oSwapDialog.setShowCloseButton(false);

                            }
                            var oDescription = sap.ui.core.Fragment.byId("SwapScripts", "idnrgSwapDesc");
                            oDescription.bindElement({
                                model : "comp-campaign",
                                path : sCurrentPath
                            });
                            //oDescription.setContent(oData.Script);
                            that._oSwapDialog.open();
                            return;
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);

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

            this._PrepayAltPay = false;
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
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);

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
            this._PrepayAltPay = false;
            this._oSwapDialog.close();
        };
        /**
		 * Action to be taken when the User clicks on Other Deposit Alternatives of swap script
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onSwapOther = function (oEvent) {
            this._PrepayAltPay = true;
            this._oSwapDialog.close();
            this.onNNP();
        };
        /**
		 * Action to be taken after Swap Script query to launch NNP and in case of REBS customer call overscript directly
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onNNP = function (oEvent) {
            var sCurrentPath,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oBindingInfo,
                NNPPopupControl = new NNPPopup(),
                oGlobalDataManager = this.getOwnerComponent().getGlobalDataManager();
            if (oGlobalDataManager.isREBS()) {
                this.invokeOverviewScript();
            } else {
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
            oContext = oModel.getContext(sCurrentPath);
            aFilterIds = ['BP', 'EffectiveDate', 'EndDate', 'CurrOffer', 'CampaignCode', 'TxtName'];
            aFilterValues = [this._sBP, oContext.getProperty("EffectDate"), oContext.getProperty("EndDate"), oContext.getProperty("CurrOffer"), oContext.getProperty("Campaign"), "OVW"];
            //aFilterValues = [this._sBP, oContext.getProperty("EffectDate"), new Date("12/31/9999"), oContext.getProperty("CurrOffer"), oContext.getProperty("Campaign"), "OVW"];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sCurrentPath = sCurrentPath + "/Scripts";
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
                parameters : {batchGroupId : "1"},
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
                oAvailDate,     //Added for Campaign Module Change CYP
                oLocalModel,
                sLpCode,
                sLpFirstName,
                sLpLastName,
                sLPRefId,
                sEffectDate,
                sCreditDate,
                sCreditRTG,
                sCreditScore,
                sCreditSource,
                sDepAmt,
                bDisconnReqDep,
                oCreditModel = this.getView().getModel('view-credit');
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
            //oAvailDate = oContext.getProperty('AvailDate');  //20160627 Temp taking off CYP changes
            oLocalModel = this.getOwnerComponent().getModel('comp-campLocal'); // Model set in Offers Controller page after checking loyality code
            sLpCode = oLocalModel.getProperty("/LPCode");
            sLpFirstName = oLocalModel.getProperty("/firstName");
            sLpLastName = oLocalModel.getProperty("/lastName");
            sLPRefId = oLocalModel.getProperty("/lprefId");
            sCA = this._sCA;
            //sPath = "/PrepayS(Contract='" + that._sContract + "',OfferCode='" + that._sOfferCode + "',Scored=" + ODataUtils.formatValue(that._bScored, 'Edm.Boolean') + ")";
            //oContext = oModel.getContext(sPath);

            sCreditDate = oCreditModel.getProperty("/CreditDate");
            sCreditRTG = oCreditModel.getProperty("/CreditRTG");
            sCreditScore = oCreditModel.getProperty("/CreditScore");
            sCreditSource = oCreditModel.getProperty("/CreditSource");
            sDepAmt = oCreditModel.getProperty("/DepAmt");
            bDisconnReqDep = oCreditModel.getProperty("/DisconnReqDep");
            mParameters = {
                method : "POST",
                urlParameters : {
                    "BP": this._sBP,
                    "Brand" : sBrand,
                    "BusinessRole" : "ZU_CALL_CTR",
                    "CA" : sCA,
                    "CampaignCode" : ODataUtils.formatValue(sCampaignCode, 'Edm.Boolean'),
                    "ConnID" : "",
                    "Contract" : sContract,
                    "CreditDate" : sCreditDate || new Date(),
                    "CreditRTG" : sCreditRTG,
                    "CreditScore" : sCreditScore,
                    "CreditSource" : sCreditSource,
                    "DepAmt" : sDepAmt,// decimal
                    "DisconnReqDep" : bDisconnReqDep,//boolean
                    "EffectDate" : sEffectDate,
                    "LP_Code" : sLpCode,
                    "LP_FirstName" : sLpFirstName,
                    "LP_LastName" : sLpLastName,
                    "LP_RefID" : sLPRefId,
                    "OfferCode" : sOfferCode,
                    "OfferTitle" : sOfferTitle,
                    "PrepayAltPay" : this._PrepayAltPay || false,//boolean
                    "PromoCode" : sPromo,
                    "PromoRank" : sPromoRank,//Int16
                    "Type": sType//,  //20160627 Temp taking off CYP changes
                    //"AvailDate": oAvailDate
                },
                success : function (oData) {
                    var oWebUiManager;
                    jQuery.sap.log.info("Odata Read Successfully:::" + oData.Code);
                    if ((oData !== undefined) && (oData.Code === "S")) {
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Change Campaign',
                            message: "SWAP is completed"
                        });
                        oWebUiManager = that.getOwnerComponent().getCcuxWebUiManager();
                        oWebUiManager.notifyWebUi('openIndex', {
                            LINK_ID: "ZVASOPTSLN",
                            REF_ID: 'ENROLL',
                            CONTRACT_ID : sContract
                        });
                        this.navTo("campaign", {bpNum: that._sBP, caNum: that._sCA, coNum : that._sContract, typeV : "P"});
                        return;
                    } else {
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Change Campaign',
                            message: "SWAP Failed"
                        });
                        this.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum: that._sContract, typeV : "N"});
                        return;
                    }
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Change Campaign',
                        message: "SWAP Failed"
                    });
                    this.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum : that._sContract, typeV : "N"});
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
            this.navTo("campaignoffers", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV : "N"});
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
                        ute.ui.main.Popup.Alert({
                            title: 'Change Campaign',
                            message: "Disposition process is completed"
                        });
                        this.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum : that._sContract, typeV : "N"});
                    } else {
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Change Campaign',
                            message: "Disposition process is Failed"
                        });
                        this.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum: that._sContract, typeV : "N"});
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::" + oData.Code);
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Change Campaign',
                        message: "Disposition process is Failed"
                    });
                }.bind(this)
            };
            oModel.callFunction("/RejectCampaign", mParameters); // callback function for error
            this._oOverviewDialog.close();
        };
        return Controller;
    }
);
