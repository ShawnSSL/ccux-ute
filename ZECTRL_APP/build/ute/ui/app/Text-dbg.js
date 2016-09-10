/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.Text', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    text: { type: 'string', defaultValue: null }
                }
            }
        });

        return CustomControl;
    },

    true
);
