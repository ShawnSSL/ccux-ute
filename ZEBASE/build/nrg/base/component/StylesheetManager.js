sap.ui.define(["jquery.sap.global","sap/ui/base/Object"],function(a,b){"use strict";var c=b.extend("nrg.base.component.StylesheetManager",{constructor:function(a){b.apply(this),this._oComponent=a},metadata:{publicMethods:["addStyleSheets"]}});return c.prototype.addStylesheets=function(){var a,b,c;a=this._oComponent.getMetadata().getConfig()||{},b=a.module||{};for(c in b)b.hasOwnProperty(c)&&b[c].resourceBundle&&this._addModuleStylesheets(b,c)},c.prototype._addModuleStylesheets=function(b,c){var d,e,f;d=b[c].stylesheet||[],e=a.sap.getModulePath(c),d.forEach(function(b){f=[e,b].join("/"),a.sap.includeStyleSheet(f)}.bind(this))},c});