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
            oRm.addClass('uteAppIdxGrpLink');
            oRm.writeClasses();
            oRm.write('>');

            this._renderHeader(oRm, oCustomControl);
            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderHeader = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppIdxGrpLink-hdr');
            oRm.writeClasses();
            oRm.write('>');

            // Header title
            oRm.write('<div');
            oRm.addClass('uteAppIdxGrpLink-hdrTitle');
            oRm.writeClasses();
            oRm.write('>');
            if (oCustomControl.getTitle()) {
                oRm.writeEscaped(oCustomControl.getTitle());
            }
            oRm.write('</div>');

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppIdxGrpLink-linkCont');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            }, this);

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
