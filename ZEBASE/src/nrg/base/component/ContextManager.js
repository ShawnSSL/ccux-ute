/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/base/EventProvider',
        'sap/ui/model/json/JSONModel'
    ],

    function (EventProvider, JSONModel) {
        'use strict';

        var Manager = EventProvider.extend('nrg.base.component.ContextManager', {
            constructor: function (oComponent) {
                EventProvider.apply(this);
                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'init',
                    'getContext',
                    'resetContext'
                ]
            }
        });

        Manager.prototype.init = function () {
            this._getUserInfo();

            //05192016 add State model for address dropdown
            this._setupStateListModel();
        };

        Manager.prototype._setupStateListModel = function () {
            this._oComponent.setModel(new sap.ui.model.json.JSONModel(), 'oStateListModel');

            this._oComponent.getModel('oStateListModel').loadData('../../../../../ZEBASE/build/nrg/base/component/json/States.json',{},false,'GET',false,false,{});
        };

        Manager.prototype._getUserInfo = function () {
            var oWebUiManager = this._oComponent.getCcuxWebUiManager();

            oWebUiManager.notifyWebUi('getUserInfo', {}, this._onGetUserInfoCallback, this);
        };

        Manager.prototype._onGetUserInfoCallback = function (oEvent) {
            var oContextModel, oUserInfo, oResponse;

            oResponse = oEvent.getParameters();

            oUserInfo = {};
            oUserInfo.webui = {
                username: oResponse.USERNAME,
                businessRole: oResponse.BUSINESS_ROLE
            };

            this.getContext().setData(oUserInfo, true);
        };

        Manager.prototype.getContext = function () {
            var oContextModel = this._oComponent.getModel('_comp-context');

            if (!oContextModel || !(oContextModel instanceof JSONModel)) {
                oContextModel = new JSONModel({});
                this._oComponent.setModel(oContextModel, '_comp-context');
            }

            return oContextModel;
        };

        Manager.prototype.resetContext = function () {
            var oModel = this.getContext();

            oModel.setData({});

            return this;
        };

        Manager.prototype.destroy = function () {
            EventProvider.prototype.destroy.apply(this, arguments);
        };

        return Manager;
    }
);
