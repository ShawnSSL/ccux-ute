/*global sap, ute, jQuery*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/core/Popup'
    ],

    function (Control, Popup) {
        'use strict';

        /*------------------------------------- Control for Reconnect Popup --------------------------------------*/

        var ReconnectPopup = Control.extend('nrg.module.dashboard.view.ReconnectPopup', {
            metadata: {
                properties: {
                    title: { type: 'string', defaultValue: null },
                    isRetro: { type: 'boolean', defaultValue: false }
                }
            }
        });

        /*-------------------------------------------- Basic Popup Configuration --------------------------------------------*/

        ReconnectPopup.prototype.init = function () {
            this._oReconnect = ute.ui.main.Popup.create('nrgReconnectPopup', {
                title: "RECONNECTION",
                close: this._onPopupClosed
            });
            this._oReconnect.addStyleClass('nrgDashboard-reconnectionPopup');
            this._oReconnect.setShowCloseButton(false);
            this.addDependent(this._oReconnect);
        };

        /*----------------------------------------------------- Methods -----------------------------------------------------*/

        ReconnectPopup.prototype.open = function () {
            if (!this._oReconnect.getContent().length) {
                var oReconnectView = sap.ui.view({
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "nrg.module.dashboard.view.Reconnect"
                });
                if (this._oReconnect.isOpen()) { return this; }
                this._oReconnect.addContent(oReconnectView);
            }
            this._oReconnect.open();
            return this;
        };

        ReconnectPopup.prototype._onPopupClosed = function (oEvent) {
            this.getParent().fireEvent("ReConnectCompleted");
        };

        return ReconnectPopup;
    },

    true
);
