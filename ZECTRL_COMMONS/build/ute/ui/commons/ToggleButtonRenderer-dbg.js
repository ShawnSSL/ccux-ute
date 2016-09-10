/*globals sap*/
/*jslint nomen:true*/
/*jslint regexp: true*/
sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
        "use strict";

        var ToggleButtonRenderer = {},
            bUseIconFont;

        ToggleButtonRenderer.render = function (rm, oToggleButton) {
            rm.write('<div');
            rm.writeControlData(oToggleButton);
            rm.addStyle('width', this._calTotalWidth(oToggleButton));
            if (oToggleButton.getHeight()) {
                rm.addStyle('height', oToggleButton.getHeight());
            }
            switch (oToggleButton.getDesign()) {
            case 'ToggleCampaign':
                rm.addClass('uteToggleBtn1');
                rm.writeStyles();
                rm.writeClasses();
                rm.write(">");

                rm.write("<input id=\"__leftBt\" type=\"button\" width=\"500px\" value=\"" + oToggleButton.getLeftBtnText() + "\"");
                if (oToggleButton.getLeftSelected()) {
                    rm.addClass('uteToggleBtn1-leftBtn-selected');
                } else {
                    rm.addClass('uteToggleBtn1-leftBtn');
                }
                rm.addStyle("width", oToggleButton.getLeftBtnWidth());
                rm.writeStyles();
                rm.writeClasses();
                rm.write(">");
                rm.write("<input id=\"__rightBt\" type=\"button\" value=\"" + oToggleButton.getRightBtnText() + "\"");
                if (oToggleButton.getLeftSelected()) {
                    rm.addClass("uteToggleBtn1-rightBtn");
                } else {
                    rm.addClass('uteToggleBtn1-rightBtn-selected');
                }
                rm.addStyle("width", oToggleButton.getRightBtnWidth());
                rm.writeStyles();
                rm.writeClasses();
                rm.write(">");
                break;
            case 'ToggleDashboard':
                rm.addClass('uteToggleBtn2');
                rm.writeStyles();
                rm.writeClasses();
                rm.write(">");

                rm.write("<input id=\"__leftBt\" type=\"button\" width=\"500px\" value=\"" + oToggleButton.getLeftBtnText() + "\"");
                if (oToggleButton.getLeftSelected()) {
                    rm.addClass('uteToggleBtn2-leftBtn-selected');
                } else {
                    rm.addClass('uteToggleBtn2-leftBtn');
                }
                rm.addStyle("width", oToggleButton.getLeftBtnWidth());
                rm.writeStyles();
                rm.writeClasses();
                rm.write(">");
                rm.write("<input id=\"__rightBt\" type=\"button\" value=\"" + oToggleButton.getRightBtnText() + "\"");
                if (oToggleButton.getLeftSelected()) {
                    rm.addClass("uteToggleBtn2-rightBtn");
                } else {
                    rm.addClass('uteToggleBtn2-rightBtn-selected');
                }
                rm.addStyle("width", oToggleButton.getRightBtnWidth());
                rm.writeStyles();
                rm.writeClasses();
                rm.write(">");
                break;
            }


            rm.write("</div>");
            //rm.addClass("
        };

        ToggleButtonRenderer._calTotalWidth = function (oToggleButton) {
            var leftButtonNum = parseInt(oToggleButton.getLeftBtnWidth().replace(/\D/g, ''), 10),
                rightButtonNum =  parseInt(oToggleButton.getRightBtnWidth().replace(/\D/g, ''), 10),
                widthUnit =  oToggleButton.getLeftBtnWidth().replace(/[^A-Za-z]/g, ""),
                totalWidth;

            totalWidth = String((leftButtonNum + rightButtonNum + 5)) + widthUnit;
            return totalWidth;
        };


        ToggleButtonRenderer.toggle = function (oToggleButton) {

            switch (oToggleButton.getDesign()) {
            case 'ToggleCampaign':
                if (oToggleButton.$().children().first().attr('class') === "uteToggleBtn1-leftBtn-selected") {

                    oToggleButton.$().children().first().removeClass("uteToggleBtn1-leftBtn-selected");
                    oToggleButton.$().children().first().addClass("uteToggleBtn1-leftBtn");

                    oToggleButton.$().children().first().next().removeClass("uteToggleBtn1-rightBtn");
                    oToggleButton.$().children().first().next().addClass("uteToggleBtn1-rightBtn-selected");

                } else {
                    oToggleButton.$().children().first().removeClass("uteToggleBtn1-leftBtn");
                    oToggleButton.$().children().first().addClass("uteToggleBtn1-leftBtn-selected");

                    oToggleButton.$().children().first().next().removeClass("uteToggleBtn1-rightBtn-selected");
                    oToggleButton.$().children().first().next().addClass("uteToggleBtn1-rightBtn");
                }
                break;
            case 'ToggleDashboard':
                if (oToggleButton.$().children().first().attr('class') === "uteToggleBtn2-leftBtn-selected") {

                    oToggleButton.$().children().first().removeClass("uteToggleBtn2-leftBtn-selected");
                    oToggleButton.$().children().first().addClass("uteToggleBtn2-leftBtn");

                    oToggleButton.$().children().first().next().removeClass("uteToggleBtn2-rightBtn");
                    oToggleButton.$().children().first().next().addClass("uteToggleBtn2-rightBtn-selected");

                } else {
                    oToggleButton.$().children().first().removeClass("uteToggleBtn2-leftBtn");
                    oToggleButton.$().children().first().addClass("uteToggleBtn2-leftBtn-selected");

                    oToggleButton.$().children().first().next().removeClass("uteToggleBtn2-rightBtn-selected");
                    oToggleButton.$().children().first().next().addClass("uteToggleBtn2-rightBtn");
                }
                break;
            }


        };

        return ToggleButtonRenderer;

    }, /* bExport= */ true);
