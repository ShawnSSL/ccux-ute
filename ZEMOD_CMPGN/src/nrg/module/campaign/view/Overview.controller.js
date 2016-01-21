/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'sap/ui/model/json/JSONModel'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.campaign.view.Overview');
		/* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {
            this._aPendingSelPaths = []; // Array for Pending Swaps Selected
        };
        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        Controller.prototype.onAfterRendering = function () {
            // Update Footer
            this.getOwnerComponent().getCcuxApp().updateFooter(this._sBP, this._sCA, this._sContract);
        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oModel = this.getOwnerComponent().getModel('comp-campaign'),
                sCurrentPath,
                sEligibilityPath,
                oBindingInfo,
                oToggleContainer = this.getView().byId("idnrgCamOvr-TabBar"),
                oToggleTemplate = this.getView().byId("idnrgCamOvr-TabItem").clone(),
                aContent,
                aFilters,
                aFilterIds,
                aFilterValues,
                oTemplatesView,
                oBinding,
                fnRecievedHandler,
                that = this,
                sTempValue,
                sPath,
                oMetaContext,
                oTemplateView,
                oTemplateModel,
                aEFLDatapaths,
                iCount,
                aResults = [],
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                i18NModel;

            i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this.getOwnerComponent().getCcuxApp().setTitle("CAMPAIGNS");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this._sFlag = oRouteInfo.parameters.typeV.toUpperCase();
            aFilterIds = ["Contract"];
            aFilterValues = [this._sContract];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sCurrentPath = i18NModel.getProperty("nrgCurrentPendingSet");
            sEligibilityPath = "/ButtonS";
            sEligibilityPath = sEligibilityPath + "('" + this._sContract + "')";
            oTemplateModel = new JSONModel();
            // Handler function for Tab Bar Item.
            fnRecievedHandler = function (oEvent) {
                var sOfferCode,
                    oToggleContainerBinding = oToggleContainer.getBinding("content");
                aContent = oToggleContainer.getContent();
                if ((aContent !== undefined) && (aContent.length > 0)) {
                    if ((that._sFlag) && ((that._sFlag === "PE") || (that._sFlag === "P"))) {  // For pending Campaign check whether there is any data
                        that._sFlag = "PE";
                        for (iCount = 0; iCount < aContent.length; iCount = iCount + 1) {
                            sTempValue = aContent[iCount].getBindingContext("comp-campaign").getProperty("Type");
                            sOfferCode = aContent[iCount].getBindingContext("comp-campaign").getProperty("OfferCode");
                            if ((sTempValue) && (sTempValue === that._sFlag) && (sOfferCode !== '00000000')) {
                                aContent[iCount].setSelected(true);
                                sPath = aContent[iCount].getBindingContext("comp-campaign").getPath();
                            } else if ((!sTempValue) && (sTempValue !== "C")) {
                                aContent[iCount].setEnabled(false);
                                that._sFlag = "C";
                                ute.ui.main.Popup.Alert({
                                    title: 'Information',
                                    message: 'Pending Campaign is not available'
                                });
                            }
                        }
                    }
                    if ((that._sFlag) && (that._sFlag === "C")) {
                        for (iCount = 0; iCount < aContent.length; iCount = iCount + 1) {
                            sTempValue = aContent[iCount].getBindingContext("comp-campaign").getProperty("Type");
                            sOfferCode = aContent[iCount].getBindingContext("comp-campaign").getProperty("OfferCode");
                            if ((sTempValue) && (sTempValue === that._sFlag)) {
                                aContent[iCount].setSelected(true);
                                sPath = aContent[iCount].getBindingContext("comp-campaign").getPath();
                            } else if ((!sTempValue) || (sTempValue === "PE")) {
                                if ((sOfferCode)) {
                                    aContent[iCount].setEnabled(true);
                                } else {
                                    aContent[iCount].setEnabled(false);
                                }

                            }
                        }
                    }
                    if (!sPath) {
                        if (aContent && aContent.length > 0) {
                            sPath = aContent[0].getBindingContext("comp-campaign").getPath();
                        }
                    }
                   // aContent[0].addStyleClass("nrgCamHisBut-Selected");
                    aEFLDatapaths = this.getModel("comp-campaign").getProperty(sPath + "/EFLs");
                    if ((aEFLDatapaths) && (aEFLDatapaths.length > 0)) {
                        for (iCount = 0; iCount < aEFLDatapaths.length; iCount = iCount + 1) {
                            aResults.push(this.getModel("comp-campaign").getProperty("/" + aEFLDatapaths[iCount]));
                        }
                        oTemplateModel.setData(that.convertEFLJson(aResults));
                        that._oEFLModel = oTemplateModel;
                        oTemplateView = sap.ui.view({
                            preprocessors: {
                                xml: {
                                    models: {
                                        tmpl : that._oEFLModel
                                    }
                                }
                            },
                            type: sap.ui.core.mvc.ViewType.XML,
                            viewName: "nrg.module.campaign.view.EFLData"
                        });
                        that.getView().byId('idnrgCamOvrPriceT').removeAllAggregation("content");
                        that.getView().byId('idnrgCamOvrPriceT').addContent(oTemplateView);
                    }
                    if (sPath) {
                        that.getView().bindElement({
                            model : "comp-campaign",
                            path : sPath
                        });
                    }
                }
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if (oToggleContainerBinding) {
                    oToggleContainerBinding.detachDataReceived(fnRecievedHandler);
                }
            };
             // Handler function for Tab Bar Item.
            oBindingInfo = {
                model : "comp-campaign",
                path : sCurrentPath,
                template : oToggleTemplate,
                filters : aFilters,
                parameters : {expand: "EFLs"},
                events: {dataReceived : fnRecievedHandler}
            };
            oToggleContainer.bindAggregation("content", oBindingInfo);
            oBindingInfo = {
                //filters : aFilters,
                success : function (oData) {
                    this.getView().byId("idCamCustReqOfferBtn").bindElement({
                        model : "comp-campaign",
                        path : sEligibilityPath
                    });
                    oModel.updateBindings(false);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Eligibility Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sEligibilityPath, oBindingInfo);
            }

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
		 * Toggles between Current and Pending clicks
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.toggleCampaign = function (oEvent) {
            var sPath,
                aEFLDatapaths,
                iCount,
                aResults = [],
                that = this,
                oTemplateView,
                oTemplateModel;
            sPath = oEvent.getSource().getBindingContext("comp-campaign").getPath();
            oTemplateModel = new JSONModel();
            // aContent[0].addStyleClass("nrgCamHisBut-Selected");
            that.getView().byId('idnrgCamOvrPriceT').removeAllAggregation("content");
            aEFLDatapaths = this.getView().getModel("comp-campaign").getProperty(sPath + "/EFLs");
            if ((aEFLDatapaths !== undefined) && (aEFLDatapaths.length > 0)) {
                for (iCount = 0; iCount < aEFLDatapaths.length; iCount = iCount + 1) {
                    aResults.push(this.getView().getModel("comp-campaign").getProperty("/" + aEFLDatapaths[iCount]));
                }
            }
            oTemplateModel.setData(that.convertEFLJson(aResults));
            oTemplateView = sap.ui.view({
                preprocessors: {
                    xml: {
                        models: {
                            tmpl : oTemplateModel
                        }
                    }
                },
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "nrg.module.campaign.view.EFLData"
            });

            that.getView().byId('idnrgCamOvrPriceT').addContent(oTemplateView);
            this.getView().bindElement({
                model : "comp-campaign",
                path : sPath
            });
        };

        /**
		 * Traverse to Offers View when the user selected Agent requested buttons
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAgentRequestedOffers = function (oEvent) {
            var sFirstMonthBill = oEvent.getSource().getBindingContext("comp-campaign").getProperty("FirstBill"),
                sInitTab = oEvent.getSource().getBindingContext("comp-campaign").getProperty("InitTab");
            if ((!sInitTab) || (sInitTab === undefined) || (sInitTab === null) || (sInitTab === "")) {
                this._sInitTab = "SE";
            } else {
                this._sInitTab = sInitTab;
            }
            if (sFirstMonthBill === "X") {
                //sap.ui.commons.MessageBox.alert("Customer has to completed atleast One Month Invoice");
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: 'Customer has to completed atleast One Month Invoice'
                });
            } else {
                this._getPendingSwapsCount(oEvent);
            }
        };
        /**
		 * Traverse to Offers View when the user selected Customer requested buttons
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onCustomerRequestedOffers = function (oEvent) {
            var sFirstMonthBill = oEvent.getSource().getBindingContext("comp-campaign").getProperty("FirstBill"),
                sCustomerEligible = oEvent.getSource().getBindingContext("comp-campaign").getProperty("CustEligFlag"),
                sInitTab = oEvent.getSource().getBindingContext("comp-campaign").getProperty("InitTab"),
                sPendingMoveOut = oEvent.getSource().getBindingContext("comp-campaign").getProperty("PendMvo"),
                _CancellationPopupHandler,
                that = this,
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            if ((!sInitTab) || (sInitTab === undefined) || (sInitTab === null) || (sInitTab === "")) {
                this._sInitTab = "SE";
            } else {
                this._sInitTab = sInitTab;
            }
            if (sPendingMoveOut) {
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: i18NModel.getProperty("nrgCmpOvrPendingMoveOut")
                });
                return;
            }
            if (!sFirstMonthBill) {
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: i18NModel.getProperty("nrgCmpOvrFirstBillMsg")
                });
            } else {
/*                if (sCustomerEligible === "X") {
                    this._getPendingSwapsCount(oEvent);
                } else {
                    _CancellationPopupHandler = function (sAction) {
                        switch (sAction) {
                        case ute.ui.main.Popup.Action.Yes:
                            that._getPendingSwapsCount(oEvent);
                            break;
                        case ute.ui.main.Popup.Action.No:
                        // No Action decided
                            break;
                        case ute.ui.main.Popup.Action.Ok:
                        // No Action decided
                            break;
                        }
                    };
                    ute.ui.main.Popup.Confirm({
                        title: 'Cancellation',
                        message: 'Customer may be charged a cancellation fee',
                        callback: _CancellationPopupHandler
                    });
                }*/
                this._getPendingSwapsCount(oEvent);
            }
        };
        /**
		 * Queries Odata and get the count of the pending swaps
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype._getPendingSwapsCount = function (oEvent) {
            var sCurrentPath,
                aFilterIds,
                aFilterValues,
                aFilters,
                mParameters,
                oModel,
                that = this,
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            sCurrentPath = i18NModel.getProperty("nrgPendingSwapsSet");
            sCurrentPath = sCurrentPath + "/$count";
            aFilterIds = ["Contract"];
            aFilterValues = [this._sContract];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            mParameters = {
                filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        jQuery.sap.log.info("Odata Read Successfully:::");
                        if ((parseInt(oData, 10)) > 0) {
                            that.showPendingSwaps();
                        } else {
                            that.navTo("campaignoffers", {bpNum: that._sBP, caNum: that._sCA, coNum: that._sContract, typeV : that._sInitTab});
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Odata Failed:::" + oError);
                }.bind(this)
            };
            oModel = this.getOwnerComponent().getModel('comp-campaign');
            if (oModel) {
                oModel.read(sCurrentPath, mParameters);
            }
        };
        /**
		 * Formats the Type value to display "Current Campaign" or "Pending Campaign"
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.formatType = function (sType) {
            var i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            if (sType === "C") {
                return i18NModel.getProperty("nrgCmpOvrCt");
            } else {
                return i18NModel.getProperty("nrgCmpOvrPg");
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
                continueFlag = false,
                oBRRow = [],
                oCERow = [],
                oBRCells = [],
                oCECells = [],
                iCount1,
                iCount2,
                aJsonDataNew,
                aTypes = [],
                tempTypes = [];

            // First check how many types are availble in the result list
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {

                temp = results[iCount1];
                if ((temp !== undefined) && (temp.EFLType !== undefined)) {

                  // Columns Assignment.
                    if (tempTypes !== undefined) {

                        for (iCount2 = 0; iCount2 < tempTypes.length; iCount2  = iCount2 + 1) {
                            if (temp.EFLType === tempTypes[iCount2]) {
                                continueFlag = true;
                                break;
                            }
                        }
                        if (continueFlag) {
                            continueFlag = false;
                        } else {
                            tempTypes.push(temp.EFLType);
                        }
                    }

                    // Columns Assignment.
                }
            }
            // Take out EFL levels which are columns
            for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {

                temp = results[iCount1];
                if ((temp !== undefined) && (temp.EFLLevel !== undefined)) {

                  // Columns Assignment.
                    if (tempColumns !== undefined) {

                        for (iCount2 = 0; iCount2 < tempColumns.length; iCount2  = iCount2 + 1) {
                            if (temp.EFLLevel === tempColumns[iCount2]) {
                                continueFlag = true;
                                break;
                            }
                        }
                        if (continueFlag) {
                            continueFlag = false;
                        } else {
                            tempColumns.push(temp.EFLLevel);
                            columns.push({
                                "EFLLevel": temp.EFLLevel
                            });
                        }
                    }
                    // Columns Assignment.
                }
            }

            aJsonDataNew = {};
            aJsonDataNew.results = {};
            aJsonDataNew.results.columns = columns;
            aJsonDataNew.results.rows = [];
             // convert the data in to rows.
            for (iCount2 = 0; iCount2 < tempTypes.length; iCount2  = iCount2 + 1) {
                oBRCells = [];
                for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {
                    temp = results[iCount1];
                    if ((temp !== undefined) && (temp.EFLLevel !== undefined) && (temp.EFLType !== undefined)) {
                        if (temp.EFLType === tempTypes[iCount2]) {
                            if (temp.EFLPrice) {
                                oBRCells.push({
                                    "EFLPrice": parseFloat(temp.EFLPrice).toFixed(1)
                                });
                            } else {
                                oBRCells.push({
                                    "EFLPrice": temp.EFLPrice
                                });
                            }
                        }

                    }
                }
                aJsonDataNew.results.rows.push({
                    "cells" : oBRCells
                });
            }
            return aJsonDataNew;
        };
        /**
		 * Display History View when user clicked on Campaign History Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.showPendingSwaps = function () {
            var oModel = this.getOwnerComponent().getModel('comp-campaign'),
                sPath,
                oBindingInfo,
                oHistoryView,
                oPendingSwapsTable,
                oScrollTemplate,
                aFilters,
                aFilterIds,
                aFilterValues,
                oPendingSwapsTemplate,
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign"),
                fnRecievedHandler,
                oViewModel = new JSONModel({
                    selected : 0,
                    ReqNumber : "",
                    ReqName : "",
                    NoPhone : false
                }),
                that = this;
            this.getView().setModel(oViewModel, "localModel");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["Contract"];
            aFilterValues = [this._sContract];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            if (!this._oDialogFragment) {
                this._oDialogFragment = sap.ui.xmlfragment("PendingOverview", "nrg.module.campaign.view.PendingSwaps", this);
            }
            if (this._oCancelDialog === undefined) {
                this._oCancelDialog = new ute.ui.main.Popup.create({
                    title: 'Change Campaign - Cancel',
                    close: this._handleDialogClosed,
                    content: this._oDialogFragment
                });
            }
            sPath = i18NModel.getProperty("nrgPendingSwapsSet");
            oPendingSwapsTable = sap.ui.core.Fragment.byId("PendingOverview", "idnrgCamPds-pendTable");
            oPendingSwapsTemplate = sap.ui.core.Fragment.byId("PendingOverview", "idnrgCamPds-pendRow");
            oPendingSwapsTable.setModel(oModel, 'comp-campaign');
            fnRecievedHandler = function () {
                var oBinding = oPendingSwapsTable.getBinding("rows");
                that._oCancelDialog.open();
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if (oBinding) {
                    oBinding.detachDataReceived(fnRecievedHandler);
                }
            };
            oBindingInfo = {
                model : "comp-campaign",
                path : sPath,
                filters : aFilters,
                template : oPendingSwapsTemplate,
                events: {dataReceived : fnRecievedHandler}
            };
            oPendingSwapsTable.bindRows(oBindingInfo);
            //this.getView().addDependent(this._oCancelDialog);
            //to get access to the global model
            this._oCancelDialog.addStyleClass("nrgCamHis-dialog");

        };
        /**
		 * Handler Function for the Average Usage selection
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAvgUsage = function (oEvent) {
            this.navTo("usage", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV : "C"});
        };
        /**
		 * Handler Function for the Pending Swaps Selection
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPendingSwapsSelected = function (oEvent) {
            var iSelected = this.getView().getModel("localModel").getProperty("/selected"),
                sPath,
                iIndex,
                sTemp;

            sPath = oEvent.getSource().getParent().getBindingContext("comp-campaign").getPath();
            iIndex = this._aPendingSelPaths.indexOf(sPath);
            if (oEvent.getSource().getChecked()) {
                iSelected = iSelected + 1;
                sTemp = iIndex < 0 && this._aPendingSelPaths.push(sPath);
            } else {
                iSelected = iSelected - 1;
                sTemp = iIndex > -1 && this._aPendingSelPaths.splice(iIndex, 1);
            }
            this.getView().getModel("localModel").setProperty("/selected", iSelected);
        };
        /**
		 * Handle when user clicked on Cancelling of Pending Swaps
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.ProceedwithCancel = function (oEvent) {
            var oModel = this.getOwnerComponent().getModel('comp-campaign'),
                aSelectedPendingSwaps,
                mParameters,
                oLocalModel,
                sReqName,
                sReqNumber,
                bNoPhone,
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");

            oLocalModel = this.getView().getModel("localModel");
            sReqName = oLocalModel.getProperty("/ReqName");
            sReqNumber = oLocalModel.getProperty("/ReqNumber");
            bNoPhone = oLocalModel.getProperty("/NoPhone");
            if ((this._aPendingSelPaths) && (this._aPendingSelPaths.length > 0)) {
                if ((!sReqName) || (sReqName === "")) {
                    //sap.ui.commons.MessageBox.alert("Please enter Requestor's Name");/nrgCmpOvrEntReqName
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: i18NModel.getProperty("nrgCmpOvrEntReqName")
                    });
                    return;
                }
                if ((!bNoPhone) && ((!sReqNumber) || (sReqNumber === ""))) {
                    //sap.ui.commons.MessageBox.alert("Please enter Requestor's Number or Select No Phone");
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: i18NModel.getProperty("nrgCmpOvrNoPhoneErrMsg")
                    });
                    return;
                }
            } else {
                //sap.ui.commons.MessageBox.alert("Select Pending Swap to cancel");
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: i18NModel.getProperty("nrgCmpOvrPendingSwapSelection")
                });
                return;
            }
            oModel.setRefreshAfterChange(false);
            this._aPendingSelPaths.forEach(function (sCurrentPath) {
                var oContext = oModel.getContext(sCurrentPath);
                mParameters = {
                    method : "POST",
                    urlParameters : {"iDoc" : oContext.getProperty("IdocNo"),
                                     "ReqNumber" : sReqNumber,
                                     "Type" : oContext.getProperty("SwapType"),
                                     "ReqName" : sReqName,
                                     "Contract" : oContext.getProperty("Contract"),
                                     "Hist" : oContext.getProperty("HistoryNo")},
                    success : function (oData, oResponse) {
                        jQuery.sap.log.info("Odata Read Successfully:::");
                    }.bind(this),
                    error: function (oError) {
                        jQuery.sap.log.info("Eligibility Error occured");
                    }.bind(this)
                };
                oModel.callFunction("/DeleteCampaign", mParameters);
            });
            this._oCancelDialog.close();
            this.navTo("campaignoffers", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV : this._sInitTab});
        };
        /**
		 * Handle when user clicked on Cancelling of Pending Swaps
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.ContinueWithoutCancel = function (oEvent) {
            this._oCancelDialog.close();
            this.navTo("campaignoffers", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, typeV : this._sInitTab});
        };
        return Controller;
    }


);
