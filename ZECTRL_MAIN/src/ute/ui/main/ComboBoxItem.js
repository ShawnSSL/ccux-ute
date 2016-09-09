/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.ComboBoxItem', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    key: { type: 'string', defaultValue: null },
                    enabled : {type: 'boolean', defaultValue: true },
                    show: { type: 'boolean', defaultValue: true}
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

        CustomControl.prototype.onclick = function (oEvent) {
            if (this.getEnabled()) {
                this.firePress();
            }
        };

        return CustomControl;
    },

    true
);
