/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.IndexLink', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    description: { type: 'string', defaultValue: null },
                    refId: { type: 'string', defaultValue: null }
                },

                events: {
                    press: {}
                }
            }
        });

        CustomControl.prototype.ontap = function (oEvent) {
            this.firePress();
        };

        return CustomControl;
    },

    true
);
