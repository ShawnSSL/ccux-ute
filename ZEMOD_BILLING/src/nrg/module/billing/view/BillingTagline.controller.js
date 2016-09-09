/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/json/JSONModel'
    ],

    function (CoreController, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.BillingTagline');

        return Controller;
    }
);
