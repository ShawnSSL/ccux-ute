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
            oRm.addClass('uteAppBody');
            oRm.writeClasses();
            oRm.write('>');

            oRm.write('<div');
            oRm.addClass('uteAppBody-wrap');
            oRm.addClass('uteAppBody-inner');
            oRm.writeClasses();
            oRm.write('>');

            this._renderBanner(oRm, oCustomControl);
            this._renderBody(oRm, oCustomControl);

            oRm.write('</div>'); // uteAppBody-inner
            oRm.write('</div>'); // uteAppBody
        };

        CustomRenderer._renderBanner = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBody-banner');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getBanner().forEach(function (oBanner) {
                oRm.renderControl(oBanner);
            });

            oRm.write('</div>');
        };

        CustomRenderer._renderBody = function (oRm, oCustomControl) {
            this._renderNavLeft(oRm, oCustomControl);
            this._renderContent(oRm, oCustomControl);
            this._renderNavRight(oRm, oCustomControl);
        };

        CustomRenderer._renderNavLeft = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBody-navLeft');
            oRm.writeClasses();
            oRm.write('>');

            oRm.write('<div');
            oRm.addClass('uteAppBody-navLeftCnt');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getNavLeft().forEach(function (oNavLeft) {
                oRm.renderControl(oNavLeft);
            }.bind(this));

            oRm.write('</div>');
            oRm.write('</div>');
        };

        CustomRenderer._renderNavRight = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBody-navRight');
            oRm.writeClasses();
            oRm.write('>');

            oRm.write('<div');
            oRm.addClass('uteAppBody-navRightCnt');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getNavRight().forEach(function (oNavRight) {
                oRm.renderControl(oNavRight);
            }.bind(this));

            oRm.write('</div>');
            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            var oContent = oCustomControl.getContent();

            oRm.write('<div');
            oRm.addClass('uteAppBody-content');
            oRm.writeClasses();
            oRm.write('>');

            if (oContent) {
                oRm.renderControl(oContent);
            }

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
