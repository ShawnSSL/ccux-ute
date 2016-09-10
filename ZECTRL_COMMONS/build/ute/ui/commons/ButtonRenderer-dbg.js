/*globals sap*/

sap.ui.define(
    [
        'jquery.sap.global'
    ],

	function (jQuery) {
        'use strict';

        var ButtonRenderer = {};

        ButtonRenderer.render = function (rm, oButton) {
            //Add Button
            rm.write('<Button');
            rm.writeControlData(oButton);
            rm.addClass('uteBtn');
            switch (oButton.getButtonType()) {
            case 'GeneralAction':
                rm.addClass('uteBtn-general uteBtn-general-action');
                break;
            case 'GeneralCancel':
                rm.addClass('uteBtn-general uteBtn-general-cancel');
                break;
            case 'GeneralInfo':
                rm.addClass('uteBtn-general uteBtn-general-info');
                break;
            case 'SpecialNav':
                rm.addClass('uteBtn-special uteBtn-general-nav');
                break;
            case 'SpecialCalculator':
                rm.addClass('uteBtn-special uteBtn-general-calculator');
                break;
            }
            if (oButton.getWidth()) {
                rm.addStyle('width', oButton.getWidth());
            }
            if (oButton.getHeight()) {
                rm.addStyle('height', oButton.getHeight());
            }
            rm.writeStyles();
            rm.writeClasses();
            if (!oButton.getEnabled()) {
                rm.write('disabled');
            }
            if (!oButton.getEnabled()) {
                rm.write(" tabIndex=\"-1\"");
            } else {
                rm.write(" tabIndex=\"0\"");
            }
            rm.write('>');

            rm.write(oButton.getText());
            rm.write('</Button>');
        };

        return ButtonRenderer;
    },

    true
);

