/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/core/EnabledPropagator'
    ],

    function (Control, EnabledPropagator) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.Button', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.ButtonDesign', defaultValue: ute.ui.main.ButtonDesign.Default },
                    text: { type: 'string', defaultValue: null },
                    /*Button disabled should be grayed out*/
                    enabled: {
                        type: 'boolean',
                        group: 'Behavior',
                        defaultValue : true
                    }
                },

                aggregations: {
                    content: { type: 'sap.ui.core.Control', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content',

                events: {
                    press: {}
                }
            }
        });

        EnabledPropagator.call(CustomControl.prototype);
        /**
         * Function is called when button is clicked.
         *
         * @param {jQuery.Event} oEvent
         * @private
         */
        CustomControl.prototype.onclick = function (oEvent) {
            if (this.getEnabled()) {
                this.firePress({/* no parameters */});
            }

            oEvent.preventDefault();
            oEvent.stopPropagation();
        };

        CustomControl.prototype.setEnabled = function (oValue) {
            if (oValue) {
                this.data('disabled', null);
            } else {
                this.data('disabled', 'true', true);
            }

            this.setProperty('enabled', oValue);
            return this;
        };

        CustomControl.prototype.ontap = function (oEvent) {
            if (this.getEnabled()) {
                this.firePress();
            }
        };

        CustomControl.prototype._addHtmlText = function (oRm) {
            oRm.write('<div');
            oRm.addClass('uteMBtn-text');
            oRm.writeClasses();
            oRm.write('>');

            oRm.write('<span');
            oRm.write('>');
            oRm.writeEscaped(this.getText());
            oRm.write('</span>');

            oRm.write('</div>');
        };

        CustomControl.prototype._addHtmlContent = function (oRm) {
            var aContent = this.getContent() || [];

            aContent.forEach(function (oContent) {
                oRm.renderControl(oContent);
            }.bind(this));
        };

        return CustomControl;
    },

    true
);
