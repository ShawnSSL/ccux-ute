/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.TabPanel', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.TabPanelDesign', defaultValue: ute.ui.main.TabPanelDesign.Default }
                },

                aggregations: {
                    content: { type: 'ute.ui.main.TabPanelItem', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content',

                associations: {
                    tabPanelFor: { type: 'ute.ui.main.TabBar', multiple: false }
                }
            }
        });

        CustomControl.prototype._onTabBarSelected = function (oControlEvent) {
            var sSelectedKey, aContent;

            sSelectedKey = oControlEvent.getParameter('selectedItem').getKey();
            aContent = this.getContent() || [];

            aContent.forEach(function (oContent) {
                if (oContent.getKey() === sSelectedKey) {
                    oContent.setHidden(false);
                } else {
                    oContent.setHidden(true);
                }
            });
        };

        return CustomControl;
    },

    true
);
