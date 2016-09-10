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
            oRm.addClass('uteAppBodyCnt');

            switch (oCustomControl.getLayout()) {
            case ute.ui.app.BodyContentLayout.FullWidthTool:
                oRm.addClass('uteAppBodyCnt-layout-fullWidthTool');
                break;
            default:
                oRm.addClass('uteAppBodyCnt-layout-default');
            }

            oRm.writeClasses();
            oRm.write('>');

            switch (oCustomControl.getLayout()) {
            case ute.ui.app.BodyContentLayout.FullWidthTool:
                this._renderFullWidthToolLayout(oRm, oCustomControl);
                break;
            default:
                this._renderDefaultLayout(oRm, oCustomControl);
            }

            oRm.write('</div>');
        };

        CustomRenderer._renderGeneral = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-general');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getGeneral().forEach(function (oGeneral) {
                oRm.renderControl(oGeneral);
            }.bind(this));

            oRm.write('</div>');
        };

        CustomRenderer._renderSummary = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-summary');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getSummary().forEach(function (oSummary) {
                oRm.renderControl(oSummary);
            }.bind(this));

            oRm.write('</div>');
        };

        CustomRenderer._renderTool = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-tool');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getTool().forEach(function (oTool) {
                oRm.renderControl(oTool);
            }.bind(this));

            oRm.write('</div>');
        };

        //SHAWN
        CustomRenderer._renderTagline = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-tagline');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getTagline().forEach(function (oTagline) {
                oRm.renderControl(oTagline);
            }.bind(this));

            oRm.write('</div>');
        };

        CustomRenderer._renderFooter = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-footer');
            oRm.writeClasses();
            oRm.write('>');

            oCustomControl.getFooter().forEach(function (oGeneral) {
                oRm.renderControl(oGeneral);
            }.bind(this));

            oRm.write('</div>');
        };

        CustomRenderer._renderDefaultLayout = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-leftSection');
            oRm.writeClasses();
            oRm.write('>');

            this._renderSummary(oRm, oCustomControl);
            this._renderTool(oRm, oCustomControl);

            oRm.write('</div>');

            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-rightSection');
            oRm.writeClasses();
            oRm.write('>');

            this._renderGeneral(oRm, oCustomControl);

            oRm.write('</div>');

            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-footerSection');
            oRm.writeClasses();
            oRm.write('>');

            this._renderFooter(oRm, oCustomControl);

            oRm.write('</div>');
        };

        CustomRenderer._renderFullWidthToolLayout = function (oRm, oCustomControl) {
            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-topSection');
            oRm.writeClasses();
            oRm.write('>');

            this._renderGeneral(oRm, oCustomControl);
            this._renderSummary(oRm, oCustomControl);


            oRm.write('</div>');

            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-bottomSection');
            oRm.writeClasses();
            oRm.write('>');

            this._renderTool(oRm, oCustomControl);
            this._renderTagline(oRm, oCustomControl);

            oRm.write('</div>');

            oRm.write('<div');
            oRm.addClass('uteAppBodyCnt-footerSection');
            oRm.writeClasses();
            oRm.write('>');

            this._renderFooter(oRm, oCustomControl);

            oRm.write('</div>');
        };

        return CustomRenderer;
    },

    true
);
