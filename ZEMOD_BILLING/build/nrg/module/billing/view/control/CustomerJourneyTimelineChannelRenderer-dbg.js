/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('nrgCJTChannel');

            if (oCustomControl.getSelected()) {
                oRm.addClass('nrgCJTChannel-selected');
            }

            oRm.writeClasses();
            oRm.write('>');

            this._renderLeftLine(oRm, oCustomControl);
            this._renderEmblem(oRm, oCustomControl);
            this._renderDescription(oRm, oCustomControl);
            this._renderRightLine(oRm, oCustomControl);


            if (oCustomControl.getRightDivider()) {
                this._renderRightDivider(oRm, oCustomControl);
            }

            oRm.write('</div>');
        };

        CustomRenderer._renderEmblem = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('nrgCJTChannel-emblem');
            oRm.writeClasses();
            oRm.write('>');

            this._renderTopLabel(oRm, oCustomControl);
            this._renderIcon(oRm, oCustomControl);


            oRm.write('</div>');
        };

        CustomRenderer._renderTopLabel = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('nrgCJTChannel-topLabel');
            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getTopLabel()) {
                oRm.writeEscaped(oCustomControl.getTopLabel());
            }

            oRm.write('</div>');
        };

        CustomRenderer._renderIcon = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeAttribute('id', oCustomControl.getId() + '-icon');
            oRm.addClass('nrgCJTChannel-icon');
            oRm.writeClasses();
            oRm.write('>');

            oRm.writeIcon(oCustomControl.getChannelIcon());

            oRm.write('</div>');
        };
        CustomRenderer._renderDescription = function (oRm, oCustomControl) {
            var aDescriptionList = [];
            if (oCustomControl.getDescription()) {
                oRm.write('<div');
                oRm.addClass('nrgCJTChannel-desc');
                oRm.writeClasses();
                oRm.write('>');
                oRm.write('<div');
                oRm.addClass('nrgCJTChannel-desc-title');
                oRm.writeClasses();
                oRm.write('>');
                oRm.writeEscaped(oCustomControl.getChannel());
                oRm.write('</div>');
                oRm.write('<div');
                oRm.addClass('nrgCJTChannel-desc-text');
                oRm.writeClasses();
                oRm.write('>');
                if (oCustomControl.getDescription()) {
                    aDescriptionList = oCustomControl.getDescription().split("~");
                    if ((aDescriptionList) && (aDescriptionList.length > 0)) {
                        oRm.write('<ul>');
                        aDescriptionList.forEach(function (sDesc) {
                            oRm.write('<li>');
                            oRm.writeEscaped(sDesc);
                            oRm.write('</li>');

                        });
                        oRm.write('</ul>');
                    }
                }
                oRm.write('</div>');
                oRm.write('</div>');
            }
        };

        CustomRenderer._renderLeftLine = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('nrgCJTChannel-line');
            oRm.addClass('nrgCJTChannel-line-left');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('</div>');
        };

        CustomRenderer._renderRightLine = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('nrgCJTChannel-line');
            oRm.addClass('nrgCJTChannel-line-right');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('</div>');
        };

        CustomRenderer._renderRightDivider = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('nrgCJTChannel-divider');
            oRm.writeClasses();
            oRm.write('>');

            /* TODO: Render a zig zag icon? */

            oRm.write('</div>');
        };

        return CustomRenderer;
    }
);
