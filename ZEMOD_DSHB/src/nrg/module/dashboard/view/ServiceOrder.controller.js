/*global sap*/
/*globals ute*/
/*globals $*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'jquery.sap.global',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ],

    function (CoreController, jQuery, Filter, FilterOperator) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.dashboard.view.ServiceOrder');

        Controller.prototype.onInit = function () {
            //Code to retrivie user role
            /*var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            if (oWebUiManager) {
                oWebUiManager.notifyWebUi('getBusinessRole', null, this._handleBsnsRlCallback, this);
            } else {
                return;
            }*/
        };

        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this.getView().setModel(this.getOwnerComponent().getModel('comp-dashboard-svcodr'), 'oODataSvc');

            //Model to keep information to show
			this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oSelectedTabs');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oPndingVisType');

            //Model for ESID dropdown
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oESIDDropdown');

            //Model for Movin Enroll
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEnrollHolds');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEnrollPndingStats');

            //Model for Reconnect
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oReconOrds');

            //Model for Disconnect
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDiscOrds');

            //Model for Others
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oOtherOrds');

            //Model for Completed Orders
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oCompleteOrds');

            // Retrieve routing parameters
            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            //init displaying model
            this._initSelectTab();
            this._initPndingVisType();

            //Init dropdpwn
            this._initESIDDropdown();

        };

        Controller.prototype._handleBsnsRlCallback = function (oEvent) {
            var oTemp = oEvent;
            return;
        };

        /********************************************************************************************************************************/
        //Init functions
        /********************************************************************************************************************************/
        Controller.prototype._initSelectTab = function () {
            this.getView().getModel('oSelectedTabs').setProperty('/pendingSelected', true);
            this.getView().getModel('oSelectedTabs').setProperty('/completeSelected', false);
        };

        Controller.prototype._initPndingVisType = function () {
            this.getView().getModel('oPndingVisType').setProperty('/visMovein', false);
            this.getView().getModel('oPndingVisType').setProperty('/visReconnect', false);
            this.getView().getModel('oPndingVisType').setProperty('/visDisconnect', false);
            this.getView().getModel('oPndingVisType').setProperty('/visOthers', false);
        };

        Controller.prototype._initESIDDropdown = function () {
            this._retrESIDs();
        };
        /********************************************************************************************************************************/

        /********************************************************************************************************************************/
        //Formatter functions
        /********************************************************************************************************************************/
        Controller.prototype._formatVisPnd = function (bPndSelected, bTypeOrder) {
            return bPndSelected && bTypeOrder;
        };

        Controller.prototype._formatVisMvi = function (results) {
            return (!(!results));   // false if results is empty
        };

        Controller.prototype._formatDate = function (oDate) {
            var sFormattedDate;

            if (!oDate) {
                return null;
            } else {
                sFormattedDate = (oDate.getMonth() + 1).toString() + '/' + oDate.getDate().toString() + '/' + oDate.getFullYear().toString().substring(2, 4);
                return sFormattedDate;
            }
        };

        /********************************************************************************************************************************/
        //Handler functions
        /********************************************************************************************************************************/
        Controller.prototype._onPendingTabClicked = function () {
            this.getView().getModel('oSelectedTabs').setProperty('/pendingSelected', true);
            this.getView().getModel('oSelectedTabs').setProperty('/completeSelected', false);
            if (this.getView().getModel('oESIDDropdown').oData.results) {
                this._retrEnrollHolds(this.getView().getModel('oESIDDropdown').oData.results[0].ESID, this.getView().getModel('oESIDDropdown').oData.results[0].Contract);
            }
        };

        Controller.prototype._onCompleteTabClicked = function () {
            this.getView().getModel('oSelectedTabs').setProperty('/pendingSelected', false);
            this.getView().getModel('oSelectedTabs').setProperty('/completeSelected', true);
            if (this.getView().getModel('oESIDDropdown').oData.results) {
                this._retrCompleteOrds(this._bpNum, this._caNum, this.getView().getModel('oESIDDropdown').oData.results[0].ESID);
            }
        };

        Controller.prototype._onESIDSelect = function (oEvent) {
            if (this.getView().getModel('oSelectedTabs').getProperty('/pendingSelected')) {
                if (this.getView().getModel('oESIDDropdown').oData.results) {
                    this._retrEnrollHolds(this.getView().getModel('oESIDDropdown').oData.results[oEvent.mParameters.selectedKey].ESID, this.getView().getModel('oESIDDropdown').oData.results[oEvent.mParameters.selectedKey].Contract);
                }
            } else {
                if (this.getView().getModel('oESIDDropdown').oData.results) {
                    this._retrCompleteOrds(this._bpNum, this._caNum, this.getView().getModel('oESIDDropdown').oData.results[oEvent.mParameters.selectedKey].ESID);
                }
            }
        };
        /********************************************************************************************************************************/

        /********************************************************************************************************************************/
        //Service call functions
        /********************************************************************************************************************************/
        Controller.prototype._retrESIDs = function () {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc'),
                i;

            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: this._caNum}));

            sPath = '/SrvAddrS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    var defaultContractItem = 0;

                    if (oData) {
                        oData.results.selectedKey = '';
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            oData.results[i].iInd = i;
                            // Select the CO passed from dashboard
                            if (oData.results[i].Contract.replace(/^0+/, '') === this._coNum) {
                                defaultContractItem = oData.results[i].iInd;
                            }
                        }
                        this.getView().getModel('oESIDDropdown').setData(oData);
                        this.getView().byId('idESIDDropdown').setSelectedKey(defaultContractItem);
                        this._retrEnrollHolds(oData.results[0].ESID, oData.results[0].Contract);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }

        };

        Controller.prototype._retrEnrollHolds = function (sESID, sContract) {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sContract}));
            aFilters.push(new Filter({ path: 'ESID', operator: FilterOperator.EQ, value1: sESID}));

            sPath = '/EnrollHoldS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length > 0) {
                        this.getView().getModel('oEnrollHolds').setData(oData);
                        this.getView().getModel('oPndingVisType').setProperty('/visMovein', true);
                        this._retrEnrollPndingStats(this._bpNum, this._caNum, sESID);
                    } else {
                        sPath = 'test';
                    }
                    //This part need to move to else later
                    this._retrReconOrds(this._bpNum, this._caNum, sContract, sESID);
                    this._retrDiscOrds(this._bpNum, this._caNum, sContract, sESID);
                    this._retrOtherOrds(this._bpNum, this._caNum, sContract, sESID);
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrEnrollPndingStats = function (sBpNum, sCaNum, sESID) {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNum}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNum}));
            aFilters.push(new Filter({ path: 'ESID', operator: FilterOperator.EQ, value1: sESID}));

            sPath = '/PendStatS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length > 0) {
                        this.getView().getModel('oEnrollPndingStats').setData(oData);
                        this.getView().getModel('oPndingVisType').setProperty('/visMovein', true);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrReconOrds = function (sBpNum, sCaNum, sCoNum, sESID) {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNum}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNum}));
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sCoNum}));
            aFilters.push(new Filter({ path: 'ESID', operator: FilterOperator.EQ, value1: sESID}));

            sPath = '/ReconOrdS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length > 0) {
                        this.getView().getModel('oReconOrds').setData(oData);
                        this.getView().getModel('oPndingVisType').setProperty('/visReconnect', true);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrDiscOrds = function (sBpNum, sCaNum, sCoNum, sESID) {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNum}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNum}));
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sCoNum}));
            aFilters.push(new Filter({ path: 'ESID', operator: FilterOperator.EQ, value1: sESID}));

            sPath = '/DiscOrdS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length > 0) {
                        this.getView().getModel('oDiscOrds').setData(oData);
                        this.getView().getModel('oPndingVisType').setProperty('/visDisconnect', true);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }

        };

        Controller.prototype._retrOtherOrds = function (sBpNum, sCaNum, sCoNum, sESID) {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNum}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNum}));
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sCoNum}));
            aFilters.push(new Filter({ path: 'ESID', operator: FilterOperator.EQ, value1: sESID}));

            sPath = '/OtherOrdS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length > 0) {
                        this.getView().getModel('oOtherOrds').setData(oData);
                        this.getView().getModel('oPndingVisType').setProperty('/visOthers', true);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrCompleteOrds = function (sBpNum, sCaNum, sESID) {
            var sPath,
                aFilters = [],
                oParameters,
                oModel = this.getView().getModel('oODataSvc');

            aFilters.push(new Filter({ path: 'BP', operator: FilterOperator.EQ, value1: sBpNum}));
            aFilters.push(new Filter({ path: 'CA', operator: FilterOperator.EQ, value1: sCaNum}));
            aFilters.push(new Filter({ path: 'ESID', operator: FilterOperator.EQ, value1: sESID}));

            sPath = '/ComplOrdS';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results.length > 0) {
                        this.getView().getModel('oCompleteOrds').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /**
		 * Back to DashBoard
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onDashBoard = function (oEvent) {
            this.navTo("dashboard.VerificationWithCaCo", {bpNum: this._bpNum, caNum: this._caNum, coNum : this._coNum});
        };
        /********************************************************************************************************************************/

		return Controller;
	}
);
