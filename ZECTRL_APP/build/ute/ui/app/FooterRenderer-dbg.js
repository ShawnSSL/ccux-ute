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
            oRm.addClass('uteAppFtr');
            oRm.addClass('uteU-clearfix');
            oRm.writeClasses();
            oRm.write('>');

            oRm.write('<div');
            oRm.addClass('uteAppFtr-wrap');
            oRm.addClass('uteAppFtr-inner');
            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>'); //uteAppFtr-inner
            oRm.write('</div>'); //uteAppFtr
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            oCustomControl.getContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            }.bind(this));
        };

        return CustomRenderer;
    },

    true
);
