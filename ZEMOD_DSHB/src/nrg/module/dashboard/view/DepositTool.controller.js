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

        var Controller = CoreController.extend('nrg.module.dashboard.view.DepositTool');

        Controller.prototype.onInit = function () {

        };

        Controller.prototype.onBeforeRendering = function () {
            // Get the OwenerComponent from the mother controller
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();

            // Get the DepositTool popup control
            this._DepositToolPopupControl = this.getView().getParent();
        };

        Controller.prototype.onAfterRendering = function () {
            // Set up models
            this.getView().setModel(this._OwnerComponent.getModel('comp-dashboard-checkbook'), 'oDataChkSvc');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDeposit');

            // Retrieve routing parameters
            var oRouteInfo = this._OwnerComponent.getCcuxContextManager().getContext().oData;

            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;

            this.retrieveDepositInfo();
        };

        /*------------------------------------------------ Retrieve Methods -------------------------------------------------*/

        Controller.prototype.retrieveDepositInfo = function () {
            var oModel = this.getView().getModel('oDataChkSvc'),
                sPath = '/Deposits',
                oParameters,
                aFilters = [];

            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: this._caNum}));
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: this._coNum}));

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oDeposit').setData(oData.results);
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

        /*------------------------------------------------- Button Actions --------------------------------------------------*/

        Controller.prototype._formatDate = function (oDate) {
            var sFormattedDate;

            if (!oDate) {
                return null;
            } else {
                sFormattedDate = this._pad(oDate.getMonth() + 1) + '/' + this._pad(oDate.getDate()) + '/' + oDate.getFullYear().toString();
                return sFormattedDate;
            }
        };

        Controller.prototype._pad = function (d) {
            return (d < 10) ? '0' + d.toString() : d.toString();
        };

        Controller.prototype.onPopupClose = function (oEvent) {
            this._DepositToolPopupControl.close();
        };
        Controller.prototype._onTypeClicked = function (oEvent) {
            var oWebUiManager = this.getView().getParent().getParent().getParent().getController().getOwnerComponent().getCcuxWebUiManager(),
                oContext = oEvent.getSource().getBindingContext("oDeposit"),
                sSecurityNumber = oContext.getProperty("Security");

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "ZSECURITY",
                Security : sSecurityNumber
            });
        };
        return Controller;
    }
);
