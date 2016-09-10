/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/base/EventProvider'
    ],

    function (EventProvider) {
        'use strict';

        var AppBody = EventProvider.extend('nrg.module.app.view.AppBody', {
            constructor: function (oController, oApp) {
                EventProvider.apply(this);

                this._oController = oController;
                this._oApp = oApp;
                this._aNavLeftListener = [];
                this._aNavRightListener = [];
            },

            metadata: {
                publicMethods: [
                    'init',
                    'reset',
                    'setContentLayout',
                    'attachNavLeft',
                    'detachNavLeft',
                    'showNavLeft',
                    'detachNavLeftAll',
                    'attachNavRight',
                    'detachNavRight',
                    'showNavRight',
                    'detachNavRightAll'
                ]
            }
        });

        AppBody.Event = {
            NavLeftPress: 'NavLeftPress',
            NavRightPress: 'NavRightPress'
        };

        AppBody.ContentLayoutType = ute.ui.app.BodyContentLayout;

        AppBody.prototype.init = function () {
            this._registerEvents();
        };

        AppBody.prototype.reset = function (bfullWidth) {
            var oBodyContent = this._oController.getView().byId('appBodyContent');

            if (bfullWidth) {
                oBodyContent.setLayout(AppBody.ContentLayoutType.FullWidthTool);
            } else {
                oBodyContent.setLayout(AppBody.ContentLayoutType.Default);
            }


            this.showNavLeft(false);
            this._detachAllNavLeft();

            this.showNavRight(false);
            this._detachAllNavRight();
        };

        AppBody.prototype.setContentLayout = function (sContentLayoutType) {
            var oBodyContent = this._oController.getView().byId('appBodyContent');

            if (oBodyContent && sContentLayoutType) {
                oBodyContent.setLayout(sContentLayoutType);
            }

            return this;
        };

        AppBody.prototype.attachNavLeft = function (fnCallback, oListener) {
            var oEventNotExist = true;

            this._aNavLeftListener.forEach(function (oNavLeft) {
                if (oNavLeft.fnCallback === fnCallback && oNavLeft.oListener === oListener) {
                    oEventNotExist = false;
                }
            });

            if (oEventNotExist) {
                this.attachEvent(AppBody.Event.NavLeftPress, fnCallback, oListener);

                this._aNavLeftListener.push({
                    fnCallback: fnCallback,
                    oListener: oListener
                });
            }

            return this;
        };

        AppBody.prototype.detachNavLeft = function (fnCallback, oListener) {
            this._aNavLeftListener.forEach(function (oNavLeft, iIndex, aListener) {
                if (oNavLeft.fnCallback === fnCallback && oNavLeft.oListener === oListener) {
                    aListener.splice(iIndex, 1);
                }
            });

            this.detachEvent(AppBody.Event.NavLeftPress, fnCallback, oListener);

            return this;
        };

        AppBody.prototype.showNavLeft = function (bShow) {
            var oNavLeftElem = this._oController.getView().byId('appBodyNavLeft');

            if (!!bShow) {
                oNavLeftElem.$().removeClass('nrgU-displayNone');
            } else {
                oNavLeftElem.$().addClass('nrgU-displayNone');
            }

            return this;
        };

        AppBody.prototype.detachNavLeftAll = function () {
            this._detachAllNavLeft();
        };

        AppBody.prototype.attachNavRight = function (fnCallback, oListener) {
            var oEventNotExist = true;

            this._aNavRightListener.forEach(function (oNavRight) {
                if (oNavRight.fnCallback === fnCallback && oNavRight.oListener === oListener) {
                    oEventNotExist = false;
                }
            });

            if (oEventNotExist) {
                this.attachEvent(AppBody.Event.NavRightPress, fnCallback, oListener);

                this._aNavRightListener.push({
                    fnCallback: fnCallback,
                    oListener: oListener
                });
            }

            return this;
        };

        AppBody.prototype.detachNavRight = function (fnCallback, oListener) {
            this._aNavRightListener.forEach(function (oNavRight, iIndex, aListener) {
                if (oNavRight.fnCallback === fnCallback && oNavRight.oListener === oListener) {
                    aListener.splice(iIndex, 1);
                }
            });

            this.detachEvent(AppBody.Event.NavRightPress, fnCallback, oListener);
            return this;
        };

        AppBody.prototype.showNavRight = function (bShow) {
            var oNavRightElem = this._oController.getView().byId('appBodyNavRight');

            if (!!bShow) {
                oNavRightElem.$().removeClass('nrgU-displayNone');
            } else {
                oNavRightElem.$().addClass('nrgU-displayNone');
            }

            return this;
        };

        AppBody.prototype.detachNavRightAll = function () {
            this._detachAllNavRight();
        };

        AppBody.prototype._registerEvents = function () {
            var oView;

            oView = this._oController.getView();
            oView.byId('appBodyNavLeft').attachEvent('click', this._onNavLeftClick, this);
            oView.byId('appBodyNavRight').attachEvent('click', this._onNavRightClick, this);
        };

        AppBody.prototype._onNavLeftClick = function (oControlEvent) {
            this.fireEvent(AppBody.Event.NavLeftPress, {
                source: oControlEvent.getSource()
            });
        };

        AppBody.prototype._detachAllNavLeft = function () {
            var i;

            for (i = 0; i < this._aNavLeftListener.length; i = i + 1) {
                this.detachEvent(
                    AppBody.Event.NavLeftPress,
                    this._aNavLeftListener[i].fnCallback,
                    this._aNavLeftListener[i].oListener
                );
            }

            this._aNavLeftListener = [];

            return this;
        };

        AppBody.prototype._onNavRightClick = function (oControlEvent) {
            this.fireEvent(AppBody.Event.NavRightPress, {
                source: oControlEvent.getSource()
            });
        };

        AppBody.prototype._detachAllNavRight = function () {
            var i;

            for (i = 0; i < this._aNavRightListener.length; i = i + 1) {
                this.detachEvent(
                    AppBody.Event.NavRightPress,
                    this._aNavRightListener[i].fnCallback,
                    this._aNavRightListener[i].oListener
                );
            }

            this._aNavRightListener = [];

            return this;
        };

        return AppBody;
    }
);
