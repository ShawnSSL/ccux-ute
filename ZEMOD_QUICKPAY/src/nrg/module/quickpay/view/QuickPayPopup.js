/*global sap, ute, jQuery*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

		/* ========================================================================*/
		/* Creating a New Control to manage Quick Pay  Pop-up                      */
		/* ======================================================================= */
        var QuickPayControl = Control.extend('nrg.module.quickpay.view.QuickPayPopup', {

        });

		/* ========================================================================*/
		/* Quick Pay Pop-up to initialize basic popup configurations               */
		/* ======================================================================= */
        QuickPayControl.prototype.init = function () {
            var _handleDialogClosed = function (oEvent) {
                    this.getParent().fireEvent("PaymentCompleted");
                };
            this._oQuickPayPopup = ute.ui.main.Popup.create({
                close: _handleDialogClosed
            });
            this._oQuickPayPopup.setShowCloseButton(false);

        };

		/* ========================================================================*/
		/* Method to be used to open the Quick Pay popup                           */
		/* ======================================================================= */

        QuickPayControl.prototype.openQuickPay = function (sContractId, sBP, sCA) {
            var oQuickView = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "nrg.module.quickpay.view.Mainfile"
            });
            oQuickView.getController()._sContractId = sContractId;
            oQuickView.getController()._sBP = sBP;
            oQuickView.getController()._sCA = sCA;
            this._oQuickPayPopup.addStyleClass("nrgQPPay-View");
            if (this._oQuickPayPopup.isOpen()) {
                //this._oPaymentPopup.setContent(oQuickPayView);
                return this;
            }
            this._oQuickPayPopup.addContent(oQuickView);
            this.addDependent(this._oQuickPayPopup);
            this._oQuickPayPopup.open();
            return this;
        };

        return QuickPayControl;
    },

    true
);
