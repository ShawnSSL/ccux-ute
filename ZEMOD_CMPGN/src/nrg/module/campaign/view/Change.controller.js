/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        "sap/ui/model/json/JSONModel"
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.campaign.view.Change');

        /* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {
        };
        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        Controller.prototype.onAfterRendering = function () {
            // Update Footer
            this.getOwnerComponent().getCcuxApp().updateFooter(this._sBP, this._sCA, this._sContract);
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oModel,
                sCurrentPath,
                mParameters,
                oTemplateView,
                oTemplateModel,
                aEFLDatapaths,
                iCount,
                oEFLJson = {},
                aResults = [],
                that = this,
                sCurrentDate,
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                oRejectRsns = that.getView().byId('idnrgRejectRsns'),
                oRejectsRsnsTemp = that.getView().byId('idnrgRejectRsnsTempl');
            this._i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._sContract = oRouteInfo.parameters.coNum;
            this._sNewOfferCode = oRouteInfo.parameters.offercodeNum;
            this._sType = oRouteInfo.parameters.stype;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            sCurrentPath = "/CpgChgOfferS";
            this._sPromo = oRouteInfo.parameters.sPromo;
            sCurrentPath = sCurrentPath + "(Contract='" + this._sContract + "',OfferCode='" + this._sNewOfferCode + "',Type='" + this._sType + "',Promo='" + this._sPromo + "')";
            oModel = this.getOwnerComponent().getModel('comp-campaign');
            oTemplateModel = new sap.ui.model.json.JSONModel();
            this._bindView(sCurrentPath);
            aEFLDatapaths = that.getView().getModel("comp-campaign").getProperty(sCurrentPath + "/EFLs");
            if ((aEFLDatapaths !== undefined) && (aEFLDatapaths.length > 0)) {
                for (iCount = 0; iCount < aEFLDatapaths.length; iCount = iCount + 1) {
                    aResults.push(that.getView().getModel("comp-campaign").getProperty("/" + aEFLDatapaths[iCount]));
                }
            }
            oTemplateModel.setData(that.convertEFLJson(aResults));
            that._oEFLModel = oTemplateModel;
            oTemplateView = sap.ui.view({
                preprocessors: {
                    xml: {
                        models: {
                            tmpl : that._oEFLModel
                        }
                    }
                },
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "nrg.module.campaign.view.EFLData"
            });
            that.getView().byId('idnrgCamChgPriceT').removeAllAggregation("content");
            that.getView().byId('idnrgCamChgPriceT').addContent(oTemplateView);
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
            var fnDataReceived = function (oEvent) {
                jQuery.sap.log.info("Data Received:::");
            };
            this.getView().bindElement({
                model : "comp-campaign",
                path : sObjectPath,
                events : {dataReceived: fnDataReceived}
            });
        };

        /**
		 * Event function for Accept Campaign
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAcceptCampaign = function (oEvent) {
            var sOfferCode = this.getView().getBindingContext("comp-campaign").getProperty("OfferCode"),
                sType = this.getView().getBindingContext("comp-campaign").getProperty("Type");
            this.navTo("campaignSS", {bpNum: this._sBP, caNum: this._sCA, offercodeNum : this._sNewOfferCode, coNum : this._sContract, stype : this._sType, sPromo : this._sPromo});
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

        /**
		 * Back to Overview page function
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.backToOverview = function (oEvent) {
            this.navTo("campaign", {bpNum: this._sBP, caNum: this._sCA, coNum : this._sContract, typeV : "C"});
        };
        /**
		 * Converts in to EFL Json format required by Template view.
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.convertEFLJson = function (results) {
            var columns = [],
                temp,
                tempColumns = [],
                continueFlag = false,
                oBRRow = [],
                oCERow = [],
                oBRCells = [],
                oCECells = [],
                iCount1,
                iCount2,
                aJsonDataNew,
                aTypes = [],
                tempTypes = [];
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {

                temp = results[iCount1];
                if ((temp !== undefined) && (temp.EFLLevel !== undefined)) {

                  // Columns Assignment.
                    if (tempColumns !== undefined) {

                        for (iCount2 = 0; iCount2 < tempColumns.length; iCount2  = iCount2 + 1) {
                            if (temp.EFLLevel === tempColumns[iCount2]) {
                                continueFlag = true;
                                break;
                            }
                        }
                        if (continueFlag) {
                            continueFlag = false;
                        } else {
                            tempColumns.push(temp.EFLLevel);
                            columns.push({
                                "EFLLevel": temp.EFLLevel
                            });
                        }
                    }
                    // Columns Assignment.
                }
            }
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {

                temp = results[iCount1];
                if ((temp !== undefined) && (temp.EFLType !== undefined)) {

                  // Columns Assignment.
                    if (tempTypes !== undefined) {

                        for (iCount2 = 0; iCount2 < tempTypes.length; iCount2  = iCount2 + 1) {
                            if (temp.EFLType === tempTypes[iCount2]) {
                                continueFlag = true;
                                break;
                            }
                        }
                        if (continueFlag) {
                            continueFlag = false;
                        } else {
                            tempTypes.push(temp.EFLType);
                        }
                    }

                    // Columns Assignment.
                }
            }
            aJsonDataNew = {};
            aJsonDataNew.results = {};
            aJsonDataNew.results.columns = columns;
            aJsonDataNew.results.rows = [];
            for (iCount2 = 0; iCount2 < tempTypes.length; iCount2  = iCount2 + 1) {
                oBRCells = [];
                for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {
                    temp = results[iCount1];
                    if ((temp !== undefined) && (temp.EFLLevel !== undefined) && (temp.EFLType !== undefined)) {
                        if (temp.EFLType === tempTypes[iCount2]) {
                            if (temp.EFLPrice) {
                                oBRCells.push({
                                    "EFLPrice": parseFloat(temp.EFLPrice).toFixed(1)
                                });
                            } else {
                                oBRCells.push({
                                    "EFLPrice": temp.EFLPrice
                                });
                            }
                        }

                    }
                }
                aJsonDataNew.results.rows.push({
                    "cells" : oBRCells
                });
            }
            return aJsonDataNew;
        };

        return Controller;
    }
);
