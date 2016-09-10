/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/mvc/Controller',
        'sap/ui/core/message/ControlMessageProcessor',
        'sap/ui/core/message/Message'
    ],

    function ($, Controller, ControlMessageProcessor, Message) {
        'use strict';

        var BaseController = Controller.extend('nrg.base.view.BaseController', {
            constructor: function (sName) {
                Controller.prototype.constructor.apply(this, arguments);
            }
        });

        BaseController.prototype._getRouter = function () {
            if (!this._oRouter) {
                this._oRouter = this.getOwnerComponent().getRouter();
            }

            return this._oRouter;
        };

        BaseController.prototype.navTo = function (sName, oParameters, bReplace) {
            var oRouter, oRouteParams, bHistReplace;

            oRouter = this._getRouter();
            oRouteParams = oParameters || {};
            bHistReplace = bReplace || false;

            oRouter.navTo(sName, oRouteParams, bHistReplace);
        };

        BaseController.prototype._getControlMessageProcessor = function () {
            if (!this._oControlMessageProcessor) {
                this._oControlMessageProcessor = new ControlMessageProcessor();
            }

            return this._oControlMessageProcessor;
        };

        BaseController.prototype._getMessageManager = function () {
            if (!this._oMessageManager) {
                this._oMessageManager = sap.ui.getCore().getMessageManager();
            }

            return this._oMessageManager;
        };

        BaseController.prototype._getTargetFromControlEvent = function (oControlEvent) {
            return [oControlEvent.getParameter('id'), oControlEvent.getParameter('property')].join('/');
        };

        BaseController.prototype.addControlMessage = function (sMessage, sType, oTarget) {
            var oMessage, sMsgType, sTarget;

            sMsgType = sType || sap.ui.core.MessageType.None;

            if (oTarget instanceof sap.ui.base.Event) {
                sTarget = this._getTargetFromControlEvent(oTarget);
            } else {
                sTarget = oTarget;
            }

            oMessage = new Message({
                message: sMessage,
                type: sMsgType,
                target: sTarget,
                processor: this._getControlMessageProcessor()
            });

            this._getMessageManager().addMessages(oMessage);
        };

        BaseController.prototype.addMessage = function (sMessage, sType) {
            var oMessage, sMsgType;

            sMsgType = sType || sap.ui.core.MessageType.None;
            oMessage = new Message({
                message: sMessage,
                type: sMsgType,
                processor: this._getControlMessageProcessor()
            });

            this._getMessageManager().addMessages(oMessage);
        };

        BaseController.prototype.removeAllMessages = function () {
            this._getMessageManager().removeAllMessages();
        };

        BaseController.prototype.removeControlMessages = function (oTarget) {
            var oMessageManager, aMessage, sTarget;

            oMessageManager = this._getMessageManager();
            aMessage = oMessageManager.getMessageModel().getData();

            if (oTarget instanceof sap.ui.base.Event) {
                sTarget = this._getTargetFromControlEvent(oTarget);
            } else {
                sTarget = oTarget;
            }

            if (aMessage && !$.isEmptyObject(aMessage)) {
                aMessage.forEach(function (oMessage) {
                    if (oMessage.target === sTarget) {
                        oMessageManager.removeMessages(oMessage);
                    }
                }.bind(this));
            }
        };

        return BaseController;
    }
);
