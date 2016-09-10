/*global sap*/
sap.ui.define(['jquery.sap.global', 'sap/ui/core/ValueStateSupport'],
    function (jQuery, ValueStateSupport) {
        "use strict";

        var RadioButtonRenderer = {};

	/**
	 * Renders the HTML for the RadioButton, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.commons.RadioButton} oRadioButton The RadioButton control that should be rendered.
	 */
        RadioButtonRenderer.render = function (rm, oRadioButton) {

            rm.write('<span');
            rm.addClass('uteRadioBtn');
            rm.writeClasses();
            rm.write('>');

            rm.write('<Input type=\"radio\" name="' + oRadioButton.getGroupName() + '\"');
            rm.writeControlData(oRadioButton);
            rm.writeAttribute("id", oRadioButton.getId());
            if (oRadioButton.getBRegular()) {
                rm.addClass('uteRadioBtn-regular');
            } else {
                rm.addClass('uteRadioBtn-solid');
            }
            rm.writeClasses();
            rm.write('>');
            rm.write('<label');
            rm.writeAttribute("for", oRadioButton.getId());
            rm.write('>');

            rm.write('</label>');
            if (oRadioButton.getText()) {
                rm.write("<text>" + oRadioButton.getText() + "</text>");
            }
            rm.write('</span>');
	    };



        RadioButtonRenderer.setSelected = function (oRadioButton, bSelected) {
        /*
            oRadioButton.$().toggleClass('sapUiRbSel', bSelected).attr('aria-checked', bSelected);
            var $Dom = oRadioButton.getDomRef("RB");
            if (bSelected) {
                $Dom.checked = true;
                $Dom.setAttribute('checked', 'checked');
            } else {
                $Dom.checked = false;
                $Dom.removeAttribute('checked');
            }
*/
        };


	    return RadioButtonRenderer;

    }, /* bExport= */ true);
