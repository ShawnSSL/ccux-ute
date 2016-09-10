/*globals sap*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var TagRenderer = {};

        TagRenderer.render = function (oRm, oControl) {
            oRm.write('<' + oControl.getElem());
            oRm.writeControlData(oControl);

            if (oControl.getType()) {
                oRm.writeAttribute('type', oControl.getType());
            }

            oRm.writeClasses();

            oRm.write('>');

            oRm.writeEscaped(oControl.getText());

            oControl.getContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            });

            oRm.write('</' + oControl.getElem() + '>');
        };

        return TagRenderer;

    },

    true
);
