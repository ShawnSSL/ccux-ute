/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/dashboard/view/ReconnectPopup'
    ],

    function (CoreController, Filter, FilterOperator, ReconnectPopup) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.dashboard.view.Tools');

        /**********************************************************************************************************************/
        //On Start
        /**********************************************************************************************************************/
        Controller.prototype.onInit = function () {
        };

        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            this.getView().setModel(this.getOwnerComponent().getModel('comp-dashboard-svcodr'), 'oODataSvc');

            //Model to keep Reconnect info and status
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oReconnectInfo');


        };

        /**********************************************************************************************************************/
        //Formatter
        /**********************************************************************************************************************/
        Controller.prototype._formatEmergencyReco = function (cIndicator) {
            if (cIndicator === 'E' || cIndicator === 'e') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._formatStandardReco = function (cIndicator) {
            if (cIndicator === 'S' || cIndicator === 's') {
                return true;
            } else {
                return false;
            }
        };



        /**********************************************************************************************************************/
        //Handlers
        /**********************************************************************************************************************/
        Controller.prototype._onReconnectionClick = function () {
/*            if (!this._oReconnectPopup) {
                this._oReconnectPopup = ute.ui.main.Popup.create({
				    content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.dashboard.view.Reconnect", this),
					title: 'RECONNETION'
				});
                this._oReconnectPopup.addStyleClass('nrgDashboard-reconnectionPopup');
				this.getView().addDependent(this._oReconnectPopup);
            }


            this._checkReconnectElgi();*/
            if (!this.ReconnectPopupControl) {
                this.ReconnectPopupControl = new ReconnectPopup({ isRetro: true });

                this.ReconnectPopupControl.attachEvent("ReConnectCompleted", function () {}, this);
                this.getView().addDependent(this.ReconnectPopupControl);
            }
            this.ReconnectPopupControl.open();
        };

        Controller.prototype._onStandardRecoSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/results/0/RecoType', 'S');
            }
        };

        Controller.prototype._onEmergencyRecoSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/results/0/RecoType', 'E');
            }
        };

        Controller.prototype._onMtrAcsYesSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/results/0/AccMeter', 'X');
            }
        };

        Controller.prototype._onMtrAcsNoSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/results/0/AccMeter', '');
            }
        };

        Controller.prototype._onReconnectClicked = function () {
            /*this._updateRecconectInfo();*/
            this._confirmReconnectInput();
        };

        Controller.prototype._onReconnectCancelClicked = function () {
            this._oReconnectPopup.close();
        };

        /**********************************************************************************************************************/
        //Other Functions for Logic
        /**********************************************************************************************************************/
        Controller.prototype._confirmReconnectInput = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (!oReconnectInfo.getProperty('/results/0/ReqName')) {
                ute.ui.main.Popup.Alert({
                    title: 'Reconnection -- Confirm',
                    message: 'Please input requestor\'s name.'
                });
            } else if (!oReconnectInfo.getProperty('/results/0/ReqNumber')) {
                ute.ui.main.Popup.Alert({
                    title: 'Reconnection -- Confirm',
                    message: 'Please input requestor\'s number.'
                });
            } else if (!oReconnectInfo.getProperty('/results/0/AccMeter') && !oReconnectInfo.getProperty('/results/0/AccComment')) {
                ute.ui.main.Popup.Alert({
                    title: 'Reconnection -- Confirm',
                    message: 'Please input meter access comment.'
                });
            } else {
                this._confirmMeterAccess();
            }
        };

        Controller.prototype._confirmMeterAccess = function () {
            ute.ui.main.Popup.Confirm({
                title: 'Reconnection -- Confirm',
                message: 'Have you confirmed the meter\'s accessibility?',
                callback: function (sAction) {
                    if (sAction === 'Yes') {
                        this._confirmPowerOnExpect();
                    }
                }.bind(this)
            });
        };

        Controller.prototype._confirmPowerOnExpect = function () {
            ute.ui.main.Popup.Confirm({
                title: 'Reconnection -- Confirm',
                message: 'Please confirm that you have communicated the Power-on expectations to the customer.',
                callback: function (sAction) {
                    if (sAction === 'Yes') {
                        this._updateRecconectInfo();
                    }
                }
            });
        };

        /**********************************************************************************************************************/
        //Request Functions
        /**********************************************************************************************************************/
        Controller.prototype._checkReconnectElgi = function () {
            var sPath,
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            sPath = '/RecoEligS(\'' + this._caNum + '\')';

            oParameters = {
                success : function (oData) {
                    if (oData.RElig) {
                        if (this._oReconnectPopup) {
                            this._oReconnectPopup.open();
                            this._retrReconnectInfo();
                        }
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Reconnection',
                            message: oData.Message
                        });
                        return false;
                    }
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'Reconnection',
                        message: 'Connection error, reconnection eligible call failed.'
                    });
                    return false;
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrReconnectInfo = function () {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');


            aFilters.push(new Filter({ path: 'PartnerID', operator: FilterOperator.EQ, value1: this._bpNum}));
            aFilters.push(new Filter({ path: 'BuagID', operator: FilterOperator.EQ, value1: this._caNum}));

            sPath = '/Reconnects' + '(' + 'PartnerID=\'' + this._bpNum + '\'' + ',BuagID=\'' + this._caNum + '\')';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oReconnectInfo').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._updateRecconectInfo = function () {
            var sPath,
                oParameters,
                oModel = this.getView().getModel('oODataSvc'),
                oReconnectInfo = this.getView().getModel('oReconnectInfo'),
                sMessage;

            sPath = '/Reconnects';

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData) {
                        sMessage = 'Reconnect Notification ' + oData.RecoNumber + ' created for contract ' + oData.VERTRAG;
                        ute.ui.main.Popup.Alert({
                            title: 'Reconnection',
                            message: sMessage
                        });
                    }
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'Reconnection',
                        message: 'Recoonection Service Order Request Failed'
                    });
                }.bind(this)
            };

            if (oModel) {
                oModel.create(sPath, oReconnectInfo.getProperty('/results/0/'), oParameters);
            }
        };



        return Controller;
    }
);
