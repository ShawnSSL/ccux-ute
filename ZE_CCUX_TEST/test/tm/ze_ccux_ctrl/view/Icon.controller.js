/*global sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/mvc/Controller',
        'sap/ui/model/json/JSONModel'
    ],

    function (jQuery, Controller, JSONModel) {
        'use strict';

        var CustomController = Controller.extend('test.tm.ze_ccux_ctrl.view.Icon');

        CustomController.prototype.onInit = function () {
            var oModel = new JSONModel({
                icon: [
                    { key: 'sap-icon://nrg-icon/agent', value: 'sap-icon://nrg-icon/agent' },
                    { key: 'sap-icon://nrg-icon/billing', value: 'sap-icon://nrg-icon/billing' },
                    { key: 'sap-icon://nrg-icon/bp', value: 'sap-icon://nrg-icon/bp' },
                    { key: 'sap-icon://nrg-icon/bulb', value: 'sap-icon://nrg-icon/bulb' },
                    { key: 'sap-icon://nrg-icon/calculator', value: 'sap-icon://nrg-icon/calculator' },
                    { key: 'sap-icon://nrg-icon/call-center', value: 'sap-icon://nrg-icon/call-center' },
                    { key: 'sap-icon://nrg-icon/campaign', value: 'sap-icon://nrg-icon/campaign' },
                    { key: 'sap-icon://nrg-icon/cc-amex', value: 'sap-icon://nrg-icon/cc-amex' },
                    { key: 'sap-icon://nrg-icon/cc-discover', value: 'sap-icon://nrg-icon/cc-discover' },
                    { key: 'sap-icon://nrg-icon/cc-mastercard', value: 'sap-icon://nrg-icon/cc-mastercard' },
                    { key: 'sap-icon://nrg-icon/cc-visa', value: 'sap-icon://nrg-icon/cc-visa' },
                    { key: 'sap-icon://nrg-icon/contact-log', value: 'sap-icon://nrg-icon/contact-log' },
                    { key: 'sap-icon://nrg-icon/dashboard', value: 'sap-icon://nrg-icon/dashboard' },
                    { key: 'sap-icon://nrg-icon/description', value: 'sap-icon://nrg-icon/description' },
                    { key: 'sap-icon://nrg-icon/dollar', value: 'sap-icon://nrg-icon/dollar' },
                    { key: 'sap-icon://nrg-icon/enroll-biz', value: 'sap-icon://nrg-icon/enroll-biz' },
                    { key: 'sap-icon://nrg-icon/enroll-res', value: 'sap-icon://nrg-icon/enroll-res' },
                    { key: 'sap-icon://nrg-icon/gear', value: 'sap-icon://nrg-icon/gear' },
                    { key: 'sap-icon://nrg-icon/high-bill', value: 'sap-icon://nrg-icon/high-bill' },
                    { key: 'sap-icon://nrg-icon/history', value: 'sap-icon://nrg-icon/history' },
                    { key: 'sap-icon://nrg-icon/location', value: 'sap-icon://nrg-icon/location' },
                    { key: 'sap-icon://nrg-icon/notes', value: 'sap-icon://nrg-icon/notes' },
                    { key: 'sap-icon://nrg-icon/notification', value: 'sap-icon://nrg-icon/notification' },
                    { key: 'sap-icon://nrg-icon/pencil', value: 'sap-icon://nrg-icon/pencil' },
                    { key: 'sap-icon://nrg-icon/plus', value: 'sap-icon://nrg-icon/plus' },
                    { key: 'sap-icon://nrg-icon/refresh', value: 'sap-icon://nrg-icon/refresh' },
                    { key: 'sap-icon://nrg-icon/rhs', value: 'sap-icon://nrg-icon/rhs' },
                    { key: 'sap-icon://nrg-icon/service-order', value: 'sap-icon://nrg-icon/service-order' },
                    { key: 'sap-icon://nrg-icon/survey', value: 'sap-icon://nrg-icon/survey' },
                    { key: 'sap-icon://nrg-icon/tag', value: 'sap-icon://nrg-icon/tag' },
                    { key: 'sap-icon://nrg-icon/weather-cloud', value: 'sap-icon://nrg-icon/weather-cloud' },
                    { key: 'sap-icon://nrg-icon/weather-rain', value: 'sap-icon://nrg-icon/weather-rain' },
                    { key: 'sap-icon://nrg-icon/weather-rain-sun', value: 'sap-icon://nrg-icon/weather-rain-sun' },
                    { key: 'sap-icon://nrg-icon/weather-snow', value: 'sap-icon://nrg-icon/weather-snow' },
                    { key: 'sap-icon://nrg-icon/weather-sunny', value: 'sap-icon://nrg-icon/weather-sunny' },
                    { key: 'sap-icon://nrg-icon/webchat', value: 'sap-icon://nrg-icon/webchat' },
                    { key: 'sap-icon://nrg-icon/website', value: 'sap-icon://nrg-icon/website' },
                    { key: 'sap-icon://nrg-icon/person', value: 'sap-icon://nrg-icon/person' },
                    { key: 'sap-icon://nrg-icon/calendar', value: 'sap-icon://nrg-icon/calendar' },
                    { key: 'sap-icon://nrg-icon/verified', value: 'sap-icon://nrg-icon/verified' },
                    { key: 'sap-icon://nrg-icon/trashcan', value: 'sap-icon://nrg-icon/trashcan' },
                    { key: 'sap-icon://nrg-icon/search', value: 'sap-icon://nrg-icon/search' },
                    { key: 'sap-icon://nrg-icon/not-verified', value: 'sap-icon://nrg-icon/not-verified' },
                    { key: 'sap-icon://nrg-icon/handset', value: 'sap-icon://nrg-icon/handset' },
                    { key: 'sap-icon://nrg-icon/weather-1n', value: 'sap-icon://nrg-icon/weather-1n' },
                    { key: 'sap-icon://nrg-icon/weather-2n', value: 'sap-icon://nrg-icon/weather-2n' },
                    { key: 'sap-icon://nrg-icon/weather-3d', value: 'sap-icon://nrg-icon/weather-3d' },
                    { key: 'sap-icon://nrg-icon/weather-3n', value: 'sap-icon://nrg-icon/weather-3n' },
                    { key: 'sap-icon://nrg-icon/weather-4', value: 'sap-icon://nrg-icon/weather-4' },
                    { key: 'sap-icon://nrg-icon/weather-10n', value: 'sap-icon://nrg-icon/weather-10n' },
                    { key: 'sap-icon://nrg-icon/weather-11', value: 'sap-icon://nrg-icon/weather-11' },
                    { key: 'sap-icon://nrg-icon/weather-13', value: 'sap-icon://nrg-icon/weather-13' }
                ]
            });

            this.getView().setModel(oModel, 'nrgIcon');
        };

        return CustomController;
    }
);

