/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteAppIdxLink');
            oRm.writeClasses();
            oRm.write('>');

            this._renderDescription(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderDescription = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.addClass('uteAppIdxLink-desc');
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getDescription()) {
                oRm.writeEscaped(oCustomControl.getDescription());
            }

            oRm.write('</span>');
        };

        return CustomRenderer;
    },

    true
);
