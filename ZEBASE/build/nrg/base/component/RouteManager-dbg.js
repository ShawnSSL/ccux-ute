/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object',
        'nrg/base/component/WebUiManager'
    ],

    function (jQuery, BaseObject, WebUiManager) {
        'use strict';

        var Manager = BaseObject.extend('nrg.base.component.RouteManager', {
            constructor: function (oComponent) {
                BaseObject.apply(this);
                this._oComponent = oComponent;
                this._aRouteHistory = [];
            },

            metadata: {
                publicMethods: [
                    'init',
                    'getCurrentRouteInfo'
                ]
            }
        });

        Manager._MAX_ROUTE_HISTORY_SIZE = '50';

        Manager.prototype.init = function () {
            this._registerRouteCallback();
            this._oComponent.getRouter().initialize();
            this._subscribeWebUi();
        };

        Manager.prototype._subscribeWebUi = function () {
            var oWebUiManager = this._oComponent.getCcuxWebUiManager();
            oWebUiManager.attachEvent('navigate', this._onWebUiNavigate, this);
        };

        Manager.prototype._unsubscribeWebUi = function () {
            var oWebUiManager = this._oComponent.getCcuxWebUiManager();
            oWebUiManager.detachEvent('navigate', this._onWebUiNavigate, this);
        };

        Manager.prototype._onWebUiNavigate = function (oEvent) {
            var oData, oRouter, sRouteName, oRouteParams;

            oData = oEvent.getParameters();
            if (!oData || !oData.route) {
                return;
            }

            sRouteName = oData.route;
            oRouteParams = oData.params || null;

            oRouter = this._oComponent.getRouter();
            jQuery.sap.log.info('[RouteManager._onWebUiNavigate()]', 'Navigating to ' + sRouteName);
            oRouter.navTo(sRouteName, oRouteParams, false);
        };

        Manager.prototype._registerRouteCallback = function () {
            var oRouter = this._oComponent.getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);
        };

        Manager.prototype._onRouteMatched = function (oEvent) {
            var oApp,
                oWebUiManager,
                bRouteMatched = false;

            this._updateContext(oEvent.getParameters());
            this._updateRouteHistory(oEvent.getParameters());
            bRouteMatched = this._checkLayout(oEvent.getParameters());
            oApp = this._oComponent.getCcuxApp();
            if (oApp) {
                oApp.reset(bRouteMatched);
            }

            oWebUiManager = this._oComponent.getCcuxWebUiManager();
            if (oWebUiManager.isAvailable()) {
                oWebUiManager.notifyWebUi('resetTimeOut');
            }
        };
        Manager.prototype._checkLayout = function (oRouteInfo) {
            var oRouteName = oRouteInfo.name,
                bRouteMatched = false;
            switch (oRouteName) {
            case "dashboard.Verification":
                bRouteMatched = true;
                break;
            case "dashboard.VerificationWithCa":
                bRouteMatched = true;
                break;
            case "dashboard.VerificationWithCaCo":
                bRouteMatched = true;
                break;
            case "billing.BillingInfo":
                bRouteMatched = true;
                break;
            case "billing.BillingInfoNoCo":
                bRouteMatched = true;
                break;
            case "billing.BillingPrePaid":
                bRouteMatched = true;
                break;
            case "billing.BillingPrePaidNoCo":
                bRouteMatched = true;
                break;
            }
            return bRouteMatched;
        };
        Manager.prototype._updateContext = function (oRouteInfo) {
            var oContextData;

            oContextData = {
                bpNum: oRouteInfo.arguments.bpNum || null,
                caNum: oRouteInfo.arguments.caNum || null,
                coNum: oRouteInfo.arguments.coNum || null
            };

            this._oComponent.getCcuxContextManager().getContext().setData(oContextData, true);
        };

        Manager.prototype._updateRouteHistory = function (oRouteInfo) {
            var oCurrentRouteInfo, sArg;

            if (this._aRouteHistory.length !== 0) {
                oCurrentRouteInfo = this._aRouteHistory[this._aRouteHistory.length - 1];
            }

            //Do not capture refresh
            if (oRouteInfo.name === 'app.refresh') {
                return this;
            }

            if (oCurrentRouteInfo) {
                if (this._isIdenticalRouteInfo(oRouteInfo, oCurrentRouteInfo)) {
                    return this;
                }
            }

            if (this._aRouteHistory.length === Manager._MAX_ROUTE_HISTORY_SIZE) {
                this._aRouteHistory.shift();
            }

            this._aRouteHistory.push(oRouteInfo);
            return this;
        };
        Manager.prototype.resetRouteHistory = function () {
            this._aRouteHistory = [];
        };
        Manager.prototype._isIdenticalRouteInfo = function (oRouteInfoA, oRouteInfoB) {
            var sArg;

            if (!oRouteInfoA || !oRouteInfoB) {
                return false;
            }

            if (oRouteInfoA.name !== oRouteInfoB.name) {
                return false;
            }

            for (sArg in oRouteInfoA.arguments) {
                if (oRouteInfoA.arguments.hasOwnProperty(sArg)) {
                    if (!oRouteInfoB.arguments[sArg]) {
                        return false;
                    }

                    if (oRouteInfoA.arguments[sArg] !== oRouteInfoB.arguments[sArg]) {
                        return false;
                    }
                }
            }

            return true;
        };

        Manager.prototype.getCurrentRouteInfo = function () {
            var oCurrentRoute;

            if (this._aRouteHistory.length === 0) {
                return null;
            }

            oCurrentRoute = this._aRouteHistory[this._aRouteHistory.length - 1];

            return {
                name: oCurrentRoute.name,
                parameters: oCurrentRoute.arguments
            };
        };
        Manager.prototype.getPreviousRouteInfo = function () {
            var oPreviousRoute;

            if (this._aRouteHistory.length === 0 || this._aRouteHistory.length === 1) {
                return null;
            }

            oPreviousRoute = this._aRouteHistory[this._aRouteHistory.length - 2];

            return {
                name: oPreviousRoute.name,
                parameters: oPreviousRoute.arguments
            };
        };
        Manager.prototype.destroy = function () {
            this._unsubscribeWebUi();
            BaseObject.prototype.destroy.apply(this, arguments);
        };

        return Manager;
    }
);
