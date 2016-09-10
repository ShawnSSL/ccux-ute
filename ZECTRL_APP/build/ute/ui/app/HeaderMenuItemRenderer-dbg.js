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
            oRm.addClass('uteAppHMItem');

            if (oCustomControl.getSelected()) {
                oRm.addClass('uteAppHMItem-selected');
            }

            if (!oCustomControl.getEnabled()) {
                oRm.addClass('uteAppHMItem-disabled');
            }

            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getHeader()) {
                this._renderHeader(oRm, oCustomControl);
            }

            oRm.write('</div>');
        };

        CustomRenderer._renderHeader = function (oRm, oCustomControl) {
            var aHeader = oCustomControl.getHeader();

            oRm.write('<div');
            oRm.writeAttribute('id', oCustomControl.getId() + '-hdr');
            oRm.addClass('uteAppHMItem-hdr');
            oRm.writeClasses();
            oRm.write('>');

            aHeader.forEach(function (oHeader) {
                oRm.renderControl(oHeader);
            });

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
