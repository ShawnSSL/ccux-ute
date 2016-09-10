/*globals sap, ute*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var Badge = Control.extend('ute.ui.commons.Badge', {
            metadata: {
                library: 'ute.ui.commons',

                properties: {
                    design: {
                        type: 'ute.ui.commons.BadgeDesign',
                        defaultValue: ute.ui.commons.BadgeDesign.Regular
                    },
                    text: {
                        type: 'string',
                        defaultValue: ''
                    },
                    size: {
                        type: 'sap.ui.core.CSSSize',
                        defaultValue: '20px'
                    },
                    textSize: {
                        type: 'sap.ui.core.CSSSize',
                        defaultValue: null
                    }
                }
            }
        });

        return Badge;
    },

    true
);


