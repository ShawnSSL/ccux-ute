/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.FooterNotificationCenter', {
            metadata: {
                library: 'ute.ui.app',

                aggregations: {
                    content: { type: 'ute.ui.app.FooterNotificationItem', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content'
            }
        });

        return CustomControl;
    },

    true
);
