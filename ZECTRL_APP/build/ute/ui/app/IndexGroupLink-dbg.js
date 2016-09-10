/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.IndexGroupLink', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    title: { type: 'string', defaultValue: null }
                },

                aggregations: {
                    content: { type: 'ute.ui.app.IndexLink', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content'
            }
        });

        return CustomControl;
    },

    true
);
