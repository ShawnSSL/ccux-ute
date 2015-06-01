/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.Button', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    text: {
                        type: 'string',
                        defaultValue: null
                    }
                },

                aggregations: {
                    content: {
                        multiple: true,
                        singularName: 'content',
                        type: 'sap.ui.core.Control'
                    }
                },

                defaultAggregation: 'content'
            }
        });

        CustomControl.prototype._addHtmlText = function (oRm) {
            oRm.write('<span>');
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
