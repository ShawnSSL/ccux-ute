/***
Please note: Build of this control has not finished yet.
Found RadioButton itself works without the group control so holding this implementation

HJL
*/

/*global sap*/
/*jslint nomen:true*/
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation'],
	function (jQuery, library, Control, ItemNavigation) {
	    "use strict";

        var RadioButtonGroup = Control.extend("ute.ui.commons.RadioButtonGroup", /** @lends sap.ui.commons.RadioButtonGroup.prototype */ { metadata : {
            library : "ute.ui.commons",
            properties : {
			/**
			 * Width of the RadioButtonGroup.
			 */
                width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Number of RadioButtons displayed in one Line.
			 */
                columns : {type : "int", group : "Appearance", defaultValue : 1},

			/**
			 * Index of the selected/checked RadioButton.
			 */
                selectedIndex : {type : "int", group : "Data", defaultValue : 0}
            },
            defaultAggregation : "items",
            aggregations : {
			/**
			 * RadioButtons of this RadioButtonGroup
			 */
                items : {type : "sap.ui.core.Item", multiple : true, singularName : "item", bindable : "bindable"}
            },
            events : {
			/**
			 * Event is fired when selection is changed by user interaction.
			 */
                select : {
				    parameters : {
					/**
					 * Index of the selected RadioButton.
					 */
					    selectedIndex : {type : "int"}
				    }
                }
            }
	    }});

        RadioButtonGroup.prototype.onBeforeRendering = function () {
            if (this.getSelectedIndex() > this.getItems().length) {
                // SelectedIndex is > than number of items -> select the first one
                jQuery.sap.log.warning("Invalid index, set to 0");
                this.setSelectedIndex(0);
            }
        };

        RadioButtonGroup.prototype.onAfterRendering = function () {
            var i;
            this.initItemNavigation();

            // update ARIA information of RadioButtons
            for (i = 0; i < this.aRBs.length; i = i + 1) {
                this.aRBs[i].$().attr("aria-posinset", i + 1).attr("aria-setsize", this.aRBs.length);
            }
        };

        /*
         * initialize ItemNavigation. Transfer RadioButtons to ItemNavigation.
         * TabIndexes are set by ItemNavigation
         * @private
         */
        RadioButtonGroup.prototype.initItemNavigation = function () {

            // Collect items for ItemNavigation
            var aDomRefs = [],
                aActiveItems,
                bEnabled,
                i;
            this._aActiveItems = [];
            aActiveItems = this._aActiveItems;
            bEnabled = false;
            for (i = 0; i < this.aRBs.length; i = i + 1) {
                aActiveItems[aDomRefs.length] = i;
                aDomRefs.push(this.aRBs[i].getDomRef());
                if (!bEnabled && this.aRBs[i].getEnabled()) {
                    // at least one RadioButton is enabled
                    bEnabled = true;
                }
            }

            if (bEnabled) {
                // at least one RadioButton enabled -> use property of RadioButtonGroup
                // so if all RadioButtons are disabled the RadioButtonGroup is disabled too.
                bEnabled = this.getEnabled();
            }

            if (!bEnabled) {
                // RadioButtonGroup is disabled -> no ItemNavigation
                if (this.oItemNavigation) {
                    this.removeDelegate(this.oItemNavigation);
                    this.oItemNavigation.destroy();
                    delete this.oItemNavigation;
                }
                return;
            }

            // init ItemNavigation
            if (!this.oItemNavigation) {
                this.oItemNavigation = new ItemNavigation();
                this.oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._handleAfterFocus, this);
                this.addDelegate(this.oItemNavigation);
            }
            this.oItemNavigation.setRootDomRef(this.getDomRef());
            this.oItemNavigation.setItemDomRefs(aDomRefs);
            this.oItemNavigation.setCycling(true);
            this.oItemNavigation.setColumns(this.getColumns());
            this.oItemNavigation.setSelectedIndex(this.getSelectedIndex());
            this.oItemNavigation.setFocusedIndex(this.getSelectedIndex());
        };

        /*
         * Set selected RadioButton via Index
         * @public
         */
        RadioButtonGroup.prototype.setSelectedIndex = function (iSelectedIndex) {

            var iIndexOld = this.getSelectedIndex();

            if (iSelectedIndex < 0) {
                // invalid negative index -> don't change index.
                jQuery.sap.log.warning("Invalid index, will not be changed");
                return this;
            }

            this.setProperty("selectedIndex", iSelectedIndex, true); // no re-rendering

            // deselect old RadioButton
            if (!isNaN(iIndexOld) && this.aRBs && this.aRBs[iIndexOld]) {
                this.aRBs[iIndexOld].setSelected(false);
            }

            // select new one
            if (this.aRBs && this.aRBs[iSelectedIndex]) {
                this.aRBs[iSelectedIndex].setSelected(true);
            }

            if (this.oItemNavigation) {
                this.oItemNavigation.setSelectedIndex(iSelectedIndex);
                this.oItemNavigation.setFocusedIndex(iSelectedIndex);
            }

            return this;

        };

        /*
         * Set selected RadioButton via Item
         * @param {sap.ui.core.Item} oSelectedItem the item to be selected.
         * @public
         */

        /**
         * Sets the item as seleced and removs the selection from the old one.
         *
         * @param {sap.ui.core.Item} oItem
         *         Selected item.
         * @type void
         * @public
         * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
         */
        RadioButtonGroup.prototype.setSelectedItem = function (iSelectedItem) {
            var i;
            for (i = 0; i < this.getItems().length; i = i + 1) {
                if (iSelectedItem.getId() === this.getItems()[i].getId()) {
                    this.setSelectedIndex(i);
                    break;
                }
            }
        };

        /*
         * Get item of selected RadioButton
         * @public
         */

        /**
         * Returns selected item. When no item is selected, "null" is returned.
         *
         * @type sap.ui.core.Item
         * @public
         * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
         */
        RadioButtonGroup.prototype.getSelectedItem = function () {
            return this.getItems()[this.getSelectedIndex()];
        };


        /*
         * On SELECT event of single Radio Buttons fire Select Event for group
         * @private
         */
        RadioButtonGroup.prototype.handleRBSelect = function (oControlEvent) {
            var i;
            // find RadioButton in Array to get Index
            for (i = 0; i < this.aRBs.length; i = i + 1) {
                if (this.aRBs[i].getId() === oControlEvent.getParameter("id")) {
                    this.setSelectedIndex(i);
                    this.oItemNavigation.setSelectedIndex(i);
                    this.oItemNavigation.setFocusedIndex(i);
                    this.fireSelect({selectedIndex: i});
                    break;
                }
            }

        };


        return RadioButtonGroup;

    }, /* bExport= */ true);
