sap.ui.define(["sap/ui/core/Control"],function(a){"use strict";var b=a.extend("ute.ui.commons.RedCrossSign",{library:"ute.ui.commons",metadata:{properties:{text:{type:"string",defaultValue:""},enabled:{type:"boolean",defaultValue:!0}},events:{press:{}}}});return b.prototype.onclick=function(a){this.getEnabled()&&this.firePress({}),a.preventDefault(),a.stopPropagation()},b},!0);