/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.Body', {
            metadata: {
                library: 'ute.ui.app',

                aggregations: {
                    banner: { type: 'sap.ui.core.Control', multiple: true, singularName: 'banner' },
                    navLeft: { type: 'sap.ui.core.Control', multiple: true, singularName: 'navLeft' },
                    navRight: { type: 'sap.ui.core.Control', multiple: true, singularName: 'navRight' },
                    content: { type: 'ute.ui.app.BodyContent', multiple: false, singularName: 'content' }
                },

                defaultAggregation: 'content'
            }
        });

        return CustomControl;
    },

    true
);
