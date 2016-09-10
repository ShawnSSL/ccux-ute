sap.ui.define(["jquery.sap.global","sap/ui/core/Control","nrg/module/billing/view/control/CustomerJourneyTimelineChannelRenderer"],function(a,b,c){"use strict";var d=b.extend("nrg.module.billing.view.control.CustomerJourneyTimelineChannel",{metadata:{properties:{channelIcon:{type:"sap.ui.core.URI",defaultValue:"sap-icon://letter"},topLabel:{type:"string",defaultValue:null},rightDivider:{type:"boolean",defaultValue:!1},selected:{type:"boolean",defaultValue:!1},description:{type:"string",defaultValue:""},channel:{type:"string",defaultValue:""}},events:{press:{},doublePress:{}}},renderer:c});return d.prototype._aChannelRegistry=[],d.prototype.init=function(){this._aChannelRegistry.push(this)},d.prototype.exit=function(){var a=this._aChannelRegistry.indexOf(this);a&&-1!==a&&this._aChannelRegistry.splice(a,1),this.$("icon").unbind("click",this._onChannelClick),this.$("icon").unbind("dblclick",this._onChannelDoubleClick)},d.prototype.onBeforeRendering=function(){this.$("icon").unbind("click",this._onChannelClick),this.$("icon").unbind("dblclick",this._onChannelDoubleClick)},d.prototype.onAfterRendering=function(){this.$("icon").bind("click",this._onChannelClick.bind(this)),this.$("icon").bind("dblclick",this._onChannelDoubleClick.bind(this))},d.prototype._onChannelClick=function(){this._bDoubleClick=!1,a.sap.delayedCall(300,this,function(){this._bDoubleClick||this.firePress()})},d.prototype.onmouseout=function(){var a=!1;this._aChannelRegistry.forEach(function(b){b&&b.getSelected()&&(a=!0)},this),a||this.$().removeClass("nrgCJTChannel-selected")},d.prototype.onmouseover=function(){var a=!1;this._aChannelRegistry.forEach(function(b){b&&b.getSelected()&&(a=!0)},this),a||(this.$().addClass("nrgCJTChannel-selected"),this.getDescription()&&this.adjustDescription())},d.prototype.onfocusout=function(){},d.prototype._onChannelDoubleClick=function(){this._bDoubleClick=!0,this.setSelected(!this.getSelected()),this.fireDoublePress()},d.prototype.setSelected=function(a){a=!!a,a?(this.$().addClass("nrgCJTChannel-selected"),this._aChannelRegistry.forEach(function(a){a!==this&&a.setSelected(!1)},this)):this.$().removeClass("nrgCJTChannel-selected"),this.setProperty("selected",a,!0),a&&this.getDescription()&&this.adjustDescription()},d.prototype.adjustDescription=function(){var b,c,d,e,f,g,h=this.$(),i=h.offset(),j=a(".nrgCJT-channelContainer"),k=j.offset();this.getDomRef()&&this.getDomRef().firstChild&&this.getDomRef().firstChild&&this.getDomRef().firstChild.nextSibling&&this.getDomRef().firstChild.nextSibling.nextSibling&&(b=this.getDomRef().firstChild.nextSibling.nextSibling,c=i.left-k.left,c*=-1,a(b).css({top:"6.5rem",left:c}),f=a(b).innerWidth(),b&&(d=b.firstChild,e=Math.abs(c)+5,g=a(d).innerWidth(),g+e>f&&(e=f-g-10),a(d).css({top:"-1rem",left:e}),a(d).offset().left-i.left>10&&a(d).css({top:"-1rem",left:"7px"})))},d.prototype.adjustDescriptionOld=function(){var b,c,d,e;this.getDomRef()&&this.getDomRef().firstChild&&this.getDomRef().firstChild&&this.getDomRef().firstChild.nextSibling&&this.getDomRef().firstChild.nextSibling.nextSibling&&(b=this.getDomRef().firstChild.nextSibling.nextSibling,d=this.getParent().getDomRef("channelContainer").scrollLeft-this.getDomRef().offsetLeft+500,Math.abs(d)>=590?(d=-472,e=Math.abs(b.offsetLeft)):Math.abs(d)>=490?(d=-372,e=Math.abs(b.offsetLeft)+5):Math.abs(d)>=390?(d=-252,e=Math.abs(b.offsetLeft)+5):Math.abs(d)>=290?(d=-172,e=Math.abs(b.offsetLeft)+5):Math.abs(d)>=190?(d=-72,e=Math.abs(b.offsetLeft)+5):Math.abs(d)>=90?(d=30,e=Math.abs(b.offsetLeft)):d=10,a(b).css({top:"6.5rem",left:d}),b&&(c=b.firstChild,a(c).css({top:"-1rem",left:e})))},d});