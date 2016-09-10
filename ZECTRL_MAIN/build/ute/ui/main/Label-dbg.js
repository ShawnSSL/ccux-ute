/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/core/LabelEnablement'
    ],

    function (Control, LabelEnablement) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.Label', {
            metadata: {
                library: 'ute.ui.main',

                interfaces: [ 'sap.ui.core.Label' ],

                properties: {
                    text: { type: 'string', defaultValue: null }
                },

                aggregations: {
                    content: { multiple: true, singularName: 'content', type: 'sap.ui.core.Control' }
                },

                defaultAggregation: 'content',

                associations: {
                    labelFor: { multiple: false, type: 'sap.ui.core.Control' }
                }
            }
        });

        LabelEnablement.enrich(CustomControl.prototype);

        CustomControl.prototype._addLabelForRendering = function (oRm) {
            var oFor = sap.ui.getCore().byId(this.getLabelForRendering());

            oRm.write(' for="');

            // for some controls the label must point to a special HTML element, not the outer one.
			if (oFor && oFor.getIdForLabel) {
				oRm.write(oFor.getIdForLabel());
			} else {
				oRm.write(this.getLabelForRendering());
			}

            oRm.write('"');
        };

        CustomControl.prototype._addHtmlText = function (oRm) {
            oRm.write('<span');
            oRm.addClass('uteMLbl-text');
            oRm.writeClasses();
            oRm.write('>');
            oRm.writeEscaped(this.getText());
            oRm.write('</span>');
        };

        CustomControl.prototype._addHtmlContent = function (oRm) {
            var aContent = this.getContent() || [];

            aContent.forEach(function (oContent) {
                oRm.renderControl(oContent);
            }.bind(this));
        };

        return CustomControl;
    },

    true
);
