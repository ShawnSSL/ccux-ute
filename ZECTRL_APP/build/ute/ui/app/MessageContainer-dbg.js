/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.MessageContainer', {
            metadata: {
                library: 'ute.ui.app',

                aggregations: {
                    content: { type: 'ute.ui.app.Message', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content'
            }
        });

        return CustomControl;
    },

    true
);
