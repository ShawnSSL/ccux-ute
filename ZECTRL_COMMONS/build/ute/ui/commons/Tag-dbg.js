/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var Tag = Control.extend('ute.ui.commons.Tag', {
            metadata: {
                library: 'ute.ui.commons',
                properties: {
                    elem: {
                        type: 'string',
                        defaultValue: 'div'
                    },
                    type: {
                        type: 'string',
                        defaultValue: null
                    },
                    text: {
                        type: 'string',
                        defaultValue: ''
                    },
                    width: {
                        type: 'string',
                        defaultValue: ''
                    }
                },
                aggregations: {
                    content: {
                        type: 'sap.ui.core.Control',
                        multiple : true,
                        singularName : 'content'
                    }
                },
                defaultAggregation : 'content'
            }
        });

        return Tag;

    },

    true
);
