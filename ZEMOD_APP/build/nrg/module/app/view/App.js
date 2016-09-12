sap.ui.define(["sap/ui/base/EventProvider","nrg/module/app/view/AppHeader","nrg/module/app/view/AppBody","nrg/module/app/view/AppFooter","nrg/module/app/view/NrgBusyDialog","jquery.sap.global"],function(a,b,c,d,e,f){"use strict";var g=a.extend("nrg.module.app.view.App",{constructor:function(d){a.apply(this),this._oController=d,this._oBusyDialog=new e({showCancelButton:!0,cancelButtonText:"STOP",stop:f.proxy(this._BusyDialogStopped,this),close:f.proxy(this._BusyDialogClosed,this)}),this._bEdit=!1,this._iBusyCounter=0,this._oAppHeader=new b(d,this),this._oAppHeader.init(),this._oAppBody=new c(d,this),this._oAppBody.init()},metadata:{publicMethods:["setOccupied","isOccupied","setHeaderMenuItemSelected","isHeaderMenuItemSelected","setHeaderMenuItemEnabled","isHeaderMenuItemEnabled","setTitle","setLayout","attachNavLeft","detachhNavLeft","showNavLeft","detachNavLeftAll","attachNavRight","detachNavRight","showNavRight","detachNavRightAll","setInEdit","isInEdit","updateFooter","updateFooterNotification","updateFooterRHS","updateFooterCampaign"]}});return g.HMItemId=b.HMItemId,g.QuickLinkId=b.QuickLinkId,g.LayoutType=c.ContentLayoutType,g.prototype.reset=function(a){this._oAppHeader.reset(),this._oAppBody.reset(a),this.setInEdit(!1)},g.prototype._BusyDialogStopped=function(){if(this._iBusyCounter=0,this._fCallBack)this._fCallBack();else{var a,b,c=this._oController.getOwnerComponent(),d=c.getCcuxRouteManager().getCurrentRouteInfo();a=c.getCcuxContextManager().getContext().getData(),b=c.getRouter(),d&&d.name&&-1===d.name.indexOf("dashboard")&&-1===d.name.indexOf("search")&&(a.bpNum&&a.caNum&&a.coNum?b.navTo("dashboard.VerificationWithCaCo",{bpNum:a.bpNum,caNum:a.caNum,coNum:a.coNum}):a.bpNum&&a.caNum?b.navTo("dashboard.VerificationWithCa",{bpNum:a.bpNum,caNum:a.caNum}):a.bpNum&&b.navTo("dashboard.Verification",{bpNum:a.bpNum}))}},g.prototype._BusyDialogClosed=function(){this._iBusyCounter=0},g.prototype.setOccupied=function(a,b,c){return a=!!a,this._fCallBack=b,a?this._iBusyCounter=this._iBusyCounter+1:(this._iBusyCounter=this._iBusyCounter-1,this._iBusyCounter<0&&(this._iBusyCounter=0)),1===this._iBusyCounter?this._oBusyDialog.open(c):0===this._iBusyCounter&&this._oBusyDialog.close(),this},g.prototype.isOccupied=function(){return this._oBusyDialog.isOpen()},g.prototype.setInEdit=function(a){return this._bEdit=!!a,this},g.prototype.isInEdit=function(){return this._bEdit},g.prototype.setHeaderMenuItemSelected=function(a,b){return this._oAppHeader.setSelected(a,b),this},g.prototype.isHeaderMenuItemSelected=function(a){return this._oAppHeader.isSelected(a)},g.prototype.setHeaderMenuItemEnabled=function(a,b){return this._oAppHeader.setEnabled(a,b),this},g.prototype.isHeaderMenuItemEnabled=function(a){return this._oAppHeader.isEnabled(a)},g.prototype.setTitle=function(a){var b=this._oController.getView().byId("appBodyTitle");return b&&a&&b.setText(a),this},g.prototype.setLayout=function(a){return this._oAppBody.setContentLayout(a),this},g.prototype.attachNavLeft=function(a,b){return this._oAppBody.attachNavLeft(a,b),this},g.prototype.detachNavLeft=function(a,b){return this._oAppBody.detachNavLeft(a,b),this},g.prototype.showNavLeft=function(a){return this._oAppBody.showNavLeft(a),this},g.prototype.detachNavLeftAll=function(){return this._oAppBody.detachNavLeftAll(),this},g.prototype.attachNavRight=function(a,b){return this._oAppBody.attachNavRight(a,b),this},g.prototype.detachNavRight=function(a,b){return this._oAppBody.detachNavRight(a,b),this},g.prototype.showNavRight=function(a){return this._oAppBody.showNavRight(a),this},g.prototype.detachNavRightAll=function(){return this._oAppBody.detachNavRightAll(),this},g.prototype._getHeader=function(){return this._oAppHeader},g.prototype._getBody=function(){return this._oAppBody},g.prototype.updateFooter=function(a,b,c){return sap.ui.getCore().getEventBus().publish("nrg.module.appFooter","eUpdateFooter",{bpNum:a,caNum:b,coNum:c}),this},g.prototype.updateFooterNotification=function(a,b,c){return sap.ui.getCore().getEventBus().publish("nrg.module.appFooter","eUpdateNotification",{bpNum:a,caNum:b,coNum:c}),this},g.prototype.updateFooterRHS=function(a,b,c){return sap.ui.getCore().getEventBus().publish("nrg.module.appFooter","eUpdateRhs",{bpNum:a,caNum:b,coNum:c}),this},g.prototype.updateFooterCampaign=function(a,b,c){return sap.ui.getCore().getEventBus().publish("nrg.module.appFooter","eUpdateCampaign",{bpNum:a,caNum:b,coNum:c}),this},g});