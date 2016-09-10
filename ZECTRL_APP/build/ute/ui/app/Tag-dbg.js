/*global sap, ute*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.Tag', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    type: { type: 'ute.ui.app.TagType', defaultValue: ute.ui.app.TagType.Block }
                },

                aggregations: {
                    content: { type: 'sap.ui.core.Control', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content'
            }
        });

        return CustomControl;
    },

    true
);
