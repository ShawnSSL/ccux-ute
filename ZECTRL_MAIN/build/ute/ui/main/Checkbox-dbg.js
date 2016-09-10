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

        var CustomControl = Control.extend('ute.ui.main.Checkbox', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.CheckboxDesign', defaultValue: ute.ui.main.CheckboxDesign.Default },
                    checked: { type: 'boolean', defaultValue: false },
                    enabled: { type: 'boolean', defaultValue: true }
                },

                events: {
                    select: {
                        parameters : {
                            checked : { type: 'boolean' }
                        }
                    }
                }
            }
        });

        EnabledPropagator.call(CustomControl.prototype);

        CustomControl.prototype.exit = function () {
            this.$().unbind('change', jQuery.proxy(this.onchange));
        };

        CustomControl.prototype.onBeforeRendering = function () {
            this.$().unbind('change', jQuery.proxy(this.onchange));
        };

        CustomControl.prototype.onAfterRendering = function () {
            this.$().bind('change', jQuery.proxy(this.onchange, this));
        };

        CustomControl.prototype.onchange = function (oEvent) {
            if (!this.getEnabled()) {
                return;
            }

            this.setChecked(this.getDomRef('intChk').checked);
            this.fireSelect({
                checked: this.getChecked()
            });
        };

        CustomControl.prototype.setChecked = function (bValue) {
            bValue = !!bValue;

            if (this.getChecked() === bValue) {
                return this;
            }

            if (this.getDomRef()) {
                if (bValue) {
                    this.getDomRef('intChk').checked = true;
                    this.getDomRef('intChk').setAttribute('checked', 'checked');
                } else {
                    this.getDomRef('intChk').checked = false;
                    this.getDomRef('intChk').removeAttribute('checked');
                }
            }

            this.setProperty('checked', bValue);
            return this;
        };

        CustomControl.prototype.setEnabled = function (bValue) {
            bValue = !!bValue;

            if (this.getEnabled() === bValue) {
                return this;
            }

            this.$('.uteMChkBox-intChk').prop('disabled', !bValue);

            this.setProperty('enabled', bValue);
            return this;
        };

        return CustomControl;
    },

    true
);
