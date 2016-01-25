/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'sap/ui/core/format/DateFormat'
    ],

    function (CoreController, JSONModel, Filter, FilterOperator, jQuery, DateFormat) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.BillingCustomerJourney');
		/* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

        };
		/* =========================================================== */
		/* lifecycle method- onAfterRendering                          */
		/* =========================================================== */
        Controller.prototype.onAfterRendering = function () {
            //this.getOwnerComponent().getCcuxApp().setLayout('FullWidthTool');
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("nrg.module.dashoard", "eAfterConfirmed", this._refreshCJ, this);
			oEventBus.subscribe("nrg.module.dashoard", "eAfterConfirmed", this._refreshCJ, this);

        };
		/* =========================================================== */
		/* lifecycle method- onBeforeRendering                         */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oBindingInfo,
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                sPath,
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                that = this,
                oDatesJsonModel,
                oViewModel = new JSONModel({
                    expandAll : false,
                    piechart : false,
                    icons: false,
                    interval1 : false,
                    interval2: false,
                    referral: false
                }),
                oPieChartModel,
                oPieChart = this.getView().byId('idnrgCJPieChart'),
                oTimeLineModel;
            oTimeLineModel = new JSONModel();
            this.getView().setModel(oTimeLineModel, 'Cj-timeline');
            oPieChartModel = new JSONModel();
            oPieChart.setDataModel(oPieChartModel);
            this.getView().setModel(oPieChartModel, 'Cj-PieChart');
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this._oFormatYyyymmdd = DateFormat.getInstance({
                pattern: 'MM/dd/yyyy'
            });
            this.getView().setModel(oViewModel, 'cj-view');
            oDatesJsonModel = new JSONModel();
            this.getView().setModel(oDatesJsonModel, 'Cj-Date');
            sPath = "/CJLifeCycleSet(BP='" + this._sBP + "',CA='" + this._sCA + "')";
            oBindingInfo = {
                success : function (oData) {
                    oDatesJsonModel.setData(oData);
                    that._dateHandler(true, false, oData.FirstButtonEnabled);
                    that._loadIcons(oData.StartDate, oData.EndDate);
                    that._loadPieChart(oData.StartDate, oData.EndDate);
                    that._loadReferral(oData.StartDate, oData.EndDate);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Odata Read Error occured");
                }.bind(this)
            };
            if (oModel && this._sBP && this._sCA) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * Handler for Customer Journey Refresh
		 *
		 * @function
         *
		 */
        Controller.prototype._refreshCJ = function (channel, event, data) {
            var sPath,
                oBindingInfo,
                oDatesJsonModel = this.getView().getModel('Cj-Date'),
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                that = this;
            // to Avoid reloading with same information.
            if ((data.bpNum) && (this._sBP) && (parseInt(this._sBP, 10) === parseInt(data.bpNum, 10))) {
                if ((data.caNum) && (this._sCA) && (parseInt(this._sCA, 10) === parseInt(data.caNum, 10))) {
                    return;
                }
            }
            this._sBP = data.bpNum;
            this._sCA = data.caNum;
            sPath = "/CJLifeCycleSet(BP='" + this._sBP + "',CA='" + this._sCA + "')";
            oBindingInfo = {
                success : function (oData) {
                    oDatesJsonModel.setData(oData);
                    that._dateHandler(true, false, oData.FirstButtonEnabled);
                    that._loadIcons(oData.StartDate, oData.EndDate);
                    that._loadPieChart(oData.StartDate, oData.EndDate);
                    that._loadReferral(oData.StartDate, oData.EndDate);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Odata Read Error occured");
                }.bind(this)
            };
            if (oModel && this._sBP && this._sCA) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * Handler for Referral Data loading
		 *
		 * @function
         *
		 */
        Controller.prototype._loadReferral = function (dStartDate, dEndDate) {
            var oDatesJsonModel,
                sPath,
                oBindingInfo,
                oReferral = this.getView().byId('idnrgCustomerRef'),
                oReferralTemplate = this.getView().byId('idnrgCustomerRef-temp'),
                aFilterIds,
                aFilterValues,
                aFilters,
                fnRecievedHandler,
                oViewModel = this.getView().getModel('cj-view'),
                that = this;
            aFilterIds = ["BP", "CA", "StartDate", "EndDate"];
            aFilterValues = [this._sBP, this._sCA, dStartDate, dEndDate];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/CJReferralSet";
            oReferral.removeContent();
            oViewModel.setProperty("/referral", false);
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            fnRecievedHandler = function (oEvent) {
                if ((oEvent) && (oEvent.mParameters) && (oEvent.mParameters.data) && (oEvent.mParameters.data.results) && (oEvent.mParameters.data.results.length > 0)) {
                    oViewModel.setProperty("/referral", true);
                }
                jQuery.sap.log.info("Odata Read successfully");
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
            };
            oBindingInfo = {
                model : "comp-cj",
                path : sPath,
                template : oReferralTemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oReferral.bindAggregation("content", oBindingInfo);
        };
        /**
		 * Handler for Icons loading
		 *
		 * @function
         *
		 */
        Controller.prototype._loadPieChart = function (dStartDate, dEndDate) {
            var sPath,
                aFilterIds,
                aFilterValues,
                aFilters,
                oBindingInfo,
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                oPieChartModel = this.getView().getModel('Cj-PieChart'),
                oPieChart = this.getView().byId('idnrgCJPieChart'),
                that = this,
                oViewModel = this.getView().getModel('cj-view');
            sPath = "/CJFrequencySet";
            aFilterIds = ["BP", "CA", "StartDate", "EndDate"];
            aFilterValues = [this._sBP, this._sCA, dStartDate, dEndDate];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oBindingInfo = {
                filters : aFilters,
                success : function (oData) {
                    oPieChartModel.setData(oData);
                    if ((oData.results) && (oData.results.length > 0)) {
                        oViewModel.setProperty("/piechart", false);
                    } else {
                        oViewModel.setProperty("/piechart", true);
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    oPieChart.refreshChart();
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Odata Read Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * Handler for Icons loading
		 *
		 * @function
         *
		 */
        Controller.prototype._loadIcons = function (dStartDate, dEndDate) {
            var sPath,
                aFilterIds,
                aFilterValues,
                aFilters,
                oBindingInfo,
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                oTimeLineModel = this.getView().getModel('Cj-timeline'),
                that = this,
                oViewModel = this.getView().getModel('cj-view');
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sPath = "/CJIconsSet";
            aFilterIds = ["BP", "CA", "StartDate", "EndDate"];
            aFilterValues = [this._sBP, this._sCA, dStartDate, dEndDate];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oBindingInfo = {
                filters : aFilters,
                success : function (oData) {
                    oTimeLineModel.setData(that.convertIcons(oData.results));
                    if ((oData.results) && (oData.results.length > 0)) {
                        oViewModel.setProperty("/icons", false);
                    } else {
                        oViewModel.setProperty("/icons", true);
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Odata Read Error occured");
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * Central handler for dates
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._dateHandler = function (binitial, bManualChange, bInterval1) {
            var oFromDate = this.getView().byId('idnrgBllCJ-fromDate'),
                oToDate = this.getView().byId('idnrgBllCJ-toDate'),
                oInterval1Button = this.getView().byId('idnrgBllCJ-Interval1'),
                oInterval2Button = this.getView().byId('idnrgBllCJ-Interval2'),
                oDatesJsonModel = this.getView().getModel('Cj-Date'),
                oNewDate = new Date(),
                oViewModel = this.getView().getModel('cj-view');
            if (binitial) {
                oToDate.setMinDate(new Date(1, 0, 1));
                oFromDate.setMinDate(new Date(1, 0, 1));
            }
            if (!bManualChange) {
                if (oDatesJsonModel.getProperty("/FirstButtonEnabled")) {
                    oViewModel.setProperty("/interval1", true);
                    oViewModel.setProperty("/interval2", false);
                } else {
                    oViewModel.setProperty("/interval1", false);
                    oViewModel.setProperty("/interval2", true);
                }
                if (oDatesJsonModel.getProperty("/EndDate")) {
                    oToDate.setDefaultDate(this._oFormatYyyymmdd.format(oDatesJsonModel.getProperty("/EndDate"), true));
                }
                if (oDatesJsonModel.getProperty("/StartDate")) {
                    oFromDate.setDefaultDate(this._oFormatYyyymmdd.format(oDatesJsonModel.getProperty("/StartDate"), true));
                }
            } else {
                if (bInterval1) {
                    oNewDate.setDate(oNewDate.getDate() - oDatesJsonModel.getProperty("/Interval1"));
                    oToDate.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), true));
                    oDatesJsonModel.setProperty("/EndDate", new Date());
                    oFromDate.setDefaultDate(this._oFormatYyyymmdd.format(oNewDate, true));
                    oDatesJsonModel.setProperty("/StartDate", oNewDate);
                } else {
                    oNewDate.setDate(oNewDate.getDate() - oDatesJsonModel.getProperty("/Interval2"));
                    oToDate.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), true));
                    oDatesJsonModel.setProperty("/EndDate", new Date());
                    oFromDate.setDefaultDate(this._oFormatYyyymmdd.format(oNewDate, true));
                    oDatesJsonModel.setProperty("/StartDate", oNewDate);
                }

            }
        };
        /**
		 * Handler for Channel single press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onInterval1 = function (oEvent) {
            var oDatesJsonModel = this.getView().getModel('Cj-Date'),
                oViewModel = this.getView().getModel('cj-view');
            oViewModel.setProperty("/interval1", false);
            oViewModel.setProperty("/interval2", true);
            this._dateHandler(false, true, true);
            this._loadIcons(oDatesJsonModel.getProperty("/StartDate"), oDatesJsonModel.getProperty("/EndDate"));
            this._loadPieChart(oDatesJsonModel.getProperty("/StartDate"), oDatesJsonModel.getProperty("/EndDate"));
            this._loadReferral(oDatesJsonModel.getProperty("/StartDate"), oDatesJsonModel.getProperty("/EndDate"));
        };
        /**
		 * Handler for Channel single press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onInterval2 = function (oEvent) {
            var oDatesJsonModel = this.getView().getModel('Cj-Date'),
                oViewModel = this.getView().getModel('cj-view');
            oViewModel.setProperty("/interval1", true);
            oViewModel.setProperty("/interval2", false);
            this._dateHandler(false, true, false);
            this._loadIcons(oDatesJsonModel.getProperty("/StartDate"), oDatesJsonModel.getProperty("/EndDate"));
            this._loadPieChart(oDatesJsonModel.getProperty("/StartDate"), oDatesJsonModel.getProperty("/EndDate"));
            this._loadReferral(oDatesJsonModel.getProperty("/StartDate"), oDatesJsonModel.getProperty("/EndDate"));
        };
        /**
		 * Handler when user changed dates
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onUpdate = function (oEvent) {
            var oFromDate = new Date(this.getView().byId('idnrgBllCJ-fromDate').getValue()),
                oToDate = new Date(this.getView().byId('idnrgBllCJ-toDate').getValue()),
                oDatesModel = this.getView().getModel('Cj-Date'),
                oViewModel = this.getView().getModel('cj-view');
            oViewModel.setProperty("/interval1", true);
            oViewModel.setProperty("/interval2", true);
            oDatesModel.setProperty("/StartDate", oFromDate);
            oDatesModel.setProperty("/EndDate", oToDate);
            this._loadIcons(oDatesModel.getProperty("/StartDate"), oDatesModel.getProperty("/EndDate"));
            this._loadPieChart(oDatesModel.getProperty("/StartDate"), oDatesModel.getProperty("/EndDate"));
            this._loadReferral(oDatesModel.getProperty("/StartDate"), oDatesModel.getProperty("/EndDate"));
        };
        /**
		 * Handler for Channel single press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onChannelPress = function (oEvent) {
            oEvent.getSource().setSelected(!oEvent.getSource().getSelected());
        };
        /**
		 * Handler for Channel Double press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onChannelDPress = function (oEvent) {
            //console.log(oEvent);
        };

        /**
		 * Handler for Pie-Chart Total press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onTotalPress = function (oEvent) {
            //console.log(oEvent);
            this.onCustomerJourneyModule();
        };
        /**
		 * Handler for Pie-Chart individual totals press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onSlicePress = function (oEvent) {
            //console.log(oEvent.getParameters());
            this.onCustomerJourneyModule();
        };
       /**
		 * Assign the filter objects based on the input selection
		 *
		 * @function
		 * @param {Array} aFilterIds to be used as sPath for Filters
         * @param {Array} aFilterValues for each sPath
		 * @private
		 */
        Controller.prototype._createSearchFilterObject = function (aFilterIds, aFilterValues, sFilterOperator) {
            var aFilters = [],
                iCount;
            if (!sFilterOperator) {
                sFilterOperator = FilterOperator.EQ;
            }
            if (aFilterIds !== undefined) {
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
                }
            }
            return aFilters;
        };
        /**
		 * Display Customer Journey module when user navigated
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onContactLogs = function (oEvent) {
            var sPath,
                mParameters,
                oCJTable,
                aFilters,
                aFilterIds,
                aFilterValues,
                that = this,
                oFromDate,
                oToDate,
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                oCustomerJourneyModel,
                oDatesModel,
                oSearchText;
            this._ChannelType = "CLOG";
            oDatesModel = this.getView().getModel('Cj-Date');
            oCustomerJourneyModel = new JSONModel();
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["BP", "CA", "StartDate", "EndDate", "ChannelType"];
            aFilterValues = [this._sBP, this._sCA, oDatesModel.getProperty("/StartDate"), oDatesModel.getProperty("/EndDate"), "CLOG"];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            if (!this._oContactLogFragment) {
                this._oContactLogFragment = sap.ui.xmlfragment("ContactLogs", "nrg.module.billing.view.CJModule", this);
            }
            if (this._oContactLogDialog === undefined) {
                this._oContactLogDialog = new ute.ui.main.Popup.create({
                    title: 'Contact Logs',
                    content: this._oContactLogFragment
                });
                this._oContactLogDialog.addStyleClass("nrgCJModule-dialog");
            }
            this._oContactLogFragment.setModel(oCustomerJourneyModel, 'Cj-module');
            this._oContactLogFragment.setModel(new JSONModel({
                visible: false
            }), 'CJ-local');
            sPath = "/CJModuleSet";
            oCJTable = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-table");
            oCJTable.setModel(oCustomerJourneyModel);
            oFromDate = sap.ui.core.Fragment.byId("ContactLogs", "idnrgBllCJ-fromDate");
            oToDate = sap.ui.core.Fragment.byId("ContactLogs", "idnrgBllCJ-toDate");
            oToDate.setMinDate(new Date(1, 0, 1));
            oFromDate.setMinDate(new Date(1, 0, 1));
            oToDate.setDefaultDate(this._oFormatYyyymmdd.format(oDatesModel.getProperty("/EndDate"), true));
            oFromDate.setDefaultDate(this._oFormatYyyymmdd.format(oDatesModel.getProperty("/StartDate"), true));
            oSearchText = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-search");
            oSearchText.setValue("");
            mParameters = {
                filters : aFilters,
                success : function (oData) {
                    oCustomerJourneyModel.setData(that.convertCJModuleData(oData.results));
                    that._oContactLogDialog.open();
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, mParameters);
            }
        };
        /**
		 * Display Customer Journey module when user navigated
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onCustomerJourneyModule = function (oEvent) {
            var sPath,
                mParameters,
                oCJTable,
                aFilters,
                aFilterIds,
                aFilterValues,
                that = this,
                oFromDate,
                oToDate,
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                oCustomerJourneyModel,
                oDatesModel,
                oSearchText;
            this._ChannelType = "CJM";
            oDatesModel = this.getView().getModel('Cj-Date');
            oCustomerJourneyModel = new JSONModel();
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["BP", "CA", "StartDate", "EndDate", "ChannelType"];
            aFilterValues = [this._sBP, this._sCA, oDatesModel.getProperty("/StartDate"), oDatesModel.getProperty("/EndDate"), "CJM"];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            if (!this._oDialogFragment) {
                this._oDialogFragment = sap.ui.xmlfragment("CustomerJourney", "nrg.module.billing.view.CJModule", this);
            }
            if (this._oCJDialog === undefined) {
                this._oCJDialog = new ute.ui.main.Popup.create({
                    title: 'CUSTOMER JOURNEY MODULE',
                    content: this._oDialogFragment
                });
                //this.getView().addDependent(this._oCJDialog);
                this._oCJDialog.addStyleClass("nrgCJModule-dialog");
            }
            this._oDialogFragment.setModel(oCustomerJourneyModel, 'Cj-module');
            sPath = "/CJModuleSet";
            oCJTable = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-table");
            oCJTable.setModel(oCustomerJourneyModel);
            oFromDate = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgBllCJ-fromDate");
            oToDate = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgBllCJ-toDate");
            oToDate.setMinDate(new Date(1, 0, 1));
            oFromDate.setMinDate(new Date(1, 0, 1));
            oToDate.setDefaultDate(this._oFormatYyyymmdd.format(oDatesModel.getProperty("/EndDate"), true));
            oFromDate.setDefaultDate(this._oFormatYyyymmdd.format(oDatesModel.getProperty("/StartDate"), true));
            this._oDialogFragment.setModel(new JSONModel({
                data: [
                    { recordIndex: '0', channelIcon: 'sap-icon://nrg-icon/website', topLabel: 'Website', channel: 'Website'},
                    { recordIndex: '1', channelIcon: 'sap-icon://nrg-icon/webchat', topLabel: 'Chat', channel: 'Chat'},
                    { recordIndex: '2', channelIcon: 'sap-icon://nrg-icon/survey', topLabel: 'Survey', channel: 'Survey'},
                    { recordIndex: '3', channelIcon: 'sap-icon://nrg-icon/agent', topLabel: 'Phone', channel: 'Phone'},
                    { recordIndex: '4', channelIcon: 'sap-icon://nrg-icon/ivr', topLabel: 'IVR', channel: 'IVR'},
                    { recordIndex: '5', channelIcon: 'sap-icon://email', topLabel: 'Correspondence', channel: 'Correspondence'},
                    { recordIndex: '6', channelIcon: 'sap-icon://iphone', topLabel: 'Mobile', channel: 'Mobile'},
                    { recordIndex: '7', channelIcon: 'sap-icon://nrg-icon/location', topLabel: 'Misc', channel: 'Misc'},
                    { recordIndex: '7', channelIcon: 'sap-icon://multi-select', topLabel: 'All', channel: 'All'}
                ]
            }), 'timeline');
            this._oDialogFragment.setModel(new JSONModel({
                visible: true
            }), 'CJ-local');
            oSearchText = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-search");
            oSearchText.setValue("");
            mParameters = {
                filters : aFilters,
                success : function (oData) {
                    oCustomerJourneyModel.setData(that.convertCJModuleData(oData.results));
                    that._oCJDialog.open();
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, mParameters);
            }
        };
        /**
		 * Handler for customer journey module refresh
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onModuleRefresh = function (oControlEvent) {
            var oFromDate,
                oToDate,
                aFilters,
                aFilterIds,
                aFilterValues,
                mParameters,
                oModel = this.getOwnerComponent().getModel('comp-cj'),
                oCustomerJourneyModel,
                that = this,
                sPath = "/CJModuleSet",
                sChannel,
                oCJTable,
                oCJDropDown,
                oFilter1,
                oSearchText;

            this.getOwnerComponent().getCcuxApp().setOccupied(true);

            if (this._ChannelType !== "CLOG") { //it is a customer journey normal view.
                oCustomerJourneyModel = this._oDialogFragment.getModel('Cj-module');
                oCJTable = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-table");
                oCJDropDown = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-DD");
                oSearchText = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-search");
                oFromDate = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgBllCJ-fromDate");
                oToDate = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgBllCJ-toDate");
                sChannel =  oCJDropDown.getSelectedKey();
                if (sChannel === "All") {
                    sChannel = "";
                }
            } else { // it is a contact log view.
                oCustomerJourneyModel = this._oContactLogFragment.getModel('Cj-module');
                oCJTable = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-table");
                oSearchText = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-search");
                oFromDate = sap.ui.core.Fragment.byId("ContactLogs", "idnrgBllCJ-fromDate");
                oToDate = sap.ui.core.Fragment.byId("ContactLogs", "idnrgBllCJ-toDate");
                sChannel = "";
            }
            oSearchText.setValue("");
            aFilterIds = ["BP", "CA", "StartDate", "EndDate", "ChannelType"];
            aFilterValues = [this._sBP, this._sCA, (new Date(oFromDate.getValue())), (new Date(oToDate.getValue())), this._ChannelType];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            mParameters = {
                filters : aFilters,
                success : function (oData) {
                    oCustomerJourneyModel.setData(that.convertCJModuleData(oData.results));
                    oFilter1 = new sap.ui.model.Filter("ChannelType", sap.ui.model.FilterOperator.Contains, sChannel);
                    aFilters = new sap.ui.model.Filter({filters: [oFilter1], and: false });
                    oCJTable.getBinding("rows").filter(aFilters);
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, mParameters);
            }
        };
        /**
		 * Handler for Customer Referral Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onCustomerReferral = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager(),
                oReferralId = oControlEvent.getSource().getText();

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "ZEMMACASE",
                REF_ID: oReferralId
            });
        };
        /**
		 * Handler for Customer Referral Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onContactLogFullView = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_CLFULLVW"
            });
        };
        /**
		 * Mapping Icons with backend Data
		 *
		 * @function
         * @param {string} sChanneltype from backend
         * @return {string} sChannelIcon for backend sChanneltype
		 */
        Controller.prototype._onSelectIcon = function (sChanneltype) {
            var sChannelIcon = 'sap-icon://nrg-icon/location';
            switch (sChanneltype) {
            case "Website":
                sChannelIcon = 'sap-icon://nrg-icon/website';
                break;
            case "Chat":
                sChannelIcon = 'sap-icon://nrg-icon/webchat';
                break;
            case "Survey":
                sChannelIcon = 'sap-icon://nrg-icon/survey';
                break;
            case "agent":
                sChannelIcon = 'sap-icon://nrg-icon/agent';
                break;
            case "IVR":
                sChannelIcon = 'sap-icon://nrg-icon/ivr';
                break;
            case "Phone":
                sChannelIcon = 'sap-icon://nrg-icon/agent';
                break;
            case "Correspondence":
                sChannelIcon = 'sap-icon://email';
                break;
            case "Mobile":
                sChannelIcon = 'sap-icon://iphone';
                break;
            case "MISC":
                sChannelIcon = 'sap-icon://nrg-icon/location';
                break;
            }
            return sChannelIcon;
        };
        /**;;
		 * Converts in to Icons Json format.
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.convertIcons = function (results) {
            var columns = [],
                temp,
                tempColumns = [],
                continueFlag = false,
                iCount1,
                iCount2,
                aJsonDataNew;
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {
                if ((results[iCount1] !== undefined) && (results[iCount1].Icon !== undefined)) {
                    results[iCount1].Channel = results[iCount1].Icon;
                    results[iCount1].Icon = this._onSelectIcon(results[iCount1].Icon);
                }
            }
            aJsonDataNew = {};
            aJsonDataNew.results = results;
            return aJsonDataNew;
        };
        /**;;
		 * Converts in to Icons Json format.
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.convertCJModuleData = function (results) {
            var columns = [],
                rows = [],
                temp,
                iCount1,
                iCount2,
                aHeaders,
                aValues,
                iCounter,
                row = {},
                aJsonDataNew,
                cells = [];
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {
                temp = results[iCount1];
                if ((temp !== undefined) && (temp.ColHeaders !== undefined)) {
                    aHeaders = temp.ColHeaders.split("~");
                    for (iCount2 = 0; iCount2 < aHeaders.length; iCount2 = iCount2 + 1) {
                        columns.push({
                            "header": aHeaders[iCount2]
                        });
                    }
                    results[iCount1].headers = columns;
                    columns = [];
                }
                if ((temp !== undefined) && (temp.ColValues !== undefined)) {
                    aValues = temp.ColValues.split("~");
                    iCounter = 1;
                    cells = [];
                    for (iCount2 = 0; iCount2 < aValues.length; iCount2 = iCount2 + 1) {
                        cells.push({
                            "value": aValues[iCount2]
                        });
                    }
                    results[iCount1].values = [];
                    results[iCount1].values.push({
                        "cells": cells
                    });
                }
                results[iCount1].expanded = false;
            }
            aJsonDataNew = {};
            aJsonDataNew.results = results;
            return aJsonDataNew;
        };
        /**
		 * Handler for Channel Double press action
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onChannelSelect = function (oEvent) {
            var sChannel = oEvent.getSource().getChannel(),
                oFilter1,
                aFilters,
                oCJTable = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-table");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            oEvent.getSource().setSelected(!oEvent.getSource().getSelected());
            if (sChannel === "All") {
                sChannel = "";
            }
            oFilter1 = new sap.ui.model.Filter("ChannelType", sap.ui.model.FilterOperator.Contains, sChannel);
            aFilters = new sap.ui.model.Filter({filters: [oFilter1], and: false });
            oCJTable.getBinding("rows").filter(aFilters);
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
        };
        /**
		 * Handler for Expand All
		 *
		 * @function
		 * @param {oEvent} sap.ui.event
         *
		 *
		 */
        Controller.prototype.onExpandAll = function (oEvent) {
            var aRows,
                oModel = oEvent.getSource().getParent().getModel("Cj-module"),
                iCount,
                oTempRow,
                oContext,
                sPath,
                oViewModel = this.getView().getModel('cj-view');
            if (this._ChannelType !== "CLOG") { //it is a customer journey normal view.
                aRows = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-table").getRows();
            } else {
                aRows = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-table").getRows();
            }
            for (iCount = 0; iCount < aRows.length; iCount = iCount + 1) {
                oTempRow = aRows[iCount];
                oContext = oTempRow.getBindingContext("Cj-module");
                sPath = oContext.getPath();
                oModel.setProperty(sPath + "/expanded", !(oContext.getProperty(sPath + "/expanded")));
            }
            if (!oViewModel.getProperty("/expandAll")) {
                oEvent.getSource().addStyleClass("nrgCJModule-table-th-contactsel");
                oViewModel.setProperty("/expandAll", true);
            } else {
                oEvent.getSource().removeStyleClass("nrgCJModule-table-th-contactsel");
                oViewModel.setProperty("/expandAll", false);
            }
        };
        /**
		 * Handler for onSearch
		 *
		 * @function
		 * @param {oEvent} sap.ui.event
         *
		 *
		 */
        Controller.prototype.onSearch = function (oEvent) {
            var oSearchText,
                oFilter1,
                oFilter2,
                aFilterValues,
                aFilters,
                oCJTable;
            if (this._ChannelType !== "CLOG") { //it is a customer journey normal view.
                oSearchText = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-search");
                oCJTable = sap.ui.core.Fragment.byId("CustomerJourney", "idnrgCJModule-table");
            } else {
                oSearchText = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-search");
                oCJTable = sap.ui.core.Fragment.byId("ContactLogs", "idnrgCJModule-table");
            }
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            oFilter1 = new sap.ui.model.Filter("SingleMessage", sap.ui.model.FilterOperator.Contains, oSearchText.getValue());
            oFilter2 = new sap.ui.model.Filter("ColValues", sap.ui.model.FilterOperator.Contains, oSearchText.getValue());
            aFilters = new sap.ui.model.Filter({filters: [oFilter1, oFilter2], and: false });
            oCJTable.getBinding("rows").filter(aFilters);
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
        };
        return Controller;
    }
);
