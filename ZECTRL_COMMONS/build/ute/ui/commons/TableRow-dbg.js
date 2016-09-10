/*global sap*/

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function (jQuery, Control) {
        "use strict";

        var TableRow = Control.extend('ute.ui.commons.TableRow', { metadata : {
            library: 'ute.ui.commons',
            properties: {
                iIndex: {type: 'int', group: 'data', defaultValue: null},
                bindingData: {}
            },
            defaultAggregation: 'cells',
            aggregations: {
                cells: {
                    type: 'sap.ui.core.Control',
                    multiple: true,
                    singularName: 'cell'
                }
            },
            events: {
                /*Event onPress*/
                press: {}
            }
        }});

        TableRow.prototype.ontap = function (oEvent) {
            this.firePress();
        };
        return TableRow;
    }, true);
