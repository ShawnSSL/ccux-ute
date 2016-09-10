/*global sap*/
/*jslint nomen:true*/

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function (jQuery, Control) {
        "use strict";

        var Table = Control.extend("ute.ui.commons.Table", { metadata : {
            library : "ute.ui.commons",
            properties : {
                /*Width of tabke*/
                width: {
                    type: 'sap.ui.core.CSSSize',
                    group: 'Dimension',
                    defaultValue: 'auto'
                },
                tableType: {
                    type: 'ute.ui.commons.TableType',
                    group: 'Appearance',
                    defaultValue: 'InvoiceTable'
                }
            },
            aggregations: {
                /* Columns of the Table*/
                /*For each column please provide with one <TableColumn> delaration in XML view, it is required for each column head's onclick event*/
                columns : {
                    type : "ute.ui.commons.TableColumn",
                    multiple : true,
                    singularName : "column",
                    bindable : "bindable"
                },

                /*Rows of the Table*/
                rows : {
                    type : "ute.ui.commons.TableRow",
                    multiple : true,
                    singularName : "row",
                    bindable : "bindable"
                }
            },
            events: {
                /*Might need this*/
                rowSelectionChange : {
				    parameters : {
                        /*selected row index*/
                        rowIndex: {type : "int"},

                        /*binding context of the row which has been clicked so that selection has been changed*/
                        rowContext: {type : "object"},

                        /* array of row indices which selection has been changed (either selected or deselected)*/
                        rowIndices : {type : "int[]"}   //keep first
				    }
                }
            }
        }});

        return Table;
    }, true);
