/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/core/mvc/Controller'
    ],

    function (CoreController) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.search.view.CallerNoIDSearchREBS');

        Controller.prototype.onInit = function () {
            var oModel;

            /*oModel = this.getOwnerComponent().getModel('comp-dashboard');
            if (oModel) {
                oModel.read('/ProductSet');
            }*/
        };

        return Controller;
    }
);
