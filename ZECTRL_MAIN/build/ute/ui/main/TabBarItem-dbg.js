/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'sap/ui/core/EnabledPropagator'
    ],

    function (jQuery, Control, EnabledPropagator) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.TabBarItem', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.TabBarItemDesign', defaultValue: ute.ui.main.TabBarItemDesign.Default },
                    key: { type: 'string', defaultValue: null },
                    group: { type: 'string', defaultValue: null },
                    selected: { type: 'boolean', defaultValue: false },
                    enabled: { type: 'boolean', defaultValue: true }
                },

                aggregations: {
                    content: { type: 'sap.ui.core.Control', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content',

                events: {
                    select: {}
                }
            }
        });

        CustomControl.prototype._groupNames = {};

        CustomControl.prototype.exit = function () {
            this.$().unbind('change', jQuery.proxy(this._onchange));
            this._removeFromGroup();
        };

        CustomControl.prototype.onBeforeRendering = function () {
            this.$().unbind('change', jQuery.proxy(this._onchange));
        };

        CustomControl.prototype.onAfterRendering = function () {
            this.$().bind('change', jQuery.proxy(this._onchange, this));
        };

        CustomControl.prototype._onchange = function (oEvent) {
            if (!this.getEnabled()) {
                return;
            }

            this.setSelected(this.getDomRef('int').checked);
        };

        CustomControl.prototype.setSelected = function (bSelected) {
            var bSelectedOld, sGroup, aControlsInGroup;

            bSelectedOld = this.getSelected();
            sGroup = this.getGroup();
            aControlsInGroup = this._groupNames[sGroup] || [];

            this.setProperty('selected', bSelected);
            this._changeGroup(sGroup);

            if (bSelected && sGroup && sGroup !== '') {
                aControlsInGroup.forEach(function (oControlInGroup) {
                    if (oControlInGroup instanceof CustomControl && oControlInGroup !== this && oControlInGroup.getSelected()) {
                        oControlInGroup.setSelected(false);
                        oControlInGroup.fireSelect();
                    }
                }.bind(this));
            }

            if (bSelectedOld !== bSelected && this.getDomRef()) {
                if (bSelected) {
                    this.getDomRef('int').checked = true;
                    this.getDomRef('int').setAttribute('checked', 'checked');

                } else {
                    this.getDomRef('int').checked = false;
				    this.getDomRef('int').removeAttribute('checked');
                }
            }

            this.fireSelect();

            return this;
        };

        CustomControl.prototype.setEnabled = function (bEnabled) {
            if (this.getDomRef()) {
                if (bEnabled) {
                    this.getDomRef('int').disabled = false;
                    this.getDomRef('int').removeAttribute('disabled');
                } else {
                    this.getDomRef('int').disabled = true;
                    this.getDomRef('int').setAttribute('disabled', 'disabled');
                }
            }

            this.setProperty('enabled', bEnabled);
            return this;
        };

        CustomControl.prototype.setGroup = function (sGroup) {
            this._changeGroup(sGroup, this.getGroup());

            this.setProperty('group', sGroup);
            return this;
        };

        CustomControl.prototype._changeGroup = function (sNewGroup, sOldGroup) {
            var aNewGroup, aOldGroup;

            aNewGroup = this._groupNames[sNewGroup];
            aOldGroup = this._groupNames[sOldGroup];

            if (!aNewGroup) {
                this._groupNames[sNewGroup] = [];
                aNewGroup = this._groupNames[sNewGroup];
            }

            if (aNewGroup.indexOf(this) === -1) {
                aNewGroup.push(this);
            }

            if (aOldGroup && aOldGroup.indexOf(this) !== -1) {
                aOldGroup.splice(aOldGroup.indexOf(this), 1);
            }
        };

        CustomControl.prototype._removeFromGroup = function () {
            var sGroup, aControlsInGroup, iGroupIndex;

            sGroup = this.getGroup();
            aControlsInGroup = this._groupNames[sGroup];
            iGroupIndex = aControlsInGroup && aControlsInGroup.indexOf(this);

            if (iGroupIndex && iGroupIndex !== -1) {
                aControlsInGroup.splice(iGroupIndex, 1);
            }
        };

        return CustomControl;
    },

    true
);
