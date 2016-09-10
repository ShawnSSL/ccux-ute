/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/base/Object',
        'sap/ui/core/message/ControlMessageProcessor',
        'sap/ui/core/message/Message'
    ],

    function (BaseObject, ControlMessageProcessor, Message) {
        'use strict';

        var Manager = BaseObject.extend('nrg.base.component.NotificationManager', {
            constructor: function (oComponent) {
                BaseObject.apply(this);
                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'getHeaderMessageProcessor',
                    'addHeaderMessage',
                    'clearHeaderMessages'
                ]
            }
        });

        Manager.prototype.init = function () {
            var oMessageManager = this._getMessageManager();
            oMessageManager.registerMessageProcessor(this.getHeaderMessageProcessor());
        };

        Manager.prototype.getHeaderMessageProcessor = function () {
            if (!this._oHeaderMessageProcessor) {
                this._oHeaderMessageProcessor = new ControlMessageProcessor();
            }

            return this._oHeaderMessageProcessor;
        };

        Manager.prototype.addHeaderMessage = function (oMsg) {
            if (!oMsg) {
                return this;
            }

            if (!oMsg.getMessageProcessor()) {
                oMsg.setMessageProcessor(this.getHeaderMessageProcessor());
            }

            this._getMessageManager().addMessages(oMsg);

            return this;
        };

        Manager.prototype.clearHeaderMessages = function () {
            this._getMessageManager().removeAllMessages();
        };

        Manager.prototype._getMessageManager = function () {
            if (!this._oMessageManager) {
                this._oMessageManager = sap.ui.getCore().getMessageManager();
            }

            return this._oMessageManager;
        };

        return Manager;
    }
);
