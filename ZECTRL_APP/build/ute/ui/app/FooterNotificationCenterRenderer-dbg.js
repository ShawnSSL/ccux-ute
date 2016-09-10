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
            oRm.addClass('uteAppFtrNotifCtr');
            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            this._renderLeftContent(oRm, oCustomControl);
            this._renderRightContent(oRm, oCustomControl);
        };

        CustomRenderer._renderLeftContent = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppFtrNotifCtr-cnt');
            oRm.addClass('uteAppFtrNotifCtr-leftCnt');
            oRm.writeClasses();
            oRm.write('>');

            //Render odd items
            oCustomControl.getContent().forEach(function (item, index) {
                if ((index + 1) % 2 === 1) {
                    oRm.write('<div');
                    oRm.addClass('uteAppFtrNotifCtr-cntItem');
                    oRm.writeClasses();
                    oRm.write('>');

                    oRm.renderControl(item);

                    oRm.write('</div>');
                }
            }, this);

            oRm.write('</div>');
        };

        CustomRenderer._renderRightContent = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppFtrNotifCtr-cnt');
            oRm.addClass('uteAppFtrNotifCtr-rightCnt');
            oRm.writeClasses();
            oRm.write('>');

            //Render even items
            oCustomControl.getContent().forEach(function (item, index) {
                if ((index + 1) % 2 === 0) {
                    oRm.write('<div');
                    oRm.addClass('uteAppFtrNotifCtr-cntItem');
                    oRm.writeClasses();
                    oRm.write('>');

                    oRm.renderControl(item);

                    oRm.write('</div>');
                }
            }, this);

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
