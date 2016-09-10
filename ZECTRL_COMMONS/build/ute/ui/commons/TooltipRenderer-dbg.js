/*!
 *  Created on  : Aug 13, 2015
 *  Author      : Jerry (Ya-Chieh) Hsu
 *  Description : Provides renderer ute.ui.commons.Tooltip.
 */
/*globals sap, ute*/
sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/commons/CalloutBaseRenderer',
        'sap/ui/core/Renderer'
    ],

    function (jQuery, CalloutBaseRenderer, Renderer) {

        "use strict";

        /**
         * Customized tooltip renderer.
         * @namespace
         */
        var CustomRenderer = Renderer.extend(CalloutBaseRenderer);

        /**
         * Renders the HTML for content.
         */
        CustomRenderer.renderContent = function (oRenderManager, oControl) {

            var rm = oRenderManager,
                content = oControl.getContent(),
                i;

            // content
            for (i = 0; i < content.length; i = i + 1) {
                rm.renderControl(content[i]);
            }
        };

        /**
         * Add the root CSS class to the Control to redefine/extend CalloutBase
         */
        CustomRenderer.addRootClasses = function (oRenderManager, oControl) {
            oRenderManager.addClass("uteCommonsTooltip");
        };

        /**
         * Add the content CSS class to the Control to redefine/extend CalloutBase
         */
        CustomRenderer.addContentClasses = function (oRenderManager, oControl) {
            oRenderManager.addClass("uteCommonsTooltip-content");
        };

        /**
         * Add the arrow/tip CSS class to the Control to redefine/extend CalloutBase
         */
        CustomRenderer.addArrowClasses = function (oRenderManager, oControl) {
            oRenderManager.addClass("uteCommonsTooltip-arrow");
        };


        return CustomRenderer;

    },

    true
);
