/*global sap*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.writeControlData(oCustomControl);
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getText()) {
                oRm.writeEscaped(oCustomControl.getText());
            }

            oRm.write('</span>');
        };

        return CustomRenderer;
    },

    true
);
