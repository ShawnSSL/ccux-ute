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
            oRm.addClass('uteAppIdxWC');
            oRm.writeClasses();
            oRm.write('>');

            this._renderLeftContent(oRm, oCustomControl);
            this._renderRightContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderLeftContent = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppIdxWc-leftCnt');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getLeftContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            }, this);

            oRm.write('</div>');
        };

        CustomRenderer._renderRightContent  = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppIdxWc-rightCnt');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getRightContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            }, this);

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
