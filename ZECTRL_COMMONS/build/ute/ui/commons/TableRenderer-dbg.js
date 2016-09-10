/*global sap*/
/*jslint nomen:true*/

sap.ui.define(['jquery.sap.global', 'sap/ui/core/theming/Parameters'],
	function (jQuery, Parameters) {
        "use strict";

        var TableRenderer = {};

        TableRenderer.render = function (oRm, oTable) {
            var bRenderDummyRow = false;

            oRm.write('<table');
            oRm.writeControlData(oTable);
            oRm.addClass('uteTb');
            oRm.writeClasses();
            oRm.addStyle('width', oTable.getWidth());
            oRm.writeStyles();
            oRm.write('><tbody>');

            //Render columns aggregation
            oRm.write('<tr');
            //oRm.addStyle('width', oTableColumn.getWidth());
            //oRm.addClass('uteTb-column');
            switch (oTable.getTableType()) {
            case 'InvoiceTable':
                oRm.addClass('uteTb-column-invoice');
                bRenderDummyRow = true;
                break;
            case 'DppTable':
                oRm.addClass('uteTb-column-dpp');
                break;
            case 'DppDeniedTable':
                oRm.addClass('uteTb-column-dpp');
                break;
            case 'CampaignTable':
                oRm.addClass('uteTb-column-campaign');
                break;
            }
            oRm.writeStyles();
            oRm.writeClasses();
            oRm.write('>');

            oTable.getColumns().forEach(function (oColumn) {
                oRm.renderControl(oColumn);
            });
            oRm.write('</tr>');
            if (bRenderDummyRow) {
                oRm.write('</tr>');
                oRm.write('<tr');
                oRm.addClass('uteTb-row-dummyRow');
                oRm.writeClasses();
                oRm.write('><td></td></tr>');
            }

            //Render rows aggregation
            oTable.getRows().forEach(function (oRow) {
                oRm.renderControl(oRow);
            });

            oRm.write('</tbody></table>');

        };



        return TableRenderer;

    }, true);
