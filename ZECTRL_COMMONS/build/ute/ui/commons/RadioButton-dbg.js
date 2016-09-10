/*global sap*/
    // Provides control sap.ui.commons.RadioButton.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
    function (jQuery, library, Control) {
        "use strict";
        var RadioButton = Control.extend("ute.ui.commons.RadioButton", {
            metadata : {
                library : "ute.ui.commons",
                properties : {
                    /*Text displayed next to the radio button*/
                    text : {type : "string", group : "Data", defaultValue : null},

                    /*true if the radio button is checked */
                    selected : {type : "boolean", group : "Data", defaultValue : false},

                    /*Group name of the radio button*/
                    groupName : {type : "string", group : "Behavior", defaultValue : "sapUiRbDefaultGroup"},

                    /*Not implemented in renderer, keep the attribute for future use*/
                    enabled: {type : "boolean", group : "Behabior", defaultValue: "true"},

                    /*Set false for the solid radio button in settings*/
                    bRegular : {type: "boolean", group: "Apperance", defaultValue: "true"}
                },
                events : {
                    /* Event is triggered when the user makes a change on the radio button.*/
                    select : {}
                }
            }
        });

        /**
         * Event handler called when the radio button is clicked.
         *
         * @param {jQuery.Event} oEvent
         * @private
         */
        RadioButton.prototype.onclick = function (oEvent) {

            if (this.getEnabled() && oEvent.target.id === (this.getId() + "-RB")) {
                this.focus();
            }

            this.userSelect(oEvent);
        };

        /**
         * This method is used internally only, whenever the user somehow selects the RadioButton.
         * It is responsible for event cancellation and for firing the select event.
         *
         * @param {jQuery.Event} oEvent
         * @private
         */
        RadioButton.prototype.userSelect = function (oEvent) {
            //	oEvent.preventDefault();
            // the control should not stop browser event propagation
            // Example: table control needs to catch and handle the event as well
            //oEvent.stopPropagation();

            if (this.getEnabled()) {
                var selected = this.getSelected();
                if (!selected) {
                    this.setSelected(true);
                    this.fireSelect({/* no parameters */});
                }
            } else {
                // readOnly or disabled -> don't allow browser to switch RadioButton on
                oEvent.preventDefault();
            }
        };

        // #############################################################################
        // Overwritten methods that are also generated in RadioButton.API.js
        // #############################################################################

        /*
         * Overwrite the definition from RadioButton.API.js
         */
        RadioButton.prototype.setSelected = function (bSelected) {

            var bSelectedOld = this.getSelected(),
                others,
                i,
                other,
                oControl;

            this.setProperty("selected", bSelected, true); // No re-rendering
            bSelected = this.getSelected();

            if (bSelected) { // If this radio button is selected, explicitly deselect the other radio buttons of the same group
                if (this.getGroupName() && (this.getGroupName() !== "")) { // Do it only if groupName is set
                    // TODO: Add control references to some static list when they are constructed, in order to avoid searching every time
                    others = document.getElementsByName(this.getGroupName());
                    for (i = 0; i < others.length; i = i + 1) {
                        other = others[i];
                        // Recommendation is that the HTML radio button has an ID ending with "-RB"
                        if (other.id && (other.id.length > 3) && (other.id.substr(other.id.length - 3) === "-RB")) {
                            // The SAPUI5 control is known by an ID without the "-RB" suffix
                            oControl = sap.ui.getCore().getElementById(other.id.substr(0, other.id.length - 3));
                            if (oControl instanceof RadioButton && (oControl !== this)) {
                                oControl.setSelected(false);
                            }
                        }
                    }
                }
            }
            if ((bSelectedOld !== bSelected) && this.getDomRef() && this.getRenderer().setSelected) {
                this.getRenderer().setSelected(this, bSelected);
            }

            return this;
        };
        return RadioButton;

    }, /* bExport= */ true);
