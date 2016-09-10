/* global sap, ute */

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.FooterPage', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    design: { type: 'ute.ui.app.FooterPageDesign', defaultValue: ute.ui.app.FooterPageDesign.Default }
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
