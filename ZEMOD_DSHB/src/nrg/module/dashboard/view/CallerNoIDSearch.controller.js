/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'sap/ui/core/routing/HashChanger'
    ],

    function (CoreController, Filter, FilterOperator, HashChanger) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.dashboard.view.CallerNoIDSearch');

        Controller.prototype.onBeforeRendering = function () {
            //var test = new HashChanger();
            //var testagian= test.getHash();

            this.getOwnerComponent().getCcuxApp().setTitle('CUSTOMER DATA');
            /*Models in the controller*/

            //get OData Model from component level first
            this.getView().setModel(this.getOwnerComponent().getModel('comp-dashboard'), 'oSearchBpODataModel');
            //JSON model for search result
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oBpSearchResult');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oBpSearchCount');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSearchFilters');

            //model to track if searched in CA
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSearchWithCA');

            this._initSearchCaModel();
            this._initSearchFilterModel();
            this._initSearchResultModel();
        };

        Controller.prototype._initSearchCaModel = function () {
            this.getView().getModel('oSearchWithCA').setProperty('/searchedInCa', false);
            this.getView().getModel('oSearchWithCA').setProperty('/searchedCaNum', null);
        };

        Controller.prototype._initSearchResultModel = function () {
            //Set search result number = 0 first.
            this.getView().getModel('oBpSearchCount').setProperty('/searchCount', 0);
        };

        Controller.prototype._initSearchFilterModel = function () {
            var oFilters = {
                sCaNum : null,
                sSsn : null,
                sDl : null,
                sOrgName : null,
                sBpNum : null,
                sFiName : null,
                sEsid : null,
                sLaName : null,
                sPhnNum : null,
                sHousNum : null,
                sStreetNum: null,
                sUnitNum: null,
                sCityNum: null,
                sStateNum: null,
                sZipNum: null,
                sTaxID: null
            };

            this.getView().getModel('oSearchFilters').setProperty('/searchTextFields', oFilters);
        };

        Controller.prototype.onTextFieldChange = function (oControlEvent) {
            //Create for future use
        };

        Controller.prototype.onSearch = function () {
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._searchBP('/BpSearchs', this._createSearchParameters());
        };

        Controller.prototype._createSearchFilterObject = function () {
            //var test = this.getView().byId('idSearchBp');


            var aFilters = [],
                oFilterTemplate,// = new Filter(),
                oFilterModel = this.getView().getModel('oSearchFilters'),
                oSearchCaModel = this.getView().getModel('oSearchWithCA');

            oSearchCaModel.setProperty('/searchedInCa', false);

            if (oFilterModel.getProperty('/searchTextFields/sHousNum')) {
                oFilterTemplate =  new Filter({
                    path: 'HouseNumber',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sHousNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sStreetNum')) {
                oFilterTemplate =  new Filter({
                    path: 'Street',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sStreetNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sUnitNum')) {
                oFilterTemplate =  new Filter({
                    path: 'UnitNumber',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sUnitNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sCityNum')) {
                oFilterTemplate =  new Filter({
                    path: 'City',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sCityNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sStateNum')) {
                oFilterTemplate =  new Filter({
                    path: 'State',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sStateNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sZipNum')) {
                oFilterTemplate =  new Filter({
                    path: 'ZipCode',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sZipNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sPhnNum')) {
                oFilterTemplate =  new Filter({
                    path: 'TelePhone',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sPhnNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sCaNum')) {
                oSearchCaModel.setProperty('/searchedInCa', true);
                oSearchCaModel.setProperty('/searchedCaNum', oFilterModel.getProperty('/searchTextFields/sCaNum'));

                oFilterTemplate =  new Filter({
                    path: 'BuagID',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sCaNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sSsn')) {
                oFilterTemplate =  new Filter({
                    path: 'SSN',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sSsn')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sDl')) {
                oFilterTemplate =  new Filter({
                    path: 'DL',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sDl')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sOrgName')) {
                oFilterTemplate =  new Filter({
                    path: 'OrgName',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sOrgName')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sBpNum')) {
                oFilterTemplate =  new Filter({
                    path: 'PartnerID',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sBpNum')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sFiName')) {
                oFilterTemplate =  new Filter({
                    path: 'FirstName',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sFiName')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sEsid')) {
                oFilterTemplate =  new Filter({
                    path: 'ESID',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sEsid')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sLaName')) {
                oFilterTemplate =  new Filter({
                    path: 'LastName',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sLaName')
                });
                aFilters.push(oFilterTemplate);
            }
            if (oFilterModel.getProperty('/searchTextFields/sTaxID')) {
                oFilterTemplate =  new Filter({
                    path: 'TaxID',
                    operator: FilterOperator.EQ,
                    value1: oFilterModel.getProperty('/searchTextFields/sTaxID')
                });
                aFilters.push(oFilterTemplate);
            }
            return aFilters;
        };

        Controller.prototype._createSearchParameters = function () {
            //var oFilter, aFilter, oParameters,
              //  oFilterModel = this.getView().getModel('oSearchFilters');

            var aFilters = this._createSearchFilterObject(),
                oParameters,
                i,
                oRouter = this.getOwnerComponent().getRouter(),
                //Componenet Level Context Model
                oComponent = this.getOwnerComponent(),
                oWebUiManager = oComponent.getCcuxWebUiManager(),
                oPassingEvent; //For none IC usage

            oParameters = {
                filters : aFilters,
                success : function (oData) {
                    if (oData.results) {
                        if (oData.results.length === 1) {
                            //oComponentContextModel.setProperty('/dashboard/bpNum', oData.results[0].PartnerID);
                            //oRouter.navTo('dashboard.Bp', {bpNum: oData.results[0].PartnerID});
                            if (oWebUiManager.isAvailable()) {
                                oWebUiManager.notifyWebUi('bpConfirmed', {
                                    BP_NUM: oData.results[0].PartnerID
                                }, this._handleBpConfirmed, this);
                            } else {
                                oPassingEvent = {
                                    BP_NUM: oData.results[0].PartnerID,
                                    getParameters: function () {
                                        return oPassingEvent;
                                    }
                                };
                                this._handleBpConfirmed(oPassingEvent);
                            }
                        } else {
                            for (i = 0; i < oData.results.length; i = i + 1) {
                                oData.results[i].iId = i + 1;
                                oData.results[i].Select = "Select";
                            }
                            this.getView().getModel('oBpSearchResult').setData(oData.results);
                            this.getView().getModel('oBpSearchCount').setProperty('/searchCount', oData.results.length);
                            oComponent.getCcuxApp().setOccupied(false);
                        }

                    }
                }.bind(this),
                error: function (oError) {
                    this.getView().getModel('oBpSearchResult').setData(null);
                }.bind(this)
            };

            return oParameters;
        };


        Controller.prototype._searchBP = function (sPath, oParameters) {
            var oModel = this.getView().getModel('oSearchBpODataModel');
            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._onBpSelect = function (oEvent) {
            var sSelectedId = oEvent.getParameters().id,
                aSelectedId = sSelectedId.split('-'),
                iSelectedId = aSelectedId[2],
                sSelectedBpNum = this.getView().getModel('oBpSearchResult').oData[iSelectedId].PartnerID,
                oComponent = this.getOwnerComponent(),
                oWebUiManager = oComponent.getCcuxWebUiManager(),
                oPassingEvent; //For none IC usage

            //Confirm BP to IC first
            oComponent.getCcuxApp().setOccupied(true);
            if (oWebUiManager.isAvailable()) {
                oWebUiManager.notifyWebUi('bpConfirmed', {
                    BP_NUM: sSelectedBpNum
                }, this._handleBpConfirmed, this);
            } else {
                oPassingEvent = {
                    BP_NUM: sSelectedBpNum,
                    getParameters: function () {
                        return oPassingEvent;
                    }
                };
                this._handleBpConfirmed(oPassingEvent);
            }

            return;
        };

        Controller.prototype._handleBpConfirmed = function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter(),
                oComponent = this.getOwnerComponent(),
                oComponentContextModel = this.getOwnerComponent().getCcuxContextManager().getContext(),
                oRouteInfo = oEvent.getParameters(),
                oSearchCaModel = this.getView().getModel('oSearchWithCA');

            //Set BpNum to Component Level
            oComponentContextModel.setProperty('/dashboard/bpNum', oRouteInfo.BP_NUM);

            //Set the loading effect to false
           // oComponent.getCcuxApp().setOccupied(false);

            //Navigate to verification page
            if (oSearchCaModel.getProperty('/searchedInCa')) {
                oRouter.navTo('dashboard.BpSearchedInCa', {bpNum: oRouteInfo.BP_NUM, caNum: oSearchCaModel.getProperty('/searchedCaNum')});
            } else {
                oRouter.navTo('dashboard.Bp', {bpNum: oRouteInfo.BP_NUM});
            }
        };

        return Controller;
    }
);
