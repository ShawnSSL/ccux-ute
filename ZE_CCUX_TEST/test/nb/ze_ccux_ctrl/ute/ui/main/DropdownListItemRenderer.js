/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<span');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteDropdownItem');

            if (oCustomControl.getDesign() !== ute.ui.main.TabBarItem.None) {
                oRm.addClass('uteMDropdownItem-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            /*
            ** Internal radio button for state management
            */
            oRm.write('<input type="radio"');
            oRm.writeAttribute('id', oCustomControl.getId() + '-int');

            if (oCustomControl.getGroup()) {
                oRm.writeAttributeEscaped('name', oCustomControl.getGroup());
            }

            if (oCustomControl.getSelected()) {
                oRm.writeAttribute('checked', 'checked');
            }

            if (!oCustomControl.getEnabled()) {
                oRm.writeAttribute('disabled', 'disabled');
            }

            oRm.addClass('uteMDropdownItem-int');
            oRm.writeClasses();
            oRm.write('/>');

            /*
            ** This is the content that the user will interact with
            */
            oRm.write('<label');
            oRm.writeAttribute('id', oCustomControl.getId() + '-ext');
            oRm.writeAttribute('for', oCustomControl.getId() + '-int');
            oRm.addClass('uteMDropdownItem-content');
            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</label>');

            oRm.write('</span>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            var aContent;

            aContent = oCustomControl.getContent() || [];
            aContent.forEach(function (oContent) {
                oRm.renderControl(oContent);
            });
        };

        return CustomRenderer;
    },

    true
);
