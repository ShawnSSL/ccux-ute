/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/mvc/Controller',
        'sap/ui/model/json/JSONModel'
    ],

    function (Controller, JSONModel) {
        'use strict';

        var CustomController = Controller.extend('test.tm.ze_ccux_ctrl.view.CustJourneyChannel');

        CustomController.prototype.onBeforeRendering = function () {
            this.getView().byId('chart').setDataModel(new JSONModel({
                data: [
                    { channel: 'Website', frequency: 3 },
                    { channel: 'Mobile', frequency: 3 },
                    { channel: 'IVR', frequency: 1 },
                    { channel: 'Webchat', frequency: 5 },
                    { channel: 'Phone', frequency: 2 },
                    { channel: 'Survey', frequency: 6 },
                    { channel: 'Correspondence', frequency: 4 }
                ]
            }));
        };

        CustomController.prototype._onTotalPress = function (oEvent) {
            //console.log(oEvent);
        };

        CustomController.prototype._onSlicePress = function (oEvent) {
            //console.log(oEvent.getParameters());
        };

        return CustomController;
    }
);
