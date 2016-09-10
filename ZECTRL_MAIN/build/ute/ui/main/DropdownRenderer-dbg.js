/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function (Popup) {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMDd');

            if (oCustomControl.getDesign() !== ute.ui.main.DropdownDesign.None) {
                oRm.addClass('uteMDd-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderHeader(oRm, oCustomControl);
            this._renderPicker(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderHeader = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteMDd-hdr');
            oRm.writeClasses();
            oRm.write('>');

            this._renderHeaderContent(oRm, oCustomControl);
            this._renderHeaderExpander(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderHeaderContent = function (oRm, oCustomControl) {
            var oContent = oCustomControl.getAggregation('_headerContent');

            oRm.write('<div');
            oRm.addClass('uteMDd-hdrContent');
            oRm.writeClasses();
            oRm.write('>');

            if (oContent) {
                oRm.renderControl(oContent);

            } else if (oCustomControl.getPlaceholder()) {
                oRm.write('<span');
                oRm.addClass('uteMDd-hdrContent-placeholder');
                oRm.writeClasses();
                oRm.write('>');

                oRm.writeEscaped(oCustomControl.getPlaceholder());

                oRm.write('</span>');
            }

            oRm.write('</div>');
        };

        CustomRenderer._renderHeaderExpander = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteMDd-hdrExpander');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('</div>');
        };

        CustomRenderer._renderPicker = function (oRm, oCustomControl) {
            var aContent = oCustomControl.getContent() || [];

            oRm.write('<div');

            oRm.writeAttribute('id', oCustomControl.getId() + '-picker');

            oRm.addClass('uteMDd-picker');
            oRm.writeClasses();

            oRm.write('>');

            aContent.forEach(function (oContent) {
                oRm.renderControl(oContent);
            });

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
