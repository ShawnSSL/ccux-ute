/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'nrg/module/nnp/view/NNPPopup',
        'jquery.sap.global'
    ],

    function (CoreController, NNPPopup, jQuery) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.nnp.view.General');


		/* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

        };
        /**
		 * Start Quick Pay process
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onQuickPay = function (oEvent) {
/*            var NNPPopupControl = new NNPPopup(),
                fNNPCompleted = function () {
                    //console.log("came here");
                },
                PartnerID = '2473499',
                Email = 'nrg@nrg.com',
                EmailConsum = '019';

            NNPPopupControl.attachEvent("NNPCompleted", fNNPCompleted);
            NNPPopupControl.openNNP(this, PartnerID, Email, EmailConsum);*/
            var oNNPView = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "nrg.module.nnp.view.NNP"
            }),
                _handleDialogClosed = function (oEvent) {
                    jQuery.sap.log.info("Odata Read Successfully:::");
                };
            oNNPView.getController()._sPartnerID = '2473499';
            oNNPView.getController()._sEmail = 'nrg@nrg.com';
            oNNPView.getController()._sEmailConsum = '019';
            this._oNNPPopup = ute.ui.main.Popup.create({
                title: 'Email Address and Preferences',
                content: oNNPView,
                close: _handleDialogClosed
            });
        };
        return Controller;
    }


);
