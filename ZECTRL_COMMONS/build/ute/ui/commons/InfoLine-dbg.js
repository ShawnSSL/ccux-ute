/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(['sap/ui/core/Control'],
    function (Control) {
        'use strict';

        var InfoLine = Control.extend('ute.ui.commons.InfoLine', {
            metadata: {
                library: 'ute.ui.commons',
                properties: {
                    title: {
                        type: 'string',
                        defaultValue: ''
                    },
                    maxHeight: {
                        type: 'sap.ui.core.CSSSize',
                        defaultValue: undefined
                    }
                },
                aggregations: {
                    content: {
                        multiple: false
                    }
                },
                defaultAggregation : 'content',
                events: {
                    change: {
                        parameters: {
                            expanded: { type: 'boolean' }
                        }
                    }
                }
            }
        });

        InfoLine.prototype.setExpand = function (bExpand) {
            this._isExpand = bExpand || false;
            this.fireChange({ expanded: this._isExpand });
        };

        InfoLine.prototype.getExpand = function () {
            return this._isExpand || false;
        };

        InfoLine.prototype.onclick = function (oEvent) {
            if (oEvent.target.type === 'checkbox') {
                this.setExpand(!this.getExpand());
            }
        };

        return InfoLine;

    }, true);
