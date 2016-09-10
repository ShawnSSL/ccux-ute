/*global sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/Icon'
    ],

    function (Icon) {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);

            oRm.addClass('uteAppMsg');
            if (oCustomControl.getDesign() !== ute.ui.app.MessageDesign.None) {
                oRm.addClass('uteAppMsg-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderText(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderIcon = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.addClass('uteAppMsg-icon');
            oRm.writeClasses();
            oRm.write('>');
            oRm.writeIcon(oCustomControl.getIcon());
            oRm.write('</span>');
        };

        CustomRenderer._renderText = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.addClass('uteAppMsg-text');
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getText()) {
                oRm.writeEscaped(oCustomControl.getText());
            }

            oRm.write('</span>');
        };

        return CustomRenderer;
    },

    true
);
