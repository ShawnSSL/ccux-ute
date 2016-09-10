/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Element',
        'sap/ui/core/Control'
    ],

    function (CoreElement) {
        'use strict';

        var Element = CoreElement.extend('ute.ui.commons.DropdownListItem', {
            metadata: {
                library: 'ute.ui.commons',

                properties: {
                    key: {
                        type: 'string',
                        defaultValue: null
                    }
                },

                defaultAggregation: 'content',

                aggregations: {
                    content: {
                        type: 'sap.ui.core.Control',
                        multiple: true,
                        singularName: 'content'
                    }
                }
            }
        });

        return Element;
    },

    true
);

