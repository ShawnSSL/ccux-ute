sap.ui.define(["nrg/base/view/BaseController"],function(a){"use strict";var b=a.extend("nrg.module.billing.view.PPCheckbookTools");return b.prototype.onBeforeRendering=function(){this.getView().setModel(this.getOwnerComponent().getModel("comp-eligibility"),"oDataEligSvc");{var a=this.getOwnerComponent().getCcuxContextManager().getContext().oData;this.getOwnerComponent().getModel("comp-feeAdjs")}this._bpNum=a.bpNum,this._caNum=a.caNum,this._coNum=a.coNum},b.prototype._onDunningBtnClicked=function(){var a=this.getOwnerComponent().getCcuxWebUiManager();a.notifyWebUi("openIndex",{LINK_ID:"Z_DUNH"})},b.prototype._onFeeAdjBtnClicked=function(){this.navTo("billing.feeAdjs",{bpNum:this._bpNum,caNum:this._caNum,coNum:this._coNum})},b.prototype._onDppBtnClicked=function(){var a,b=this.getOwnerComponent().getCcuxWebUiManager(),c="/EligCheckS('"+this._coNum+"')",d=this.getView().getModel("oDataEligSvc"),e=this;a={success:function(a){a&&a.DPPActv?b.notifyWebUi("openIndex",{LINK_ID:"Z_DPP_CR"}):e.navTo("billing.DefferedPmtPlan",{bpNum:this._bpNum,caNum:this._caNum,coNum:this._coNum})}.bind(this),error:function(){}.bind(this)},d&&this._coNum&&d.read(c,a)},b});