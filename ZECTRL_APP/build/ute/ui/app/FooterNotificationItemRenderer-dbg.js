/*global sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [],

    function (Icon) {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteAppFtrNotifItem');

            if (oCustomControl.getDesign() !== ute.ui.app.FooterNotificationItemDesign.None) {
                oRm.addClass('uteAppFtrNotifItem-design-' + oCustomControl.getDesign().toLowerCase());
            }

            if (oCustomControl.getLink()) {
                oRm.addClass('uteAppFtrNotifItem-link');
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            this._renderIcon(oRm, oCustomControl);
            this._renderText(oRm, oCustomControl);
        };

        CustomRenderer._renderIcon = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.addClass('uteAppFtrNotifItem-icon');

            oRm.writeClasses();
            oRm.write('>');

            oRm.writeIcon(oCustomControl.getCustomIcon());

            oRm.write('</span>');
        };

        CustomRenderer._renderText = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.addClass('uteAppFtrNotifItem-text');

            oRm.writeClasses();
            oRm.write('>');

            oRm.writeEscaped(oCustomControl.getText());

            oRm.write('</span>');
        };

        return CustomRenderer;
    },

    true
);
