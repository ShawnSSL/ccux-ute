sap.ui.define(["jquery.sap.global","./library","sap/ui/core/Control","sap/ui/core/Popup"],function(a,b,c){"use strict";var d=c.extend("ute.ui.commons.TextView",{metadata:{library:"ute.ui.commons",properties:{text:{type:"string",defaultValue:"",bindable:"bindable"},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},design:{type:"ute.ui.commons.TextViewDesign",group:"Data",defaultValue:ute.ui.commons.TextViewDesign.Base},color:{type:"ute.ui.commons.TextViewColor",group:"Appearance",defaultValue:ute.ui.commons.TextViewColor.Black}}}});return d.prototype.setText=function(b){this.setProperty("text",b,!0);var c=this.getDomRef();return c&&(b=this.getText(),c.innerHTML=a.sap.encodeHTML(b).replace(/&#xa;/g,"<br>")),this},d},!0);