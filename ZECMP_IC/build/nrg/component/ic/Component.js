sap.ui.define(["jquery.sap.global","sap/ui/core/UIComponent","sap/ui/core/Popup","nrg/base/component/ResourceBundleManager","nrg/base/component/StylesheetManager","nrg/base/component/IconManager","nrg/base/component/MockDataManager","nrg/base/component/RealDataManager","nrg/base/component/WebUiManager","nrg/base/component/RouteManager","nrg/base/component/ContextManager","nrg/base/component/NotificationManager","nrg/base/component/GlobalDataManager","nrg/base/component/Router"],function(a,b,c,d,e,f,g,h,i,j,k,l,m){"use strict";var n=b.extend("nrg.component.ic.Component",{metadata:{manifest:"json"}});return n.prototype.getCcuxNotificationManager=function(){return this._oNotificationManager},n.prototype.getCcuxContextManager=function(){return this._oContextManager},n.prototype.getCcuxWebUiManager=function(){return this._oWebUiManager},n.prototype.getCcuxRouteManager=function(){return this._oRouteManager},n.prototype.getRealDataManager=function(){return this._oRealDataManager},n.prototype.getGlobalDataManager=function(){return this._oGlobalDataManager},n.prototype.getCcuxApp=function(){var a=this.getAggregation("rootControl").getController();return a?a.getApp():null},n.prototype.init=function(){b.prototype.init.apply(this),this._oWebUiManager=new i(this),this._oContextManager=new k(this),this._oStylesheetManager=new e(this),this._oResourceBundleManager=new d(this),this._oIconManager=new f(this),this._oRealDataManager=new h(this),this._oGlobalDataManager=new m(this),this._oMockDataManager=new g(this),this._oRouteManager=new j(this),this._oNotificationManager=new l(this),this._oWebUiManager.start(),this._oContextManager.init(),this._oNotificationManager.init(),this._oRealDataManager.addODataModels(),this._oMockDataManager.startMockServers(),this._oMockDataManager.addMockODataModels(),this._oResourceBundleManager.addResourceModels(),this._oStylesheetManager.addStylesheets(),this._oIconManager.addIcons(),this._oRouteManager.init()},n.prototype.destroy=function(){this._oWebUiManager&&(this._oWebUiManager.destroy(),this._oWebUiManager=null),this._oResourceBundleManager&&(this._oResourceBundleManager.destroy(),this._oResourceBundleManager=null),this._oStylesheetManager&&(this._oStylesheetManager.destroy(),this._oStylesheetManager=null),this._oIconManager&&(this._oIconManager.destroy(),this._oIconManager=null),this._oMockDataManager&&(this._oMockDataManager.destroy(),this._oMockDataManager=null),this._oRealDataManager&&(this._oRealDataManager.destroy(),this._oRealDataManager=null),this._oRouteManager&&(this._oRouteManager.destroy(),this._oRouteManager=null),this._oContextManager&&(this._oContextManager.destroy(),this._oContextManager=null),b.prototype.destroy.apply(this,arguments)},n.prototype.onAfterRendering=function(){},n});