/*global sap*/
/*jslint nomen: true */

sap.ui.define(
    [
        'jquery.sap.global',
        './DatePicker',
        'ute/ui/commons/TextfieldRenderer'
    ],
	function (jQuery, DatePicker, TextFieldRenderer) {
        'use strict';

        /*
         * DatePickerRenderer is extending TextFieldRenderer
         */
        var DatePickerRenderer = sap.ui.core.Renderer.extend(TextFieldRenderer);

        /**
         * Overriding TextFieldRenderer to include the value attribute to Datepicker.
         *
         * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
         * @param {ute.ui.commons.Textfield} oTextfield an object representation of the control that should be rendered
         */
/*        TextFieldRenderer.render = function (oRm, oTextfield) {
            oRm.write('<span');
            oRm.addClass('uteTextfield');
            oRm.writeClasses();
            oRm.write('>');

            if (oTextfield.getFieldType() === 'Underlined') {
                if (oTextfield.getLabel()) {
                    oRm.write('<label');
                    oRm.addClass('uteTextfield-underlined-label');
                    oRm.writeClasses();
                    oRm.write('>');
                    oRm.write(oTextfield.getLabel() + ':');
                    oRm.write('</label>');
                }
                oRm.write('<input');
                oRm.writeControlData(oTextfield);
                oRm.writeAttribute('id', oTextfield.getId());
                oRm.writeAttribute('name', oTextfield.getName());
                oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                oRm.addStyle('width', oTextfield.getWidth());
                oRm.addClass('uteTextfield-underlined-input');
                oRm.writeStyles();
                oRm.writeClasses();
                oRm.write('>');
            } else {
                oRm.write('<input');
                oRm.writeControlData(oTextfield);
                oRm.writeAttribute('id', oTextfield.getId());
                oRm.writeAttribute('name', oTextfield.getName());
                oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                oRm.writeAttributeEscaped('value', oTextfield.getValue());
                oRm.addStyle('width', oTextfield.getWidth());
                oRm.addClass('uteTextfield-regular');
                oRm.writeStyles();
                oRm.writeClasses();
                oRm.write('>');
            }
            if (this.renderOuterContentBefore) {
                this.renderOuterContentBefore(oRm, oTextfield);
            }

            oRm.write('</span>');
        };*/

        /**
         * DatePickerRenderer Method to include the Icon to launch the Calendar control in the pop-up.
         *
         * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
         * @param {ute.ui.commons.DatePicker} oDatePicker an object representation of the control that should be rendered
         */
        DatePickerRenderer.renderOuterContentBefore = function (oRm, oDatePicker) {
            oRm.write('<div');
            oRm.writeControlData(oDatePicker);
            oRm.writeAttribute('tabindex', '-1'); // to do not close popup by click on it
            oRm.addClass('uteDatePicIcon');
            oRm.writeClasses();
            oRm.write('></div>'); //No Symbol for HCB Theme, as done by ComboBox.

        };

        return DatePickerRenderer;
    },

    true
);
