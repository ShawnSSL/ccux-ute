/*global sap, ute, jQuery*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
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
            this._oABPPopup.setShowCloseButton(false);
            this.addDependent(this._oABPPopup);
        };

        /*----------------------------------------------------- Methods -----------------------------------------------------*/

        ABPPopup.prototype.prepareABP = function (bisRetro) {
            var oABPView,
                eventBus = sap.ui.getCore().getEventBus();


            if (!this._oABPPopup.getContent().length) {
                oABPView = sap.ui.view({
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "nrg.module.billing.view.ABP"
                });
                // Set a variable to flag if it's retro or not
                oABPView.getController().isRetro = bisRetro;
                if (this._oABPPopup.isOpen()) { return this; }
                this._oABPPopup.addContent(oABPView);
            } else {
                if ((this._oABPPopup.getContent()) && (this._oABPPopup.getContent().length > 0)) {
                    this._oABPPopup.getContent()[0].getController().isRetro = bisRetro;
                }
            }
            eventBus.publish("nrg.module.billing", "eOpenABPPopup", {}); //20160615 Revert to allow other changes first
            //this._oABPPopup.open();
            return this;
        };
        ABPPopup.prototype._onPopupClosed = function () {
            this.getParent().fireEvent("ABPCompleted");
        };
        return ABPPopup;
    },

    true
);
