/*global sap*/

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/core/ValueStateSupport'],
    function (jQuery, Renderer, ValueStateSupport) {
        "use strict";
        var DropdownRenderer = {},
            i,
            j,
            oContent,
            height,
            scrollHeight;

        DropdownRenderer.render = function (oRm, oDropdown) {

            oRm.write('<div');
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('<ul');
            oRm.writeControlData(oDropdown);
            oRm.writeAttributeEscaped("id", 'dd');
            oRm.addClass('uteDD');

            switch (oDropdown.getArrowType()) {
            case 'Solid':
                oRm.addClass('uteDD-arrow-solid');
                break;
            case 'Hollow':
                oRm.addClass('uteDD-arrow-hollow');
                break;
            }

            switch (oDropdown.getBorder()) {
            case 'All':
                oRm.addClass('uteDD-with-border');
                break;
            case 'Bottom':
                oRm.addClass('uteDD-with-border-bottom');
                break;
            case 'None':
                oRm.addClass('uteDD-with-border-none');
                break;
            }

            if (oDropdown.getEnabled()) {
                switch (oDropdown.getBackground()) {
                case 'White':
                    oRm.addClass('uteDD-background-white');
                    break;
                case 'Transparent':
                    break;
                }
            } else {
                oRm.addClass('uteDD-background-grey');
            }

            switch (oDropdown.getArrowcolor()) {
            case 'Blue':
                oRm.addClass('uteDD-arrow-blue');
                break;
            case 'Grey':
                oRm.addClass('uteDD-arrow-grey');
                break;
            }

            oRm.writeClasses();

            if (oDropdown.getWidth()) {
                oRm.addStyle('width', oDropdown.getWidth());
            }
            if (oDropdown.getPadding()) {
                oRm.addStyle('padding', oDropdown.getPadding());
            }
            oRm.writeStyles();
            oRm.write('>');

            oRm.write('<a');
            oRm.addClass('uteDD-value');
            oRm.write('>');
            if (oDropdown.getValue() === '') {
                oRm.writeEscaped(oDropdown.getTitle());
            } else {
                oRm.writeEscaped(oDropdown.getValue());
            }
            oRm.write('</a>');
            if (oDropdown.getEnabled()) {

                oRm.write('<ul');
                oRm.addClass('uteDD-list');

                oRm.addStyle('top', this.calTop(oDropdown));
                oRm.addStyle('overflow-x', 'hidden');
                height = oDropdown.getMaxItems();
                height = (height * 100 / 3);
                scrollHeight = (height.toString()).concat('px');
                oRm.addStyle('height', scrollHeight);
                oRm.writeStyles();
                if (oDropdown.getBorder() === 'All') {
                    oRm.addClass('uteDD-list-with-border');
                }
                switch (oDropdown.getBorder()) {
                case 'All':
                    oRm.addClass('uteDD-list-with-border');
                    break;
                case 'Bottom':
                case 'None':
                    break;
                }

                switch (oDropdown.getBackground()) {
                case 'White':
                    oRm.addClass('uteDD-list-white-background');
                    break;
                case 'Transparent':
                    break;
                }

                oRm.writeClasses();

                oRm.write('>');
                for (i = 0; i < oDropdown.getDropdownListItems().length; i += 1) {
                    var oItem = oDropdown.getDropdownListItems()[i];
                    oRm.write("<li");

                    switch (oDropdown.getArrowcolor()) {
                    case 'Blue':
                        oRm.addClass('uteDD-list-hover-blue');
                        break;
                    case 'Grey':
                        oRm.addClass('uteDD-list-hover-grey');
                        break;
                    }
                    oRm.writeClasses();
                    oRm.write('>');

                    oRm.write('<a>');

                    for (j = 0; j < oItem.getContent().length; j += 1) {
                        oContent = oItem.getContent()[j];
                        oRm.renderControl(oContent);
                    }
                    oRm.write('</a>');

                    oRm.write('</li>');
                }
                oRm.write("</ul>");

            }
            oRm.write("</ul>");
            oRm.write('</div>');


        };
        DropdownRenderer.calTop = function (oDropdown) {
            var top = parseInt(oDropdown.getPadding().replace(/\D/g, ''), 10),
                totalTop;

            totalTop = String((top + 110)) + "%";

            return totalTop;
        };

        return DropdownRenderer;
    },

    true
    );


