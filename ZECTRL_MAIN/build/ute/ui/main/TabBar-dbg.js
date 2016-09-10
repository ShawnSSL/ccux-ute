/*global sap, ute */
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control'
    ],

    function (jQuery, Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.TabBar', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.TabBarDesign', defaultValue: ute.ui.main.TabBarDesign.Default }
                },

                aggregations: {
                    content: { type: 'sap.ui.core.Control', multiple: true, singularName: 'content' }
                },

                defaultAggregation: 'content',

                events: {
                    select: {
                        parameters: {
                            selectedItem: { type: 'ute.ui.main.TabBarItem' }
                        }
                    }
                }
            }
        });

        CustomControl.prototype._attachItemSelect = function (oItem) {
            oItem.attachSelect(this._onItemSelect, this);
        };

        CustomControl.prototype._onItemSelect = function (oControlEvent) {
            if (oControlEvent.getSource().getSelected()) {
                this.fireSelect({
                    selectedItem: oControlEvent.getSource()
                });
            }
        };

        return CustomControl;
    },

    true
);
