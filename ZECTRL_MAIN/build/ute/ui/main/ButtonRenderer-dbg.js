/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.writeControlData(oCustomControl);

            oRm.addClass('uteMBtn');

            if (oCustomControl.getDesign() !== ute.ui.main.ButtonDesign.None) {
                oRm.addClass('uteMBtn-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getText()) {
                oCustomControl._addHtmlText(oRm);
            }

            if (oCustomControl.getContent()) {
                oCustomControl._addHtmlContent(oRm);
            }

            oRm.write('</span>');
        };

        return CustomRenderer;
    },

    true
);
