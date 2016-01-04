/*global sap, ute, jQuery*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/core/Popup'
    ],

    function (Control, Popup) {
        'use strict';

        /*------------------------------------------ Control for Eligibility Popup ------------------------------------------*/

        var EligPopup = Control.extend('nrg.module.billing.view.EligPopup', {
            metadata: {
                properties: {
                    title: { type: 'string', defaultValue: null },
                    eligType: { type: 'string', defaultValue: "" }
                }
            }
        });

        /*-------------------------------------------- Basic Popup Configuration --------------------------------------------*/

        EligPopup.prototype.init = function () {
            this._oEligPopup = ute.ui.main.Popup.create({
                title: "ELIGIBILITY CRITERIA",
                close: this._onPopupClosed
            });
            this._oEligPopup.addStyleClass('nrgBilling-eligPopup');
            this._oEligPopup.setShowCloseButton(true);
            this.addDependent(this._oEligPopup);
        };

        /*----------------------------------------------------- Methods -----------------------------------------------------*/

        EligPopup.prototype.prepare = function () {
            if (!this._oEligPopup.getContent().length) {
                var oEligView = sap.ui.view({
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "nrg.module.billing.view.Elig"
                });
                // Set a variable for eligibility type
                oEligView.getController().eligType = this.getEligType();
                if (this._oEligPopup.isOpen()) { return this; }
                this._oEligPopup.addContent(oEligView);
            }
            this._oEligPopup.open();
            return this;
        };

        EligPopup.prototype._onPopupClosed = function (oEvent) {
            this.getParent().fireEvent("EligCompleted");
        };

        return EligPopup;
    },

    true
);
