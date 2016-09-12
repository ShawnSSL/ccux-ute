sap.ui.define(["nrg/base/view/BaseController","sap/ui/model/Filter","sap/ui/model/FilterOperator","jquery.sap.global","sap/ui/model/json/JSONModel"],function(a,b,c){"use strict";var d=a.extend("nrg.module.dashboard.view.DepositTool");return d.prototype.onInit=function(){},d.prototype.onBeforeRendering=function(){this._OwnerComponent=this.getView().getParent().getParent().getParent().getController().getOwnerComponent(),this._DepositToolPopupControl=this.getView().getParent()},d.prototype.onAfterRendering=function(){this.getView().setModel(this._OwnerComponent.getModel("comp-dashboard-checkbook"),"oDataChkSvc"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDeposit");var a=this._OwnerComponent.getCcuxContextManager().getContext().oData;this._bpNum=a.bpNum,this._caNum=a.caNum,this._coNum=a.coNum,this.retrieveDepositInfo()},d.prototype.retrieveDepositInfo=function(){var a,d=this.getView().getModel("oDataChkSvc"),e="/Deposits",f=[];f.push(new b({path:"CA",operator:c.EQ,value1:this._caNum})),f.push(new b({path:"Contract",operator:c.EQ,value1:this._coNum})),a={filters:f,success:function(a){a&&this.getView().getModel("oDeposit").setData(a.results)}.bind(this),error:function(){}.bind(this)},d&&d.read(e,a)},d.prototype._formatDate=function(a){var b;return a?b=this._pad(a.getMonth()+1)+"/"+this._pad(a.getDate())+"/"+a.getFullYear().toString():null},d.prototype._pad=function(a){return 10>a?"0"+a.toString():a.toString()},d.prototype.onPopupClose=function(){this._DepositToolPopupControl.close()},d.prototype._onTypeClicked=function(a){var b=this.getView().getParent().getParent().getParent().getController().getOwnerComponent().getCcuxWebUiManager(),c=a.getSource().getBindingContext("oDeposit"),d=c.getProperty("Security");b.notifyWebUi("openIndex",{LINK_ID:"ZSECURITY",REF_ID:d})},d});