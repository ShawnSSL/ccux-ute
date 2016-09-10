/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ],

    function (CoreController, Filter, FilterOperator) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.dashboard.view.Reconnect');

        /**********************************************************************************************************************/
        //On Start
        /**********************************************************************************************************************/

        Controller.prototype.onBeforeRendering = function () {
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();
            // Get the ABP popup control
            this._ReconnectControl = this.getView().getParent();
            var oRouteInfo = this._OwnerComponent.getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            this.getView().setModel(this._OwnerComponent.getModel('comp-dashboard-svcodr'), 'oODataSvc');

            //Model to keep Reconnect info and status
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oReconnectInfo');
            this._checkReconnectElgi();
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
            if (!this._oReconnectPopup) {
                this._oReconnectPopup = ute.ui.main.Popup.create({
				    content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.dashboard.view.Reconnect", this),
					title: 'RECONNECTION'
				});
                this._oReconnectPopup.addStyleClass('nrgDashboard-reconnectionPopup');
				this.getView().addDependent(this._oReconnectPopup);
            }


            this._checkReconnectElgi();
        };

        Controller.prototype._onStandardRecoSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/RecoType', 'S');
            }
        };

        Controller.prototype._onEmergencyRecoSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/RecoType', 'E');
            }
        };

        Controller.prototype._onMtrAcsYesSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/AccMeter', 'X');
            }
        };

        Controller.prototype._onMtrAcsNoSelected = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (oReconnectInfo.oData.results.length > 0) {
                oReconnectInfo.setProperty('/AccMeter', '');
            }
        };

        Controller.prototype._onReconnectClicked = function () {
            /*this._updateRecconectInfo();*/
            this._confirmReconnectInput();
        };

        Controller.prototype._onReconnectCancelClicked = function () {
            this._ReconnectControl.close();
        };

        /**********************************************************************************************************************/
        //Other Functions for Logic
        /**********************************************************************************************************************/
        Controller.prototype._confirmReconnectInput = function () {
            var oReconnectInfo = this.getView().getModel('oReconnectInfo');

            if (!oReconnectInfo.getProperty('/ReqName')) {
                ute.ui.main.Popup.Alert({
                    title: 'Reconnection -- Confirm',
                    message: 'Please input requestor\'s name.'
                });
            } else if (!oReconnectInfo.getProperty('/ReqNumber')) {
                ute.ui.main.Popup.Alert({
                    title: 'Reconnection -- Confirm',
                    message: 'Please input requestor\'s number.'
                });
            } else if (!oReconnectInfo.getProperty('/AccMeter') && !oReconnectInfo.getProperty('/AccComment')) {
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
            var that = this;
            ute.ui.main.Popup.Confirm({
                title: 'Reconnection -- Confirm',
                message: 'Please confirm that you have communicated the Power-on expectations to the customer.',
                callback: function (sAction) {
                    if (sAction === 'Yes') {
                        that._updateRecconectInfo();
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
                oModel = this.getView().getModel('oODataSvc'),
                that = this;

            sPath = '/RecoEligS(\'' + this._caNum + '\')';

            oParameters = {
                success : function (oData) {
                    if (oData.RElig) {
                        this._retrReconnectInfo();
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Reconnection',
                            message: oData.Message
                        });
                        that._ReconnectControl.close();
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
                oModel = this.getView().getModel('oODataSvc'),
                that = this;


            aFilters.push(new Filter({ path: 'PartnerID', operator: FilterOperator.EQ, value1: this._bpNum}));
            aFilters.push(new Filter({ path: 'BuagID', operator: FilterOperator.EQ, value1: this._caNum}));

            sPath = '/Reconnects' + '(' + 'PartnerID=\'' + this._bpNum + '\'' + ',BuagID=\'' + this._caNum + '\')';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                    if (oData) {
                        this.getView().getModel('oReconnectInfo').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                    if (oError && oError.responseText) {
                        var oErrorObject = JSON.parse(oError.responseText);
                        if (oErrorObject && oErrorObject.error && oErrorObject.error.message && oErrorObject.error.message.value) {
                            ute.ui.main.Popup.Alert({
                                title: 'Reconnection',
                                message: oErrorObject.error.message.value
                            });
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Reconnection',
                                message: "Error in Backend"
                            });
                        }
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Reconnection',
                            message: "Error in Backend"
                        });
                    }
                    that._ReconnectControl.close();

                }.bind(this)
            };

            if (oModel) {
                this._OwnerComponent.getCcuxApp().setOccupied(true);
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._updateRecconectInfo = function () {
            var sPath,
                oParameters,
                oModel = this.getView().getModel('oODataSvc'),
                oReconnectInfo = this.getView().getModel('oReconnectInfo'),
                sMessage,
                that = this;

            sPath = '/Reconnects';

            oParameters = {
                merge: false,
                success : function (oData) {
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                    if (oData) {
                        sMessage = 'Reconnect Notification ' + oData.RecoNumber + ' created for contract ' + oData.VERTRAG;
                        ute.ui.main.Popup.Alert({
                            title: 'Reconnection',
                            message: sMessage
                        });
                    }
                    that._ReconnectControl.close();
                }.bind(this),
                error: function (oError) {
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Reconnection',
                        message: 'Recoonection Service Order Request Failed'
                    });
                    that._ReconnectControl.close();
                }.bind(this)
            };

            if (oModel) {
                that._OwnerComponent.getCcuxApp().setOccupied(true);
                oModel.create(sPath, oReconnectInfo.getData(), oParameters);
            }
        };
        return Controller;
    }
);
