/*global sap*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Renderer',
        'ute/ui/commons/TextfieldRenderer'
    ],

	function (jQuery, Renderer, TextFieldRenderer) {
        'use strict';

	    var TextAreaRenderer = sap.ui.core.Renderer.extend(TextFieldRenderer);

        /**
         * Use TextField to render TextArea but change tag to TEXTAREA
         * @protected
         */
        TextAreaRenderer.getInnerTagName = function () {
            return ('textarea');
        };
        /**
         * Add attributes, styles and so on to TextField tag
         */
        TextAreaRenderer.renderInnerAttributes = function (oRenderManager, oTextArea) {

            var rm = oRenderManager;

            rm.addClass("uteUiTxtA");

            rm.addStyle('overflow', 'auto');

            /*eslint-disable no-empty */
            //TODO Rethink if empty block is needed
            if (oTextArea.getWidth() && oTextArea.getWidth() !== '') {
                //done in TextField renderer
                rm.addStyle('width', oTextArea.getWidth());
            } else {
                if (oTextArea.getCols() && oTextArea.getCols() !== '') {
                    rm.writeAttribute('cols', oTextArea.getCols());
                }
            }
            /*eslint-enable no-empty */

            if (oTextArea.getHeight() && oTextArea.getHeight() !== '') {
                rm.addStyle('height', oTextArea.getHeight());
                //if a height is set don't use margin-top and margin-button because this would it make higher than wanted
                //this would lead to scrollbars or cut controls in layouts
                rm.addStyle('margin-top', '0');
                rm.addStyle('margin-bottom', '0');
            } else {
                if (oTextArea.getRows() && oTextArea.getRows() !== '') {
                    rm.writeAttribute('rows', oTextArea.getRows());
                }
            }

            // Changes of the wrap property require re-rendering for browser reasons.
            // Therefore, no dynamic function to change wrapping necessary.
            switch (oTextArea.getWrapping()) {
            case (sap.ui.core.Wrapping.Soft):
                rm.writeAttribute('wrap', 'soft');
                break;
            case (sap.ui.core.Wrapping.Hard):
                rm.writeAttribute('wrap', 'hard');
                break;
            case (sap.ui.core.Wrapping.Off):
                rm.writeAttribute('wrap', 'off');
                break;
            }
        };
        TextAreaRenderer.renderInnerContent = function (oRenderManager, oTextArea) {
            // Convenience variable
            var rm = oRenderManager,
                sValue = oTextArea.getValue(),
                sPlaceholder = oTextArea.getPlaceholder();

            if (sValue.length > oTextArea.getMaxLength() && oTextArea.getMaxLength() > 0) {
                sValue = sValue.substring(0, oTextArea.getMaxLength());
            }

            if (sPlaceholder && !sValue) {
                rm.writeEscaped(sPlaceholder);
            } else {
                rm.writeEscaped(sValue);
            }
        };
	    return TextAreaRenderer;

    },

    true
);
