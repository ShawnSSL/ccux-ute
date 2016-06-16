/*global sap*/
/*jslint nomen:true*/
/*jslint regexp: true*/



sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'ute/ui/commons/Textfield', 'sap/ui/commons/ListBox', 'sap/m/Popover', 'sap/ui/core/ListItem'],
	function (jQuery, library, Control, Textfield, List, Popover, StandardListItem) {
        "use strict";

        var AutoComplete = Textfield.extend("ute.ui.commons.AutoComplete", { metadata : {
            library : "ute.ui.commons",

            properties : {
                showSuggestion : {type : "boolean", group : "Behavior", defaultValue : false},
                /**
                 * If set, the value of this parameter will control the horizontal size of the suggestion list to display more data. This allows suggestion lists to be wider than the input field if there is enough space available. By default, the suggestion list is always as wide as the input field.
                 * Note: The value will be ignored if the actual width of the input field is larger than the specified parameter value.
                 * @since 1.21.1
                 */
                maxSuggestionWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
                /**
                 * Minimum length of the entered text in input before suggest event is fired. The default value is 1 which means the suggest event is fired after user types in input. When it's set to 0, suggest event is fired when input with no text gets focus.
                 * @since 1.21.2
                 */
                startSuggestion : {type : "int", group : "Behavior", defaultValue : 1},
                /**
                 *  ABAP Field Name.
                 *
                 */
                fieldName : {type : "string", group : "Behavior", defaultValue : ''}
            },
            defaultAggregation : "suggestionItems",
            aggregations : {

                /**
                 * SuggestItems are the items which will be shown in the suggestion popup. Changing this aggregation (by calling addSuggestionItem, insertSuggestionItem, removeSuggestionItem, removeAllSuggestionItems, destroySuggestionItems) after input is rendered will open/close the suggestion popup. o display suggestions with two text values, it is also possible to add sap.ui.core/ListItems as SuggestionItems (since 1.21.1). For the selected ListItem, only the first value is returned to the input field.
                 * @since 1.16.1
                 */
                suggestionItems : {type : "sap.ui.core.Item", multiple : true, singularName : "suggestionItem"}


            },
            events : {
                suggest : {
                    parameters : {

                        /**
                         * Current visible value of the <code>TextField</code>.
                         */
                        suggestValue : {type : "string"}
                    }
			    }
            }
        }
            });
        /**
         * Initializes the control
         * @private
         */
        AutoComplete.prototype.init = function () {
            this._fnFilter = AutoComplete._DEFAULTFILTER;
        };
        /**
         * Destroys the control
         * @private
         */
        AutoComplete.prototype.exit = function () {

            this._deregisterEvents();

            // clear delayed calls
            this.cancelPendingSuggest();

            if (this._iRefreshListTimeout) {
                jQuery.sap.clearDelayedCall(this._iRefreshListTimeout);
                this._iRefreshListTimeout = null;
            }

            if (this._oSuggestionPopup) {
                this._oSuggestionPopup.destroy();
                this._oSuggestionPopup = null;
            }

            // CSN# 1404088/2014: list is not destroyed when it has not been attached to the popup yet
            if (this._oList) {
                this._oList.destroy();
                this._oList = null;
            }
        };

        /**
         * The default filter function for one and two-value. It checks whether the item text begins with the typed value.
         * @param {string} sValue the current filter string
         * @param {sap.ui.core.Item} oItem the filtered list item
         * @private
         * @returns {boolean} true for items that start with the parameter sValue, false for non matching items
         */
        AutoComplete._DEFAULTFILTER = function (sValue, oItem) {
            return jQuery.sap.startsWithIgnoreCase(oItem.getText(), sValue);
        };
		AutoComplete.prototype.setShowSuggestion = function (bValue) {
			this.setProperty("showSuggestion", bValue, true);
			this._iPopupListSelectedIndex = -1;
			if (bValue) {
				this._lazyInitializeSuggestionPopup(this);
			} else {
				this.destroySuggestionPopup(this);
			}
			return this;
		};
		AutoComplete.prototype.destroySuggestionPopup = function (oInput) {

			if (oInput._oSuggestionPopup) {
				oInput._oSuggestionPopup.destroy();
				oInput._oSuggestionPopup = null;
			}
			if (oInput._oList instanceof List) {
				oInput._oList.destroy();
				oInput._oList = null;
			}
		};

/*        AutoComplete.prototype.onfocusin = function (oEvent) {
            Textfield.prototype.onfocusin.apply(this, arguments);
            this.$().addClass("sapMInputFocused");
            // fires suggest event when startSuggestion is set to 0 and input has no text
            if (!this.getStartSuggestion() && !this.getValue()) {
                this._triggerSuggest(this.getValue());
            }
        };*/
        AutoComplete.prototype._triggerSuggest = function (sValue) {

            this.cancelPendingSuggest();

            if (!sValue) {
                sValue = "";
            }

            if (sValue.length >= this.getStartSuggestion()) {
                this._iSuggestDelay = jQuery.sap.delayedCall(300, this, function () {
                    this._bBindingUpdated = false;
                    this.fireSuggest({
                        suggestValue: sValue
                    });
                    // if binding is updated during suggest event, the list items don't need to be refreshed here
                    // because they will be refreshed in updateItems function.
                    // This solves the popup blinking problem
                    if (!this._bBindingUpdated) {
                        this._refreshItemsDelayed();
                    }
                });
            } else if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
                this._iPopupListSelectedIndex = -1;
                this._closeSuggestionPopup();
            }
        };
        AutoComplete.prototype.updateSuggestionItems = function () {
            this.updateAggregation("suggestionItems");
            this._refreshItemsDelayed();
            return this;
        };
        /**
         * Resizes the popup to the input width and makes sure that the input is never bigger as the popup
         * @private
         */
        AutoComplete.prototype._resizePopup = function () {
            var that = this;

            if (this._oList && this._oSuggestionPopup) {
                if (this.getMaxSuggestionWidth()) {
                    this._oSuggestionPopup.setContentWidth(this.getMaxSuggestionWidth());
                } else {
                    this._oSuggestionPopup.setContentWidth((this.$().outerWidth()) + "px");
                }
                // resize suggestion popup to minimum size of the input field
                setTimeout(function () {
                    if (that._oSuggestionPopup && that._oSuggestionPopup.isOpen() && that._oSuggestionPopup.$().outerWidth() < that.$().outerWidth()) {
                        that._oSuggestionPopup.setContentWidth((that.$().outerWidth()) + "px");
                    }
                }, 0);
            }
        };
        AutoComplete.prototype.onAfterRendering = function () {
            var that = this;

            this._resizePopup();
            this._sPopupResizeHandler = sap.ui.core.ResizeHandler.register(this.getDomRef(), function () {
                that._resizePopup();
            });
        };
        AutoComplete.prototype._deregisterEvents = function () {
            if (this._sPopupResizeHandler) {
                sap.ui.core.ResizeHandler.deregister(this._sPopupResizeHandler);
                this._sPopupResizeHandler = null;
            }
        };
		/**
		 * Forwards aggregations with the name of items or columns to the internal table.
		 * @overwrite
		 * @public
		 * @param {string} sAggregationName the name for the binding
		 * @param {object} oBindingInfo the configuration parameters for the binding
		 * @returns {sap.m.Input} this pointer for chaining
		 */
		AutoComplete.prototype.bindAggregation = function () {
			var args = Array.prototype.slice.call(arguments);

            this.createSuggestionPopupContent(this);
            this._bBindingUpdated = true;


			// propagate the bind aggregation function to list
			this._callMethodInManagedObject.apply(this, ["bindAggregation"].concat(args));
            return this;
		};
		AutoComplete.prototype._lazyInitializeSuggestionPopup = function () {
			if (!this._oSuggestionPopup) {
				this.createSuggestionPopup();
			}
		};
        AutoComplete.prototype.createSuggestionPopup = function () {

			var oInput = this;

			oInput._oSuggestionPopup = (new Popover(oInput.getId() + "-popup", {
                showHeader : false,
                placement : sap.m.PlacementType.Vertical,
                initialFocus : oInput
            }).attachAfterClose(function () {
                //if (oInput._iPopupListSelectedIndex  >= 0) {
                    //oInput._fireSuggestionItemSelectedEvent();
                //}
                if (oInput._oList) {
                    oInput._oList.destroyItems();
                }

            }).attachBeforeOpen(function () {
                oInput._sBeforeSuggest = oInput.getValue();
            }));

			oInput._oSuggestionPopup.addStyleClass("sapMInputSuggestionPopup");

			// add popup as dependent to also propagate the model and bindings to the content of the popover
			oInput.addDependent(oInput._oSuggestionPopup);
            this.overwritePopover(oInput._oSuggestionPopup, oInput);

			if (oInput._oList) {
				oInput._oSuggestionPopup.addContent(oInput._oList);
			}

		};
		AutoComplete.prototype._refreshItemsDelayed = function () {
			jQuery.sap.clearDelayedCall(this._iRefreshListTimeout);
			this._iRefreshListTimeout = jQuery.sap.delayedCall(0, this, this.refreshListItems, [ this ]);
		};
		AutoComplete.prototype.addSuggestionItem = function (oItem) {
			this.addAggregation("suggestionItems", oItem, true);
			this._refreshItemsDelayed();
			this.createSuggestionPopupContent(this);
			return this;
		};

		AutoComplete.prototype.insertSuggestionItem = function (oItem, iIndex) {
			this.insertAggregation("suggestionItems", iIndex, oItem, true);
			this._refreshItemsDelayed();
			this.createSuggestionPopupContent(this);
			return this;
		};

		AutoComplete.prototype.removeSuggestionItem = function (oItem) {
			var res = this.removeAggregation("suggestionItems", oItem, true);
			this._refreshItemsDelayed();
			return res;
		};

		AutoComplete.prototype.removeAllSuggestionItems = function () {
			var res = this.removeAllAggregation("suggestionItems", true);
			this._refreshItemsDelayed();
			return res;
		};
		AutoComplete.prototype.destroySuggestionItems = function () {
			this.destroyAggregation("suggestionItems", true);
			this._refreshItemsDelayed();
			return this;
		};
        /* =========================================================== */
        /*           begin: forward aggregation methods to table       */
        /* =========================================================== */

        /*
         * Forwards a function call to a managed object based on the aggregation name.
         * If the name is items, it will be forwarded to the table, otherwise called
         * locally
         * @private
         * @param {string} sFunctionName the name of the function to be called
         * @param {string} sAggregationName the name of the aggregation asociated
         * @returns {mixed} the return type of the called function
         */
        AutoComplete.prototype._callMethodInManagedObject = function (sFunctionName) {
            var aArgs = Array.prototype.slice.call(arguments);

            return sap.ui.core.Control.prototype[sFunctionName].apply(this, aArgs.slice(1));
        };
		AutoComplete.prototype.overwritePopover = function (oPopover, oInput) {
			// overwrite the internal properties to not to show the arrow in popover.
			oPopover._marginTop = 0;
			oPopover._marginLeft = 0;
			oPopover._marginRight = 0;
			oPopover._marginBottom = 0;
			oPopover._arrowOffset = 0;
			oPopover._offsets = [ "0 0", "0 0", "0 0", "0 0" ];
			oPopover._myPositions = [ "begin bottom", "begin center", "begin top", "end center" ];
			oPopover._atPositions = [ "begin top", "end center", "begin bottom", "begin center" ];
			oPopover.open = function () {
				this.openBy(oInput, false, true);
			};

			// remove animation from popover
			oPopover.oPopup.setAnimations(function ($Ref, iRealDuration, fnOpened) {
				fnOpened();
			}, function ($Ref, iRealDuration, fnClosed) {
				fnClosed();
			});
		};
		AutoComplete.prototype.createSuggestionPopupContent = function (oInput, bTabular) {
			// only initialize the content once
			if (oInput._oList) {
				return;
			}
            oInput._oList = new List(oInput.getId() + "-popup-list", {
                width : "100%",
                //showNoData : false,
                //mode : sap.m.ListMode.SingleSelectMaster,
                //rememberSelections : false,
                select : function (oEvent) {
                    var oListItem = oEvent.getParameter("selectedItem"),
                        iCount = oInput._iSetCount,
                        sNewValue;

/*                    // fire suggestion item select event
                    oInput.fireSuggestionItemSelected({
                        selectedItem: oListItem._oItem
                    });*/

                    // otherwise use title
                    sNewValue = oListItem.getText();
                    oInput._$input.val(sNewValue);
                    oInput.onChange(oEvent);
                    oInput._iPopupListSelectedIndex = -1;
                    oInput._closeSuggestionPopup();
                    oInput._doSelect();
                }
            }).addStyleClass("uteTextfield-floatList");
			if (oInput._oSuggestionPopup) {
				oInput._oSuggestionPopup.addContent(oInput._oList);
            }
		};
		AutoComplete.prototype._closeSuggestionPopup = function () {
			if (this._oSuggestionPopup) {
				this.cancelPendingSuggest();
				this._oSuggestionPopup.close();
			}
		};
        AutoComplete.prototype.cancelPendingSuggest = function () {
            if (this._iSuggestDelay) {
                jQuery.sap.clearDelayedCall(this._iSuggestDelay);
                this._iSuggestDelay = null;
            }
        };
        /**
         * Selects the text of the InputDomRef in the given range
         * @param {int} [iStart=0] start position of the text selection
         * @param {int} [iEnd=<length of text>] end position of the text selection
         * @return {sap.m.Input} this Input instance for chaining
         * @private
         */
        AutoComplete.prototype._doSelect = function (iStart, iEnd) {
            var oDomRef = this._$input[0],
                $Ref;
            if (oDomRef) {
                // if no Dom-Ref - no selection (Maybe popup closed)
                $Ref = this._$input;
                oDomRef.focus();
                $Ref.selectText((iStart || 0), (iEnd || $Ref.val().length));
            }
            return this;
        };
        AutoComplete.prototype.refreshListItems = function (oInput) {
			var bShowSuggestion = oInput.getShowSuggestion(),
                oItem,
				aItems = oInput.getSuggestionItems(),
				sTypedChars = this.getValue() || "",
				oList = oInput._oList,
				bFilter = true,
				aHitItems = [],
				iItemsLength = 0,
				oPopup = oInput._oSuggestionPopup,
				oListItem,
				i,
                bListItem;
			oInput._iPopupListSelectedIndex = -1;

			if (!(bShowSuggestion && oInput.getDomRef())) {
				return false;
			}
			// only destroy items in simple suggestion mode
			if (oInput._oList) {
				//TODO: avoid flickering when !bFilter
				oList.destroyItems();
			}

            for (i = 0; i < aItems.length; i = i + 1) {
                oItem = aItems[i];
                if (!bFilter || oInput._fnFilter(sTypedChars, oItem)) {
                    oListItem = new StandardListItem(oItem.getId() + "-sli");
                    oListItem.setText(oItem.getText());
                    //oListItem.setType(oItem.getEnabled() ? sap.m.ListType.Active : sap.m.ListType.Inactive);
                    oListItem._oItem = oItem;
                    aHitItems.push(oListItem);
                }
            }


			iItemsLength = aHitItems.length;
			if (iItemsLength > 0) {
                for (i = 0; i < iItemsLength; i = i + 1) {
				    oList.addItem(aHitItems[i]);
				}
                if (oInput._sCloseTimer) {
                    clearTimeout(oInput._sCloseTimer);
                    oInput._sCloseTimer = null;
                }

                if (!oPopup.isOpen() && !oInput._sOpenTimer && (this.getValue().length >= this.getStartSuggestion())) {
                    oInput._sOpenTimer = setTimeout(function () {
                        oInput._resizePopup();
                        oInput._sOpenTimer = null;
                        oPopup.open();
                        //oInput.focus();
                        oInput._$input.blur().focus().val(oInput._$input.val());
                    }, 0);
                }

			} else {
				//sAriaText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("INPUT_SUGGESTIONS_NO_HIT");
				//oInput.$("inner").removeAttr("aria-haspopup");
				//oInput.$("inner").removeAttr("aria-activedescendant");

                if (oPopup.isOpen()) {
                    oInput._sCloseTimer = setTimeout(function () {
                        oInput._iPopupListSelectedIndex = -1;
                        oInput.cancelPendingSuggest();
                        oPopup.close();
                    }, 0);
                }
			}

			// update Accessibility text for suggestion
			//oInput.$("SuggDescr").text(sAriaText);
		};
        AutoComplete.prototype.validateAggregation = function (sAggregationName, oObject, bMultiple) {
            return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
        };

        AutoComplete.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
            this._callMethodInManagedObject("setAggregation", sAggregationName,	oObject, bSuppressInvalidate);
            return this;
        };

        AutoComplete.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
            return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
        };

        AutoComplete.prototype.indexOfAggregation = function (sAggregationName, oObject) {
            return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
        };

        AutoComplete.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
            this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
            return this;
        };

        AutoComplete.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
            this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
            return this;
        };

        AutoComplete.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
            return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
        };

        AutoComplete.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
            return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
        };

        AutoComplete.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
            this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
            return this;
        };

        AutoComplete.prototype.getBinding = function (sAggregationName) {
            return this._callMethodInManagedObject("getBinding", sAggregationName);
        };

        AutoComplete.prototype.getBindingInfo = function (sAggregationName) {
            return this._callMethodInManagedObject("getBindingInfo", sAggregationName);
        };

        AutoComplete.prototype.getBindingPath = function (sAggregationName) {
            return this._callMethodInManagedObject("getBindingPath", sAggregationName);
        };
		AutoComplete.prototype.oninput = function (oEvent) {
			//Textfield.prototype.oninput.call(this, oEvent);
            var value = this._$input.val();
            this.setProperty("value", value, true);
			this.fireLiveChange({
				value: value,
				// backwards compatibility
				newValue: value
			});
			// No need to fire suggest event when suggestion feature isn't enabled or runs on the phone.
			// Because suggest event should only be fired by the input in dialog when runs on the phone.
			if (this.getShowSuggestion()) {
				this._triggerSuggest(this.getValue());
			}
		};
		AutoComplete.prototype.getValue = function () {
			return this.getDomRef("input") ? this._$input.val() : this.getProperty("value");
		};
        AutoComplete.prototype.clone = function () {
            var oInputClone = sap.ui.core.Control.prototype.clone.apply(this, arguments),
                bindingInfo;

            // add suggestion columns
            bindingInfo = this.getBindingInfo("suggestionColumns");
            if (bindingInfo) {
                oInputClone.bindAggregation("suggestionColumns", bindingInfo);
            } else {
                this.getSuggestionColumns().forEach(function (oColumn) {
                    oInputClone.addSuggestionColumn(oColumn.clone(), true);
                });
            }

            // add suggestion rows
            bindingInfo = this.getBindingInfo("suggestionRows");
            if (bindingInfo) {
                oInputClone.bindAggregation("suggestionRows", bindingInfo);
            } else {
                this.getSuggestionRows().forEach(function (oRow) {
                    oInputClone.addSuggestionRow(oRow.clone(), true);
                });
            }

            return oInputClone;
        };
        // do not cache jQuery object and define _$input for compatibility reasons
        Object.defineProperty(AutoComplete.prototype, "_$input", {
            get: function () {
                return this.$("input");
            }
        });
        // helper method for keyboard navigation in suggestion items
        AutoComplete.prototype._isSuggestionItemSelectable = function (oItem) {
            // CSN# 1390866/2014: The default for ListItemBase type is "Inactive", therefore disabled entries are only supported for single and two-value suggestions
            // for tabular suggestions: only check visible
            // for two-value and single suggestions: check also if item is not inactive
            //return oItem.getVisible() && (oItem.getType() !== sap.m.ListType.Inactive);
            return true;
        };
        AutoComplete.prototype._onsaparrowkey = function (oEvent, sDir, iItems) {
            if (!this.getEnabled() || !this.getEditable()) {
                return;
            }
            if (!this._oSuggestionPopup || !this._oSuggestionPopup.isOpen()) {
                return;
            }
            if (sDir !== "up" && sDir !== "down") {
                return;
            }

            oEvent.preventDefault();
            oEvent.stopPropagation();

            var bFirst = false,
                oList = this._oList,
                aItems = this.getSuggestionItems(),
                aListItems = oList.getItems(),
                iSelectedIndex = this._iPopupListSelectedIndex,
                sNewValue,
                iOldIndex = iSelectedIndex,
                iStopIndex;

            if (sDir === "up" && iSelectedIndex === 0) {
                // if key is 'up' and selected Item is first -> do nothing
                return;
            }
            if (sDir === "down" && iSelectedIndex === aListItems.length - 1) {
                //if key is 'down' and selected Item is last -> do nothing
                return;
            }

            if (iItems > 1) {
                // if iItems would go over the borders, search for valid item in other direction
                if (sDir === "down" && iSelectedIndex + iItems >= aListItems.length) {
                    sDir = "up";
                    iItems = 1;
                    aListItems[iSelectedIndex].setSelected(false);
                    iStopIndex = iSelectedIndex;
                    iSelectedIndex = aListItems.length - 1;
                    bFirst = true;
                } else if (sDir === "up" && iSelectedIndex - iItems < 0) {
                    sDir = "down";
                    iItems = 1;
                    //aListItems[iSelectedIndex].setSelected(false);
                    iStopIndex = iSelectedIndex;
                    iSelectedIndex = 0;
                    bFirst = true;
                }
            }

            // always select the first item from top when nothing is selected so far
            if (iSelectedIndex === -1) {
                iSelectedIndex = 0;
                if (this._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
                    // if first item is visible, don't go into while loop
                    iOldIndex = iSelectedIndex;
                    bFirst = true;
                } else {
                    // detect first visible item with while loop
                    sDir = "down";
                }
            }

            if (sDir === "down") {
                while (iSelectedIndex < aListItems.length - 1 && (!bFirst || !this._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
                    //aListItems[iSelectedIndex].setSelected(false);
                    iSelectedIndex = iSelectedIndex + iItems;
                    bFirst = true;
                    iItems = 1; // if wanted item is not selectable just search the next one
                    if (iStopIndex === iSelectedIndex) {
                        break;
                    }
                }
            } else {
                while (iSelectedIndex > 0 && (!bFirst || !aListItems[iSelectedIndex].getVisible() || !this._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
                    aListItems[iSelectedIndex].setSelected(false);
                    iSelectedIndex = iSelectedIndex - iItems;
                    bFirst = true;
                    iItems = 1; // if wanted item is not selectable just search the next one
                    if (iStopIndex === iSelectedIndex) {
                        break;
                    }
                }
            }

            //if (!this._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
                // if no further visible item can be found -> do nothing (e.g. set the old item as selected again)
                //if (iOldIndex >= 0) {
                    //aListItems[iOldIndex].setSelected(true).updateAccessibilityState();
                    //aListItems[iOldIndex].setSelected(true);
                    //this.$("inner").attr("aria-activedescendant", aListItems[iOldIndex].getId());
               // }
              //  return;
            //} else {
                //aListItems[iSelectedIndex].setSelected(true).updateAccessibilityState();
               // aListItems[iSelectedIndex].setSelected(true);
                //this.$("inner").attr("aria-activedescendant", aListItems[iSelectedIndex].getId());
           // }

            if (sap.ui.Device.system.desktop) {
                this._scrollToItem(iSelectedIndex, sDir);
            }

            sNewValue = aListItems[iSelectedIndex].getText();

            // setValue isn't used because here is too early to modify the lastValue of input
            this._$input.val(sNewValue);

            this._doSelect();
            this._iPopupListSelectedIndex = iSelectedIndex;
        };
        AutoComplete.prototype._scrollToItem = function (iIndex, sDir) {
            var oPopup = this._oSuggestionPopup,
                oList = this._oList,
                oListItem,
                oListItemDom;

            if (!(oPopup instanceof Popover) || !oList) {
                return;
            }

            oListItem = oList.getItems()[iIndex];
            oListItemDom = oListItem && oListItem.$()[0];

            if (oListItemDom) {
                oListItemDom.scrollIntoView(sDir === "up");
            }
        };
        AutoComplete.prototype.onsapup = function (oEvent) {
            this._onsaparrowkey(oEvent, "up", 1);
        };

        AutoComplete.prototype.onsapdown = function (oEvent) {
            this._onsaparrowkey(oEvent, "down", 1);
        };

        AutoComplete.prototype.onsappageup = function (oEvent) {
            this._onsaparrowkey(oEvent, "up", 5);
        };

        AutoComplete.prototype.onsappagedown = function (oEvent) {
            this._onsaparrowkey(oEvent, "down", 5);
        };
        AutoComplete.prototype.onsapenter = function (oEvent) {
            if (Textfield.prototype.onsapenter) {
                Textfield.prototype.onsapenter.apply(this, arguments);
            }

            // when enter is pressed before the timeout of suggestion delay, suggest event is cancelled
            this.cancelPendingSuggest();

            if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
                if (this._iPopupListSelectedIndex >= 0) {
                    //this._fireSuggestionItemSelectedEvent();
                    this._doSelect();

                    this._iPopupListSelectedIndex = -1;
                }
                this._closeSuggestionPopup();
            }

        };
        AutoComplete.prototype.onsapfocusleave = function (oEvent) {
            var oPopup = this._oSuggestionPopup;

            if (oPopup instanceof Popover) {
                if (oEvent.relatedControlId && jQuery.sap.containsOrEquals(oPopup.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
                    this.focus();
                }
            }

        };
	    return AutoComplete;

    }, /* bExport= */ true);
