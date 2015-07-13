/*global sap*/

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
                    item: { type: 'ute.ui.app.HeaderMenuItem', multiple: true, singularName: 'item' }
                },

                defaultAggregation: 'item'
            }
        });



        return CustomControl;
    },

    true
);
