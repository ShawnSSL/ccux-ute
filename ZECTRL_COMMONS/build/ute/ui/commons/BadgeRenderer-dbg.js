/*globals sap*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var BadgeRenderer = {};

        BadgeRenderer.render = function (oRm, oControl) {
            oRm.write('<div');

            oRm.writeControlData(oControl);

            if (oControl.getTooltip_AsString()) {
                oRm.writeAttributeEscaped('title', oControl.getTooltip_AsString());
            }

            oRm.addStyle('width', oControl.getSize());
            oRm.addStyle('height', oControl.getSize());
            oRm.addStyle('line-height', oControl.getSize());

            if (oControl.getTextSize()) {
                oRm.addStyle('font-size', oControl.getTextSize());
            }

            oRm.writeStyles();

            oRm.addClass('uteBadge');
            oRm.addClass('uteBadge-txt');
            oRm.addClass('uteBadge-' + oControl.getDesign().toLowerCase());
            oRm.writeClasses();

            oRm.write('>');
            oRm.writeEscaped(oControl.getText());
            oRm.write('</div>');
        };

        return BadgeRenderer;
    },

    true
);

