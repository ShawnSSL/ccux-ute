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
            oRm.addClass('uteMTabPanelItem');

            if (oCustomControl.getDesign() !== ute.ui.main.TabPanelItem.None) {
                oRm.addClass('uteMTabPanelItem-design-' + oCustomControl.getDesign().toLowerCase());
            }

            if (oCustomControl.getHidden()) {
                oRm.addClass('uteMTabPanelItem-hidden');
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            var aContent = oCustomControl.getContent() || [];

            aContent.forEach(function (oContent) {
                oRm.write('<div');
                oRm.addClass('uteMTabPanelItem-content');
                oRm.writeClasses();
                oRm.write('>');

                oRm.renderControl(oContent);

                oRm.write('</div>');
            });
        };

        return CustomRenderer;
    },

    true
);
