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
        'nrg/module/billing/view/ABPPopup'
    ],

    function (CoreController, Fragment, JSONModel, Filter, FilterOperator, ABPPopup) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.BillingCheckbookTools');

        Controller.prototype.onInit = function () {

        };

        Controller.prototype.onBeforeRendering = function () {
            this.getView().setModel(this.getOwnerComponent().getModel('comp-eligibility'), 'oDataEligSvc');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');

            // Retrieve routing parameters
            var oRouteInfo = this.getOwnerComponent().getCcuxContextManager().getContext().oData;
            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;
            this._retrieveEligibility();
        };

        Controller.prototype.onAfterRendering = function () {
        };

        Controller.prototype._retrieveEligibility = function (fnCallback) {
            var sPath = '/EligCheckS(\'' + this._coNum + '\')',
                oModel = this.getView().getModel('oDataEligSvc'),
                oEligModel = this.getView().getModel('oEligibility'),
                oParameters,
                alert,
                i;

            oParameters = {
                success : function (oData) {
                    oEligModel.setData(oData);
                    if (fnCallback) {
                        fnCallback();
                    }
                }.bind(this),
                error: function (oError) {
                    
                }.bind(this)
            };

            if (oModel && this._coNum) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._onDunningBtnClicked = function () {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            oWebUiManager.notifyWebUi('openIndex', {LINK_ID: 'Z_DUNH'});
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
                this.ABPPopupCustomControl.attachEvent("ABPCompleted", function () {}, this);
                this.getView().addDependent(this.ABPPopupCustomControl);
            }
            this.ABPPopupCustomControl.prepareABP();
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

                this.ABPPopupCustomControl.attachEvent("ABPCompleted", function () {}, this);
                this.getView().addDependent(this.ABPPopupCustomControl);
            }
            this.ABPPopupCustomControl.prepareABP();
        };
        Controller.prototype._onDppBtnClicked = function (oEvent) {
/*            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager(),
                oRetrDone = false,
                checkRetrComplete,
                that = this;

            // Display the loading indicator
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            // Retrieve Notification
            this._retrieveEligibility(function () {oRetrDone = true; });
            // Check retrieval done
            checkRetrComplete = setInterval(function () {
                if (oRetrDone) {
                    var oEligibilityModel = this.getView().getModel('oEligibility');
                    // Dismiss the loading indicator
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    // Upon successfully retrieving the data, stop checking the completion of retrieving data
                    clearInterval(checkRetrComplete);
                    // Check active or not
                    if (!oEligibilityModel.oData.DPPActv) {
                        // Go to DPP page

                    } else {
                        // Go to transaction launcher
                        oWebUiManager.notifyWebUi('openIndex', {
                            LINK_ID: "Z_DPP"
                        });
                    }
                }
            }.bind(this), 100);*/
            var oBindingContext = oEvent.getSource().getBindingContext("oEligibility"),
                oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();
            if (oBindingContext) {
                if (oBindingContext.getProperty("/DPPActv")) {
                    oWebUiManager.notifyWebUi('openIndex', {
                        LINK_ID: "Z_DPP"
                    });
                } else {
                    this.navTo('billing.DefferedPmtPlan', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
                }
            }

        };

        Controller.prototype._onExtnBtnClicked = function (oEvent) {
/*            var oEligModel = this.getOwnerComponent().getModel('comp-dppext'),
                oParameters,
                sPath,
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            // Retrieve Notification
            sPath = '/ExtElgbles(\'' + this._coNum + '\')';
            oParameters = {
                success : function (oData) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oData && oData.NoAmtDue) {
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'No Amount Due'
                        });
                    } else {
                        that.navTo('billing.DefferedPmtExt', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
                    }

                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            if (oEligModel && this._coNum) {
                oEligModel.read(sPath, oParameters);
            }*/
            this.navTo('billing.DefferedPmtExt', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
        };

        return Controller;
    }
);
