/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.TabPanelItem', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.TabPanelItemDesign', defaultValue: ute.ui.main.TabPanelItemDesign.Default },
                    key: { type: 'string', defaultValue: null },
                    hidden: { type: 'boolean', defaultValue: true }
                },

                aggregations: {
                    content: { type: 'sap.ui.core.Control', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content'
            }
        });

        CustomControl.prototype.setHidden = function (bValue) {
            if (bValue) {
                this.$().addClass('uteMTabPanelItem-hidden');
            } else {
                this.$().removeClass('uteMTabPanelItem-hidden');
            }

            this.setProperty('hidden', bValue);
            return this;
        };

        return CustomControl;
    },

    true
);
