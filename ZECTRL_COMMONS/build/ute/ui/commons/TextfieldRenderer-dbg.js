/*global sap*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Renderer',
        'sap/ui/core/ValueStateSupport'
    ],

	function (jQuery, Renderer, ValueStateSupport) {
        'use strict';

	    var TextfieldRenderer = {};


	    TextfieldRenderer.render = function (oRm, oTextfield) {
            //var bRenderOuter = oTextField._getRenderOuter();
            var tooltip = ValueStateSupport.enrichTooltip(oTextfield, oTextfield.getTooltip());

            oRm.write('<span');
            oRm.writeControlData(oTextfield);
            oRm.addClass('uteTextfield');
            if (oTextfield.getFieldType() === 'Noborder') {
                oRm.addClass('uteTextfield-noBorder');
            }
            if (oTextfield.getFieldType() === 'Float') {
                oRm.addClass('uteTextfield-float');
                oRm.addStyle('width', oTextfield.getWidth());
                oRm.writeStyles();
            }
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
                //oRm.write('<input');
                // Inner tag / pure TextField
                if (this.getInnerTagName) {
                    oRm.write('<' + this.getInnerTagName());
                } else {
                    oRm.write("<input");
                }
                //oRm.writeControlData(oTextfield);
                oRm.writeAttribute('id', oTextfield.getId() + '-input');
                //oRm.writeAttribute('id', oTextfield.getId());
                if (oTextfield.getName()) {
                    oRm.writeAttribute('name', oTextfield.getName());
                }

                if (!oTextfield.getEditable()) {
                    oRm.writeAttribute('readonly', '');
                    oRm.writeAttribute('disabled', '');
                }
                if (tooltip) {
				    oRm.writeAttributeEscaped('title', tooltip);
			    }
/*                if (oTextfield.getValue()) {
                    oRm.writeAttribute('value', oTextfield.getValue());
                } else {
                    oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                }*/
                if (oTextfield.getMaxLength()) {
			        oRm.writeAttribute("maxLength", oTextfield.getMaxLength());
		        }
                // Add additional attributes, styles and so on (TextArea)
                if (this.renderInnerAttributes) {
                    this.renderInnerAttributes(oRm, oTextfield);
                }
                oRm.addStyle('width', oTextfield.getWidth());
                oRm.addClass('uteTextfield-underlined-input');
                oRm.writeStyles();
                oRm.writeClasses();
                //oRm.write('>');
                if (this.getInnerTagName) {
                    oRm.write(">");
                } else {
                    if (oTextfield.getValue()) {
                        oRm.writeAttribute('value', oTextfield.getValue());
                    } else {
                        oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                    }
                    oRm.write("\"");
                    oRm.write("/>");
                }
                if (this.getInnerTagName) {
                    // Inner hook
                    if (this.renderInnerContent) {
                        this.renderInnerContent(oRm, oTextfield);
                    }

                    oRm.write('</' + this.getInnerTagName() + '>');
                }
            } else if (oTextfield.getFieldType() === 'Noborder') {
                //oRm.write('<input');
                // Inner tag / pure TextField
                if (this.getInnerTagName) {
                    oRm.write('<' + this.getInnerTagName());
                } else {
                    oRm.write("<input");
                }
                //oRm.writeControlData(oTextfield);
                oRm.writeAttribute('id', oTextfield.getId() + '-input');
                if (oTextfield.getName()) {
                    oRm.writeAttribute('name', oTextfield.getName());
                }
/*                if (oTextfield.getValue()) {
                    oRm.writeAttribute('value', oTextfield.getValue());
                } else {
                    oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                }*/
                if (!oTextfield.getEditable()) {
                    oRm.writeAttribute('readonly', '');
                    oRm.writeAttribute('disabled', '');
                }
                if (tooltip) {
				    oRm.writeAttributeEscaped('title', tooltip);
			    }
                if (oTextfield.getMaxLength()) {
			        oRm.writeAttribute("maxLength", oTextfield.getMaxLength());
		        }
                // Add additional attributes, styles and so on (TextArea)
                if (this.renderInnerAttributes) {
                    this.renderInnerAttributes(oRm, oTextfield);
                }
                oRm.addStyle('width', 'auto');
                oRm.addClass('uteTextfield-noBorder-input');
                oRm.writeStyles();
                oRm.writeClasses();
                //oRm.write('>');
                if (this.getInnerTagName) {
                    oRm.write(">");
                } else {
                    if (oTextfield.getValue()) {
                        oRm.writeAttribute('value', oTextfield.getValue());
                    } else {
                        oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                    }
                    oRm.write("\"");
                    oRm.write("/>");
                }
                if (this.getInnerTagName) {
                    // Inner hook
                    if (this.renderInnerContent) {
                        this.renderInnerContent(oRm, oTextfield);
                    }

                    oRm.write('</' + this.getInnerTagName() + '>');
                }
            } else if (oTextfield.getFieldType() === 'Float') {
                //oRm.write('<input');
                // Inner tag / pure TextField
                if (this.getInnerTagName) {
                    oRm.write('<' + this.getInnerTagName());
                } else {
                    oRm.write("<input");
                }
                // Attributes
                oRm.writeAttribute('id', oTextfield.getId() + '-input');
                if (oTextfield.getName()) {
                    oRm.writeAttribute('name', oTextfield.getName());
                }
                oRm.writeAttribute('required', 'required');
                if (oTextfield.getValue()) {
                    oRm.writeAttribute('value', oTextfield.getValue());
                }
                if (!oTextfield.getEditable()) {
                    oRm.writeAttribute('readonly', '');
                    oRm.writeAttribute('disabled', '');
                }
                if (tooltip) {
				    oRm.writeAttributeEscaped('title', tooltip);
			    }
                if (oTextfield.getMaxLength()) {
                    oRm.writeAttribute("maxLength", oTextfield.getMaxLength());
                }
                // Add additional attributes, styles and so on (TextArea)
                if (this.renderInnerAttributes) {
                    this.renderInnerAttributes(oRm, oTextfield);
                }
                oRm.addClass('uteTextfield-float-input');
                oRm.writeClasses();
                //oRm.write('>');
                if (this.getInnerTagName) {
                    oRm.write(">");
                } else {
                    if (oTextfield.getValue()) {
                        oRm.writeAttribute('value', oTextfield.getValue());
                    }
                    oRm.write("\"");
                    oRm.write("/>");
                }
                if (this.getInnerTagName) {
                    // Inner hook
                    if (this.renderInnerContent) {
                        this.renderInnerContent(oRm, oTextfield);
                    }

                    oRm.write('</' + this.getInnerTagName() + '>');
                }
                // Implement Placeholder
                if (oTextfield.getPlaceholder()) {
                    oRm.write('<label');
                    oRm.writeAttribute('for', oTextfield.getName());
                    oRm.addClass('uteTextfield-float-label');
                    oRm.writeClasses();
                    oRm.write('>');
                    oRm.write(oTextfield.getPlaceholder());
                    oRm.write('</label>');
                }
            } else {       //default situation, so not specified as type "underlined"
                //oRm.write('<input');
                // Inner tag / pure TextField
                if (this.getInnerTagName) {
                    oRm.write('<' + this.getInnerTagName());
                } else {
                    oRm.write("<input");
                }
                //oRm.writeControlData(oTextfield);
                oRm.writeAttribute('id', oTextfield.getId() + '-input');
                //oRm.writeAttribute('id', oTextfield.getId());
                if (oTextfield.getName()) {
                    oRm.writeAttribute('name', oTextfield.getName());
                }
                if (oTextfield.getValue()) {
                    oRm.writeAttribute('value', oTextfield.getValue());
                } else {
                    oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                }
                if (!oTextfield.getEditable()) {
                    oRm.writeAttribute('readonly', '');
                    oRm.writeAttribute('disabled', '');
                }
                if (tooltip) {
				    oRm.writeAttributeEscaped('title', tooltip);
			    }
                if (oTextfield.getMaxLength()) {
			        oRm.writeAttribute("maxLength", oTextfield.getMaxLength());
		        }
                // Add additional attributes, styles and so on (TextArea)
                if (this.renderInnerAttributes) {
                    this.renderInnerAttributes(oRm, oTextfield);
                }
                oRm.addStyle('width', oTextfield.getWidth());
                oRm.addClass('uteTextfield-regular');
                oRm.writeStyles();
                oRm.writeClasses();
                //oRm.write('>');
                if (this.getInnerTagName) {
                    oRm.write(">");
                } else {
                    if (oTextfield.getValue()) {
                        oRm.writeAttribute('value', oTextfield.getValue());
                    } else {
                        oRm.writeAttribute('placeholder', oTextfield.getPlaceholder());
                    }
                    oRm.write("\"");
                    oRm.write("/>");
                }
                if (this.getInnerTagName) {
                    // Inner hook
                    if (this.renderInnerContent) {
                        this.renderInnerContent(oRm, oTextfield);
                    }

                    oRm.write('</' + this.getInnerTagName() + '>');
                }
            }

            if (this.renderOuterContentBefore) {
                this.renderOuterContentBefore(oRm, oTextfield);
            }

            oRm.write('</span>');
        };


	    return TextfieldRenderer;

    },

    true
);
