/*global sap, ute, jQuery*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/core/Popup'
    ],

    function (Control, Popup) {
        'use strict';

        /*------------------------------------- Control for Average Billing Plan Popup --------------------------------------*/

        var ABPPopup = Control.extend('nrg.module.billing.view.ABPPopup', {
            metadata: {
                properties: {
                    title: { type: 'string', defaultValue: null },
                    isRetro: { type: 'boolean', defaultValue: false }
                }
            }
        });

        /*-------------------------------------------- Basic Popup Configuration --------------------------------------------*/

        ABPPopup.prototype.init = function () {
            this._oABPPopup = ute.ui.main.Popup.create('nrgBilling-avgBillingPopup', {
                title: "AVERAGE BILLING PLAN",
                close: this._onPopupClosed
            });
            this._oABPPopup.addStyleClass('nrgBilling-avgBillingPopup');
            this._oABPPopup.setShowCloseButton(true);
            this.addDependent(this._oABPPopup);
        };

        /*----------------------------------------------------- Methods -----------------------------------------------------*/

        ABPPopup.prototype.prepareABP = function () {
            if (!this._oABPPopup.getContent().length) {
                var oABPView = sap.ui.view({
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "nrg.module.billing.view.ABP"
                });
                // Set a variable to flag if it's retro or not
                oABPView.getController().isRetro = this.getIsRetro();
                if (this._oABPPopup.isOpen()) { return this; }
                this._oABPPopup.addContent(oABPView);
            }
            this._oABPPopup.open();
            return this;
        };

        ABPPopup.prototype._onPopupClosed = function (oEvent) {
            this.getParent().fireEvent("ABPCompleted");
        };

        return ABPPopup;
    },

    true
);
