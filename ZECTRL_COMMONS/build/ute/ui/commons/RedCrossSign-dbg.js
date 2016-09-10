/*global sap*/

sap.ui.define(['sap/ui/core/Control'],
    function (Control) {
        'use strict';

        var RedCrossSign = Control.extend("ute.ui.commons.RedCrossSign", {
                library: 'ute.ui.commons',
                metadata : {
                    properties : {
                /**
                 *
                 * Button text displayed at runtime.
                 */
                        text : {type : "string", defaultValue : ''},
	           /**
                 *
                 * Boolean property to enable the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings.
                 */
                        enabled : {type : "boolean", defaultValue : true}

					},
                    events : {
			   /**
                 *
                 * Event is fired when the user presses the control.
                 */
                        press : {}
                    }

                }

            });
	   /**
         * Function is called when button is clicked.
         *
         * @param {jQuery.Event} oEvent
         * @private
         */

	    RedCrossSign.prototype.onclick = function (oEvent) {
            if (this.getEnabled()) {
                this.firePress({/* no parameters */});
            }

            oEvent.preventDefault();
            oEvent.stopPropagation();
        };
	    return RedCrossSign;
    }, true);
