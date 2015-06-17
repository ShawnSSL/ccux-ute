/*global sap, ute */
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global'
    ],

    function (jQuery) {
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
                oRm.write('<span');
                oRm.addClass('uteMTabBar-item');
                oRm.writeClasses();
                oRm.write('>');

                oContent.setGroup(oCustomControl.getId() + '--grp');
                oCustomControl._attachItemPress(oContent);

                oRm.renderControl(oContent);

                oRm.write('</span>');
            });
        };

        return CustomRenderer;
    },

    true
);
