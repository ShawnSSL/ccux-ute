/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'jquery.sap.global',
        'sap/ui/model/json/JSONModel'
    ],

    function (CoreController, jQuery, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.DPPTools');

        Controller.prototype.onBeforeRendering = function () {
        };

        return Controller;
    }
);