/*
            rm.addClass("sapUiBtn");




            // button is rendered as a "<button>" element
            rm.write("<button type=\"button\""); // otherwise this turns into a submit button in IE8
            rm.writeControlData(oButton);
            if (oButton.getTooltip_AsString()) {
                rm.writeAttributeEscaped("title", oButton.getTooltip_AsString());
            }

            switch (oButton.getuteDesign()) {

            case "Button1":
                rm.addClass("uteUiBtns uteUiBtn1");
                // If button is disabled
                if (!oButton.getEnabled()) {
                    rm.write(" tabIndex=\"-1\"");
                    rm.addClass("uteUiBtnInact");
                } else {
                    rm.write(" tabIndex=\"0\"");
                    rm.addClass("uteUiBtns");
                }
                break;
            case "Button2":
                rm.addClass("uteUiBtns uteUiBtn2");
                break;
            case "Button3":
                rm.addClass("uteUiBtns uteUiBtn3");
                break;
            case "Button4":
                rm.addClass("uteUiBtns uteUiBtn4");
                break;
            default:
                rm.addClass("uteUiBtns uteUiBtn1");
            }


            //ARIA
            rm.writeAccessibilityState(oButton, {
                role: 'button',
                disabled: !oButton.getEnabled()
            });


            var bImageOnly = false;
            if (!oButton.getText() && oButton.getIcon()) { // icon, but no text => reduce padding
                rm.addClass("sapUiBtnIconOnly");
                bImageOnly = true; // only the image is there, so it must have some meaning
            }

            if (oButton.getWidth() && oButton.getWidth() !== '') {
                rm.addStyle("width", oButton.getWidth());
                rm.addClass("sapUiBtnFixedWidth");
            }
            if (oButton.getHeight() && oButton.getHeight() !== '') {
                rm.addStyle("height", oButton.getHeight());
            }
            rm.writeStyles();

            if (this.renderButtonAttributes) {
                this.renderButtonAttributes(rm, oButton);
            }

            // feature-dependent CSS class, written for browsers not understanding CSS gradients (=IE8, IE9)
            // required to avoid a large number of browser selectors which is needed to NOT serve filter:... to IE10
            if (!!sap.ui.Device.browser.internet_explorer && (!document.documentMode || document.documentMode < 10)) {
                rm.addClass("sapUiBtnNoGradient");
            }

            rm.writeClasses();

            rm.write(">");


            if (this.renderButtonContentBefore) {
                this.renderButtonContentBefore(rm, oButton);
            }

            bUseIconFont = false;
            if (sap.ui.core.IconPool.isIconURI(oButton.getIcon())) {
                bUseIconFont = true;
            }
            if (oButton.getIconFirst()) {
                if (bUseIconFont) {
                    this.writeIconHtml(rm, oButton, bImageOnly);
                } else if (this._getIconForState(oButton, "base")) {
                    this.writeImgHtml(rm, oButton, bImageOnly);
                }
            }

            // write the button label
            if (oButton.getText()) {
                if (!oButton.getIcon() && !this.renderButtonContentBefore && !this.renderButtonContentAfter) {
                    rm.writeEscaped(oButton.getText());
                } else { // if there is an icon, an additional span is required
                    rm.write("<span class=\"sapUiBtnTxt\">");
                    rm.writeEscaped(oButton.getText());
                    rm.write("</span>");
                }
            }

            if (!oButton.getIconFirst()) {
                if (bUseIconFont) {
                    this.writeIconHtml(rm, oButton, bImageOnly);
                } else if (this._getIconForState(oButton, "base")) {
                    this.writeImgHtml(rm, oButton, bImageOnly);
                }
            }

            if (this.renderButtonContentAfter) {
                this.renderButtonContentAfter(rm, oButton);
            }


            if (oButton.getuteDesign() === "Button4") {

                var width = oButton.getUteSvgIconWidth(), height = oButton.getUteSvgIconHeight();

                if (!width || width === '') {
                    width = "12px";
                }
                if (!height || height === '') {
                    height = "25px";
                }

                // SVG path for the Refresh Icon
                var svgPath =  "M482.282,440.902L612,291.229h-89.805c-9.978-136.37-123.064-242.805-259.435-242.805                 C116.413,48.424,0,164.837,0,311.185s116.413,262.761,262.761,262.761c59.87,0,113.087-19.956,159.652-56.543l9.979-6.652 l-59.87-63.195l-6.652,6.651c-29.935,23.283-66.521,33.262-103.108,33.262c-96.457,0-176.283-79.827-176.283-176.283 s79.826-176.282,176.283-176.282c89.805,0,166.305,69.848,172.957,156.326h-99.783L482.282,440.902z";

                rm.write("<svg");
                rm.addClass("uteUiBtn4Icon");
                rm.writeClasses();
                rm.writeAttribute("width", width);
                rm.writeAttribute("height", height);
                rm.writeAttribute("viewBox", "0 48.424 612 525.521");
                rm.writeAttribute("xml:space", "preserve");
                rm.write(">");
                rm.write("<path");
                rm.writeAttribute("d", svgPath);
                rm.write("/>");
                rm.write("</svg>");
            }



            // close button
            rm.write("</button>");
        };


        ButtonRenderer.onactive = function (oButton) {
            oButton.$().addClass("sapUiBtnAct").removeClass("sapUiBtnStd");
            oButton.$("img").attr("src", this._getIconForState(oButton, "active"));
        };
        ButtonRenderer.ondeactive = function (oButton) {
            oButton.$().addClass("sapUiBtnStd").removeClass("sapUiBtnAct");
            oButton.$("img").attr("src", this._getIconForState(oButton, "deactive"));
        };

        ButtonRenderer.onblur = function (oButton) {
            oButton.$().removeClass("sapUiBtnFoc");
            oButton.$("img").attr("src", this._getIconForState(oButton, "blur"));
            if (!!sap.ui.Device.browser.internet_explorer) {
                ButtonRenderer.onmouseout(oButton);
            }
        };

        ButtonRenderer.onfocus = function (oButton) {
            oButton.$().addClass("sapUiBtnFoc");
            oButton.$("img").attr("src", this._getIconForState(oButton, "focus"));

        };

        ButtonRenderer.onmouseout = function (oButton) {
            oButton.$().removeClass("sapUiBtnAct");
            oButton.$().addClass("sapUiBtnStd");
            oButton.$("img").attr("src", this._getIconForState(oButton, "mouseout"));
        };


        ButtonRenderer.onmouseover = function (oButton) {

            oButton.$("img").attr("src", this._getIconForState(oButton, "mouseover"));

        };


        ButtonRenderer._getIconForState = function (oButton, sState) {
            var sIcon;

            if (!oButton.getEnabled()) {
                sState = "disabled";
            }
            switch (sState) {
            case "focus":
            case "blur":
            case "base":
                if (oButton.$().hasClass("sapUiBtnAct")) {
                    sIcon = oButton.getIconSelected() || oButton.getIconHovered();
                    return sIcon ? sIcon : oButton.getIcon();
                } else if (oButton.$().hasClass("sapUiBtnFoc")) {
                    return oButton.getIconHovered() || oButton.getIcon();
                }
                return oButton.getIcon();
            case "mouseout":
                if (oButton.$().hasClass("sapUiBtnFoc")) {
                    return oButton.getIconHovered() || oButton.getIcon();
                }
                return oButton.getIcon();
            case "active":
                sIcon = oButton.getIconSelected() || oButton.getIconHovered();
                return sIcon ? sIcon : oButton.getIcon();
            case "mouseover":
            case "deactive":
                sIcon = oButton.getIconHovered();
                return sIcon ? sIcon : oButton.getIcon();
            }
            return oButton.getIcon();
        };


        ButtonRenderer.writeImgHtml = function (oRenderManager, oButton, bImageOnly) {
            var rm = oRenderManager,
                iconUrl = this._getIconForState(oButton, "base");

            rm.write("<img");
            rm.writeAttribute("id", oButton.getId() + "-img");
            rm.writeAttributeEscaped("src", iconUrl);
            if (oButton.getTooltip_AsString() && !oButton.getText()) {
                rm.writeAttributeEscaped("alt", oButton.getTooltip_AsString());
            } else {
                rm.writeAttribute("alt", ""); // there must be an ALT attribute
            }

            if (!bImageOnly) {
                rm.writeAttribute("role", "presentation");
            }

            rm.addClass("sapUiBtnIco");
            if (oButton.getText()) { // only add a distance to the text if there is text
                if (oButton.getIconFirst()) {
                    rm.addClass("sapUiBtnIcoL");
                } else {
                    rm.addClass("sapUiBtnIcoR");
                }
            }
            rm.writeClasses();

            rm.write("/>");
        };

        ButtonRenderer.writeIconHtml = function (oRenderManager, oButton, bImageOnly) {

            var rm = oRenderManager;
            var oIconInfo = sap.ui.core.IconPool.getIconInfo(oButton.getIcon());
            var aClasses = [];
            var mAttributes = {};

            mAttributes.id = oButton.getId() + "-icon";

            aClasses.push("sapUiBtnIco");
            if (oButton.getText()) { // only add a distance to the text if there is text
                var bRTL = rm.getConfiguration().getRTL();
                if ((oButton.getIconFirst() && (!bRTL || oIconInfo.skipMirroring)) || (!oButton.getIconFirst() && !oIconInfo.skipMirroring && bRTL)) {
                    aClasses.push("sapUiBtnIcoL");
                } else {
                    aClasses.push("sapUiBtnIcoR");
                }
            }

            rm.writeIcon(oButton.getIcon(), aClasses, mAttributes);

        };

        ButtonRenderer.changeIcon = function (oButton) {

            if (sap.ui.core.IconPool.isIconURI(oButton.getIcon())) {
                var oIconInfo = sap.ui.core.IconPool.getIconInfo(oButton.getIcon());
                var oIcon = oButton.$("icon");
                if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 9) {
                    oIcon.text(oIconInfo.content);
                } else {
                    oIcon.attr("data-sap-ui-icon-content", oIconInfo.content);
                }
                if (!oIconInfo.skipMirroring) {
                    oIcon.addClass("sapUiIconMirrorInRTL");
                } else {
                    oIcon.removeClass("sapUiIconMirrorInRTL");
                }
            } else if (oButton.$().hasClass("sapUiBtnAct")) {
                oButton.$("img").attr("src", this._getIconForState(oButton, "active"));
            } else if (oButton.$().hasClass("sapUiBtnFoc")) {
                oButton.$("img").attr("src", this._getIconForState(oButton, "focus"));
            } else if (oButton.$().hasClass("sapUiBtnStd")) {
                oButton.$("img").attr("src", this._getIconForState(oButton, "base"));
            }

        };

*/
