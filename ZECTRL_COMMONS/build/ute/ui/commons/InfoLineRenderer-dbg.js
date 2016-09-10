/*globals sap*/

sap.ui.define([],
    function () {
        'use strict';

        var InfoLineRenderer = {};

        InfoLineRenderer.render = function (oRm, oControl) {
            oRm.write('<div');
            oRm.writeControlData(oControl);

            oRm.addClass('uteInfoLine');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('<ul>');
            oRm.write('<li>');

            if (oControl.getExpand()) {
                oRm.write('<input type="checkbox" />');
            } else {
                oRm.write('<input type="checkbox" checked />');
            }

            oRm.write('<i></i>');

            oRm.write('<div');
            oRm.addClass('uteInfoLineItemTitle');
            oRm.writeClasses();
            oRm.write('>');
            oRm.writeEscaped(oControl.getTitle());
            oRm.write('</div>'); //uteInfoLineItemTitle div

            oRm.write('<div');
            oRm.addClass('uteInfoLineItemContent');
            oRm.writeClasses();

            if (oControl.getMaxHeight()) {
                oRm.addStyle('max-height', oControl.getMaxHeight());
                oRm.writeStyles();
            }

            oRm.write('>');
            oRm.renderControl(oControl.getContent());
            oRm.write('</div>'); //uteInfoLineItemContent div

            oRm.write('</li>');
            oRm.write('</ul>');
            oRm.write('</div>'); //uteInfoLine div
        };

        return InfoLineRenderer;

    }, true);

/*
<div class="uteInfoLine">
    <ul>
        <li>
            <input type="checkbox" checked>
            <i></i>
            <div class="uteInfoLineItemTitle">
                <span>Title</span>
            </div>
            <div class="uteInfoLineItemContent">
                Lorem ipsum sit dol mit...
            </div>
        </li>
    </ul>
</div>
*/
