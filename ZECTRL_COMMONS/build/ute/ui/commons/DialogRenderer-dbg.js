// Provides default renderer for control ute.ui.commons.Dialog
/*global sap, ute*/
/*jslint nomen:true*/
sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
	    "use strict";


	/**
	 *  ute.ui.commons.DialogRenderer
	 * @namespace
	 */
	    var DialogRenderer = {};


	/**
	 * Renders the HTML for the Dialog, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
        DialogRenderer.render = function (rm, oControl) {
            var heightSet = ute.ui.commons.Dialog._isSizeSet(oControl.getHeight()),
                widthSet = ute.ui.commons.Dialog._isSizeSet(oControl.getWidth()),
                rb = sap.ui.getCore().getLibraryResourceBundle("ute.ui.commons"),
                aButtons = oControl.getButtons(),
                iButtonCount,
                i,
                title,
                aChildren;

            //oControl.getScrollTop();  // Update the scroll position properties
            //oControl.getScrollLeft();

            // Root element and classes/styles
            rm.write("<div");
            rm.writeControlData(oControl);
            rm.addClass("uteDialog");

            /*
            if (oControl.getModal()) {
                rm.addClass("sapUiDlgModal");
            }*/
            //rm.addClass("sapUiDlgContentBorderDesign" + oControl.getContentBorderDesign());

            rm.addStyle("width", oControl.getWidth());
            rm.addStyle("height", oControl.getHeight());
            rm.addStyle("min-width", oControl.getMinWidth());
            rm.addStyle("min-height", oControl.getMinHeight());
            rm.addStyle("max-width", oControl.getMaxWidth());
            rm.addStyle("max-height", oControl.getMaxHeight());
            // Do not display the dialog content directly after rerendering, since it might just be
            // rendered inside the static area, whithout being in a popup
            rm.addStyle("display", "none");

            if (!heightSet) {
                rm.addClass("sapUiDlgFlexHeight");
            }
            if (!widthSet) {
                rm.addClass("sapUiDlgFlexWidth");
            }
            if (iButtonCount === 0) {
                rm.addClass("sapUiDlgNoButtons");
            }
            if (!oControl.getApplyContentPadding()) {
                rm.addClass("sapUiDlgNoPad");
            }
            rm.writeClasses();
            rm.writeStyles();

            rm.writeAttribute("aria-labelledby", oControl.getId() + "-lbl " + oControl.getId() + "-acc");
            rm.writeAttribute("role", oControl.getAccessibleRole().toLowerCase());
            rm.writeAttribute("tabindex", "-1");
            rm.write("><span style='display:none;' id='", oControl.getId(), "-acc'>", rb.getText("To close dialog, press ESC"), "</span>");

            // Header
            rm.write("<span id='" + oControl.getId() + "-fhfe' tabIndex='0'></span><div id='" + oControl.getId() + "-hdr' class='sapUiDlgHdr uteDialogHdr'>");
            rm.write("<span class='sapUiDlgHdrLeft uteDialogHdrLeft' id='" + oControl.getId() + "-hdrL'>");

            // Header label
            title = oControl.getTitle();
            rm.write("<span id='" + oControl.getId() + "-lbl' class='sapUiDlgLabel'");

            rm.writeAttribute("role", "heading");
            rm.writeAttribute("aria-level", "1");
            if (title) {
                rm.writeAttributeEscaped("title", title);
            }
            rm.write(">");

            if (!title) {
                rm.write("&nbsp;");
            } else {
                rm.writeEscaped(title);
            }
            rm.write("</span></span>");
            rm.write("<span id='", oControl.getId(), "-hdrR' class='sapUiDlgHdrBtns uteUiDlgHdrBtn'>");
            // Example for an additional button:   rm.write("<a class='sapUiDlgOptBtn'></a>");

            if (oControl.getShowCloseButton()) {
                rm.write("<a id='", oControl.getId(), "-close' class='sapUiDlgCloseBtn' href='javascript:void(0)'");
                rm.write(" tabIndex='-1'"); // according to accessibility experts (O.K. and M.J.), the 'x' should not be tab-able
                rm.writeAttribute("role", "button");
                rm.writeAttributeEscaped("aria-label", rb.getText("To close dialog, press ESC"));
                rm.writeAttributeEscaped("title", rb.getText("Close"));
                rm.write(">X</a>");
            }
            rm.write("</span></div>");

            //Header separator
            rm.write('<div class="uteUiDlgHdrSep sapUiDlgHdrSep"></div>');


            // Content area
            rm.write("<div class='sapUiDlgCont uteUiDlgCont' id='", oControl.getId(), "-cont' tabindex=\"-1\">");

            // Content
            aChildren = oControl.getContent();
            for (i = 0; i < aChildren.length; i = i + 1) {
                rm.renderControl(aChildren[i]);
            }
            rm.write("</div>");


            /*
            // Footer separator
            if (iButtonCount > 0) {
                rm.write('<div class="sapUiDlgFooterSep"></div>');
            }*/

            // Footer
            rm.write("<div id='");
            rm.write(oControl.getId());
            rm.write("-footer' class='sapUiDlgFooter uteUiDlgFooter'>");

            // Wave and Buttons
            rm.write("<div class='sapUiDlgBtns'>");
            for (i = 0; i < iButtonCount; i = i + 1) {
                rm.renderControl(aButtons[i]);
            }
            rm.write("</div><div class='sapUiDlgWave'></div></div>");

            // Grip
            if (oControl.getResizable()) {
                rm.write("<span id='");
                rm.write(oControl.getId());
                rm.write("-grip' class='sapUiDlgGrip'>&#916;</span>");
            }

            // End of Dialog
            //rm.write("<span id='" + oControl.getId() + "-fhee' tabIndex='0'></span></div>");

        };


	    return DialogRenderer;

    }, /* bExport= */ true);
