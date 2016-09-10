/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController'
    ],

    function (CoreController) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.search.view.CallerNoIDEnrollment');

        Controller.prototype.onInit = function () {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager(),
                tempHolder;

            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEnrollmentList');

            if (oWebUiManager) {
                oWebUiManager.notifyWebUi('getEnrollmentConfig', null, this._handleEnrlCfgCallback, this);
            } else {
                return;
            }
        };

        Controller.prototype._handleEnrlCfgCallback = function (oEvent) {
            var oEnrList = this.getView().getModel('oEnrollmentList');

            oEnrList.setProperty('/actionList', oEvent.mParameters);
            return;
        };

        Controller.prototype._onActionItemClicked = function (oEvent) {
            var oSource = oEvent.getSource(),
                sPath = oSource.mBindingInfos.text.binding.aBindings[1].getContext().getPath(),
                oActionTarget = this.getView().getModel('oEnrollmentList').getProperty(sPath),
                oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            oWebUiManager.notifyWebUi('openIndex', {LINK_ID: oActionTarget.LINK_ID}, null, this);

            return;
        };

        Controller.prototype.onEnrollBusiness = function () {
            sap.ui.commons.MessageBox.alert("Enroll Business User");
        };

        Controller.prototype.onEnrollResident = function () {
            sap.ui.commons.MessageBox.alert("Enroll Resident User");
        };

        Controller.prototype.onEnrollRHS = function () {
            sap.ui.commons.MessageBox.alert("Enroll RHS User");
        };

        Controller.prototype.onEnrollHomeSecurity = function () {
            sap.ui.commons.MessageBox.alert("Enroll Home Security User");
        };

        return Controller;
    }
);
