/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.SummaryPage', {
            metadata: {
                library: 'ute.ui.app'
            }
        });

        return CustomControl;
    },

    true
);
