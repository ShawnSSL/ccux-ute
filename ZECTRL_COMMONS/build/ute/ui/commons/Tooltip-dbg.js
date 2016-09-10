/*!
 *  Created on  : Aug 13, 2015
 *  Author      : Jerry (Ya-Chieh) Hsu
 *  Description : Provides control ute.ui.commons.Tooltip.
 */
/*globals sap, ute*/
sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/commons/CalloutBase'
    ],
    function (jQuery, CalloutBase) {

        "use strict";

         /**
         * Constructor for a Customized Tooltip.
         *
         * @param {string} [sId] id for the new control, generated automatically if no id is given
         * @param {object} [mSettings] initial settings for the new control
         *
         * @class
         *
         * Is used to provide tooltip that has controls as its children. This tooltip extends the CalloutBase.
         * @extends sap.ui.core.TooltipBase
         *
         * @author Utegration Jerry Hsu
         * @version ${version}
         *
         * @constructor
         * @public
         * @alias ute.ui.commons.Tooltip
         */


        var CustomControl = CalloutBase.extend("ute.ui.commons.Tooltip", {

            metadata : {

                library : "ute.ui.commons",

                properties: {
                    /* ute.ui.commons.TooltipDesign */
                    tooltipDesign: {
                        type: 'ute.ui.commons.TooltipDesign',
                        group: 'Appearance',
                        defaultValue: 'Black'
                    }
                },

                aggregations : {

                    /**
                     * Determines the content of the Customized Tooltip
                     */
                    content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
                },

                defaultAggregation: 'content'
            }
        });

        ///**
        // * This file defines behavior for the Customized Tooltip control
        // */

        return CustomControl;

    },

    true

);
