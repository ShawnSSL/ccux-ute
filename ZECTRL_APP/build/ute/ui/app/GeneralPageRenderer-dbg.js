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
            oRm.addClass('uteAppGenPg');
            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            });

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
