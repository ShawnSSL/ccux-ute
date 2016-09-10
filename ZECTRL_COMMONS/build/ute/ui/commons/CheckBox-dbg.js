/*globals sap */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function (jQuery, library, Control) {
        "use strict";

        var CheckBox = Control.extend("ute.ui.commons.CheckBox", { metadata: {
            library : "ute.ui.commons",
            properties : {
                /* Contains the state of the control whether it is flagged with a check mark, or not*/
                checked : {type : "boolean", group : "Data", defaultValue : false, bindable : "bindable"},

                /* Defines the text displayed next to the check box */
                text : {type : "string", group : "Appearance", defaultValue : null},

                /*  Using this property, the control could be disabled, if required.*/
                enabled : {type : "boolean", group : "Behavior", defaultValue : true},

                /* The 'name' property to be used in the HTML code, for example for HTML forms that send data to the server via submit.*/
                name : {type : "string", group : "Misc", defaultValue : null}
            },
            events : {
                change : {
                    parameters : {
                        /* Checks whether the box is flagged or not flagged.*/
                        checked : {type : "boolean"}
                    }
                }
            }
        }});


        /*  Event handler called when the check box is clicked.*/
        CheckBox.prototype.onclick = function (oEvent) {
            this.userToggle(oEvent);
        };

        CheckBox.prototype.userToggle = function (oEvent) {
            oEvent.preventDefault();
            if (this.getEnabled()) {
                this.toggle();
                this.fireChange({checked: this.getChecked()});
            } else {
                // CheckBox has been activated by the user, but value cannot be changed
                // do nothing, but restore the focus to the complete control, as the user might have clicked the <input> element which also can get the focus
                this.getDomRef().focus();
            }
        };

        // implement public method toggle()
        CheckBox.prototype.toggle = function () {
            this.setChecked(!this.getChecked());
            return this;
        };

        return CheckBox;

    }, /* bExport= */ true);
