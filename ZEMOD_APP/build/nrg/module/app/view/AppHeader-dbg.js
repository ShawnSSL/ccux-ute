/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/base/EventProvider'
    ],

    function (EventProvider) {
        'use strict';

        var AppHeader = EventProvider.extend('nrg.module.app.view.AppHeader', {
            constructor: function (oController, oApp) {
                EventProvider.apply(this);

                this._oController = oController;
                this._oApp = oApp;
                this._oSubmenuDlg = {};
            },

            metadata: {
                publicMethods: [
                    'init',
                    'reset',
                    'setEnabled',
                    'isEnabled',
                    'setSelected',
                    'isSelected'
                ]
            }
        });

        AppHeader.HMItemId = {
            Menu: 'appHMItemMenu',
            Index: 'appHMItemIndex',
            Transaction: 'appHMItemTransaction',
            EsidTool: 'appHMItemEsidTool',
            PalPlus: 'appHMItemPalPlus',
            Messages: 'appHMItemMessages',
            Refresh: 'appHMItemRefresh',
            ClearAcc: 'appHMItemClearAcc',
            Logoff: 'appHMItemLogoff'
        };

        AppHeader.QuickLinkId = {
            Dashboard: 'dashboard',
            BusinessEnrollment: 'bizEnroll',
            ResidentialEnrollment: 'resEnroll',
            History: 'history',
            ServiceOrder: 'serviceOrder',
            Campaign: 'campaign',
            HighBill: 'highBill',
            RHS: 'rhs',
            /*ContactLog: 'contactLog',*/
            Billing: 'billing',
            BusinessPartner: 'bupa',
            Referral: 'Ref',
            SVOC : 'SVOC'
        };

        AppHeader.prototype.init = function () {
            this._registerHMItemEvents();
        };

        AppHeader.prototype.reset = function () {
            this._resetAllHMItemState();
            this._closeAllSubmenus();
            this._clearHeaderMessages();
        };

        AppHeader.prototype.setEnabled = function (bEnabled, sHMItemId) {
            var oHMItem = this._oController.getView().byId(sHMItemId);

            bEnabled  = !!bEnabled;
            if (oHMItem) {
                if (!bEnabled && this._isSubmenu(sHMItemId)) {
                    this._closeSubmenu(sHMItemId);
                }

                oHMItem.setEnabled(bEnabled);
            }

            return this;
        };

        AppHeader.prototype.isEnabled = function (sHMItemId) {
            var oHMItem = this._oController.getView().byId(sHMItemId);

            if (oHMItem) {
                return oHMItem.getEnabled();
            }

            return false;
        };

        AppHeader.prototype.setSelected = function (bSelected, sHMItemId) {
            var oHMItem = this._oController.getView().byId(sHMItemId);

            bSelected = !!bSelected;
            if (oHMItem && oHMItem.getEnabled()) {
                if (this._isSubmenu(sHMItemId)) {
                    if (bSelected) {
                        this._openSubmenu(sHMItemId);
                    } else {
                        this._closeSubmenu(sHMItemId);
                    }

                    oHMItem.setSelected(bSelected);
                    oHMItem.deselectOthers();

                } else {
                    if (bSelected) {
                        oHMItem.setSelected(false);
                        oHMItem.deselectOthers();
                        this._closeAllSubmenus();
                    } else {
                        oHMItem.setSelected(false);
                    }
                }
            }

            return this;
        };

        AppHeader.prototype.isSelected = function (sHMItemId) {
            var oHMItem = this._oController.getView().byId(sHMItemId);

            if (oHMItem) {
                return oHMItem.getSelected();
            }

            return false;
        };

        AppHeader.prototype._resetAllHMItemState = function () {
            var sHMItemId, oHMItem, oView;

            oView = this._oController.getView();

            for (sHMItemId in this.HMItemId) {
                if (this.HMItemId.hasOwnProperty(sHMItemId)) {
                    oHMItem = oView.byId(sHMItemId);
                    if (oHMItem) {
                        oHMItem.setSelected(false);
                        oHMItem.setEnabled(true);
                    }
                }
            }
        };

        AppHeader.prototype._registerHMItemEvents = function () {
            var oView = this._oController.getView();

            oView.byId(AppHeader.HMItemId.Menu).attachEvent('press', this._oController._onMenuPress, this._oController);
            oView.byId(AppHeader.HMItemId.Index).attachEvent('press', this._oController._onIndexPress, this._oController);
            oView.byId(AppHeader.HMItemId.Transaction).attachEvent('press', this._oController._onTransactionPress, this._oController);
            oView.byId(AppHeader.HMItemId.EsidTool).attachEvent('press', this._oController._onEsidToolPress, this._oController);
            oView.byId(AppHeader.HMItemId.PalPlus).attachEvent('press', this._oController._onPalPlusPress, this._oController);
            oView.byId(AppHeader.HMItemId.Messages).attachEvent('press', this._oController._onMessagesPress, this._oController);
            oView.byId(AppHeader.HMItemId.Refresh).attachEvent('press', this._oController._onRefreshPress, this._oController);
            oView.byId(AppHeader.HMItemId.ClearAcc).attachEvent('press', this._oController._onClearAccPress, this._oController);
            oView.byId(AppHeader.HMItemId.Logoff).attachEvent('press', this._oController._onLogoffPress, this._oController);
        };

        AppHeader.prototype._isSubmenu = function (sSubmenuId) {
            switch (sSubmenuId) {
            case AppHeader.HMItemId.Menu:
            case AppHeader.HMItemId.Messages:
            case AppHeader.HMItemId.Index:
                return true;
            default:
                return false;
            }
        };

        AppHeader.prototype._getSubmenu = function (sSubmenuId) {
            var oSubmenu, oView, sFragmentId;

            if (!this._oSubmenuDlg[sSubmenuId]) {
                switch (sSubmenuId) {
                case AppHeader.HMItemId.Menu:
                    sFragmentId = 'nrg.module.app.view.AppHeaderMenu';
                    break;
                case AppHeader.HMItemId.Messages:
                    sFragmentId = 'nrg.module.app.view.AppHeaderMessages';
                    break;
                case AppHeader.HMItemId.Index:
                    sFragmentId = 'nrg.module.app.view.AppHeaderIndex';
                    break;
                default:
                    sFragmentId = null;
                }

                if (sFragmentId) {
                    oView = this._oController.getView();
                    this._oSubmenuDlg[sSubmenuId] = sap.ui.xmlfragment(sFragmentId, this._oController);
                    this._oSubmenuDlg[sSubmenuId].setPosition(oView.byId('appHdr'), '0 0');
                    oView.addDependent(this._oSubmenuDlg[sSubmenuId]);
                }
            }

            return this._oSubmenuDlg[sSubmenuId];
        };

        AppHeader.prototype._closeAllSubmenus = function (oPreserveSubmenuDlg) {
            var sSubmenuDlg;

            for (sSubmenuDlg in this._oSubmenuDlg) {
                if (this._oSubmenuDlg.hasOwnProperty(sSubmenuDlg)) {
                    if (!(oPreserveSubmenuDlg && this._oSubmenuDlg[sSubmenuDlg] === oPreserveSubmenuDlg)) {
                        this._oSubmenuDlg[sSubmenuDlg].close();
                    }
                }
            }
        };

        AppHeader.prototype._openSubmenu = function (sHMItemId) {
            var oSubmenuDlg, oHMenuItem;

            oHMenuItem = this._oController.getView().byId(sHMItemId);
            oSubmenuDlg = this._getSubmenu(sHMItemId);

            if (oHMenuItem && oSubmenuDlg) {
                if (!oHMenuItem.getSelected()) {
                    oHMenuItem.deselectOthers();
                    oHMenuItem.setSelected(true);
                }

                this._closeAllSubmenus(oSubmenuDlg);
                oSubmenuDlg.open();
            }

            return this;
        };

        AppHeader.prototype._closeSubmenu = function (sHMItemId) {
            var oSubmenuDlg, oHMenuItem;

            oHMenuItem = this._oController.getView().byId(sHMItemId);
            oSubmenuDlg = this._getSubmenu(sHMItemId);

            if (oHMenuItem && oSubmenuDlg) {
                oSubmenuDlg.close();
            }

            return this;
        };

        AppHeader.prototype._clearHeaderMessages = function () {
            var oNotifManager = this._oController.getOwnerComponent().getCcuxNotificationManager();
            oNotifManager.clearHeaderMessages();
        };

        return AppHeader;
    }
);
