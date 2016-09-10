/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'sap/ui/core/mvc/View',
        'sap/m/Dialog'
    ],

    function (jQuery, Control, View, Dialog) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.HeaderMenuItem', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    enabled: { type: 'boolean', defaultValue: true },
                    selected: { type: 'boolean', defaultValue: false}
                },

                aggregations: {
                    header: { type: 'sap.ui.core.Control', multiple: true, singularName: 'header' }
                },

                defaultAggregation: 'header',

                events: {
                    press: {}
                }
            }
        });

        CustomControl.prototype._aHdrMenuItem = [];

        CustomControl.prototype.setEnabled = function (bEnabled) {
            bEnabled = !!bEnabled;

            if (bEnabled) {
                this.$().removeClass('uteAppHMItem-disabled');
            } else {
                this.$().addClass('uteAppHMItem-disabled');
                this.setSelected(false);
            }

            this.setProperty('enabled', bEnabled, true);
            return this;
        };

        CustomControl.prototype.setSelected = function (bSelected) {
            bSelected = !!bSelected;

            if (bSelected) {
                this.$().addClass('uteAppHMItem-selected');
            } else {
                this.$().removeClass('uteAppHMItem-selected');
            }

            this.setProperty('selected', bSelected, true);
            return this;
        };

        CustomControl.prototype.deselectOthers = function () {
            this._aHdrMenuItem.forEach(function (oItem) {
                if (oItem instanceof CustomControl && oItem !== this && oItem.getSelected()) {
                    oItem.setSelected(false);
                }
            }.bind(this));
        };

        CustomControl.prototype._onClick = function (oEvent) {
            if (this.getEnabled()) {
                this.setSelected(!this.getSelected());
                this.firePress();
            }
        };

        CustomControl.prototype._bindEvents = function () {
            var oHdrEl = this.getDomRef('hdr');

            jQuery(oHdrEl).bind('click', jQuery.proxy(this._onClick, this));
        };

        CustomControl.prototype._unbindEvents = function () {
            var oHdrEl = this.getDomRef('hdr');

            if (oHdrEl) {
                jQuery(oHdrEl).unbind();
            }
        };

        CustomControl.prototype._registerMe = function () {
            this._aHdrMenuItem.push(this);
        };

        CustomControl.prototype._deregisterMe = function () {
            var iHdrMenuItemIndex = this._aHdrMenuItem.indexOf(this);

            if (iHdrMenuItemIndex && iHdrMenuItemIndex !== -1) {
                this._aHdrMenuItem.splice(iHdrMenuItemIndex, 1);
            }
        };

        CustomControl.prototype.init = function () {
            this._registerMe();
        };

        CustomControl.prototype.exit = function () {
            this._unbindEvents();
            this._deregisterMe();
        };

        CustomControl.prototype.onBeforeRendering = function () {
            this._unbindEvents();
        };

        CustomControl.prototype.onAfterRendering = function () {
            this._bindEvents();
        };

        return CustomControl;
    },

    true
);
