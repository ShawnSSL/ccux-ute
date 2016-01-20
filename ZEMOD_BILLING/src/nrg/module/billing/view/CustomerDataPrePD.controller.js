/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'nrg/base/view/BaseController',
        'sap/ui/model/json/JSONModel',
        'nrg/module/quickpay/view/QuickPayControl'
    ],

    function (jQuery, Controller, JSONModel, QuickPayControl) {
        'use strict';

        var CustomController = Controller.extend('nrg.module.billing.view.CustomerDataPrePD');

        CustomController.prototype.onInit = function () {

        };

        CustomController.prototype.onBeforeRendering = function () {
            this.getOwnerComponent().getCcuxApp().setTitle('BILLING');
            this._initRouting();
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            var oModel = this.getOwnerComponent().getModel('comp-feeAdjs'),
                oBindingInfo,
                sPath = "/PrepaySet(BP='" + this._bpNum + "',CA='" + this._caNum + "')",
                that = this;
            oBindingInfo = {
                success : function (oData) {
                    that.getView().bindElement({
                        model : "comp-feeAdjs",
                        path : sPath
                    });
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };

        CustomController.prototype.onAfterRendering = function () {
            this.getOwnerComponent().getCcuxApp().showNavLeft(true);
            this.getOwnerComponent().getCcuxApp().attachNavLeft(this._navLeftCallBack, this);
            this.getOwnerComponent().getCcuxApp().showNavRight(true);
            this.getOwnerComponent().getCcuxApp().attachNavRight(this._navRightCallBack, this);
            this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);
        };

        Controller.prototype._navLeftCallBack = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum && this._caNum && this._bpNum) {
                oRouter.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else if (!this._coNum && this._caNum && this._bpNum) {
                oRouter.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
            } else if (!this._coNum && !this._caNum && this._bpNum) {
                oRouter.navTo('dashboard.Verification', {bpNum: this._bpNum});
            }
        };

        Controller.prototype._navRightCallBack = function () {
            //var oRouteManger = this.getOwnerComponent().getCcuxRouteManager();
        };

        CustomController.prototype.onExit = function () {

        };

        CustomController.prototype.onPayNow = function () {
            var QuickControl = new QuickPayControl();

            this._sContract = this._coNum;
            this._sBP = this._bpNum;
            this._sCA = this._caNum;
            this.getView().addDependent(QuickControl);
            QuickControl.openQuickPay(this._sContract, this._sBP, this._sCA);
        };
        /*************************************************************************************************************************/
        //Init Functions
        /*************************************************************************************************************************/
        CustomController.prototype._initRouting = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;
            return;
        };
        /*************************************************************************************************************************/



        /*************************************************************************************************************************/
        //Handlers
        /*************************************************************************************************************************/
        CustomController.prototype._onChkbookLnkClicked = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum) {
                oRouter.navTo('billing.PrePayCheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('billing.PrePayCheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        CustomController.prototype._onHighbillLnkClicked = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum) {
                oRouter.navTo('billing.HighBill', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('billing.HighBillNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        /*************************************************************************************************************************/
        return CustomController;
    }
);
