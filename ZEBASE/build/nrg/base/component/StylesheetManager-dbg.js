/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object'
    ],

    function (jQuery, Object) {
        'use strict';

        var Manager = Object.extend('nrg.base.component.StylesheetManager', {
            constructor: function (oComponent) {
                Object.apply(this);

                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'addStyleSheets'
                ]
            }
        });

        Manager.prototype.addStylesheets = function () {
            var oConfig, oModule, sModule;

            oConfig = this._oComponent.getMetadata().getConfig() || {};
            oModule = oConfig.module || {};

            for (sModule in oModule) {
                if (oModule.hasOwnProperty(sModule)) {
                    if (oModule[sModule].resourceBundle) {
                        this._addModuleStylesheets(oModule, sModule);
                    }
                }
            }
        };

        Manager.prototype._addModuleStylesheets = function (oModule, sModule) {
            var aStylesheet, sModulePath, sStylesheetPath;

            aStylesheet = oModule[sModule].stylesheet || [];
            sModulePath = jQuery.sap.getModulePath(sModule);

            aStylesheet.forEach(function (sStylesheet) {
                sStylesheetPath = [ sModulePath, sStylesheet ].join('/');
                jQuery.sap.includeStyleSheet(sStylesheetPath);
            }.bind(this));
        };

        return Manager;
    }
);
