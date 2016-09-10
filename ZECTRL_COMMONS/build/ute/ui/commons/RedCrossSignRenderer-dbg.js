/*global sap*/
sap.ui.define([],
    function () {
        'use strict';

        var RedCrossSignRenderer = {};

        RedCrossSignRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
            oRm.writeControlData(oControl);
			oRm.addClass("uteRedCrossSign");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
        };

        return RedCrossSignRenderer;

    }, true);
