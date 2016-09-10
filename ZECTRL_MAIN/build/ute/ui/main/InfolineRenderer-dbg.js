/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('uteMIl');

            if (oCustomControl.getDesign() !== ute.ui.main.InfolineDesign.None) {
                oRm.addClass('uteMIl-design-' + oCustomControl.getDesign().toLowerCase());
            }

            oRm.writeClasses();
            oRm.write('>');

            if (oCustomControl.getReverse()) {
                this._addContent(oRm, oCustomControl);
                this._addHeader(oRm, oCustomControl);
            } else {
                this._addHeader(oRm, oCustomControl);
                this._addContent(oRm, oCustomControl);
            }

            oRm.write('</div>');
        };

        CustomRenderer._addHeader = function (oRm, oCustomControl) {
            oRm.write('<header');
            oRm.addClass('uteMIl-hdr');
            oRm.writeClasses();
            oRm.write('>');

            this._addHeaderContent(oRm, oCustomControl);
            this._addHeaderExpander(oRm, oCustomControl);

            oRm.write('</header>');
        };

        CustomRenderer._addHeaderExpander = function (oRm, oCustomControl) {
            var oHdrExpander;

            oRm.write('<aside');
            oRm.addClass('uteMIl-hdrExpander');
            oRm.writeClasses();
            oRm.write('>');

            oHdrExpander = oCustomControl.getAggregation('_headerExpander');
            oHdrExpander.addStyleClass('uteMIl-hdrExpanderDesign-' + oCustomControl.getDesign().toLowerCase());

            oRm.renderControl(oHdrExpander);

            oRm.write('</aside>');
        };

        CustomRenderer._addHeaderContent = function (oRm, oCustomControl) {
            var aHdrContent;

            oRm.write('<article');
            oRm.addClass('uteMIl-hdrContent');
            oRm.writeClasses();
            oRm.write('>');

            aHdrContent = oCustomControl.getHeaderContent();
            if (aHdrContent) {
                aHdrContent.forEach(function (oHdrContent) {
                    oRm.renderControl(oHdrContent);
                });
            }

            oRm.write('</article>');
        };

        CustomRenderer._addContent = function (oRm, oCustomControl) {
            var aContent;

            oRm.write('<section');
            oRm.addClass('uteMIl-body');

            if (!oCustomControl.getExpanded()) {
                oRm.addClass('uteMIl-body-hidden');
            }

            oRm.writeClasses();
            oRm.write('>');

            aContent = oCustomControl.getContent();
            if (aContent) {
                aContent.forEach(function (oContent) {
                    oRm.renderControl(oContent);
                });
            }

            oRm.write('</section>');
        };

        return CustomRenderer;
    },

    true
);
