/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [],

    function () {
        'use strict';

        var CustomRenderer = {};

        CustomRenderer.render = function (oRm, oCustomControl) {
            var sTag = oCustomControl.getType() === ute.ui.app.TagType.Block ? 'div' : 'span';

            oRm.write('<' + sTag);
            oRm.writeControlData(oCustomControl);
            oRm.writeClasses();
            oRm.write('>');

            this._renderContent(oRm, oCustomControl);

            oRm.write('</' + sTag + '>');
        };

        CustomRenderer._renderContent = function (oRm, oCustomControl) {
            oCustomControl.getContent().forEach(function (oContent) {
                oRm.renderControl(oContent);
            }.bind(this));
        };

        return CustomRenderer;
    },

    true
);
