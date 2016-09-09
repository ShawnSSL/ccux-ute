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

        var CustomControl = Control.extend('ute.ui.main.ComboBox', {
            metadata: {
                library: 'ute.ui.main',

                properties: {
                    value : {type : "string", group : "Data", defaultValue : '', bindable : "bindable"},
                    design: { type: 'ute.ui.main.ComboBoxDesign', defaultValue: ute.ui.main.DropdownDesign.Default },
                    enabled: { type: 'boolean', defaultValue: true },
                    selectedKey: { type: 'string', defaultValue: null },
                    allowOnlyListed: { type: 'boolean', defaultValue: false}    //if true, not allowing user to type values not belonged to the binding list
                    //placeholder: { type: 'string', defaultValue: null }*/
                },

                aggregations: {
                    content: { type: 'ute.ui.main.ComboBoxItem', multiple: true, singularName: 'content' },

                    _headerContent: { type: 'ute.ui.main.ComboBoxItem', multiple: false, visibility: 'hidden' }
                },

                defaultAggregation: 'content',

                events: {
                    select: {
                        parameters: {
                            selectedKey: { type: 'string' }
                        }
                    },

                    change : {
                        parameters : {
                        /*The new / changed value of the textfield.*/
                            newValue : {type : "string"}
                    }
                },
                }
            }
        });

        /*CustomControl.prototype.getInputDomRef = function () {
            return this.getDomRef("input") || null;
        };*/

        CustomControl.prototype.onBeforeRendering = function () {
            var oHContent = this.getAggregation('_headerContent');

            if (this.getSelectedKey()) {
                this.setValue(oHContent.getContent()[0].mProperties.text);
            }

            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Rendered');
        };

        CustomControl.prototype._checkChange = function (oEvent) {
            var newVal = oEvent.target.value,
                oldVal = this.getValue(),
                aContent = this.getAggregation('content'),
                i;

            if (newVal) {
                newVal = newVal.trim();
            } else {
                for (i = 0; i < aContent.length; i = i + 1) {
                    aContent[i].setShow(true);
                }
            }
            if (oldVal) {
                oldVal = oldVal.trim();
            }
            if (this.getEnabled() && (oldVal !== newVal)) {
                this.setProperty("value", newVal, true); // suppress rerendering
                this.fireChange({newValue: newVal}); // oldValue is not that easy in ComboBox and anyway not in API... thus skip it
            }
	    };

        CustomControl.prototype.onfocusout = function (oEvent) {
            this._checkChange(oEvent);
            //this._syncHeaderContent();

            oEvent.preventDefault();
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }
        };

