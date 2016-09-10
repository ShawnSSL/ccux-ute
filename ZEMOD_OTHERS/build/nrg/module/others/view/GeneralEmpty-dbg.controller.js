/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/mvc/Controller',
        'nrg/base/component/WebUiManager',
        'sap/ui/core/message/Message'
    ],

    function (jQuery, Controller, WebUiManager, Message) {
        'use strict';

        var CustomController = Controller.extend('nrg.module.others.view.GeneralEmpty');

        CustomController.prototype.onConfirm = function (oControlEvent) {
            var oWebUiManager, oComponent, sId;

            oComponent = this.getOwnerComponent();
            oWebUiManager = oComponent.getCcuxWebUiManager();

            oComponent.getCcuxApp().setOccupied(true);
            sId = oWebUiManager.notifyWebUi('bpConfirmed', {
                BP_NUM: '0002955761'
            }, this._handleBpConfirmed, this);
        };

        CustomController.prototype._handleBpConfirmed = function (oEvent) {
            var oComponent, oRouter, oRouteInfo;

            oComponent = this.getOwnerComponent();
            oComponent.getCcuxApp().setOccupied(false);

            oRouteInfo = oEvent.getParameters();
            if (oRouteInfo.CONFIRMED && oRouteInfo.CONFIRMED === 'X') {
                oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('dashboard.Bp', {
                    bpNum: oRouteInfo.BP_NUM
                });
            }
        };

        CustomController.prototype.onLogout = function (oControlEvent) {
            var oWebUiManager, oComponent;

            oComponent = this.getOwnerComponent();
            oWebUiManager = oComponent.getCcuxWebUiManager();

            oComponent.getCcuxApp().setOccupied(true);
            oWebUiManager.notifyWebUi('logout', {}, this._handleLogout, this);
        };

        CustomController.prototype._handleLogout = function (oEvent) {
            var oComponent, oResponse;

            oComponent = this.getOwnerComponent();
            oComponent.getCcuxApp().setOccupied(false);

            oResponse = oEvent.getParameters();
            if (oResponse.CANCEL && oResponse.CANCEL === 'X') {
                jQuery.sap.log.info('[GeneralEmptyController._handleLogout()]', 'Logout cancelled by user');
            }
        };

        CustomController.prototype.onAddMessage = function (oControlEvent) {
            var oNotificationManager = this.getOwnerComponent().getCcuxNotificationManager();

            oNotificationManager.addHeaderMessage(new Message({
                description: 'this is a new description',
                type: sap.ui.core.MessageType.Error
            }));

            oNotificationManager.addHeaderMessage(new Message({
                description: 'this is a new description',
                type: sap.ui.core.MessageType.Warning
            }));

            oNotificationManager.addHeaderMessage(new Message({
                description: 'this is a new description',
                type: sap.ui.core.MessageType.Information
            }));

            oNotificationManager.addHeaderMessage(new Message({
                description: 'this is a new description',
                type: sap.ui.core.MessageType.Success
            }));
        };

        CustomController.prototype.onSetInEdit = function (oEvent) {
            this.getOwnerComponent().getCcuxApp().setInEdit(true);
            this.getOwnerComponent().getRouter().navTo('search.SearchNoID');
        };

        CustomController.prototype.onInit = function () {

        };

        return CustomController;
    }
);
