/*global sap, window*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object',
        'sap/ui/base/EventProvider'
    ],

    function (jQuery, BaseObject, EventProvider) {
        'use strict';

        var Manager = EventProvider.extend('nrg.base.component.WebUiManager', {
            constructor: function (oComponent) {
                EventProvider.apply(this);
                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'start',
                    'notifyWebUi',
                    'cancelWebUiEvent',
                    'isAvailable'
                ]
            }
        });

        Manager.prototype.start = function () {
            this._addDomEventListener();
        };

        Manager.prototype.isAvailable = function () {
            var bAvailable = true;

            //Do not call yourself
            if (window.parent === window) {
                return false;
            }

            return bAvailable;
        };

        Manager.prototype.cancelWebUiEvent = function (sEvent, sId, fnCallback, oListener) {
            var sEventInt = [ sEvent, sId ].join('-');
            this.detachEvent(sEventInt, fnCallback, oListener);

            this.notifyWebUi('cancelEvent', {
                EVENT: sEvent,
                SID: sId
            });

            return this;
        };

        Manager.prototype.notifyWebUi = function (sEvent, oPayload, fnCallback, oListener) {
            var sMessage, oData, sId;

            if (!this.isAvailable()) {
                jQuery.sap.log.error(
                    '[WebUiManager.notifyWebUi()]',
                    'Unable to post message because this component is not embedded in any parent window'
                );

                return this;
            }

            if (!sEvent) {
                jQuery.sap.log.error(
                    '[WebUiManager.notifyWebUi()]',
                    'Event name is not provided'
                );

                return this;
            }

            oData = {};
            oData.EVENT = sEvent;

            if (oPayload) {
                oData.PAYLOAD = oPayload;
            }

            if (fnCallback) {
                sId = this._getUniqueId();
                oData.SID = sId;
                this.attachEventOnce([ oData.EVENT, oData.SID ].join('-'), fnCallback, oListener);
            }

            sMessage = JSON.stringify(oData);

            jQuery.sap.log.info('[WebUiManager.notifyWebUi()]', sMessage);
            window.parent.postMessage(sMessage, this._getDomain());

            return sId || this;
        };

        Manager.prototype._fromWebUi = function (oEvent) {
            var oData;

            if (oEvent.origin !== this._getDomain()) {
                return;
            }

            oData = JSON.parse(oEvent.data);
            if (!oData || !oData.EVENT) {
                return;
            }

            jQuery.sap.log.info('[WebUiManager._fromWebUi()]', oEvent.data);

            if (oData.SID) {
                this.fireEvent([ oData.EVENT, oData.SID ].join('-'), oData.PAYLOAD);
            } else {
                this.fireEvent(oData.EVENT, oData.PAYLOAD);
            }
        };

        Manager.prototype._getDomain = function () {
            return window.location.protocol + '//' + window.location.host;
        };

        Manager.prototype._addDomEventListener = function () {
            if (window.addEventListener) {
                window.addEventListener('message', jQuery.proxy(this._fromWebUi, this), false);
            } else {
                window.attachEvent('onmessage', jQuery.proxy(this._fromWebUi, this));
            }
        };

        Manager.prototype._getUniqueId = function () {
            var sId = +new Date();

            return sId.toString();
        };

        return Manager;
    }
);
