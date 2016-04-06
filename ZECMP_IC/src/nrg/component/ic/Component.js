/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/UIComponent',
        'sap/ui/core/Popup',
        'nrg/base/component/ResourceBundleManager',
        'nrg/base/component/StylesheetManager',
        'nrg/base/component/IconManager',
        'nrg/base/component/MockDataManager',
        'nrg/base/component/RealDataManager',
        'nrg/base/component/WebUiManager',
        'nrg/base/component/RouteManager',
        'nrg/base/component/ContextManager',
        'nrg/base/component/NotificationManager',
        'nrg/base/component/GlobalDataManager',

        'nrg/base/component/Router'
    ],

    function (jQuery, Component, Popup, ResourceBundleManager, StylesheetManager, IconManager,
        MockDataManager, RealDataManager, WebUiManager, RouteManager, ContextManager, NotificationManager, GlobalDataManager) {
        'use strict';

        var CustomComponent = Component.extend('nrg.component.ic.Component', {
            metadata: {
                manifest: 'json'
            }
        });

        CustomComponent.prototype.getCcuxNotificationManager = function () {
            return this._oNotificationManager;
        };

        CustomComponent.prototype.getCcuxContextManager = function () {
            return this._oContextManager;
        };

        CustomComponent.prototype.getCcuxWebUiManager = function () {
            return this._oWebUiManager;
        };

        CustomComponent.prototype.getCcuxRouteManager = function () {
            return this._oRouteManager;
        };
        CustomComponent.prototype.getRealDataManager = function () {
            return this._oRealDataManager;
        };
        CustomComponent.prototype.getGlobalDataManager = function () {
            return this._oGlobalDataManager;
        };
        CustomComponent.prototype.getCcuxApp = function () {
            var oRootViewController = this.getAggregation('rootControl').getController();

            if (oRootViewController) {
                return oRootViewController.getApp();
            }

            return null;
        };

        CustomComponent.prototype.init = function () {
            Component.prototype.init.apply(this);

            //Instantiation sequence should not be important
            this._oWebUiManager = new WebUiManager(this);
            this._oContextManager = new ContextManager(this);
            this._oStylesheetManager = new StylesheetManager(this);
            this._oResourceBundleManager = new ResourceBundleManager(this);
            this._oIconManager = new IconManager(this);
            this._oRealDataManager = new RealDataManager(this);
            this._oGlobalDataManager = new GlobalDataManager(this);
            this._oMockDataManager = new MockDataManager(this);
            this._oRouteManager = new RouteManager(this);
            this._oNotificationManager = new NotificationManager(this);

            //Initialization sequence is important due to inter manager dependencies
            this._oWebUiManager.start();
            this._oContextManager.init(); //Depending on WebUiManager
            this._oNotificationManager.init();
            this._oRealDataManager.addODataModels();
            this._oMockDataManager.startMockServers();
            this._oMockDataManager.addMockODataModels();
            this._oResourceBundleManager.addResourceModels();
            this._oStylesheetManager.addStylesheets();
            this._oIconManager.addIcons();
            this._oRouteManager.init();  //Depending on WebUiManager
        };

        CustomComponent.prototype.destroy = function () {
            if (this._oWebUiManager) {
                this._oWebUiManager.destroy();
                this._oWebUiManager = null;
            }

            if (this._oResourceBundleManager) {
                this._oResourceBundleManager.destroy();
                this._oResourceBundleManager = null;
            }

            if (this._oStylesheetManager) {
                this._oStylesheetManager.destroy();
                this._oStylesheetManager = null;
            }

            if (this._oIconManager) {
                this._oIconManager.destroy();
                this._oIconManager = null;
            }

            if (this._oMockDataManager) {
                this._oMockDataManager.destroy();
                this._oMockDataManager = null;
            }

            if (this._oRealDataManager) {
                this._oRealDataManager.destroy();
                this._oRealDataManager = null;
            }

            if (this._oRouteManager) {
                this._oRouteManager.destroy();
                this._oRouteManager = null;
            }

            if (this._oContextManager) {
                this._oContextManager.destroy();
                this._oContextManager = null;
            }

            Component.prototype.destroy.apply(this, arguments);
        };

        return CustomComponent;
    }
);
