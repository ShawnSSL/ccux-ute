/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'jquery.sap.global',
        "sap/ui/model/json/JSONModel",
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ],

    function (CoreController, jQuery, JSONModel,  Filter, FilterOperator) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.campaign.view.History');


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
        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var sPath,
                mParameters,
                oHistoryTable,
                oHistoryRowTemplate,
                aFilters,
                aFilterIds,
                aFilterValues,
                oDataTag,
                oNoDataTag,
                fnRecievedHandler,
                aRows,
                oPricingTable,
                oPricingRowTemplate,
                oPricingColTemplate,
                that = this,
                fnRecieved,
                fnChange,
                oTemplateView,
                oTemplateModel,
                aEFLDatapaths,
                iCount,
                oEFLJson = {},
                aResults = [],
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            aFilterIds = ["Contract", "Type"];
            aFilterValues = [this._sContract, "H"];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = this._i18NModel.getProperty("nrgHistorySet");
            oHistoryTable = this.getView().byId("idnrgCamHis-table");
            oHistoryRowTemplate = this.getView().byId("idnrgCamHis-row").clone();
            oDataTag = this.getView().byId("idnrgCamHisData");
            oNoDataTag = this.getView().byId("idnrgCamHisNoData");
            oPricingColTemplate = this.getView().byId("idnrgCamHis-prcCol");
            oPricingRowTemplate = this.getView().byId("idnrgCamHis-prcRow");
            oPricingTable = this.getView().byId("idnrgCamHisPriceT");
            oTemplateModel = new sap.ui.model.json.JSONModel();
            // Function received handler is used to update the view with first History campaign.---start
            fnRecievedHandler = function () {
                var oBinding = oHistoryTable.getBinding("rows");
                aRows = oHistoryTable.getRows();
                if ((aRows !== undefined) && (aRows.length > 0)) {
                    sPath = aRows[0].getBindingContext("comp-campaign").getPath();
                    aRows[0].addStyleClass("nrgCamHis-but-selected");

                   // Adding EFL Table to History view as XML templating-- start
                    aEFLDatapaths = this.getModel("comp-campaign").getProperty(sPath + "/EFLs");
                    if ((aEFLDatapaths !== undefined) && (aEFLDatapaths.length > 0)) {
                        for (iCount = 0; iCount < aEFLDatapaths.length; iCount = iCount + 1) {
                            aResults.push(this.getModel("comp-campaign").getProperty("/" + aEFLDatapaths[iCount]));
                        }
                    }
                    if ((aResults === undefined) && (aResults.length === 0)) {
                        return;
                    } else {
                        oTemplateModel.setData(that.convertEFLJson(aResults));
                        that._oEFLModel = oTemplateModel;
                        oTemplateView = new sap.ui.view({
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
                        that.getView().byId("idnrgCamHisPriceT").removeAllAggregation("content");
                        that.getView().byId('idnrgCamHisPriceT').addContent(oTemplateView);
                    }
                    that.getView().bindElement({
                        model : "comp-campaign",
                        path : sPath
                    });
                    // Adding EFL Table to History view as XML templating--end
                } else {
                    oDataTag.addStyleClass("nrgCamHis-hide");
                    oNoDataTag.removeStyleClass("nrgCamHis-hide");
                }
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if (oBinding) {
                    oBinding.detachDataReceived(fnRecievedHandler);
                }
            };
            // Function received handler is used to update the view with first History campaign.---end
            mParameters = {
                parameters : {expand: "EFLs"},
                model : "comp-campaign",
                path : sPath,
                template : oHistoryRowTemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oHistoryTable.bindAggregation("rows", mParameters);
        };
         /**
		 * When the user choosed to select a Campaign for Details
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         * @private
		 */
        Controller.prototype.onPressed = function (oEvent) {
            var aChildren,
                sPath,
                i,
                aRows,
                oPricingTable,
                oPricingRowTemplate,
                oPricingColTemplate,
                oHistoryTable = this.getView().byId("idnrgCamHis-table"),
                mParameters,
                fnRecieved,
                fnChange,
                oTemplateView,
                oTemplateModel,
                aEFLDatapaths,
                iCount,
                oEFLJson = {},
                aResults = [];
            aRows = oHistoryTable.getRows();
            aChildren = oEvent.getSource().getParent().findElements();
            for (i = 0; i < aChildren.length; i = i + 1) {
                if (aChildren[i].hasStyleClass("nrgCamHis-but-selected")) {
                    aChildren[i].removeStyleClass("nrgCamHis-but-selected");
                }
            }
            oEvent.getSource().addStyleClass("nrgCamHis-but-selected");
            sPath = oEvent.getSource().getBindingContext("comp-campaign").getPath();
            oPricingTable = this.getView().byId("idnrgCamHisPriceT");
            oPricingTable.removeAllAggregation("content");
            oPricingRowTemplate = this.getView().byId("idnrgCamHis-prcRow");
            oPricingColTemplate = this.getView().byId("idnrgCamHis-prcCol");
            this.getView().bindElement({
                model : "comp-campaign",
                path : sPath
            });
            // Development for Pricing Table binding..........................................
           // Adding EFL Table to History view as XML templating-- start
            oTemplateModel = new sap.ui.model.json.JSONModel();
            aEFLDatapaths = this.getView().getModel("comp-campaign").getProperty(sPath + "/EFLs");
            if ((aEFLDatapaths !== undefined) && (aEFLDatapaths.length > 0)) {
                for (iCount = 0; iCount < aEFLDatapaths.length; iCount = iCount + 1) {
                    aResults.push(this.getView().getModel("comp-campaign").getProperty("/" + aEFLDatapaths[iCount]));
                }
            }
            oTemplateModel.setData(this.convertEFLJson(aResults));
            oTemplateView = sap.ui.view({
                preprocessors: {
                    xml: {
                        models: {
                            tmpl : oTemplateModel
                        }
                    }
                },
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "nrg.module.campaign.view.EFLData"
            });
            oPricingTable.addContent(oTemplateView);

            // Adding EFL Table to History view as XML templating--end

            // Development for Pricing Table binding..........................................
        };

         /**
		 * To Format Tile Date Value after binding
		 *
		 * @function
		 * @param {startDate} Start Date value from binding
         * @param {endDate} End Date value from binding
         * @private
		 */
        Controller.prototype.formatTileDate = function (startDate, endDate) {
            return startDate + " - " + endDate;
        };

        /**
		 * To Format EFL Column Name
		 *
		 * @function
		 * @param {String} EFL Interval value
         *
         * @private
		 */
        Controller.prototype.formatEFLType = function (eflLevel) {
            return "EFL@" + eflLevel;
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
            if (aFilterIds !== undefined) {
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
                }
            }
            return aFilters;
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
		 * Handler Function for the Average Usage selection
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAvgUsage = function (oEvent) {
            this.navTo("usage", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV : "H"});
        };
        return Controller;
    }
);
