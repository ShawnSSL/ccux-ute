/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController'
    ],

    function (CoreController) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.HighBillTools');
        /* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
        };
        /**
		 * Handler for Meter Test Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onMeterTest = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_MTR_RD"
            });
        };
        /**
		 * Handler for Home Energy
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onHomeEnergy = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_HOME_CHK"
            });
        };
        /**
		 * Handler for Weekly Summary Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onWeekly = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "ZZSMHEADER"
            });
        };
        /**
		 * Handler for Project Bill Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onProjectBill = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_PROJ_BIL"
            });
        };
        /**
		 * Handler for Smart Meter Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onSmartMeter = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_SM_TEXAS"
            });
        };
        /**
		 * Handler for Energy Efficienty website launcher
         *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onEngergyEff = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_REI_SAVE"
            });
        };
        /**
		 * Handler for Energy Efficienty website launcher
         *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
/*        Controller.prototype.onChangeCampaign = function (oControlEvent) {
            this.navTo("campaign", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV: "C"});
        };*/
        /**
		 * Handler for Energy Efficienty website launcher
         *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onRHS = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "ZVASOPTSLN"
            });
        };
        return Controller;
    }

);
