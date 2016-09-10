/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.EventArea', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    enabled: { type: 'boolean', defaultValue: true }
                },

                aggregations: {
                    content: { type: 'sap.ui.core.Control', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content',

                events: {
                    click: {}
                }
            }
        });

        CustomControl.prototype.onclick = function (oEvent) {
            if (this.getEnabled()) {
                this.fireClick();
            }
        };

        CustomControl.prototype.setEnabled = function (bEnabled) {
            bEnabled = !!bEnabled;

            this.setProperty('enabled', bEnabled, true);
            return this;
        };

        return CustomControl;
    },

    true
);
