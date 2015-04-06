/*globals sap*/
/*jslint nomen: true*/

sap.ui.define(
    function () {
        'use strict';

        var AppHdrQL = function (viewId, header) {
            this._oHeader = header;
            this._oController = this._oHeader.getController();
            this._oAppHdrQuickLink = this._oController.getView().byId(viewId);
        };

        AppHdrQL.prototype.initialize = function () {
            this._oAppHdrQuickLinkElem = this._oAppHdrQuickLink.getDomRef();
            this._aQuickLinkElem = [].slice.call(this._oAppHdrQuickLinkElem.querySelectorAll('ul > li'));
            this._aQuickLinkElem.forEach(this._addQuickLinkListener, this);
        };

        AppHdrQL.prototype._addQuickLinkListener = function (oElem) {
            oElem.addEventListener('click', function (event) {
                var sQuickLinkId = event.target.id.replace(this._oController.getView().getId() + '--', '');

                /*
                    TODO: routing when the agent clicks a quick link!!!
                */

                this._oHeader.closeSubMenu();
            }.bind(this));
        };

        return AppHdrQL;
    },

    false
);
