/*global sap*/
/*jslint nomen:true*/

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

            this._renderContent(oRm, oCustomControl);

            oRm.write('</span>');
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
