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
            oRm.addClass('uteAppHdr');
            oRm.addClass('uteU-clearfix');
            oRm.writeClasses();
            oRm.write('>');

            oRm.write('<div');
            oRm.addClass('uteAppHdr-wrap');
            oRm.addClass('uteAppHdr-inner');
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getBanner()) {
                this._renderBanner(oRm, oCustomControl);
            }

            if (oCustomControl.getMenu()) {
                this._renderMenu(oRm, oCustomControl);
            }

            oRm.write('</div>'); // uteAppHdr-inner
            oRm.write('</div>'); // uteAppHdr
        };

        CustomRenderer._renderBanner = function (oRm, oCustomControl) {
            var aBanner = oCustomControl.getBanner();

            oRm.write('<div');
            oRm.addClass('uteAppHdr-banner');
            oRm.addClass('uteU-left');
            oRm.writeClasses();
            oRm.write('>');

            aBanner.forEach(function (oBanner) {
                oRm.renderControl(oBanner);
            }.bind(this));

            oRm.write('</div>');
        };

        CustomRenderer._renderMenu = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppHdr-menu');
            oRm.addClass('uteU-right');
            oRm.writeClasses();
            oRm.write('>');

            oRm.renderControl(oCustomControl.getMenu());

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
