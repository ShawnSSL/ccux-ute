/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        "sap/ui/model/json/JSONModel"
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.FeeAdjustments');
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oViewModel = new JSONModel({
                    discNoticefee : false,  // Disc Notice Fee is pre-selected
                    discRecovfee : true,
                    Latefee : true,
                    Reconnectfee : true,
                    feeDateDD : true,
                    reasonDD: false,
                    ok: false,
                    feeSelected : false,
                    textArea : false
			    }),
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                oCATemplate = this.getView().byId("idnrgFeeAdj-DropDownCA-temp"),
                oDisconnectDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp"),
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath,
                oBindingInfo,
                fnRecievedHandler,
                that = this;
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this._sCO = oRouteInfo.parameters.coNum;
            this.getView().setModel(oViewModel, "view-feeAdj");
            aFilterIds = ["BP"];
            aFilterValues = [this._sBP];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/ContractAcctS";
            fnRecievedHandler = function (oEvent, oData) {
                var aContent = oCADropDown.getContent(),
                    fnDataReceivedHandler;
                if ((aContent) && (aContent.length > 0)) {
                    oCADropDown.setSelectedKey(aContent[0].getKey());
                    aFilterIds = ["CA"];
                    aFilterValues = [oCADropDown.getSelectedKey()];
                    aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                    sPath = "/DiscNoticeFeeS";
                    fnDataReceivedHandler = function (oEvent, oData) {
                        if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                            oDisconnectDropDown.setPlaceholder("No Data Available");
                        }
                    };
                    oBindingInfo = {
                        model : "comp-feeAdjs",
                        path : sPath,
                        template : oDisconnectTemplate,
                        filters : aFilters,
                        events: {dataReceived : fnDataReceivedHandler}
                    };
                    oDisconnectDropDown.bindAggregation("content", oBindingInfo);
                }
            };
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oCATemplate,
                filters : aFilters,
                events: {dataReceived : fnRecievedHandler}
            };
            oCADropDown.bindAggregation("content", oBindingInfo);
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
		 * Clicked on Submit
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onSubmit = function (oEvent) {
            var oModel = this.getOwnerComponent().getModel('comp-feeAdjs'),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                oTextArea = this.getView().byId("idnrgFeeAdj-textArea"),
                oDateDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oReasonDropDown = this.getView().byId("idnrgFeeAdj-DropDownReason"),
                mParameters,
                sAmount,
                sPath,
                oViewModel = this.getView().getModel("view-feeAdj");
            if (oViewModel.getProperty("/discNoticefee")) {
                sPath = "/DiscNoticeFeeS";
            }
            if (oViewModel.getProperty("/discRecovfee")) {
                sPath = "/DiscRecovFeeS";
            }
            if (oViewModel.getProperty("/Latefee")) {
                sPath = "/LateFeeS";
            }
            if (oViewModel.getProperty("/Reconnectfee")) {
                sPath = "/ReconReqFeeS";
            }
            sPath = sPath + "(CA='" + oCADropDown.getSelectedKey() + "',DocNum='" + oDateDropDown.getSelectedKey() + "')/Amount";
            sAmount = oModel.getProperty(sPath);
            mParameters = {
                method : "POST",
                urlParameters : {"Amount" : sAmount,
                                         "CA" : oCADropDown.getSelectedKey(),
                                        "DocNum" : oDateDropDown.getSelectedKey(),
                                        "Reason" : oReasonDropDown.getSelectedKey(),
                                        "Text" : oTextArea.getValue()},
                success : function (oData) {
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };
            oModel.callFunction("/RemoveFee", mParameters); // callback function for error
        };
        /**
		 * Clicked on Disconnect Notice Fee
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onDiscNoticeFee = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj"),
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath,
                oBindingInfo,
                oDisconnectDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp"),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                fnDataReceivedHandler;
            oViewModel.setProperty("/discNoticefee", false);
            oViewModel.setProperty("/discRecovfee", true);
            oViewModel.setProperty("/Latefee", true);
            oViewModel.setProperty("/Reconnectfee", true);
            oViewModel.setProperty("/reasonDD", false);
            aFilterIds = ["CA"];
            aFilterValues = [oCADropDown.getSelectedKey()];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/DiscNoticeFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Data Available");
                }
            };
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oDisconnectTemplate,
                filters : aFilters,
                events: {dataReceived : fnDataReceivedHandler}
            };
            oDisconnectDropDown.bindAggregation("content", oBindingInfo);

        };
        /**
		 * Clicked on Disconnect Recovery Fee
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onDiscRecovFee = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj"),
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath,
                oBindingInfo,
                oDisconnectDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp"),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                fnDataReceivedHandler;
            oViewModel.setProperty("/discNoticefee", true);
            oViewModel.setProperty("/discRecovfee", false);
            oViewModel.setProperty("/Latefee", true);
            oViewModel.setProperty("/Reconnectfee", true);
            oViewModel.setProperty("/reasonDD", false);
            aFilterIds = ["CA"];
            aFilterValues = [oCADropDown.getSelectedKey()];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/DiscRecovFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Data Available");
                }
            };
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oDisconnectTemplate,
                filters : aFilters,
                events: {dataReceived : fnDataReceivedHandler}
            };
            oDisconnectDropDown.bindAggregation("content", oBindingInfo);
        };
        /**
		 * Clicked on Late Fee
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onLateFee = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj"),
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath,
                oBindingInfo,
                oDisconnectDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp"),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                oReasonDropDown = this.getView().byId("idnrgFeeAdj-DropDownReason"),
                oReasonDropDownTemplate = this.getView().byId("idnrgFeeAdj-DropDownReason-temp"),
                fnDataReceivedHandler;
            oViewModel.setProperty("/discNoticefee", true);
            oViewModel.setProperty("/discRecovfee", true);
            oViewModel.setProperty("/Latefee", false);
            oViewModel.setProperty("/Reconnectfee", true);
            oViewModel.setProperty("/reasonDD", true);
            aFilterIds = ["CA"];
            aFilterValues = [oCADropDown.getSelectedKey()];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/LateFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Data Available");
                }
            };
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oDisconnectTemplate,
                filters : aFilters,
                events: {dataReceived : fnDataReceivedHandler}
            };
            oDisconnectDropDown.bindAggregation("content", oBindingInfo);
            sPath = "/RemovalReasonS";
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oReasonDropDownTemplate
            };
            oReasonDropDown.bindAggregation("content", oBindingInfo);
        };
        /**
		 * Clicked on Reconnect Fee
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onReconnectFee = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj"),
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath,
                oBindingInfo,
                oDisconnectDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp"),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                fnDataReceivedHandler;
            oViewModel.setProperty("/discNoticefee", true);
            oViewModel.setProperty("/discRecovfee", true);
            oViewModel.setProperty("/Latefee", true);
            oViewModel.setProperty("/Reconnectfee", false);
            oViewModel.setProperty("/reasonDD", false);
            sPath = "/ReconReqFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Data Available");
                }
            };
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oDisconnectTemplate,
                filters : aFilters,
                events: {dataReceived : fnDataReceivedHandler}
            };
            oDisconnectDropDown.bindAggregation("content", oBindingInfo);
        };
        /**
		 * Clicked on Reconnect Fee
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onCoSelect = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj");
            if (!oViewModel.getProperty("/discNoticefee")) {
                this.onDiscNoticeFee();
            }
            if (!oViewModel.getProperty("/discRecovfee")) {
                this.onDiscRecovFee();
            }
            if (!oViewModel.getProperty("/Latefee")) {
                this.onLateFee();
            }
            if (!oViewModel.getProperty("/Reconnectfee")) {
                this.onReconnectFee();
            }

        };
        /**
		 * Enable the Ok button if dropdown selected
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onFeeDDSelect = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj");
            oViewModel.setProperty("/ok", true);
        };
        /**
		 * Clicked on Cancel Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onCancel = function (oEvent) {
            this.navTo("billing.CheckBook", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sCO});
        };


        return Controller;
    }

);
