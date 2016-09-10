/*global sap, ute*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.GeneralPage', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    design: { type: 'ute.ui.app.GeneralPageDesign', defaultValue: ute.ui.app.GeneralPageDesign.Default }
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
