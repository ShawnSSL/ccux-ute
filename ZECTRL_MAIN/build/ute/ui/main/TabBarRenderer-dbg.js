/*global sap, ute */
/*jslint nomen:true*/

sap.ui.define(
    [
        'ute/ui/main/TabBarItem'
    ],

    function (TabBarItem) {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMTabBar');

            if (oCustomControl.getDesign() !== ute.ui.main.TabBar.None) {
                oRm.addClass('uteMTabBar-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            var aContent = oCustomControl.getContent() || [];

            aContent.forEach(function (oContent) {
                if (oContent instanceof TabBarItem) {
                    oContent.setGroup(oCustomControl.getId() + '--grp');
                    oCustomControl._attachItemSelect(oContent);
                }

                oRm.renderControl(oContent);
            });
        };

        return CustomRenderer;
    },

    true
);
