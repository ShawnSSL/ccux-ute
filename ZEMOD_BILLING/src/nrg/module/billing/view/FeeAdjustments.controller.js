/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'sap/ui/model/json/JSONModel',
        'nrg/base/type/Price'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel, price) {
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
                    textArea : "",
                    textAreaValue : false
			    }),
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                oCATemplate = this.getView().byId("idnrgFeeAdj-DropDownCA-temp"),
                oDisconnectDropDown = this.getView().byId("idnrgFeeAdj-DropDownDate"),
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp").clone(),
                aFilterIds,
                aFilterValues,
                aFilters,
                sPath,
                oBindingInfo,
                fnRecievedHandler,
                that = this,
                oTextArea = this.getView().byId("idnrgFeeAdj-textArea");
            oDisconnectDropDown.removeAllContent();
            //oTextArea.setValue("");
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
                    that._sCA =  parseInt(that._sCA, 10);
                    oCADropDown.setSelectedKey(that._sCA);
                    aFilterIds = ["CA"];
                    aFilterValues = [that._sCA];
                    aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                    sPath = "/DiscNoticeFeeS";
                    fnDataReceivedHandler = function (oEvent, oData) {
                        if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                            oDisconnectDropDown.setPlaceholder("No Fee(s) Found");
                        } else if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length > 0)) {
                            oDisconnectDropDown.setPlaceholder("CHOOSE THE FEE");
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
                sReason,
                sPath,
                oViewModel = this.getView().getModel("view-feeAdj"),
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            if (!oViewModel.getProperty("/discNoticefee")) {
                sPath = "/DiscNoticeFeeS";
                sReason = "DISC_NOTIC";
            }
            if (!oViewModel.getProperty("/discRecovfee")) {
                sPath = "/DiscRecovFeeS";
                sReason = "DISC_RECVR";
            }
            if (!oViewModel.getProperty("/Latefee")) {
                sPath = "/LateFeeS";
                sReason = oReasonDropDown.getSelectedKey();
                if (!sReason) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Please select a Reason'
                    });
                    return;
                }
            }
            if (!oViewModel.getProperty("/Reconnectfee")) {
                sPath = "/ReconReqFeeS";
                sReason = "RECON_REQ";
            }
            sPath = sPath + "(CA='" + oCADropDown.getSelectedKey() + "',DocNum='" + oDateDropDown.getSelectedKey() + "')/Amount";
            sAmount = oModel.getProperty(sPath);
            mParameters = {
                method : "POST",
                urlParameters : {"Amount" : sAmount || 0,
                                 "CA" : oCADropDown.getSelectedKey(),
                                 "DocNum" : oDateDropDown.getSelectedKey(),
                                 "Reason" : sReason,
                                 "Text" : oTextArea.getValue()},
                success : function (oData) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oData && oData.Success) {
                        ute.ui.main.Popup.Alert({
                            title: "Fee Adjustments",
                            message: oData.Message
                        });
                    } else {
                        var sMessage = "<div style='margin:10px'>" + oData.Message + "</div>",
                            oText = new sap.ui.core.HTML({content: sMessage}),
                            oButton = new ute.ui.main.Button({text: 'OK', press: function () {that._AlertDialog.close(); }}),
                            oTag = new ute.ui.commons.Tag();
                        oTag.addContent(oText);
                        oTag.addContent(oButton);
                        if (that._AlertDialog === undefined) {
                            that._AlertDialog = new ute.ui.main.Popup.create({
                                title: "Fee Adjustments",
                                content: oTag
                            });
                        }
                        that._AlertDialog.open();
                    }
                    that.navTo("billing.CheckBook", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sCO});
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: "Fee Adjustments",
                        message: "Late Fee has not been removed."
                    });
                    that.navTo("billing.CheckBook", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sCO});
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
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp").clone(),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                fnDataReceivedHandler,
                oTextArea = this.getView().byId("idnrgFeeAdj-textArea");
            oTextArea.setValue("");

            oDisconnectDropDown.removeAllContent();

            oViewModel.setProperty("/discNoticefee", false);
            oViewModel.setProperty("/discRecovfee", true);
            oViewModel.setProperty("/Latefee", true);
            oViewModel.setProperty("/Reconnectfee", true);
            oViewModel.setProperty("/reasonDD", false);
            oViewModel.setProperty("/textArea", "");
            aFilterIds = ["CA"];
            aFilterValues = [oCADropDown.getSelectedKey()];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/DiscNoticeFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Fee(s) Found");
                } else if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length > 0)) {
                    oDisconnectDropDown.setPlaceholder("CHOOSE THE FEE");
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
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp").clone(),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                fnDataReceivedHandler,
                oTextArea = this.getView().byId("idnrgFeeAdj-textArea");
            oTextArea.setValue("");

            oDisconnectDropDown.removeAllContent();

            oViewModel.setProperty("/discNoticefee", true);
            oViewModel.setProperty("/discRecovfee", false);
            oViewModel.setProperty("/Latefee", true);
            oViewModel.setProperty("/Reconnectfee", true);
            oViewModel.setProperty("/reasonDD", false);
            oViewModel.setProperty("/textArea", "");
            aFilterIds = ["CA"];
            aFilterValues = [oCADropDown.getSelectedKey()];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/DiscRecovFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Fee(s) Found");
                } else if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length > 0)) {
                    oDisconnectDropDown.setPlaceholder("CHOOSE THE FEE");
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
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp").clone(),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                oReasonDropDown = this.getView().byId("idnrgFeeAdj-DropDownReason"),
                oReasonDropDownTemplate = this.getView().byId("idnrgFeeAdj-DropDownReason-temp").clone(),
                fnDataReceivedHandler,
                oTextArea = this.getView().byId("idnrgFeeAdj-textArea"),
                fnDataReceivedHandler2;
            oTextArea.setValue("");

            oDisconnectDropDown.removeAllContent();
            oReasonDropDown.removeAllContent();
            oViewModel.setProperty("/discNoticefee", true);
            oViewModel.setProperty("/discRecovfee", true);
            oViewModel.setProperty("/Latefee", false);
            oViewModel.setProperty("/Reconnectfee", true);
            oViewModel.setProperty("/reasonDD", true);
            oViewModel.setProperty("/textArea", "");
            aFilterIds = ["CA"];
            aFilterValues = [oCADropDown.getSelectedKey()];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/LateFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Fee(s) Found");
                } else if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length > 0)) {
                    oDisconnectDropDown.setPlaceholder("CHOOSE THE FEE");
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
            fnDataReceivedHandler2 = function (oEvent, oData) {
                if ((oReasonDropDown.getContent()) && (oReasonDropDown.getContent().length === 0)) {
                    oReasonDropDown.setPlaceholder("No Reason(s) Found");
                } else if ((oReasonDropDown.getContent()) && (oReasonDropDown.getContent().length > 0)) {
                    oReasonDropDown.setPlaceholder("CHOOSE THE REASON");
                }
            };
            sPath = "/RemovalReasonS";
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                template : oReasonDropDownTemplate,
                events: {dataReceived : fnDataReceivedHandler2}
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
                oDisconnectTemplate = this.getView().byId("idnrgFeeAdj-DropDownDate-temp").clone(),
                oCADropDown = this.getView().byId("idnrgFeeAdj-DropDownCA"),
                fnDataReceivedHandler,
                oTextArea = this.getView().byId("idnrgFeeAdj-textArea");
            oTextArea.setValue("");

            oDisconnectDropDown.removeAllContent();

            oViewModel.setProperty("/discNoticefee", true);
            oViewModel.setProperty("/discRecovfee", true);
            oViewModel.setProperty("/Latefee", true);
            oViewModel.setProperty("/Reconnectfee", false);
            oViewModel.setProperty("/reasonDD", false);
            oViewModel.setProperty("/textArea", "");
            sPath = "/ReconReqFeeS";
            fnDataReceivedHandler = function (oEvent, oData) {
                if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length === 0)) {
                    oDisconnectDropDown.setPlaceholder("No Fee(s) Found");
                } else if ((oDisconnectDropDown.getContent()) && (oDisconnectDropDown.getContent().length > 0)) {
                    oDisconnectDropDown.setPlaceholder("CHOOSE THE FEE");
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
        Controller.prototype._parseCAValue = function (oValue) {
            if (oValue) {
                return parseInt(oValue, 10);
            } else {
                return "";
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
		 * formatting function to enable button or not based on the other field selections.
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._enableButton = function (sTextArea, bOkFlag) {
            if ((sTextArea) && (bOkFlag)) {
                return true;
            } else {
                return false;
            }

        };
        /**
		 * Clicked on Cancel Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onCancel = function (oEvent) {
            var oText = new sap.ui.core.HTML({content: "<div style='position:relative;width:64px;height:64px;background-color:black;'></div>"}),
                oButton = new ute.ui.main.Button({text: 'OK', press: function () {this.Popupclose(); }}),
                oTag = new ute.ui.commons.Tag();
            oTag.addContent(oText);
            oTag.addContent(oButton);
            if (this._AlertDialog === undefined) {
                this._AlertDialog = new ute.ui.main.Popup.create({
                    title: 'Change Campaign - Cancel',
                    content: oTag
                });
            }
            this._AlertDialog.open();
            this.navTo("billing.CheckBook", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sCO});
        };
         /**
		 * Clicked on Cancel Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.Popupclose = function (oEvent) {
            this._AlertDialog.close();
        };
        /**
		 * Clicked on Cancel Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._onTextAreaValue = function (oEvent) {
            var oViewModel = this.getView().getModel("view-feeAdj");
            oViewModel.setProperty("/textAreaValue", true);
        };

        return Controller;
    }
);
