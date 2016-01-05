/*globals sap, ute*/
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

        var Controller = CoreController.extend('nrg.module.billing.view.Elig');

        Controller.prototype.onInit = function () {

        };

        Controller.prototype.onBeforeRendering = function () {

        };

        Controller.prototype.onAfterRendering = function () {
            // Get the OwenerComponent from the mother controller
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();

            // Get the ABP popup control
            this._EligPopupControl = this.getView().getParent();

            // Set up models
            this.getView().setModel(this._OwnerComponent.getModel('comp-eligibility'), 'oDataEligSvc');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligCriteria');

            // Retrieve routing parameters
            var oRouteInfo = this._OwnerComponent.getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            this._initialCheck();
        };

        /*------------------------------------------------ Retrieve Methods -------------------------------------------------*/
        Controller.prototype._retrieveEligCrtTable = function (sEligType, fnCallback) {
            var sPath = '/EligCriteriaS',
                aFilters = [],
                oModel = this.getView().getModel('oDataEligSvc'),
                oEligCriteriaModel = this.getView().getModel('oEligCriteria'),
                oParameters,
                parsedData = {},
                i;

            if (this._coNum) {
                aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: this._coNum}));
            }
            if (sEligType) {
                aFilters.push(new Filter({ path: 'EligKey', operator: FilterOperator.EQ, value1: sEligType}));
            }
            oParameters = {
                filters: aFilters,
                success : function (oData) {

                    // Parse the oData
                    for (i = 0; i < oData.results.length; i = i + 1) {

                        // Handle ABP & RBB cases
                        if (oData.results[i].EligKey !== 'EXTN') {
                            if (!parsedData.hasOwnProperty(oData.results[i].Category)) {
                                parsedData[oData.results[i].Category] = {};
                                parsedData[oData.results[i].Category].Title = "CATEGORY " + oData.results[i].Category;
                                parsedData[oData.results[i].Category].Data = [];
                            }

                            // Parse check & uncheck flag
                            oData.results[i].Check = oData.results[i].Mark;
                            oData.results[i].Uncheck = !oData.results[i].Mark;
                            delete oData.results[i].Mark;

                            if ((oData.results[i].Val1 === '')) {
                                parsedData[oData.results[i].Category].Summary = {};
                                parsedData[oData.results[i].Category].Summary.visible = true;
                                parsedData[oData.results[i].Category].Summary.Check = oData.results[i].Check;
                                parsedData[oData.results[i].Category].Summary.Uncheck = !oData.results[i].Check;
                                parsedData[oData.results[i].Category].Summary.Message = (oData.results[i].Check) ? "ELIGIBLE" : "NOT ELIGIBLE";
                            } else {
                                parsedData[oData.results[i].Category].Data.push(oData.results[i]);
                            }
                        } else { // Handle EXTN case
                            if (!parsedData.EXTN) {
                                parsedData.EXTN = {};
                                parsedData.EXTN.Title = "EXTENSION";
                                parsedData.EXTN.Data = [];
                                parsedData.EXTN.Summary = {};
                                parsedData.EXTN.Summary.visible = false;
                            }

                            // Parse check & uncheck flag
                            oData.results[i].Check = oData.results[i].Mark;
                            oData.results[i].Uncheck = !oData.results[i].Mark;
                            delete oData.results[i].Mark;

                            parsedData.EXTN.Data.push(oData.results[i]);
                        }
                    }

                    oEligCriteriaModel.setData(parsedData);

                    if (fnCallback) {
                        fnCallback();
                    }
                }.bind(this),
                error: function (oError) {
                    if (fnCallback) {
                        fnCallback();
                    }
                }.bind(this)
            };

            if (oModel && aFilters && aFilters.length > 0) {
                oModel.read(sPath, oParameters);
            }
        };

        /*-------------------------------------------------- Initial Check --------------------------------------------------*/

        Controller.prototype._initialCheck = function () {
            var bRetrEligCtrTableComplete = false,
                checkDoneEligCtrTable;

            // Display the loading indicator
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            // Retrieve eligibility criteria table
            this._retrieveEligCrtTable(this.eligType, function () {bRetrEligCtrTableComplete = true; });

            checkDoneEligCtrTable = setInterval(function () {
                if (bRetrEligCtrTableComplete) {
                    // Insert data to popup

                    // Dismiss the loading indicator
                    this._OwnerComponent.getCcuxApp().setOccupied(false);

                    clearInterval(checkDoneEligCtrTable);
                }
            }.bind(this), 100);
        };

        /*------------------------------------------------- Button Actions --------------------------------------------------*/



        Controller.prototype._pad = function (d) {
            return (d < 10) ? '0' + d.toString() : d.toString();
        };

        Controller.prototype.onPopupClose = function (oEvent) {
            this.getView().getParent().close();
        };

        return Controller;
    }
);
