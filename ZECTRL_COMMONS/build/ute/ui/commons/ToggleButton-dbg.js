/*globals sap */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool'],
	function (jQuery, library, Control, EnabledPropagator, IconPool) {
	    "use strict";

        var ToggleButton = Control.extend("ute.ui.commons.ToggleButton", { metadata : {
            library : "ute.ui.commons",
            properties : {
                /*Left side button text*/
                leftBtnText : {type : "string", group : "Appearance", defaultValue : ''},

                /*Right side button text*/
                rightBtnText : {type : "string", group : "Appearance", defaultValue : ''},

                leftSelected : {type : "boolean", group: "Behavior", defaultValue: true},

                /*Boolean property to enable the control (default is true).*/
                enabled : {type : "boolean", group : "Behavior", defaultValue : true},

                /*Width of the left side button in CSS-size, set at 249px as default */
                leftBtnWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "262px"},

                /*Same as left side button width. Left and right side witdth do not have to be the same*/
                rightBtnWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "262px"},

                /*Specifies the button height. If this property is set, the height which is specified by the underlying theme is not used any longer.*/
                height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

                 /*ute.ui.commons.ToggleButtonType*/
                design : {type : "ute.ui.commons.ToggleButtonDesign", group : "Appearance", defaultValue : "ToggleCampaign"}

            },
            events : {
                /*Event is fired when the user presses the control.*/
                press : {}
            }
        }});

        /**
         * Puts the focus to the button.
         *
         * @name sap.ui.commons.Button#focus
         * @function
         * @type void
         * @public
         * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
         */
        //EnabledPropagator.call(ToggleButton.prototype);

        /*Function is called when button is clicked.*/
        ToggleButton.prototype.onclick = function (oEvent) {
            if (this.getEnabled()) {

                if (this.getLeftSelected()) {
                    this.setLeftSelected(false);
                } else {
                    this.setLeftSelected(true);
                }

                //this.getRenderer().toggle(this);
                this.firePress({/* no parameters */});
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }

        };

        return ToggleButton;

    }, /* bExport= */ true);
