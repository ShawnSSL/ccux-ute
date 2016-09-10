/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMDdItem');
            if (!oCustomControl.getEnabled()) {
                oRm.addClass('uteMDdItem-disabled');
            }
            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            var aContent = oCustomControl.getContent() || [];

            aContent.forEach(function (oContent) {
                oRm.renderControl(oContent);
            });
        };

        return CustomRenderer;
    },

    true
);
