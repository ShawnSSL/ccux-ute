/*global sap*/
/*jslint nomen:true*/
/*jslint regexp: true*/



sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/ValueStateSupport'],
	function (jQuery, library, Control, ValueStateSupport) {
        "use strict";

        var Textfield = Control.extend("ute.ui.commons.Textfield", { metadata : {
            library : "ute.ui.commons",

            properties : {
                //Value the textfield bind with
                value : {type : "string", group : "Data", defaultValue : '', bindable : "bindable"},

                //Not implemented, if enabled = false will grey out
                enabled : {type : "boolean", group : "Behavior", defaultValue : true},

                //If false the textfield is not editable
                editable : {type : "boolean", group : "Behavior", defaultValue : true},

                //CSS type width of the Textfield, the min width is set to 168px.
                width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "200px" },

                maxLength : {type : "int", group : "Behavior", defaultValue : 0},

                //name attribute in HTML
                name : {type : "string", group : "Misc", defaultValue : null},

                //title attribute in HTML
                tooltip : {type : "string", group : "Misc", defaultValue : null, bindable : "bindable"},

                //Placeholder value of a string before the input
                placeholder : {type : "string", group : "Appearance", defaultValue : null},


                fieldType : { type: "ute.ui.commons.TextfieldType", group: "Appearance", defaultValue: "Regular" },
                //Two types of inputs, one is "field1" and the other is "field2""

                label: { type: "string", group: "Appearance", defaultvalue: null },

                //check if it restricts to numeric/ decimal / string
                valueType : {type : "string", group : "Data", defaultValue : 'S'}
            },
            events : {
                /*Fired when textfield is edit*/
                change : {
                    parameters : {
                        /*The new / changed value of the textfield.*/
                        newValue : {type : "string"}
                    }
                },
                // Fired when the enter key got clicked 
                enterKeyPress : {},

                // Fired when the textfield is focused
                focusIn : {},
                liveChange : {
                    parameters : {

                        /**
                         * Current visible value of the <code>TextField</code>.
                         */
                        liveValue : {type : "string"}
                    }
			    }
            }
        }
            });
        /**
         * Handles the change event.
         *
         * @protected
         * @param {object} oEvent
         * @returns {true|undefined} true when change event is fired
         */
        Textfield.prototype.onChange = function (oEvent) {
            this._checkChange(oEvent);

            oEvent.preventDefault();
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }

        };

        //0714206 Add this event listener for 1.3X UI5 version update
        Textfield.prototype.onfocusout = function (oEvent) {
            this._checkChange(oEvent);

            oEvent.preventDefault();
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }
        };

        Textfield.prototype.onsapfocusleave = function (oEvent) {

            this._checkChange(oEvent);

            oEvent.preventDefault();
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }
        };

        Textfield.prototype.onfocusin = function (oEvent) {
            oEvent.preventDefault();
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }

            this.fireFocusIn(oEvent);
        };

        Textfield.prototype.onsapenter = function (oEvent) {
            oEvent.preventDefault();
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }

            this._checkChange(oEvent);
            this.fireEnterKeyPress(oEvent);
        };
        Textfield.prototype.onkeypress = function (oEvent) {
            if (oEvent.which === jQuery.sap.KeyCodes.Z && oEvent.ctrlKey && !oEvent.altKey) {
                // prevent browsers standard history logic because different in different browsers
                oEvent.preventDefault();
            }
            if ((this.getValueType()) && ((this.getValueType() === 'I') || (this.getValueType() === 'i'))) {
                jQuery(this.getInputDomRef()).val(jQuery(this.getInputDomRef()).val().replace(/[^\d].+/, ""));
                if ((oEvent.which < 48 || oEvent.which > 57)) {
                    oEvent.preventDefault();
                }
            }
            if ((this.getValueType()) && ((this.getValueType() === 'd') || (this.getValueType() === 'D'))) {
                var inputCode = oEvent.which,
                    currentValue = jQuery(this.getInputDomRef()).val(),
                    tempValue;
                if (inputCode > 0 && (inputCode < 48 || inputCode > 57)) {
                    if (inputCode === 46) {
                        if (this.getCursorPosition(this) === 0 && currentValue.charAt(0) === '-') {
                            oEvent.preventDefault();
                        }
                        if (currentValue.match(/[.]/)) {
                            oEvent.preventDefault();
                        }
                    } else if (inputCode === 45) {
                        if (currentValue.charAt(0) === '-') {
                            oEvent.preventDefault();
                        }
                        if (this.getCursorPosition(this) !== 0) {
                            oEvent.preventDefault();
                        }
                    } else if (inputCode === 8) {
                        return true;
                    } else {
                        oEvent.preventDefault();
                    }

                } else if (inputCode > 0 && (inputCode >= 48 && inputCode <= 57)) {
                    if (currentValue.charAt(0) === '-' && this.getCursorPosition(this) === 0) {
                        oEvent.preventDefault();
                    }
                    tempValue = currentValue.split('.');
                    if (tempValue[1].length > 1) {
                        oEvent.preventDefault();
                    }

                }
            }
        };
        Textfield.prototype.getCursorPosition = function (element) {
            var r,
                re,
                rc;
            if (element.selectionStart) {
                return element.selectionStart;
            } else if (document.selection) {
                element.focus();
                r = document.selection.createRange();
                if (r === null) {
                    return 0;
                }

                re = element.createTextRange();
                rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                return rc.text.length;
            }
            return 0;
        };
        /**
         * Event handler called on Paste
         *
         * @param {jQuery.Event} oEvent The event object
         * @private
         */
        Textfield.prototype.onpaste = function (oEvent) {
            if ((this.getValueType()) && ((this.getValueType() === 'I') || (this.getValueType() === 'i'))) {
                oEvent.preventDefault();
            }
            if ((this.getValueType()) && ((this.getValueType() === 'd') || (this.getValueType() === 'D'))) {
                oEvent.preventDefault();
            }
        };
        Textfield.prototype._checkChange = function (oEvent) {
            var oInput = this.getInputDomRef(),
                newVal = oInput && oInput.value,
                oldVal = this.getValue();

            if (newVal) {
                newVal = newVal.trim();
            }
            if (oldVal) {
                oldVal = oldVal.trim();
            }
            if (this.getEditable() && this.getEnabled() && (oldVal !== newVal)) {
                this.setProperty("value", newVal, true); // suppress rerendering
                //console.log(this.getValue());
                this.fireChange({newValue: newVal}); // oldValue is not that easy in ComboBox and anyway not in API... thus skip it
            }
	    };

        Textfield.prototype._getRenderOuter = function () {

            if (this.bRenderOuter === undefined) {
                var oRenderer = this.getRenderer();
                if (oRenderer.renderOuterAttributes || oRenderer.renderOuterContentBefore || oRenderer.renderOuterContent) {
                    this.bRenderOuter = true;
                } else {
                    this.bRenderOuter = false;
                }
            }
            return this.bRenderOuter;
        };

        Textfield.prototype.getInputDomRef = function () {
            /*
            if (!this._getRenderOuter()) {
                return this.getDomRef() || null;
            } else {
                return this.getDomRef("input") || null;
            }*/
            return this.getDomRef("input") || null;
        };

        Textfield.prototype.oninput = function (oEvent) {

            if (!this._realOninput(oEvent)) {
                return;
            }

            this._fireLiveChange(oEvent);

        };

        Textfield.prototype._realOninput = function (oEvent) {

            if (sap.ui.Device.browser.internet_explorer) {
                // as IE fires oninput event directly after rendering if value contains special characters (like Ü,Ö,Ä)
                // compare first value in first oninput event with rendered one
                var $input = jQuery(this.getInputDomRef()),
                    sRenderedValue = this._sRenderedValue;
                this._sRenderedValue = undefined;
                if (sRenderedValue === $input.val()) {
                    return false;
                }
            }

            return true;

        };
        /* Overwrite of generated function - no new JS-doc.
         * Property setter for the Tooltip
         *
         * @param oTooltip:
         * @return {sap.ui.commons.TextField} <code>this</code> to allow method chaining
         * @public
         */
        Textfield.prototype.setTooltip = function (oTooltip) {
            var oInputDomRef = this.getInputDomRef(),
                sTooltip;

            if (oInputDomRef) {
                sTooltip = ValueStateSupport.enrichTooltip(this, this.getTooltip());
                jQuery(oInputDomRef).attr("title", sTooltip || "");
            }

            return this;
        };
        /**
         * Handler for live change
         * reads the current content and fires the liveChange event
         * @param {jQuery.Event} oEvent The event object.
         * @private
         */
        Textfield.prototype._fireLiveChange = function (oEvent) {

            if (this.getEnabled() && this.getEditable()) {
                var sLiveValue = jQuery(this.getInputDomRef()).val();
                this.fireLiveChange({liveValue: sLiveValue});
            }

        };

	    return Textfield;

    }, /* bExport= */ true);
