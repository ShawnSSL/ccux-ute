/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<button');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMBtn');
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getText()) {
                oCustomControl._addHtmlText(oRm);
            }

            if (oCustomControl.getContent()) {
                oCustomControl._addHtmlContent(oRm);
            }

            oRm.write('</button>');
        };

        return CustomRenderer;
    },

    true
);
