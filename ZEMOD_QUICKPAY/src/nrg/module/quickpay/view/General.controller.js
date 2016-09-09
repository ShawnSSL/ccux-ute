/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'nrg/module/quickpay/view/QuickPayPopup',
        'sap/ui/model/json/JSONModel'
    ],

    function (CoreController, QuickPayControl, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.quickpay.view.General');


		/* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oViewModel = new JSONModel({
                    reliantPay : true,
                    message : "",
                    reliantText : "Verify",
                    reliantPress: ".onAcceptReliant",
                    newBankRouting: "",
                    newBankAccount: "",
                    selected : 0
                });
            this.getView().setModel(oViewModel, "appView");
        };
        /**
		 * Start Quick Pay process
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onQuickPay = function (oEvent) {
            var QuickControl = new QuickPayControl(),
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this.getView().addDependent(QuickControl);
            QuickControl.openQuickPay(this._sContract, this._sBP, this._sCA);
        };

        return Controller;
    }


);
