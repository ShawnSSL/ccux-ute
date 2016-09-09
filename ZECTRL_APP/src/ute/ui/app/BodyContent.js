/*global sap, ute*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.BodyContent', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    layout: { type: 'ute.ui.app.BodyContentLayout', defaultValue: ute.ui.app.BodyContentLayout.Default }
                },

                aggregations: {
                    general: { type: 'sap.ui.core.Control', multiple: true, singularName: 'general' },
                    summary: { type: 'sap.ui.core.Control', multiple: true, singularName: 'summary' },
                    tool: { type: 'sap.ui.core.Control', multiple: true, singularName: 'tool' },
                    footer: { type: 'sap.ui.core.Control', multiple: true, singularName: 'footer' },
                    tagline: { type: 'sap.ui.core.Control', multiple: true, singularName: 'tagline' }
                },

                defaultAggregation: 'general'
            }
        });

        return CustomControl;
    },

    true
);
