/*globals sap*/

// Provides default renderer for control sap.ui.commons.CheckBox
sap.ui.define(['jquery.sap.global'],
	function (jQuery, ValueStateSupport) {
        "use strict";

        var CheckBoxRenderer = {};

	    CheckBoxRenderer.render = function (rm, oCheckBox) {
            rm.write('<span');
            rm.addClass('uteChkBox');
            rm.writeClasses();
            rm.write('><input');
            rm.writeAttribute('type', 'checkbox');
            rm.writeAttribute('id', oCheckBox.getId());
            rm.addClass('uteChkBox-input');
            rm.writeClasses();
            if (oCheckBox.getName()) {
                rm.writeAttribute('name', oCheckBox.getName());
            }
            if (oCheckBox.getChecked()) {
                rm.write('checked');
            }
            rm.write('/><label');
            rm.writeAttribute("for", oCheckBox.getId());
            rm.write("></label>");
            if (oCheckBox.getText()) {
                rm.write('<text');
                rm.addClass("uteChkBox-text");
                rm.writeClasses();
                rm.write(">" + oCheckBox.getText() + "</text>");
            }
            rm.write("</span>");
	    };

	    return CheckBoxRenderer;

    }, /* bExport= */ true);
