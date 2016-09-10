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
            oRm.addClass('uteMTabPanel');

            if (oCustomControl.getDesign() !== ute.ui.main.TabPanel.None) {
                oRm.addClass('uteMTabPanel-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            var aContent, oTabBar, sTabBarSelectedKey;

            if (oCustomControl.getTabPanelFor()) {
                oTabBar = sap.ui.getCore().byId(oCustomControl.getTabPanelFor());
                if (oTabBar) {
                    // Get selected key from tab bar
                    sTabBarSelectedKey = this._getSelectedKeyFromTabBar(oTabBar);

                    // Listen to select event from tab bar
                    oTabBar.attachSelect(jQuery.proxy(oCustomControl._onTabBarSelected), oCustomControl);
                }
            }

            aContent = oCustomControl.getContent() || [];

            aContent.forEach(function (oContent) {
                if (sTabBarSelectedKey && oContent.getKey() === sTabBarSelectedKey) {
                    oContent.setHidden(false);
                }

                oRm.renderControl(oContent);

            }.bind(this));
        };

        CustomRenderer._getSelectedKeyFromTabBar = function (oTabBar) {
            var aContent, sSelectedKey;

            aContent = oTabBar.getContent() || [];

            aContent.forEach(function (oContent) {
                if (oContent instanceof ute.ui.main.TabBarItem) {
                    if (oContent.getSelected()) {
                        sSelectedKey = oContent.getKey();
                    }
                }
            });

            return sSelectedKey;
        };

        return CustomRenderer;
    },

    true
);
