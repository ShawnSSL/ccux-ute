/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object',
        'sap/ui/core/util/MockServer',
        'sap/ui/model/odata/v2/ODataModel',
        'sap/ui/model/odata/CountMode'
    ],

    function (jQuery, BaseObject, MockServer, ODataModel, CountMode) {
        'use strict';

        var Manager = BaseObject.extend('nrg.base.component.MockDataManager', {
            constructor: function (oComponent) {
                BaseObject.apply(this);

                this._oComponent = oComponent;
            },

            metadata: {
                publicMethods: [
                    'startMockServers',
                    'stopMockServers',
                    'addMockODataModels'
                ]
            }
        });

        Manager.prototype.startMockServers = function () {
            var oModule, sModule, sMock, oMock, sMockPath, oMockServer;

            this._aMockServers = [];
            if (jQuery.sap.getUriParameters().get('nrg-mock') !== 'true') {
                return;
            }

            oModule = this._getModuleMetadata();

            for (sModule in oModule) {
                if (oModule.hasOwnProperty(sModule)) {
                    for (sMock in oModule[sModule].odata.mock) {
                        if (oModule[sModule].odata.mock.hasOwnProperty(sMock)) {
                            oMock = oModule[sModule].odata.mock;
                            sMockPath = this._getModuleMockDataPath(sModule, oMock[sMock].mockDataBaseUrl);
                            oMockServer = this._startModuleMockServer(sMock, oMock, sMockPath);

                            this._aMockServers.push({
                                sMock: sMock,
                                oMockServer: oMockServer
                            });
                        }
                    }
                }
            }
        };

        Manager.prototype.stopMockServers = function () {
            this._aMockServers.forEach(function (oMockServer) {
                oMockServer.stop();
            });
        };

        Manager.prototype.addMockODataModels = function () {
            this._aMockServers.forEach(function (oEntry) {
                var oModel;

                oModel = new ODataModel(oEntry.oMockServer.getRootUri(), {
                    defaultCountMode: CountMode.None,
                    useBatch: false
                });

                this._oComponent.setModel(oModel, oEntry.sMock);

            }.bind(this));
        };

        Manager.prototype._getModuleMetadata = function () {
            var oConfig, oModule, sModule;

            oConfig = this._oComponent.getMetadata().getConfig() || {};
            oModule = oConfig.module || {};

            for (sModule in oModule) {
                if (oModule.hasOwnProperty(sModule)) {
                    oModule[sModule].odata = oModule[sModule].odata || {};
                    oModule[sModule].odata.mock = oModule[sModule].odata.mock || {};
                }
            }

            return oModule;
        };

        Manager.prototype._getModuleMockDataPath = function (sModule, sMockDataBaseUrl) {
            var sModulePath;

            sModulePath = jQuery.sap.getModulePath(sModule);

            return [ sModulePath, sMockDataBaseUrl ].join('/');
        };

        Manager.prototype._startModuleMockServer = function (sMock, oMock, sMockPath) {
            var oMockServer;

            oMockServer = new MockServer({
                rootUri: sMockPath
            });

            oMockServer.simulate(sMockPath + 'metadata.xml', {
                sMockdataBaseUrl: sMockPath,
                bGenerateMissingMockData: oMock[sMock].generateMissingMockData
            });

            oMockServer.start();

            return oMockServer;
        };

        Manager.prototype.destroy = function () {
            this.stopMockServers();
            BaseObject.prototype.destroy.apply(this, arguments);
        };

        return Manager;
    }
);