/*        CustomControl.prototype.onkeypress = function (oEvent) {
            var sOriVal = oEvent.target.value,
                cPressedKey = oEvent.key,
                sCurQuery,
                aContent = this.getAggregation('content'),
                i,
                sCurIteState;

            sCurQuery = sOriVal + cPressedKey;

            for (i = 0; i < aContent.length; i = i + 1) {
                sCurIteState = aContent[i].mBindingInfos.key.binding.oContext.oModel.oData.US_State[i].sFullName;
                if (!this._bStartWith (sCurIteState, sCurQuery)) {
                    aContent[i].setShow(false);
                } else {
                    aContent[i].setShow(true);
                }
            }
        };*/

        CustomControl.prototype._handleArrowKey = function (oEvent) {
            var sKeyName = oEvent.key,
                aContent = this.getAggregation('content'),
                i;

            for (i = 0; i < aContent.length; i = i + 1) {
                if (aContent[i].$().hasClass('uteMDdItem-Focused') && aContent[i].getShow()) {
                    aContent[i].$().removeClass('uteMDdItem-Focused');
                    if ((sKeyName === 'ArrowDown' || oEvent.key === 'Down')  && i < aContent.length - 1) {
                        aContent[i + 1].$().addClass('uteMDdItem-Focused');
                    } else if ((sKeyName === 'ArrowUp' || oEvent.key === 'Up') && i > 0) {
                        aContent[i - 1].$().addClass('uteMDdItem-Focused');
                    }
                    return;
                }
            }
            for (i = 0; i < aContent.length; i = i + 1) {
                if (aContent[i].getShow()) {
                    aContent[i].$().addClass('uteMDdItem-Focused');
                    return;
                }
            }
        };

        CustomControl.prototype._handleEnterKey = function (oEvent) {
            var aContent = this.getAggregation('content'),
                i;

            for (i = 0; i < aContent.length; i = i + 1) {
                if (aContent[i].$().hasClass('uteMDdItem-Focused')) {
                    aContent[i].$().removeClass('uteMDdItem-Focused');
                    this.setSelectedKey(aContent[i].mBindingInfos.key.binding.oContext.oModel.oData.US_State[i].sAbvName);
                    this.fireSelect({
                        selectedKey: aContent[i].mBindingInfos.key.binding.oContext.oModel.oData.US_State[i].sAbvName
                    });
                    this.setProperty("value", aContent[i].mBindingInfos.key.binding.oContext.oModel.oData.US_State[i].sFullName, true); // suppress rerendering
                    return;
                }
            }
            this.setSelectedKey('');
            this.fireSelect({
                selectedKey: ''
            });
        };

        CustomControl.prototype.onkeyup = function (oEvent) {
            var sCurQuery = oEvent.target.value,
                aContent = this.getAggregation('content'),
                i,
                sCurIteState,
                sCurIteStateAbv,
                bInListInd;

            //Handle ArrowKeyDown
            if (oEvent.key === 'ArrowDown' || oEvent.key === 'ArrowUp' || oEvent.key === 'Down' || oEvent.key === 'Up') {
                this._handleArrowKey(oEvent);
            }
            if (oEvent.key === 'Enter') {
                this._handleEnterKey(oEvent);
            }

            //Popup Activate
            if (this.getEnabled() && this._hasContent()) {
                this.$().addClass('uteMDd-active');
                this.$('picker').css('z-index', Popup.getNextZIndex());
                jQuery(document).on('click', jQuery.proxy(this._autoClose, this));
            }

            bInListInd = false;

            for (i = 0; i < aContent.length; i = i + 1) {
                sCurIteState = aContent[i].mBindingInfos.key.binding.oContext.oModel.oData.US_State[i].sFullName;
                if (!this._bStartWith (sCurIteState, sCurQuery)) {
                    aContent[i].setShow(false);
                } else {
                    aContent[i].setShow(true);
                    bInListInd = true;
                }
            }


            if (this.getAllowOnlyListed() && !bInListInd) {
                sCurQuery = sCurQuery.slice(0, -1);
                this.setValue(sCurQuery);
                oEvent.target.value = sCurQuery;

                for (i = 0; i < aContent.length; i = i + 1) {
                    sCurIteState = aContent[i].mBindingInfos.key.binding.oContext.oModel.oData.US_State[i].sFullName;
                    if (!this._bStartWith (sCurIteState, sCurQuery)) {
                        aContent[i].setShow(false);
                    } else {
                        aContent[i].setShow(true);
                    }
                }
            }
        };

        CustomControl.prototype._bStartWith = function (sString, sNeedle) {
            if (sString.toLowerCase().indexOf(sNeedle.toLowerCase()) === 0) {
                return true;
            } else {
                return false;
            }
        };


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

            if (typeof sKey === 'undefined') {
                return;
            }

            aContent.forEach(function (oContent) {
                if (oContent.getKey() === sKey) {
                    oContent.data('selected', 'selected', true);
                } else {
                    oContent.data('selected', null);
                }
            });

            this.setProperty('selectedKey', sKey);
            if (sKey !== "") {
                this._syncHeaderContent();
            }
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
        /**
         * Bind an aggregation to the model.(Before Standard is called call overridden to make sure actual aggregation is cleared)
         *
         * The bound aggregation will use the given template, clone it for each item
         * which exists in the bound list and set the appropriate binding context.
         * This is a generic method which can be used to bind any aggregation to the
         * model. A managed object may flag aggregations in the metamodel with
         * bindable="bindable" to get typed bind<i>Something</i> methods for those aggregations.
         *
         * @param {string} sName the aggregation to bind
         * @param {object} oBindingInfo the binding info
         * @param {string} oBindingInfo.path the binding path
         * @param {sap.ui.base.ManagedObject} oBindingInfo.template the template to clone for each item in the aggregation
         * @param {boolean} [oBindingInfo.templateShareable=true] option to enable that the template will be shared which means that it won't be destroyed or cloned automatically
         * @param {function} oBindingInfo.factory the factory function
         * @param {number} oBindingInfo.startIndex the first entry of the list to be created
         * @param {number} oBindingInfo.length the amount of entries to be created (may exceed the sizelimit of the model)
         * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [oBindingInfo.sorter] the initial sort order (optional)
         * @param {sap.ui.model.Filter[]} [oBindingInfo.filters] the predefined filters for this aggregation (optional)
         * @param {object} [oBindingInfo.parameters] a map of parameters which is passed to the binding
         * @param {function} [oBindingInfo.groupHeaderFactory] a factory function to generate custom group visualization (optional)
         *
         * @return {sap.ui.base.ManagedObject} reference to the instance itself
         * @public
         */
        CustomControl.prototype.bindAggregation = function (sName, oBindingInfo) {
            if (this.getAggregation("_headerContent")) {
                this.setAggregation('_headerContent', null); // Null is the only way to remove singular Aggregation(or 0..1 Aggregation).
                //this.setSelectedKey("");
            }
            return Control.prototype.bindAggregation.apply(this, arguments);
        };

        CustomControl.prototype.insertContent = function (oContent, iIndex) {
            oContent.attachPress(this._onDropdownItemPress, this);

            this.insertAggregation('content', oContent, iIndex);
            return this;
        };

        CustomControl.prototype._onDropdownItemPress = function (oControlEvent) {
            //oControlEvent.stopPropagation();
            //if (this.getSelectedKey() !== oControlEvent.getSource().getKey()) {
            this.setSelectedKey(oControlEvent.getSource().getKey());
            this.fireSelect({
                selectedKey: oControlEvent.getSource().getKey()
            });
            //}
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
