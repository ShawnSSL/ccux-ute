sap.ui.define(["sap/ui/core/Control"],function(a){"use strict";var b=a.extend("ute.ui.commons.InfoLine",{metadata:{library:"ute.ui.commons",properties:{title:{type:"string",defaultValue:""},maxHeight:{type:"sap.ui.core.CSSSize",defaultValue:void 0}},aggregations:{content:{multiple:!1}},defaultAggregation:"content",events:{change:{parameters:{expanded:{type:"boolean"}}}}}});return b.prototype.setExpand=function(a){this._isExpand=a||!1,this.fireChange({expanded:this._isExpand})},b.prototype.getExpand=function(){return this._isExpand||!1},b.prototype.onclick=function(a){"checkbox"===a.target.type&&this.setExpand(!this.getExpand())},b},!0);