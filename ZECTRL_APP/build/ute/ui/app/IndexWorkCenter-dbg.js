/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.IndexWorkCenter', {
            metadata: {
                library: 'ute.ui.app',

                aggregations: {
                    leftContent: { type: 'ute.ui.app.IndexGroupLink', multiple: true, singularName: 'leftContent' },
                    rightContent: { type: 'ute.ui.app.IndexGroupLink', multiple: true, singularName: 'rightContent' }
                },

                defaultAggregation: 'leftContent'
            }
        });

        return CustomControl;
    },

    true
);
