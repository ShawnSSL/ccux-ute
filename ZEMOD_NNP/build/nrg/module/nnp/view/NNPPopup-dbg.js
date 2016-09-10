/*global sap, ute, jQuery*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/core/Popup'
    ],

    function (Control, Popup) {
        'use strict';

		/* ========================================================================*/
		/* Creating a New Control to manage Quick Pay  Pop-up                      */
		/* ======================================================================= */
        var NNPPopup = Control.extend('nrg.module.nnp.view.NNPPopup', {

        });

		/* ========================================================================*/
		/* Quick Pay Pop-up to initialize basic popup configurations               */
		/* ======================================================================= */
        NNPPopup.prototype.init = function () {
            var _handleDialogClosed = function (oEvent) {
                    this.getParent().fireEvent("NNPCompleted");
                };
            this._oNNPPopup = ute.ui.main.Popup.create({
                title: 'Email Address and Preferences',
                close: _handleDialogClosed
            });
            this._oNNPPopup.setShowCloseButton(false);

        };

		/* ========================================================================*/
		/* Method to be used to open the Quick Pay popup                           */
		/* ======================================================================= */

        NNPPopup.prototype.openNNP = function (PartnerID, Email, EmailConsum) {
            var oNNPView = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "nrg.module.nnp.view.NNP"
            });
            oNNPView.getController()._sPartnerID = PartnerID;
            oNNPView.getController()._sEmail = Email;
            oNNPView.getController()._sEmailConsum = EmailConsum;
            oNNPView.addStyleClass("nrgQPPay-View");
            if (this._oNNPPopup.isOpen()) {
                //this._oPaymentPopup.setContent(oQuickPayView);
                return this;
            }
            this._oNNPPopup.addContent(oNNPView);
            this.addDependent(this._oNNPPopup);
            this._oNNPPopup.open();
            return this;
        };

        return NNPPopup;
    },

    true
);
