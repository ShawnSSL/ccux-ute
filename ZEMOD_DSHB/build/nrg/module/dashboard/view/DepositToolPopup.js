sap.ui.define(["sap/ui/core/Control","sap/ui/core/Popup"],function(a){"use strict";var b=a.extend("nrg.module.dashboard.view.DepositToolPopup",{metadata:{properties:{title:{type:"string",defaultValue:null}}}});return b.prototype.init=function(){this._oDepositToolPopup=ute.ui.main.Popup.create("nrgDashboard-depositToolPopup",{title:"DEPOSIT TOOL",close:this._onPopupClosed}),this._oDepositToolPopup.addStyleClass("nrgDashboard-depositToolPopup"),this._oDepositToolPopup.setShowCloseButton(!0),this.addDependent(this._oDepositToolPopup)},b.prototype.preparePopup=function(){if(!this._oDepositToolPopup.getContent().length){var a=sap.ui.view({type:sap.ui.core.mvc.ViewType.XML,viewName:"nrg.module.dashboard.view.DepositTool"});if(this._oDepositToolPopup.isOpen())return this;this._oDepositToolPopup.addContent(a)}return this._oDepositToolPopup.open(),this},b.prototype._onPopupClosed=function(){this.getParent().fireEvent("DepositToolCompleted")},b},!0);