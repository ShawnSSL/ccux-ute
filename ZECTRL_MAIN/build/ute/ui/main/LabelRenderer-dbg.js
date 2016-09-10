/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<label');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMLbl');
            oRm.writeClasses();

            if (oCustomControl.getLabelForRendering()) {
                oCustomControl._addLabelForRendering(oRm);
            }

            oRm.write('>');

            if (oCustomControl.getText()) {
                oCustomControl._addHtmlText(oRm);
            }

            if (oCustomControl.getContent()) {
                oCustomControl._addHtmlContent(oRm);
            }

            oRm.write('</label>');
        };

        return CustomRenderer;
    },

    true
);
