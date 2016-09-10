/*global sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/routing/Router'
    ],

    function (Router) {
        'use strict';

        var CustomRouter = Router.extend('nrg.base.component.Router', {
            constructor: function (oRoutes, oConfig, oOwner, oTargetsConfig) {
                this._oComponent = oOwner;

                Router.apply(this, arguments);
            }
        });

        CustomRouter.prototype.navTo = function (sName, oParameters, bReplace) {//Hard coding bReplace = true in the funtion; forcing UI5/Hashchanger not to store any browser history
            var oCcuxApp, fnConfirmCallback, mConfirmParam, oAppRbModel;

            oCcuxApp = this._oComponent.getCcuxApp();
            if (oCcuxApp && oCcuxApp.isInEdit()) {
                fnConfirmCallback = function (sAction) {
                    if (sAction === ute.ui.main.Popup.Action.Yes) {
                        oCcuxApp.setInEdit(false);
                        Router.prototype.navTo.call(this, sName, oParameters, true);
                    }
                }.bind(this);

                mConfirmParam = {};
                mConfirmParam.callback = fnConfirmCallback;

                oAppRbModel = this._oComponent.getModel('comp-i18n-app');
                if (oAppRbModel) {
                    mConfirmParam.title = oAppRbModel.getProperty('nrgAppNavDataLossTitle');
                    mConfirmParam.message = oAppRbModel.getProperty('nrgAppNavDataLossMsg');
                } else {
                    mConfirmParam.title = 'Possible Data Loss';
                    mConfirmParam.message = 'There might be unsaved changes. Do you really want to navigate away?';
                }

                ute.ui.main.Popup.Confirm(mConfirmParam);

            } else {
                Router.prototype.navTo.apply(this, [sName, oParameters, true]);
            }
        };

        return CustomRouter;
    },

    true
);
