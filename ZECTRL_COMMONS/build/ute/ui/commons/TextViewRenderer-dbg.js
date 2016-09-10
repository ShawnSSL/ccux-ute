// Provides default renderer for control sap.ui.commons.TextView
/*global sap*/
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function (jQuery, Renderer) {
	    "use strict";


	/**
	 * TextView renderer.
	 * @author UTE
	 *
	 */
	    var TextViewRenderer = {
	        };

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 *
	 */
	    TextViewRenderer.render = function (rm, oTextView) {

            rm.write("<div");
            rm.writeClasses();
            rm.write(">");
		    rm.write("<span");
		    rm.writeControlData(oTextView);
            rm.addClass("uteTv");
            if (oTextView.getWidth() && oTextView.getWidth() !== '') {
			    rm.addStyle("width", oTextView.getWidth());
		    }
            rm.addClass('uteTv-design-' + oTextView.getDesign().toLowerCase());
            rm.addClass('uteTv-color-' + oTextView.getColor().toLowerCase());
            rm.writeClasses();
		    rm.writeStyles();
		    rm.write(">");
		    rm.writeEscaped(oTextView.getText(), true);
		    rm.write("</span>");
            rm.write("</div>");

	    };


	    return TextViewRenderer;

    }, /* bExport= */ true);
