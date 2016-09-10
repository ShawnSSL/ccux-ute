/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.Header', {
            metadata: {
                library: 'ute.ui.app',

                aggregations: {
                    banner: { type: 'sap.ui.core.Control', multiple: true, singularName: 'banner' },
                    menu: { type: 'sap.ui.core.Control', multiple: false }
                }
            }
        });

        return CustomControl;
    },

    true
);
