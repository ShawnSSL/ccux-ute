/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            /*
            ** Container to hold the entire radiobutton
            */
            oRm.write('<span');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMRb');

            if (oCustomControl.getDesign() !== ute.ui.main.RadioButtonDesign.None) {
                oRm.addClass('uteMRb-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            /*
            ** Actual radio button, will be hide away
            */
            oRm.write('<input type="radio"');
            oRm.writeAttribute('id', oCustomControl.getId() + '-intRb');

            if (oCustomControl.getGroup()) {
                oRm.writeAttributeEscaped('name', oCustomControl.getGroup());
            }

            if (oCustomControl.getChecked()) {
                oRm.writeAttribute('checked', 'checked');
            }

            if (!oCustomControl.getEnabled()) {
                oRm.writeAttribute('disabled', 'disabled');
            }

            oRm.addClass('uteMRb-intRb');
            oRm.writeClasses();
            oRm.write('/>');

            /*
            ** This is the 'radio button' that the user will interact with
            */
            oRm.write('<label');
            oRm.writeAttribute('id', oCustomControl.getId() + '-extRb');
            oRm.writeAttribute('for', oCustomControl.getId() + '-intRb');
            oRm.addClass('uteMRb-rb');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('</label>');

            oRm.write('</span>');
        };

        return CustomRenderer;
    },

    true
);
