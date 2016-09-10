/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object',
        'sap/ui/model/odata/v2/ODataModel',
        'sap/ui/model/odata/CountMode'
    ],

    function (jQuery, Object, ODataModel, CountMode) {
        'use strict';

        var Manager = Object.extend('nrg.base.component.RealDataManager', {
            constructor: function (oComponent) {
                Object.apply(this);

                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'addODataModels',
                    'refreshODataModels'
                ]
            }
        });

        Manager.prototype.addODataModels = function () {
            var oConfig, oModule, sModule, oData, oDataReal;

            oConfig = this._oComponent.getMetadata().getConfig() || {};
            oModule = oConfig.module || {};

            for (sModule in oModule) {
                if (oModule.hasOwnProperty(sModule)) {
                    oData = oModule[sModule].odata || {};
                    oDataReal = oData.real || {};

                    if (oModule[sModule].odata) {
                        this._addModuleODataModels(oDataReal);
                    }
                }
            }
        };

        Manager.prototype._addModuleODataModels = function (oDataReal) {
            var sDataReal, oModel, sRelativeToSicf, sServiceUrl;

            sRelativeToSicf = '../../../../../../../../../';

            for (sDataReal in oDataReal) {
                if (oDataReal.hasOwnProperty(sDataReal)) {
                    sServiceUrl = sRelativeToSicf + oDataReal[sDataReal].url;

                    oModel = new ODataModel(sServiceUrl, {
                        defaultCountMode: CountMode.None,
                        useBatch: true
                    });

                    this._oComponent.setModel(oModel, sDataReal);
                }
            }
        };
        Manager.prototype.refreshODataModels = function () {
            var oConfig,
                oModule,
                sModule,
                oData,
                oDataReal,
                sDataReal,
                oModel;

            oConfig = this._oComponent.getMetadata().getConfig() || {};
            oModule = oConfig.module || {};

            for (sModule in oModule) {
                if (oModule.hasOwnProperty(sModule)) {
                    oData = oModule[sModule].odata || {};
                    oDataReal = oData.real || {};

                    if (oModule[sModule].odata) {
                        for (sDataReal in oDataReal) {
                            if (oDataReal.hasOwnProperty(sDataReal)) {
                                oModel = this._oComponent.getModel(sDataReal);
                                oModel.oData = {};
                                //oModel.refresh(false, true);//If set to true then the model data will be removed/cleared.
                            }
                        }
                    }
                }
            }
        };

        return Manager;
    }
);
