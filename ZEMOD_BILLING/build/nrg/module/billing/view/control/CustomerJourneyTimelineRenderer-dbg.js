/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/module/billing/view/control/CustomerJourneyTimelineChannel'
    ],

    function (CJTChannel) {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeControlData(oCustomControl);
            oRm.addClass('nrgCJT');
            oRm.writeClasses();
            oRm.write('>');

            this._renderNavBack(oRm, oCustomControl);
            this._renderChannel(oRm, oCustomControl);
            this._renderNavForward(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderChannel = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeAttribute('id', oCustomControl.getId() + '-channelContainer');
            oRm.addClass('nrgCJT-channelContainer');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getChannel().forEach(function (oChannel) {
                oRm.renderControl(oChannel);
            }, this);

            oRm.write('</div>');
        };

        CustomRenderer._renderNavBack = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeAttribute('id', oCustomControl.getId() + '-navBack');
            oRm.addClass('nrgCJT-navBack');
            oRm.writeClasses();
            oRm.write('>');

            oRm.writeIcon('sap-icon://navigation-left-arrow');

            oRm.write('</div>');
        };

        CustomRenderer._renderNavForward = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.writeAttribute('id', oCustomControl.getId() + '-navForward');
            oRm.addClass('nrgCJT-navForward');
            oRm.writeClasses();
            oRm.write('>');

            oRm.writeIcon('sap-icon://navigation-right-arrow');

            oRm.write('</div>');
        };

        return CustomRenderer;
    }
);
