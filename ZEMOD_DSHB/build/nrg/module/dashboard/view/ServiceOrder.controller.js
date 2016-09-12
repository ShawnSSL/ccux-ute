sap.ui.define(["nrg/base/view/BaseController","jquery.sap.global","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(a,b,c,d){"use strict";var e=a.extend("nrg.module.dashboard.view.ServiceOrder");return e.prototype.onInit=function(){},e.prototype.onBeforeRendering=function(){var a=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();this.getView().setModel(this.getOwnerComponent().getModel("comp-dashboard-svcodr"),"oODataSvc"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oSelectedTabs"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oPndingVisType"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oESIDDropdown"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oEnrollHolds"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oEnrollPndingStats"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oReconOrds"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDiscOrds"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oOtherOrds"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oCompleteOrds"),this._bpNum=a.parameters.bpNum,this._caNum=a.parameters.caNum,this._coNum=a.parameters.coNum,this._initSelectTab(),this._initPndingVisType(),this._initESIDDropdown()},e.prototype.onAfterRendering=function(){this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum,this._caNum,this._coNum)},e.prototype._handleBsnsRlCallback=function(a){},e.prototype._initSelectTab=function(){this.getView().getModel("oSelectedTabs").setProperty("/pendingSelected",!0),this.getView().getModel("oSelectedTabs").setProperty("/completeSelected",!1)},e.prototype._initPndingVisType=function(){this.getView().getModel("oPndingVisType").setProperty("/visMovein",!1),this.getView().getModel("oPndingVisType").setProperty("/visReconnect",!1),this.getView().getModel("oPndingVisType").setProperty("/visDisconnect",!1),this.getView().getModel("oPndingVisType").setProperty("/visOthers",!1)},e.prototype._initESIDDropdown=function(){this._retrESIDs()},e.prototype._formatVisPnd=function(a,b){return a&&b},e.prototype._formatVisMvi=function(a){return!!a},e.prototype._formatDate=function(a){var b;return a?b=(a.getMonth()+1).toString()+"/"+a.getDate().toString()+"/"+a.getFullYear().toString().substring(2,4):null},e.prototype._onPendingTabClicked=function(){var a=this.getView().byId("idESIDDropdown").getProperty("selectedKey");this.getView().getModel("oSelectedTabs").setProperty("/pendingSelected",!0),this.getView().getModel("oSelectedTabs").setProperty("/completeSelected",!1),this.getView().getModel("oESIDDropdown").oData.results&&this._retrEnrollHolds(this.getView().getModel("oESIDDropdown").oData.results[a].ESID,this.getView().getModel("oESIDDropdown").oData.results[0].Contract)},e.prototype._onCompleteTabClicked=function(){var a=this.getView().byId("idESIDDropdown").getProperty("selectedKey");this.getView().getModel("oSelectedTabs").setProperty("/pendingSelected",!1),this.getView().getModel("oSelectedTabs").setProperty("/completeSelected",!0),this.getView().getModel("oESIDDropdown").oData.results&&this._retrCompleteOrds(this._bpNum,this._caNum,this._coNum,this.getView().getModel("oESIDDropdown").oData.results[a].ESID)},e.prototype._onESIDSelect=function(a){this.getView().getModel("oSelectedTabs").getProperty("/pendingSelected")?this.getView().getModel("oESIDDropdown").oData.results&&this._retrEnrollHolds(this.getView().getModel("oESIDDropdown").oData.results[a.mParameters.selectedKey].ESID,this.getView().getModel("oESIDDropdown").oData.results[a.mParameters.selectedKey].Contract):this.getView().getModel("oESIDDropdown").oData.results&&this._retrCompleteOrds(this._bpNum,this._caNum,this._coNum,this.getView().getModel("oESIDDropdown").oData.results[a.mParameters.selectedKey].ESID)},e.prototype._retrESIDs=function(){var a,b,e,f=[],g=this.getView().getModel("oODataSvc");f.push(new c({path:"CA",operator:d.EQ,value1:this._caNum})),a="/SrvAddrS",b={filters:f,success:function(a){var b=0;if(a){for(a.results.selectedKey="",e=0;e<a.results.length;e+=1)a.results[e].iInd=e,parseInt(a.results[e].Contract,10)===parseInt(this._coNum,10)&&(b=a.results[e].iInd);this.getView().getModel("oESIDDropdown").setData(a),this.getView().byId("idESIDDropdown").setSelectedKey(b),this._retrEnrollHolds(a.results[b].ESID,a.results[b].Contract)}}.bind(this),error:function(){}.bind(this)},g&&g.read(a,b)},e.prototype._retrEnrollHolds=function(a,b){var e,f,g=[],h=this.getView().getModel("oODataSvc");g.push(new c({path:"Contract",operator:d.EQ,value1:b})),g.push(new c({path:"ESID",operator:d.EQ,value1:a})),e="/EnrollHoldS",f={filters:g,success:function(c){c.results.length>0?(this.getView().getModel("oEnrollHolds").setData(c),this.getView().getModel("oPndingVisType").setProperty("/visMovein",!0),this._retrEnrollPndingStats(this._bpNum,this._caNum,a)):e="test",this._retrReconOrds(this._bpNum,this._caNum,b,a),this._retrDiscOrds(this._bpNum,this._caNum,b,a),this._retrOtherOrds(this._bpNum,this._caNum,b,a)}.bind(this),error:function(){}.bind(this)},h&&h.read(e,f)},e.prototype._retrEnrollPndingStats=function(a,b,e){var f,g,h=[],i=this.getView().getModel("oODataSvc");h.push(new c({path:"BP",operator:d.EQ,value1:a})),h.push(new c({path:"CA",operator:d.EQ,value1:b})),h.push(new c({path:"ESID",operator:d.EQ,value1:e})),f="/PendStatS",g={filters:h,success:function(a){a.results.length>0&&(this.getView().getModel("oEnrollPndingStats").setData(a),this.getView().getModel("oPndingVisType").setProperty("/visMovein",!0))}.bind(this),error:function(){}.bind(this)},i&&i.read(f,g)},e.prototype._retrReconOrds=function(a,b,e,f){var g,h,i=[],j=this.getView().getModel("oODataSvc");i.push(new c({path:"BP",operator:d.EQ,value1:a})),i.push(new c({path:"CA",operator:d.EQ,value1:b})),i.push(new c({path:"Contract",operator:d.EQ,value1:e})),i.push(new c({path:"ESID",operator:d.EQ,value1:f})),g="/ReconOrdS",h={filters:i,success:function(a){a.results.length>0&&(this.getView().getModel("oReconOrds").setData(a),this.getView().getModel("oPndingVisType").setProperty("/visReconnect",!0))}.bind(this),error:function(){}.bind(this)},j&&j.read(g,h)},e.prototype._retrDiscOrds=function(a,b,e,f){var g,h,i=[],j=this.getView().getModel("oODataSvc");i.push(new c({path:"BP",operator:d.EQ,value1:a})),i.push(new c({path:"CA",operator:d.EQ,value1:b})),i.push(new c({path:"Contract",operator:d.EQ,value1:e})),i.push(new c({path:"ESID",operator:d.EQ,value1:f})),g="/DiscOrdS",h={filters:i,success:function(a){a.results.length>0&&(this.getView().getModel("oDiscOrds").setData(a),this.getView().getModel("oPndingVisType").setProperty("/visDisconnect",!0))}.bind(this),error:function(){}.bind(this)},j&&j.read(g,h)},e.prototype._retrOtherOrds=function(a,b,e,f){var g,h,i=[],j=this.getView().getModel("oODataSvc");i.push(new c({path:"BP",operator:d.EQ,value1:a})),i.push(new c({path:"CA",operator:d.EQ,value1:b})),i.push(new c({path:"Contract",operator:d.EQ,value1:e})),i.push(new c({path:"ESID",operator:d.EQ,value1:f})),g="/OtherOrdS",h={filters:i,success:function(a){a.results.length>0&&(this.getView().getModel("oOtherOrds").setData(a),this.getView().getModel("oPndingVisType").setProperty("/visOthers",!0))}.bind(this),error:function(){}.bind(this)},j&&j.read(g,h)},e.prototype._retrCompleteOrds=function(a,b,e,f){var g,h,i=[],j=this.getView().getModel("oODataSvc");i.push(new c({path:"BP",operator:d.EQ,value1:a})),i.push(new c({path:"CA",operator:d.EQ,value1:b})),i.push(new c({path:"Contract",operator:d.EQ,value1:e})),i.push(new c({path:"ESID",operator:d.EQ,value1:f})),g="/ComplOrdS",h={filters:i,success:function(a){a.results.length>0&&this.getView().getModel("oCompleteOrds").setData(a)}.bind(this),error:function(){}.bind(this)},j&&j.read(g,h)},e.prototype._onDashBoard=function(){this.navTo("dashboard.VerificationWithCaCo",{bpNum:this._bpNum,caNum:this._caNum,coNum:this._coNum})},e});