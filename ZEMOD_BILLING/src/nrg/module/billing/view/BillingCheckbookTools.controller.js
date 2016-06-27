/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/core/Fragment',
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/billing/view/ABPPopup',
        'nrg/module/dashboard/view/ReconnectPopup'
    ],

    function (CoreController, Fragment, JSONModel, Filter, FilterOperator, ABPPopup, ReconnectPopup) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.BillingCheckbookTools');

        Controller.prototype.onBeforeRendering = function () {
            this.getView().setModel(this.getOwnerComponent().getModel('comp-eligibility'), 'oDataEligSvc');
            // Retrieve routing parameters
            var oRouteInfo = this.getOwnerComponent().getCcuxContextManager().getContext().oData;
            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;
        };

        Controller.prototype._onDunningBtnClicked = function () {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            oWebUiManager.notifyWebUi('openIndex', {LINK_ID: 'Z_DUNH'});
        };
        Controller.prototype._onReconnectionClick = function () {
            if (!this.ReconnectPopupControl) {
                this.ReconnectPopupControl = new ReconnectPopup({ isRetro: true });

                this.ReconnectPopupControl.attachEvent("ReConnectCompleted", function () {}, this);
                this.getView().addDependent(this.ReconnectPopupControl);
            }
            this.ReconnectPopupControl.open();
        };
        /**
		 * Handler for Fee Adjustments Button.
		 *
		 * @function
		 * @param {oEvent} Type Event object
         *
		 *
		 */
        Controller.prototype._onFeeAdjBtnClicked = function (oEvent) {
            this.navTo("billing.feeAdjs", {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
        };
        Controller.prototype._onAvgBillBtnClicked = function () {
            if (!this.ABPPopupCustomControl) {
                this.ABPPopupCustomControl = new ABPPopup({ isRetro: false });
                this.ABPPopupCustomControl.attachEvent("ABPCompleted", this._onABPCompletedReloadChkBk, this);
                this.getView().addDependent(this.ABPPopupCustomControl);
            } else {
                this.ABPPopupCustomControl._oABPPopup.setTitle('AVERAGE BILLING PLAN');
            }
            this.ABPPopupCustomControl.prepareABP(false);
        };

        Controller.prototype._onABPCompletedReloadChkBk = function () {
            var eventBus = sap.ui.getCore().getEventBus();

            eventBus.publish("nrg.module.billing", "eABPCompleted", {});
        };
        /**
		 * Handler for Balance Bill Re-Average Detail.
		 *
		 * @function
		 * @param {oEvent} Type Event object
         *
		 *
		 */
        Controller.prototype._onReAvgBillBtnClicked = function (oEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();
            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_BB_REAVG"
            });
        };
        Controller.prototype._onRetroAverageBillingClick = function () {
            if (!this.ABPPopupCustomControl) {
                this.ABPPopupCustomControl = new ABPPopup({ isRetro: true });
                this.ABPPopupCustomControl._oABPPopup.setTitle('RETRO AVERAGE BILLING PLAN: ACTIVATE');
               //this.ABPPopupCustomControl._oABPPopup.setTitle('The title you want to change to.');

                this.ABPPopupCustomControl.attachEvent("ABPCompleted", this._onABPCompletedReloadChkBk, this);
                this.getView().addDependent(this.ABPPopupCustomControl);
            } else {
                this.ABPPopupCustomControl._oABPPopup.setTitle('RETRO AVERAGE BILLING PLAN: ACTIVATE');
            }
            this.ABPPopupCustomControl.prepareABP(true);
        };
        Controller.prototype._onDppBtnClicked = function (oEvent) {
 /*
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager(),
                sPath = '/EligCheckS(\'' + this._coNum + '\')',
                oModel = this.getView().getModel('oDataEligSvc'),
                oParameters,
                that = this;

            oParameters = {
                success : function (oData) {
                    if (oData && oData.DPPActv) {
                        oWebUiManager.notifyWebUi('openIndex', {
                            LINK_ID: "Z_DPP"
                        });
                    } else {
                        that.navTo('billing.DefferedPmtPlan', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel && this._coNum) {
                oModel.read(sPath, oParameters);
            }
   */
            this.navTo('billing.DefferedPmtPlan', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
        };

        Controller.prototype._onExtnBtnClicked = function (oEvent) {
            this.navTo('billing.DefferedPmtExt', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
        };

        return Controller;
    }
);
