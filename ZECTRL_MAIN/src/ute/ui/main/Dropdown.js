/*global sap, ute, document*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'sap/ui/core/Popup',
        'ute/ui/main/Checkbox',
        'ute/ui/main/DropdownItem'
    ],

    function (jQuery, Control, Popup, Checkbox, DropdownItem) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.main.Dropdown', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    design: { type: 'ute.ui.main.DropdownDesign', defaultValue: ute.ui.main.DropdownDesign.Default },
                    enabled: { type: 'boolean', defaultValue: true },
                    selectedKey: { type: 'string', defaultValue: null },
                    placeholder: { type: 'string', defaultValue: null }
                },

                aggregations: {
                    content: { type: 'ute.ui.main.DropdownItem', multiple: true, singularName: 'content' },

                    _headerContent: { type: 'ute.ui.main.DropdownItem', multiple: false, visibility: 'hidden' }
                },

                defaultAggregation: 'content',

                events: {
                    select: {
                        parameters: {
                            selectedKey: { type: 'string' }
                        }
                    }
                }
            }
        });

        CustomControl.prototype.onclick = function (oEvent) {
            oEvent.stopPropagation();

            if (this.$().hasClass('uteMDd-active')) {
                this.$().removeClass('uteMDd-active');
                jQuery(document).off('click', this._autoClose);

            } else {
                if (this.getEnabled() && this._hasContent()) {
                    this.$().addClass('uteMDd-active');
                    this.$('picker').css('z-index', Popup.getNextZIndex());
                    jQuery(document).on('click', jQuery.proxy(this._autoClose, this));
                }
            }
        };

        CustomControl.prototype._autoClose = function (oEvent) {
            jQuery(document).off('click', this._autoClose);
            this.$().removeClass('uteMDd-active');
        };

        CustomControl.prototype.setEnabled = function (bEnabled) {
            bEnabled = !!bEnabled;

            if (bEnabled) {
                this.data('disabled', null);
            } else {
                this.data('disabled', 'disabled', true);
            }

            this.setProperty('enabled', bEnabled);
            return this;
        };

        CustomControl.prototype.setSelectedKey = function (sKey) {
            var aContent = this.getContent() || [];

            aContent.forEach(function (oContent) {
                if (oContent.getKey() === sKey) {
                    oContent.data('selected', 'selected', true);
                } else {
                    oContent.data('selected', null);
                }
            });

            this.setProperty('selectedKey', sKey);
            this._syncHeaderContent();

            return this;
        };

        CustomControl.prototype.addContent = function (oContent) {
            oContent.attachPress(this._onDropdownItemPress, this);

            this.addAggregation('content', oContent);
            return this;
        };

        CustomControl.prototype.removeAllContent = function () {
            if (this.getAggregation("_headerContent")) {
                this.setAggregation('_headerContent', null); // Null is the only way to remove singular Aggregation(or 0..1 Aggregation).
            }
            this.removeAllAggregation('content');
        };

        CustomControl.prototype.insertContent = function (oContent, iIndex) {
            oContent.attachPress(this._onDropdownItemPress, this);

            this.insertAggregation('content', oContent, iIndex);
            return this;
        };

        CustomControl.prototype._onDropdownItemPress = function (oControlEvent) {
            if (this.getSelectedKey() !== oControlEvent.getSource().getKey()) {
                this.setSelectedKey(oControlEvent.getSource().getKey());
                this.fireSelect({
                    selectedKey: this.getSelectedKey()
                });
            }
        };

        CustomControl.prototype._hasContent = function () {
            var aContent = this.getContent() || [];
            return aContent.length > 0;
        };

        CustomControl.prototype._syncHeaderContent = function () {
            var aContent = this.getContent() || [];

            if (this.getAggregation("_headerContent")) {
                this.setAggregation('_headerContent', null);// Null is the only way to remove singular Aggregation(or 0..1 Aggregation).
            }

            aContent.forEach(function (oContent) {
                if (oContent.getKey() === this.getSelectedKey()) {
                    this.setAggregation('_headerContent', oContent.clone());
                }

            }.bind(this));
        };

        return CustomControl;
    },

    true
);
