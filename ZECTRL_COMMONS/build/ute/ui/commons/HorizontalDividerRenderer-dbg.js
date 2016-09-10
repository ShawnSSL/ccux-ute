/*global sap*/

sap.ui.define(
    [],

	function () {
	    'use strict';

	    var HDivRenderer = {};

	    HDivRenderer.render = function (oRm, oControl) {
		    oRm.write('<div');
            oRm.writeControlData(oControl);

            oRm.addStyle('width', oControl.getWidth());
            oRm.writeStyles();

            oRm.addClass('uteHDiv');
            oRm.addClass('uteHDiv-height-' + oControl.getHeight().toLowerCase());
            oRm.addClass('uteHDiv-size-' + oControl.getSize().toLowerCase());
            oRm.addClass('uteHDiv-design-' + oControl.getDesign().toLowerCase());
            oRm.writeClasses();

            oRm.write('>');
            oRm.write('</div>');
	    };

	    return HDivRenderer;
    },

    true
);
