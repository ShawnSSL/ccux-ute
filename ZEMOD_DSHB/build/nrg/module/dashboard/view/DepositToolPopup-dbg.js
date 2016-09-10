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

        var DepositToolPopup = Control.extend('nrg.module.dashboard.view.DepositToolPopup', {
            metadata: {
                properties: {
                    title: { type: 'string', defaultValue: null }
                }
            }
        });

        /*-------------------------------------------- Basic Popup Configuration --------------------------------------------*/

        DepositToolPopup.prototype.init = function () {
            this._oDepositToolPopup = ute.ui.main.Popup.create('nrgDashboard-depositToolPopup', {
                title: "DEPOSIT TOOL",
                close: this._onPopupClosed
            });
            this._oDepositToolPopup.addStyleClass('nrgDashboard-depositToolPopup');
            this._oDepositToolPopup.setShowCloseButton(true);
            this.addDependent(this._oDepositToolPopup);
        };

        /*----------------------------------------------------- Methods -----------------------------------------------------*/

        DepositToolPopup.prototype.preparePopup = function () {
            if (!this._oDepositToolPopup.getContent().length) {
                var oDepositToolView = sap.ui.view({
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "nrg.module.dashboard.view.DepositTool"
                });
                if (this._oDepositToolPopup.isOpen()) { return this; }
                this._oDepositToolPopup.addContent(oDepositToolView);
            }
            this._oDepositToolPopup.open();
            return this;
        };

        DepositToolPopup.prototype._onPopupClosed = function (oEvent) {
            this.getParent().fireEvent("DepositToolCompleted");
        };

        return DepositToolPopup;
    },

    true
);
