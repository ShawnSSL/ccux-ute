/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/Object',
        'sap/ui/model/json/JSONModel'
    ],

    function (jQuery, Object, JSONModel) {
        'use strict';

        var Manager = Object.extend('nrg.base.component.GlobalDataManager', {
            constructor: function (oComponent) {
                Object.apply(this);

                this._globalModel = new JSONModel();
            },

            metadata: {
                publicMethods: [
                    'setGDCProperty',
                    'getGDCProperty',
                    'refreshGDC',
                    'setPrepay',
                    'getIsSiebel',
                    'setIsSiebel'
                ]
            }
        });

        Manager.prototype.setGDCProperty = function (sPath, oValue) {
            if (sPath && oValue) {
                this._globalModel.setProperty(sPath, oValue);
            }
        };

        Manager.prototype.setIsSiebel = function (bSiebel) {
            if (bSiebel) {
                this.setGDCProperty("/siebel", true);
            } else {
                this.setGDCProperty("/siebel", false);
            }
        };

        Manager.prototype.getIsSiebel = function () {
            return this.getGDCProperty("/siebel") || false;
        };

        Manager.prototype.setPrepay = function (bisPrepay) {
            if (bisPrepay) {
                this.setGDCProperty("/prepay", true);
            } else {
                this.setGDCProperty("/prepay", false);
            }
        };

        Manager.prototype.isPrepay = function () {
            return this.getGDCProperty("/prepay") || false;
        };

        Manager.prototype.setREBS = function (bisPrepay) {
            if (bisPrepay) {
                this.setGDCProperty("/REBS", true);
            } else {
                this.setGDCProperty("/REBS", false);
            }
        };

        Manager.prototype.isREBS = function () {
            return this.getGDCProperty("/REBS") || false;
        };
        Manager.prototype.setCAConfirm = function (bisFirstTimeConfirm) {
            if (bisFirstTimeConfirm) {
                this.setGDCProperty("/CAConfirm", true);
            } else {
                this.setGDCProperty("/CAConfirm", false);
            }
        };

        Manager.prototype.isCAConfirm = function () {
            return this.getGDCProperty("/CAConfirm") || false;
        };
        Manager.prototype.getGDCProperty = function (sPath) {
            if (sPath) {
                return this._globalModel.getProperty(sPath);
            }
        };

        Manager.prototype.refreshGDC = function () {
            this._globalModel = new JSONModel();
        };

        return Manager;
    }
);
