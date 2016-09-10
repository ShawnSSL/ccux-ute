/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {

            /*
            ** Container to hold the entire checkbox
            */
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMChkBox');

            if (oCustomControl.getDesign() !== ute.ui.main.CheckboxDesign.None) {
                oRm.addClass('uteMChkBox-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            /*
            ** Actual checkbox, will be hidden away
            */
            oRm.write('<input type="checkbox"');
            oRm.writeAttribute('id', oCustomControl.getId() + '-intChk');

            if (oCustomControl.getChecked()) {
                oRm.writeAttribute('checked', 'checked');
            }

            if (!oCustomControl.getEnabled()) {
                oRm.writeAttribute('disabled', 'disabled');
            }

            oRm.addClass('uteMChkBox-intChk');
            oRm.writeClasses();
            oRm.write('/>');

            /*
            ** This is the 'checkbox' that the user will interact with
            */
            oRm.write('<label');
            oRm.writeAttribute('id', oCustomControl.getId() + '-extChk');
            oRm.writeAttribute('for', oCustomControl.getId() + '-intChk');
            oRm.addClass('uteMChkBox-chk');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('</label>');

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
