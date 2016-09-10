/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'ute/ui/app/HeaderMenuItem'
    ],

    function (HeaderMenuItem) {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteAppHdrMenu');
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getItem()) {
                this._renderItem(oRm, oCustomControl);
            }

            oRm.write('</div>');
        };

        CustomRenderer._renderItem = function (oRm, oCustomControl) {
            var aItem = oCustomControl.getItem();

            aItem.forEach(function (oItem) {
                oRm.renderControl(oItem);
            }.bind(this));
        };

        return CustomRenderer;
    },

    true
);
