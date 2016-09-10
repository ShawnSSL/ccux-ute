/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'sap/ui/model/json/JSONModel'
    ],

    function (CoreController, Filter, FilterOperator, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.usage.view.Usage');


		/* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

        };
        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        Controller.prototype.onAfterRendering = function () {
            // Update Footer
            //this.getOwnerComponent().getCcuxApp().updateFooter(this._sBP, this._sCA, this._sContract);
        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oBindingInfo,
                oServiceAddressDropDown = this.getView().byId("idnrgUsgServiceAdd-DropDown"),
                oServiceAddressTemplate = this.getView().byId("idnrgUsgServiceAdd-DropDownItem"),
                sPath,
                aFilterIds,
                aFilterValues,
                aFilters,
                fnRecievedHandler,
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                that = this,
                oUsageTable = this.getView().byId("idnrgUsgTable-Rows"),
                oUsageTableRowTemplate = this.getView().byId("idnrgUsgRow-Infoline"),
                oGraph = this.getView().byId('idnrgUsg-Graph-chart'),
                oGraphNoData = this.getView().byId('idnrgUsg-Graph-NoData'),
                oNoDataTag = this.getView().byId("idnrgUsgNoData").clone(),
                oRadioWeekly = this.getView().byId("idnrgUsgRadioweekly"),
                oGlobalDataManager = this.getOwnerComponent().getGlobalDataManager(),
                oViewModel = new JSONModel({
                    isREBS : false  // true for invoice & false for consumption
                });
            if (oGlobalDataManager.isREBS()) {
                oViewModel.setProperty("/isREBS", true);
            }
            oRadioWeekly.setChecked(true);
            this._SelectedInfoLines = [];
            that._oGraphModel = new JSONModel();
            that.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this._sType = oRouteInfo.parameters.typeV;
            aFilterIds = ["CA"];
            aFilterValues = [this._sCA];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            this.getView().setModel(oViewModel, "localModel");
            //aFilters.push(new Filter("CA", FilterOperator.Contains, "23", ""));
            fnRecievedHandler = function (oEvent, oData) {
                var aContent = oServiceAddressDropDown.getContent(),
                    sContentPath,
                    aFilterIds,
                    aFilterValues,
                    aFilters,
                    sPath = "/UsageS",
                    fnTableDataRecdHandler,
                    oBinding = oUsageTable.getBinding("content");
                fnTableDataRecdHandler = function (oEvent) {
                    var oTableBinding = oServiceAddressDropDown.getBinding("content");
                    oGraphNoData.setVisible(false);
                    that._oGraphModel.setData(that.convertEFLJson(oEvent.mParameters.data.results.reverse()));
                    oGraph.setDataModel(that._oGraphModel);
                    if (oTableBinding) {
                        oTableBinding.detachDataReceived(fnTableDataRecdHandler);
                    }
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                };
                if ((aContent) && (aContent.length > 0)) {
                    if (that._sContract) {
                        aContent.forEach(function (oItem) {
                            var oBindingContext = oItem.getBindingContext("comp-usage");
                            if (parseInt(that._sContract, 10) === parseInt(oBindingContext.getProperty("Contract"), 10)) {
                                oServiceAddressDropDown.setSelectedKey(oItem.getKey());
                            }
                        });
                    }
                    aFilterIds = ["Contract"];
                    aFilterValues = [that._sContract];
                    aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                    oBindingInfo = {
                        model : "comp-usage",
                        path : sPath,
                        template : oUsageTableRowTemplate,
                        filters : aFilters,
                        events: {dataReceived : fnTableDataRecdHandler}
                    };
                    oUsageTable.bindAggregation("content", oBindingInfo);

                } else {
                    if (oUsageTable) {
                        oUsageTable.removeAllContent();
                        oUsageTable.addContent(oNoDataTag);
                    }
                }

                if (oBinding) {
                    oBinding.detachDataReceived(fnRecievedHandler);
                }

            };
            sPath = "/SrvAddrS";
            oBindingInfo = {
                model : "comp-usage",
                path : sPath,
                template : oServiceAddressTemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oServiceAddressDropDown.bindAggregation("content", oBindingInfo);
        };
       /**
		 * Assign the filter objects based on the input selection
		 *
		 * @function
		 * @param {Array} aFilterIds to be used as sPath for Filters
         * @param {Array} aFilterValues for each sPath
		 * @private
		 */
        Controller.prototype._createSearchFilterObject = function (aFilterIds, aFilterValues) {
            var aFilters = [],
                iCount;

            for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
            }
            return aFilters;
        };
        /**
		 * Handler when user toggled between Daily and weekly
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.onExpandType = function (oEvent) {
            var that = this;
            this._SelectedInfoLines.forEach(function (oCurrent) {
                that._bindInfoLine(oCurrent);
            });
        };
       /**
		 * Handler when user expanded Info line for each row
		 *
		 * @function
		 * @param {Event} oEvent object
         *
		 *
		 */
        Controller.prototype.expandInfoline = function (oEvent) {
            var oCurrentInfoLine = oEvent.getSource().getParent(),
                iIndex,
                sTemp;

            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            oCurrentInfoLine.setExpanded(!(oCurrentInfoLine.getExpanded()));
            iIndex = this._SelectedInfoLines.indexOf(oCurrentInfoLine);
            if (oCurrentInfoLine.getExpanded()) {
                sTemp = iIndex < 0 && this._SelectedInfoLines.push(oCurrentInfoLine);
            } else {
                sTemp = iIndex > -1 && this._SelectedInfoLines.splice(iIndex, 1);
            }
            if (oCurrentInfoLine.getExpanded()) {
                this._bindInfoLine(oCurrentInfoLine);
            } else {
                oCurrentInfoLine.removeStyleClass("nrgUsgTable-InfolineSelected");
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
            }
        };
        /**
		 * Central Handler for inner Table accesing and binding data.
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype._bindInfoLine = function (oCurrentInfoLine) {
            var oRadioWeekly = this.getView().byId("idnrgUsgRadioweekly"),
                sPath,
                fnRecievedHandler,
                oInsideTableTag,
                oInsideTableTemplate = this.getView().byId("idnrgUsgTable-insideTmpl"),
                that = this,
                aFilterIds,
                aFilterValues,
                aFilters,
                oBindingContext,
                oNoDataTag = this.getView().byId("idnrgUsgNoData").clone(),
                oBindingInfo;
            if ((oRadioWeekly) && (oRadioWeekly.getChecked())) {
                sPath = "/WeeklyUsageS";
            } else {
                sPath = "/DailyUsageS";
            }
            oCurrentInfoLine.addStyleClass("nrgUsgTable-InfolineSelected");
            fnRecievedHandler = function (oEvent, oData) {
                var aContent = oInsideTableTag.getContent(),
                    oTableBinding = oInsideTableTag.getBinding("content");
                if ((aContent) && (aContent.length === 0)) {
                    oInsideTableTag.addContent(oNoDataTag);
                }
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if (oTableBinding) {
                    oTableBinding.detachDataReceived(fnRecievedHandler);
                }
            };
            oBindingContext = oCurrentInfoLine.getBindingContext("comp-usage");
            aFilterIds = ["Contract", "PeriodBegin", "PeriodEnd"];
            aFilterValues = [oBindingContext.getProperty("Contract"), oBindingContext.getProperty("PeriodBegin"), oBindingContext.getProperty("PeriodEnd")];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oInsideTableTag = oCurrentInfoLine.getContent().pop();
            oBindingInfo = {
                model : "comp-usage",
                path : sPath,
                template : oInsideTableTemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oInsideTableTag.bindAggregation("content", oBindingInfo);
        };
       /**
		 * Handler when user clicked on Back
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.backToPage = function (oEvent) {
            if (this._sType ===  "C") {
                this.navTo("campaign", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV: "C"});
            } else if (this._sType ===  "H") {
                this.onRateHistory();
            } else if (this._sType ===  "B") {
                this.navTo("billing.HighBill", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract});
            } else {
                this.navTo("dashboard.VerificationWithCaCo", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract});
            }
        };

       /**
		 * Handler when user expanded Info line for each row
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.toggleTable = function (oEvent) {
        };
       /**
		 * Handler when user expanded Info line for each row
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.toggleGraph = function (oEvent) {
/*            this.getView().byId('chart').setDataModel(new JSONModel({
                data: [
                    { meterReadDate: '3/12/2015', kwhUsage: 120, avgHighTemp: 70 },
                    { meterReadDate: '2/11/2015', kwhUsage: 123, avgHighTemp: 70 },
                    { meterReadDate: '1/12/2015', kwhUsage: 121, avgHighTemp: 70 },
                    { meterReadDate: '12/11/2014', kwhUsage: 200, avgHighTemp: 70 }
                ]
            }));*/
        };
        /**
		 * Handler when user clicked on Billing
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.onBilling = function (oEvent) {
            this.navTo("billing.BillingInfo", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract});
        };
       /**
		 * Handler when user clicked on rate history
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.onRateHistory = function (oEvent) {
            this.navTo("campaignhistory", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract});
        };
       /**
		 * Handler when user changed service address
		 *
		 * @function
		 * @param {Event} oEvent object
		 */
        Controller.prototype.onServiceAdd = function (oEvent) {
            var oBindingContext,
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath = "/UsageS",
                fnTableDataRecdHandler,
                oUsageTable = this.getView().byId("idnrgUsgTable-Rows"),
                oUsageTableRowTemplate = this.getView().byId("idnrgUsgRow-Infoline"),
                that = this,
                oBindingInfo,
                oServiceAddressDropDown = this.getView().byId("idnrgUsgServiceAdd-DropDown"),
                aContent,
                sKey,
                oGraphNoData = this.getView().byId('idnrgUsg-Graph-NoData'),
                aDummyArray = [];
            this._SelectedInfoLines = [];
            aContent = oServiceAddressDropDown.getContent();
            sKey = oServiceAddressDropDown.getSelectedKey();
            aContent.forEach(function (oContent) {
                if (oContent.getKey() === sKey) {
                    oBindingContext = oContent.getBindingContext("comp-usage");
                }
            });
            that._oGraphModel.setData(aDummyArray);
            oGraphNoData.setVisible(true);
            if (oBindingContext) {
                aFilterIds = ["Contract"];
                aFilterValues = [oBindingContext.getProperty("Contract")];
                aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                fnTableDataRecdHandler = function (oEvent) {
                    var oTableBinding = oUsageTable.getBinding("content");
                    that._oGraphModel.setData(that.convertEFLJson(oEvent.mParameters.data.results.reverse()));
                    oGraphNoData.setVisible(false);
                    if (oTableBinding) {
                        oTableBinding.detachDataReceived(fnTableDataRecdHandler);
                    }
                };
                oBindingInfo = {
                    model : "comp-usage",
                    path : sPath,
                    template : oUsageTableRowTemplate,
                    filters : aFilters,
                    events: {dataReceived : fnTableDataRecdHandler}
                };
                oUsageTable.bindAggregation("content", oBindingInfo);
            }
        };
        /**
		 * Converts in to EFL Json format required by Template view.
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.convertEFLJson = function (results) {
            var columns = [],
                temp,
                tempColumns = [],
                iCount1,
                aJsonDataNew,
                dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM/dd/yyyy" }),
                oformattedDate;
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {
                temp = results[iCount1];
                if ((temp !== undefined) && (temp.KwhUsage !== undefined)) {
                    oformattedDate = dateFormat.format(new Date(temp.PeriodEnd.getTime()));
                    columns.push({
                        "kwhUsage": parseInt(temp.KwhUsage, 10),
                        "meterReadDate": oformattedDate,
                        "avgHighTemp": parseInt(temp.HighTemp, 10)
                    });
                }
            }
            aJsonDataNew = {};
            //aJsonDataNew.results = {};
            aJsonDataNew.data = columns;
            return aJsonDataNew;
        };
        /**
		 * Handler for Side links
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.toggleCheckBook = function (oControlEvent) {
            this.navTo("billing.CheckBook", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract});
        };
        /**
		 * Handler for Side links
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.toggleBillWizard = function (oControlEvent) {
            this.navTo('billing.HighBill', {
                bpNum: this._sBP,
                caNum: this._sCA,
                coNum: this._sContract
            });
        };
        /**
		 * Handler for Dunning History Transaction launcher
		 *
		 * @function
		 * @param {Event} Type Event object
         *
		 *
		 */
        Controller.prototype.onDunningHistory = function (oControlEvent) {
            var oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();

            //this._oApp.setHeaderMenuItemSelected(false, App.HMItemId.Index);

            oWebUiManager.notifyWebUi('openIndex', {
                LINK_ID: "Z_DUNH"
            });
        };
        /**
		 * Format Date column in inner table
		 *
		 * @function
		 * @param {Contract} Type value from the binding
         * @param {ESID} Type value from the binding
         *
		 *
		 */
        Controller.prototype.formatDateColumn = function (sType, sStartDate, sEndDate) {
            var sFormattedDate = "";
            if ((sStartDate)) {
                sFormattedDate += sStartDate;
            } else {
                return;
            }
            if ((sEndDate)) {
                if (sType !== 'D') {
                    sFormattedDate += " - " + sEndDate;
                }
            }
            return sFormattedDate;
        };
        /**
		 * Format address in the drop down
		 *
		 * @function
		 * @param {Contract} Type value from the binding
         * @param {ESID} Type value from the binding
         *
		 *
		 */
        Controller.prototype.formatESID = function (Contract, ESID) {
            var sFormattedAddress = "";
            if ((Contract) && (ESID)) {
                sFormattedAddress += "[ ESID - " + ESID + " ] ";
            }
            return sFormattedAddress;
        };
        /**
		 * Format address in the drop down
		 *
		 * @function
         * @param {House} Type value from the binding
         * @param {Street} Type value from the binding
         * @param {Apt} Type value from the binding
         * @param {City} Type value from the binding
         * @param {State} Type value from the binding
         * @param {ZIP} Type value from the binding
         *
		 *
		 */
        Controller.prototype.formatAddress = function (House, Street, Apt, City, State, ZIP) {
            var sFormattedAddress = "";
            if ((House)) {
                sFormattedAddress += House;
            }
            if ((Street)) {
                sFormattedAddress += " " + Street;
            }
            if ((Apt)) {
                sFormattedAddress += ",  " + Apt;
            }
            if ((House) || (Street) || (Apt)) {
                sFormattedAddress += ",";
            }
            if ((City)) {
                sFormattedAddress += " " + City + ",";
            }
            if ((State)) {
                sFormattedAddress += " " + State;
            }
            if ((ZIP)) {
                sFormattedAddress += " " + ZIP;
            }
            return sFormattedAddress;
        };
        return Controller;
    }


);
