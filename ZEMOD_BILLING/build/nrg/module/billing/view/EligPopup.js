sap.ui.define(["sap/ui/core/Control","sap/ui/core/Popup"],function(a){"use strict";var b=a.extend("nrg.module.billing.view.EligPopup",{metadata:{properties:{title:{type:"string",defaultValue:null},eligType:{type:"string",defaultValue:""}}}});return b.prototype.init=function(){this._oEligPopup=ute.ui.main.Popup.create({title:"ELIGIBILITY CRITERIA",close:this._onPopupClosed}),this._oEligPopup.addStyleClass("nrgBilling-eligPopup"),this._oEligPopup.setShowCloseButton(!0),this.addDependent(this._oEligPopup)},b.prototype.prepare=function(){if(!this._oEligPopup.getContent().length){var a=sap.ui.view({type:sap.ui.core.mvc.ViewType.XML,viewName:"nrg.module.billing.view.Elig"});if(a.getController().eligType=this.getEligType(),this._oEligPopup.isOpen())return this;this._oEligPopup.addContent(a)}return this._oEligPopup.open(),this},b.prototype._onPopupClosed=function(){this.getParent().fireEvent("EligCompleted")},b},!0);