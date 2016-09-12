sap.ui.define(["jquery.sap.global","./library","sap/ui/core/Control","ute/ui/commons/Textfield","sap/ui/commons/ListBox","sap/m/Popover","sap/ui/core/ListItem"],function(a,b,c,d,e,f,g){"use strict";var h=d.extend("ute.ui.commons.AutoComplete",{metadata:{library:"ute.ui.commons",properties:{showSuggestion:{type:"boolean",group:"Behavior",defaultValue:!1},maxSuggestionWidth:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},startSuggestion:{type:"int",group:"Behavior",defaultValue:1},fieldName:{type:"string",group:"Behavior",defaultValue:""}},defaultAggregation:"suggestionItems",aggregations:{suggestionItems:{type:"sap.ui.core.Item",multiple:!0,singularName:"suggestionItem"}},events:{suggest:{parameters:{suggestValue:{type:"string"}}}}}});return h.prototype.init=function(){this._fnFilter=h._DEFAULTFILTER},h.prototype.exit=function(){this._deregisterEvents(),this.cancelPendingSuggest(),this._iRefreshListTimeout&&(a.sap.clearDelayedCall(this._iRefreshListTimeout),this._iRefreshListTimeout=null),this._oSuggestionPopup&&(this._oSuggestionPopup.destroy(),this._oSuggestionPopup=null),this._oList&&(this._oList.destroy(),this._oList=null)},h._DEFAULTFILTER=function(b,c){return a.sap.startsWithIgnoreCase(c.getText(),b)},h.prototype.setShowSuggestion=function(a){return this.setProperty("showSuggestion",a,!0),this._iPopupListSelectedIndex=-1,a?this._lazyInitializeSuggestionPopup(this):this.destroySuggestionPopup(this),this},h.prototype.destroySuggestionPopup=function(a){a._oSuggestionPopup&&(a._oSuggestionPopup.destroy(),a._oSuggestionPopup=null),a._oList instanceof e&&(a._oList.destroy(),a._oList=null)},h.prototype._triggerSuggest=function(b){this.cancelPendingSuggest(),b||(b=""),b.length>=this.getStartSuggestion()?this._iSuggestDelay=a.sap.delayedCall(300,this,function(){this._bBindingUpdated=!1,this.fireSuggest({suggestValue:b}),this._bBindingUpdated||this._refreshItemsDelayed()}):this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()&&(this._iPopupListSelectedIndex=-1,this._closeSuggestionPopup())},h.prototype.updateSuggestionItems=function(){return this.updateAggregation("suggestionItems"),this._refreshItemsDelayed(),this},h.prototype._resizePopup=function(){var a=this;this._oList&&this._oSuggestionPopup&&(this._oSuggestionPopup.setContentWidth(this.getMaxSuggestionWidth()?this.getMaxSuggestionWidth():this.$().outerWidth()+"px"),setTimeout(function(){a._oSuggestionPopup&&a._oSuggestionPopup.isOpen()&&a._oSuggestionPopup.$().outerWidth()<a.$().outerWidth()&&a._oSuggestionPopup.setContentWidth(a.$().outerWidth()+"px")},0))},h.prototype.onAfterRendering=function(){var a=this;this._resizePopup(),this._sPopupResizeHandler=sap.ui.core.ResizeHandler.register(this.getDomRef(),function(){a._resizePopup()})},h.prototype._deregisterEvents=function(){this._sPopupResizeHandler&&(sap.ui.core.ResizeHandler.deregister(this._sPopupResizeHandler),this._sPopupResizeHandler=null)},h.prototype.bindAggregation=function(){var a=Array.prototype.slice.call(arguments);return this.createSuggestionPopupContent(this),this._bBindingUpdated=!0,this._callMethodInManagedObject.apply(this,["bindAggregation"].concat(a)),this},h.prototype._lazyInitializeSuggestionPopup=function(){this._oSuggestionPopup||this.createSuggestionPopup()},h.prototype.createSuggestionPopup=function(){var a=this;a._oSuggestionPopup=new f(a.getId()+"-popup",{showHeader:!1,placement:sap.m.PlacementType.Vertical,initialFocus:a}).attachAfterClose(function(){a._oList&&a._oList.destroyItems()}).attachBeforeOpen(function(){a._sBeforeSuggest=a.getValue()}),a._oSuggestionPopup.addStyleClass("sapMInputSuggestionPopup"),a.addDependent(a._oSuggestionPopup),this.overwritePopover(a._oSuggestionPopup,a),a._oList&&a._oSuggestionPopup.addContent(a._oList)},h.prototype._refreshItemsDelayed=function(){a.sap.clearDelayedCall(this._iRefreshListTimeout),this._iRefreshListTimeout=a.sap.delayedCall(0,this,this.refreshListItems,[this])},h.prototype.addSuggestionItem=function(a){return this.addAggregation("suggestionItems",a,!0),this._refreshItemsDelayed(),this.createSuggestionPopupContent(this),this},h.prototype.insertSuggestionItem=function(a,b){return this.insertAggregation("suggestionItems",b,a,!0),this._refreshItemsDelayed(),this.createSuggestionPopupContent(this),this},h.prototype.removeSuggestionItem=function(a){var b=this.removeAggregation("suggestionItems",a,!0);return this._refreshItemsDelayed(),b},h.prototype.removeAllSuggestionItems=function(){var a=this.removeAllAggregation("suggestionItems",!0);return this._refreshItemsDelayed(),a},h.prototype.destroySuggestionItems=function(){return this.destroyAggregation("suggestionItems",!0),this._refreshItemsDelayed(),this},h.prototype._callMethodInManagedObject=function(a){var b=Array.prototype.slice.call(arguments);return sap.ui.core.Control.prototype[a].apply(this,b.slice(1))},h.prototype.overwritePopover=function(a,b){a._marginTop=0,a._marginLeft=0,a._marginRight=0,a._marginBottom=0,a._arrowOffset=0,a._offsets=["0 0","0 0","0 0","0 0"],a._myPositions=["begin bottom","begin center","begin top","end center"],a._atPositions=["begin top","end center","begin bottom","begin center"],a.open=function(){this.openBy(b,!1,!0)},a.oPopup.setAnimations(function(a,b,c){c()},function(a,b,c){c()})},h.prototype.createSuggestionPopupContent=function(a){a._oList||(a._oList=new e(a.getId()+"-popup-list",{width:"100%",select:function(b){{var c,d=b.getParameter("selectedItem");a._iSetCount}c=d.getText(),a._$input.val(c),a.setProperty("value",c,!0),a.onChange(b),a._iPopupListSelectedIndex=-1,a._closeSuggestionPopup(),a._doSelect()}}).addStyleClass("uteTextfield-floatList"),a._oSuggestionPopup&&a._oSuggestionPopup.addContent(a._oList))},h.prototype._closeSuggestionPopup=function(){this._oSuggestionPopup&&(this.cancelPendingSuggest(),this._oSuggestionPopup.close())},h.prototype.cancelPendingSuggest=function(){this._iSuggestDelay&&(a.sap.clearDelayedCall(this._iSuggestDelay),this._iSuggestDelay=null)},h.prototype._doSelect=function(a,b){var c,d=this._$input[0];return d&&(c=this._$input,d.focus(),c.selectText(a||0,b||c.val().length)),this},h.prototype.refreshListItems=function(a){var b,c,d,e=a.getShowSuggestion(),f=a.getSuggestionItems(),h=this.getValue()||"",i=a._oList,j=!0,k=[],l=0,m=a._oSuggestionPopup;if(a._iPopupListSelectedIndex=-1,!e||!a.getDomRef())return!1;for(a._oList&&i.destroyItems(),d=0;d<f.length;d+=1)b=f[d],(!j||a._fnFilter(h,b))&&(c=new g(b.getId()+"-sli"),c.setText(b.getText()),c._oItem=b,k.push(c));if(l=k.length,l>0){for(d=0;l>d;d+=1)i.addItem(k[d]);a._sCloseTimer&&(clearTimeout(a._sCloseTimer),a._sCloseTimer=null),!m.isOpen()&&!a._sOpenTimer&&this.getValue().length>=this.getStartSuggestion()&&(a._sOpenTimer=setTimeout(function(){a._resizePopup(),a._sOpenTimer=null,m.open(),a._$input.blur().focus().val(a._$input.val())},0))}else m.isOpen()&&(a._sCloseTimer=setTimeout(function(){a._iPopupListSelectedIndex=-1,a.cancelPendingSuggest(),m.close()},0))},h.prototype.validateAggregation=function(a,b,c){return this._callMethodInManagedObject("validateAggregation",a,b,c)},h.prototype.setAggregation=function(a,b,c){return this._callMethodInManagedObject("setAggregation",a,b,c),this},h.prototype.getAggregation=function(a,b){return this._callMethodInManagedObject("getAggregation",a,b)},h.prototype.indexOfAggregation=function(a,b){return this._callMethodInManagedObject("indexOfAggregation",a,b)},h.prototype.insertAggregation=function(a,b,c,d){return this._callMethodInManagedObject("insertAggregation",a,b,c,d),this},h.prototype.addAggregation=function(a,b,c){return this._callMethodInManagedObject("addAggregation",a,b,c),this},h.prototype.removeAggregation=function(a,b,c){return this._callMethodInManagedObject("removeAggregation",a,b,c)},h.prototype.removeAllAggregation=function(a,b){return this._callMethodInManagedObject("removeAllAggregation",a,b)},h.prototype.destroyAggregation=function(a,b){return this._callMethodInManagedObject("destroyAggregation",a,b),this},h.prototype.getBinding=function(a){return this._callMethodInManagedObject("getBinding",a)},h.prototype.getBindingInfo=function(a){return this._callMethodInManagedObject("getBindingInfo",a)},h.prototype.getBindingPath=function(a){return this._callMethodInManagedObject("getBindingPath",a)},h.prototype.oninput=function(){var a=this._$input.val();this.setProperty("value",a,!0),this.fireLiveChange({value:a,newValue:a}),this.getShowSuggestion()&&this._triggerSuggest(this.getValue())},h.prototype.getValue=function(){return this.getDomRef("input")?this._$input.val():this.getProperty("value")},h.prototype.clone=function(){var a,b=sap.ui.core.Control.prototype.clone.apply(this,arguments);return a=this.getBindingInfo("suggestionColumns"),a?b.bindAggregation("suggestionColumns",a):this.getSuggestionColumns().forEach(function(a){b.addSuggestionColumn(a.clone(),!0)}),a=this.getBindingInfo("suggestionRows"),a?b.bindAggregation("suggestionRows",a):this.getSuggestionRows().forEach(function(a){b.addSuggestionRow(a.clone(),!0)}),b},Object.defineProperty(h.prototype,"_$input",{get:function(){return this.$("input")}}),h.prototype._isSuggestionItemSelectable=function(){return!0},h.prototype._onsaparrowkey=function(a,b,c){if(this.getEnabled()&&this.getEditable()&&this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()&&("up"===b||"down"===b)){a.preventDefault(),a.stopPropagation();var d,e,f=!1,g=this._oList,h=(this.getSuggestionItems(),g.getItems()),i=this._iPopupListSelectedIndex,j=i;if(!("up"===b&&0===i||"down"===b&&i===h.length-1)){if(c>1&&("down"===b&&i+c>=h.length?(b="up",c=1,h[i].setSelected(!1),e=i,i=h.length-1,f=!0):"up"===b&&0>i-c&&(b="down",c=1,e=i,i=0,f=!0)),-1===i&&(i=0,this._isSuggestionItemSelectable(h[i])?(j=i,f=!0):b="down"),"down"===b)for(;i<h.length-1&&(!f||!this._isSuggestionItemSelectable(h[i]))&&(i+=c,f=!0,c=1,e!==i););else for(;i>0&&(!f||!h[i].getVisible()||!this._isSuggestionItemSelectable(h[i]))&&(h[i].setSelected(!1),i-=c,f=!0,c=1,e!==i););sap.ui.Device.system.desktop&&this._scrollToItem(i,b),d=h[i].getText(),this._$input.val(d),this._doSelect(),this._iPopupListSelectedIndex=i}}},h.prototype._scrollToItem=function(a,b){var c,d,e=this._oSuggestionPopup,g=this._oList;e instanceof f&&g&&(c=g.getItems()[a],d=c&&c.$()[0],d&&d.scrollIntoView("up"===b))},h.prototype.onsapup=function(a){this._onsaparrowkey(a,"up",1)},h.prototype.onsapdown=function(a){this._onsaparrowkey(a,"down",1)},h.prototype.onsappageup=function(a){this._onsaparrowkey(a,"up",5)},h.prototype.onsappagedown=function(a){this._onsaparrowkey(a,"down",5)},h.prototype.onsapenter=function(){d.prototype.onsapenter&&d.prototype.onsapenter.apply(this,arguments),this.cancelPendingSuggest(),this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()&&(this._iPopupListSelectedIndex>=0&&(this._doSelect(),this._iPopupListSelectedIndex=-1),this._closeSuggestionPopup())},h.prototype.onsapfocusleave=function(b){var c=this._oSuggestionPopup;c instanceof f&&b.relatedControlId&&a.sap.containsOrEquals(c.getDomRef(),sap.ui.getCore().byId(b.relatedControlId).getFocusDomRef())&&this.focus()},h},!0);