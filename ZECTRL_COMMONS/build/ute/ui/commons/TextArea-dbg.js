/*global sap*/
/*jslint nomen:true*/


sap.ui.define(['jquery.sap.global', './library', 'ute/ui/commons/Textfield'],
    function (jQuery, library, Textfield) {
        "use strict";

        var TextArea = Textfield.extend("ute.ui.commons.TextArea", { metadata : {
            library : "ute.ui.commons",

            properties : {

                /**
                 * Height of text field. When it is set (CSS-size such as % or px), this is the exact size.
                 */
                height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

                /**
                 * Number of Columns. Cols means number of characters per row. This proprty is only used if Width is not used.
                 */
                cols : {type : "int", group : "Dimension", defaultValue : null},

                /**
                 * Number of Rows. This proprty is only used if Height is not used.
                 */
                rows : {type : "int", group : "Dimension", defaultValue : null},

                /**
                 * Text wrapping. Possible values are: Soft, Hard, Off.
                 */
                wrapping : {type : "sap.ui.core.Wrapping", group : "Appearance", defaultValue : null},

                /**
                 * Position of cursor, e.g., to let the user re-start typing at the same position as before the server roundtrip
                 */
                cursorPos : {type : "int", group : "Appearance", defaultValue : null},

                /**
                 * text which appears, in case quick-help is switched on
                 */
                explanation : {type : "string", group : "Misc", defaultValue : null},

                /**
                 * ID of label control
                 * @deprecated Since version 1.5.2.
                 * Please use association AriaLabelledBy instead.
                 */
                labeledBy : {type : "string", group : "Identification", defaultValue : null, deprecated: true}
            }
        }
            });
	    return TextArea;

    }, /* bExport= */ true);
