/*globals sap */
// Provides control sap.ui.commons.Button.
sap.ui.define(
    [
        'jquery.sap.global',
        './library',
        'sap/ui/core/Control'
    ],

	function (jQuery, library, Control) {
	    'use strict';

        var Button = Control.extend('ute.ui.commons.Button', {
            metadata : {
                library: 'ute.ui.commons',
                properties: {
                    /*Button text*/
                    text: {
                        type: 'string',
                        group: 'Appearance',
                        defaultValue: ''
                    },

                    /*Button disabled should be grayed out*/
                    enabled: {
                        type: 'boolean',
                        group: 'Behavior',
                        defaultValue : true
                    },

                    /*Button Width*/
                    width: {
                        type: 'sap.ui.core.CSSSize',
                        group: 'Dimension',
                        defaultValue: null
                    },

                    /*button height*/
                    height: {
                        type: 'sap.ui.core.CSSSize',
                        group: 'Dimension',
                        defaultValue: null
                    },

                    /*Button icon*/
                    icon: {
                        type: 'sap.ui.core.URI',
                        group: 'Appearance',
                        defaultValue: null
                    },

                    /*true if icon is in front of button*/
                    iconFirst: {
                        type: 'boolean',
                        group: 'Appearance',
                        defaultValue: true
                    },

                    /*ute.ui.commons.ButtonType*/
                    buttonType: {
                        type: 'ute.ui.commons.ButtonType',
                        group: 'Appearance',
                        defaultValue: 'GeneralAction'
                    },

                    /**
                     * Specifies the SVG Icon width
                     */
                    uteSvgIconWidth: {
                        type: 'sap.ui.core.CSSSize',
                        group : "Dimension",
                        defaultValue: null
                    },

                    /**
                     * Specifies the SVG Icon height
                     */
                    uteSvgIconHeight: {
                        type: 'sap.ui.core.CSSSize',
                        group: 'Dimension',
                        defaultValue: null
                    }
                },

                events: {
                    /*Event onPress*/
                    press: {}
                }
            }
        });

        Button.prototype.onclick = function (oEvent) {
            if (this.getEnabled()) {
                this.firePress({});
            }

            oEvent.preventDefault();
            oEvent.stopPropagation();
        };

        return Button;
    },

    true
);
