/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.HeaderMenu', {
            metadata: {
                library: 'ute.ui.app',

                properties: {

                },

                aggregations: {
                    item: { type: 'sap.ui.core.Control', multiple: true, singularName: 'item' }
                },

                defaultAggregation: 'item'
            }
        });

        return CustomControl;
    },

    true
);
