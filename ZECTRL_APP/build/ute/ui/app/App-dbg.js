/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.App', {
            metadata: {
                library: 'ute.ui.app',

                aggregations: {
                    header: { type: 'ute.ui.app.Header', multiple: false },
                    body: { type: 'ute.ui.app.Body', multiple: false },
                    footer: { type: 'ute.ui.app.Footer', multiple: false }
                }
            }
        });

        return CustomControl;
    },

    true
);
