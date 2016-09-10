/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object',
        'sap/ui/model/resource/ResourceModel'
    ],

    function (jQuery, Object, ResourceModel) {
        'use strict';

        var Manager = Object.extend('nrg.base.component.MockDataManager', {
            constructor: function (oComponent) {
                Object.apply(this);

                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'addResourceModels'
                ]
            }
        });

        Manager.prototype.addResourceModels = function () {
            var oConfig, oModule, sModule;

            oConfig = this._oComponent.getMetadata().getConfig() || {};
            oModule = oConfig.module || {};

            for (sModule in oModule) {
                if (oModule.hasOwnProperty(sModule)) {
                    if (oModule[sModule].resourceBundle) {
                        this._addModuleResourceModels(oModule, sModule);
                    }
                }
            }
        };

        Manager.prototype._addModuleResourceModels = function (oModule, sModule) {
            var oResourceBundle, sResourceBundle, sModulePath, sResourcePath, oModel;

            oResourceBundle = oModule[sModule].resourceBundle || {};
            sModulePath = jQuery.sap.getModulePath(sModule);

            for (sResourceBundle in oResourceBundle) {
                if (oResourceBundle.hasOwnProperty(sResourceBundle)) {
                    sResourcePath = [ sModulePath, oResourceBundle[sResourceBundle] ].join('/');

                    oModel = new ResourceModel({
                        bundleUrl: sResourcePath
                    });

                    this._oComponent.setModel(oModel, sResourceBundle);
                }
            }
        };

        return Manager;
    }
);
