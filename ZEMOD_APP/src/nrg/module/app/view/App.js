/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/base/EventProvider',
        'nrg/module/app/view/AppHeader',
        'nrg/module/app/view/AppBody',
        'nrg/module/app/view/AppFooter',
        'sap/m/BusyDialog'
    ],

    function (EventProvider, AppHeader, AppBody, AppFooter, BusyDialog) {
        'use strict';

        var App = EventProvider.extend('nrg.module.app.view.App', {
            constructor: function (oController) {
                EventProvider.apply(this);

                this._oController = oController;
                this._oBusyDialog = new BusyDialog();
                //this._oBusyDialog.setShowCancelButton(true);
                this._bEdit = false;
                this._iBusyCounter = 0;

                this._oAppHeader = new AppHeader(oController, this);
                this._oAppHeader.init();

                this._oAppBody = new AppBody(oController, this);
                this._oAppBody.init();

                // this._oAppFooter = new AppFooter(oController, this);
                // this._oAppFooter.init();
            },

            metadata: {
                publicMethods: [
                    'setOccupied',
                    'isOccupied',
                    'setHeaderMenuItemSelected',
                    'isHeaderMenuItemSelected',
                    'setHeaderMenuItemEnabled',
                    'isHeaderMenuItemEnabled',
                    'setTitle',
                    'setLayout',
                    // 'setFooterExpanded',
                    // 'isFooterExpanded',
                    'attachNavLeft',
                    'detachhNavLeft',
                    'showNavLeft',
                    'detachNavLeftAll',
                    'attachNavRight',
                    'detachNavRight',
                    'showNavRight',
                    'detachNavRightAll',
                    'setInEdit',
                    'isInEdit',
                    'updateFooter',
                    'updateFooterNotification',
                    'updateFooterRHS',
                    'updateFooterCampaign'
                ]
            }
        });

        App.HMItemId = AppHeader.HMItemId;
        App.QuickLinkId = AppHeader.QuickLinkId;
        App.LayoutType = AppBody.ContentLayoutType;

        App.prototype.reset = function (bfullwidth) {
            this._oAppHeader.reset();
            this._oAppBody.reset(bfullwidth);
            // this._oAppFooter.reset();

            this.setInEdit(false);
        };

        App.prototype.setOccupied = function (bOccupied) {
            bOccupied = !!bOccupied;
            if (bOccupied) {
                this._iBusyCounter = this._iBusyCounter + 1;
            } else {
                this._iBusyCounter = this._iBusyCounter - 1;
                if (this._iBusyCounter < 0) {
                    this._iBusyCounter = 0;
                }
            }
            if (this._iBusyCounter === 1) {
                this._oBusyDialog.open();
            } else if (this._iBusyCounter === 0) {
                this._oBusyDialog.close();
            }

            return this;
        };

        App.prototype.isOccupied = function () {
            return this._oBusyDialog.isOpen();
        };

        App.prototype.setInEdit = function (bEdit) {
            this._bEdit = !!bEdit;
            return this;
        };

        App.prototype.isInEdit = function () {
            return this._bEdit;
        };

        App.prototype.setHeaderMenuItemSelected = function (bSelected, sHMItemId) {
            this._oAppHeader.setSelected(bSelected, sHMItemId);
            return this;
        };

        App.prototype.isHeaderMenuItemSelected = function (sHMItemId) {
            return this._oAppHeader.isSelected(sHMItemId);
        };

        App.prototype.setHeaderMenuItemEnabled = function (bEnabled, sHMItemId) {
            this._oAppHeader.setEnabled(bEnabled, sHMItemId);
            return this;
        };

        App.prototype.isHeaderMenuItemEnabled = function (sHMItemId) {
            return this._oAppHeader.isEnabled(sHMItemId);
        };

        App.prototype.setTitle = function (sTitle) {
            var oBodyTitle = this._oController.getView().byId('appBodyTitle');

            if (oBodyTitle && sTitle) {
                oBodyTitle.setText(sTitle);
            }

            return this;
        };

        App.prototype.setLayout = function (sLayoutType) {
            this._oAppBody.setContentLayout(sLayoutType);
            return this;
        };

        App.prototype.attachNavLeft = function (fnCallback, oListener) {
            this._oAppBody.attachNavLeft(fnCallback, oListener);
            return this;
        };

        App.prototype.detachNavLeft = function (fnCallback, oListener) {
            this._oAppBody.detachNavLeft(fnCallback, oListener);
            return this;
        };

        App.prototype.showNavLeft = function (bShow) {
            this._oAppBody.showNavLeft(bShow);
            return this;
        };

        App.prototype.detachNavLeftAll = function () {
            this._oAppBody.detachNavLeftAll();
            return this;
        };

        App.prototype.attachNavRight = function (fnCallback, oListener) {
            this._oAppBody.attachNavRight(fnCallback, oListener);
            return this;
        };

        App.prototype.detachNavRight = function (fnCallback, oListener) {
            this._oAppBody.detachNavRight(fnCallback, oListener);
            return this;
        };

        App.prototype.showNavRight = function (bShow) {
            this._oAppBody.showNavRight(bShow);
            return this;
        };

        App.prototype.detachNavRightAll = function () {
            this._oAppBody.detachNavRightAll();
            return this;
        };

        // App.prototype.setFooterExpanded = function (bExpanded) {
        //     this._oAppFooter.setExpanded(bExpanded);
        //     return this;
        // };

        // App.prototype.isFooterExpanded = function () {
        //     return this._oAppFooter.isExpanded();
        // };

        App.prototype._getHeader = function () {
            return this._oAppHeader;
        };

        App.prototype._getBody = function () {
            return this._oAppBody;
        };

        // App.prototype._getFooter = function () {
        //     return this._oAppFooter;
        // };

        // App.prototype._initFooterContent = function () {
        //     this._oAppFooter._initFooterContent();
        //     return this;
        // };

        App.prototype.updateFooter = function (sBpNumber, sCaNumber, sCoNumber) {
            sap.ui.getCore().getEventBus().publish("nrg.module.appFooter", "eUpdateFooter", {bpNum: sBpNumber, caNum: sCaNumber, coNum: sCoNumber});
            return this;
        };

        App.prototype.updateFooterNotification = function (sBpNumber, sCaNumber, sCoNumber) {
            sap.ui.getCore().getEventBus().publish("nrg.module.appFooter", "eUpdateNotification", {bpNum: sBpNumber, caNum: sCaNumber, coNum: sCoNumber});
            return this;
        };

        App.prototype.updateFooterRHS = function (sBpNumber, sCaNumber, sCoNumber) {
            sap.ui.getCore().getEventBus().publish("nrg.module.appFooter", "eUpdateRhs", {bpNum: sBpNumber, caNum: sCaNumber, coNum: sCoNumber});
            return this;
        };

        App.prototype.updateFooterCampaign = function (sBpNumber, sCaNumber, sCoNumber) {
            sap.ui.getCore().getEventBus().publish("nrg.module.appFooter", "eUpdateCampaign", {bpNum: sBpNumber, caNum: sCaNumber, coNum: sCoNumber});
            return this;
        };

        return App;
    }
);
