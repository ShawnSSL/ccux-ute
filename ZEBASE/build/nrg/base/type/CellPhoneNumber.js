sap.ui.define(["jquery.sap.global","sap/ui/model/SimpleType","sap/ui/model/FormatException","sap/ui/model/ParseException","sap/ui/model/ValidateException"],function(a,b,c,d,e){"use strict";var f=b.extend("nrg.base.type.CellPhoneNumber",{constructor:function(){b.apply(this,arguments)}});return f.prototype.getName=function(){return"nrg.base.type.CellPhoneNumber"},f.prototype.setFormatOptions=function(a){this.oFormatOptions=a},f.prototype.setConstraints=function(b){this.oConstraints=b,a.isEmptyObject(this.oConstraints)&&(this.oConstraints={mandatory:!1})},f.prototype.parseValue=function(a){if(void 0===a||null===a)return a;if(!a.match(/[\d\-]/i)&&""!==a)throw jQuery.sap.log.error("Parse Exception: Invalid Cell phone number",a),new d("Invalid Cell phone number");return a},f.prototype.validateValue=function(a){if((void 0===a||null===a)&&this.oConstraints.mandatory)throw jQuery.sap.log.error("Validate Exception: Cell phone number cannot be empty",a),new e("Cell phone number cannot be empty");if(a.length>30)throw jQuery.sap.log.error("Validate Exception: Cell phone number length exceeds(allowed upto 30 char)",a),new e("Cell phone number length exceeds(allowed upto 30 char)");return a},f.prototype.formatValue=function(a){return void 0===a||null===a||""===a.trim()?a:(a=a.replace(/-/g,""),a=a.replace(" ",""),a=a.replace("+",""),a.length>=11?"+"+a.substr(0,1)+" "+a.substr(1,3)+"-"+a.substr(4,3)+"-"+a.substr(7,4)+" ":a.substr(0,3)+"-"+a.substr(3,3)+"-"+a.substr(6,4)+" "+a.substr(10))},f});