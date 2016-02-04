/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'nrg/base/type/Price',
        "sap/ui/model/json/JSONModel"
    ],

    function (CoreController, Filter, FilterOperator, jQuery, price, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.campaign.view.Tools');
        /* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

        };
        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oViewModel,
                mParameters,
                aFilters,
                i,
                oModel,
                sCurrentPath,
                aFilterIds,
                aFilterValues,
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();
            oViewModel = new JSONModel({
                selected : 0,
                history : false,
                cancel : false,
                ReqNumber : "",
                ReqName : "",
                NoPhone : false
			});

            this._i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this.getView().setModel(oViewModel, "localModel");
            sCurrentPath = this._i18NModel.getProperty("nrgHistorySet");
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            aFilterIds = ["Contract", "Type"];
            aFilterValues = [this._sContract, "H"];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sCurrentPath = sCurrentPath + "/$count";
            mParameters = {
                filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        jQuery.sap.log.info("Odata Read Successfully:::");
                        if ((parseInt(oData, 10)) > 0) {
                            this.getView().getModel("localModel").setProperty("/history", true);
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
            sCurrentPath = this._i18NModel.getProperty("nrgPendingSwapsSet");
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
                            this.getView().getModel("localModel").setProperty("/cancel", true);
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
            if (aFilterIds !== undefined) {
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
                }
            }
            return aFilters;
        };

        /**
		 * Display History View when user clicked on Campaign History Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onHistoryPress = function (oEvent) {
            this.navTo("campaignhistory", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract});
        };

        /**
		 * Display History View when user clicked on Campaign History Button
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onCancelPress = function (oEvent) {
            var oModel = this.getOwnerComponent().getModel('comp-campaign'),
                sPath,
                mParameters,
                oHistoryView,
                oPendingSwapsTable,
                oScrollTemplate,
                aFilters,
                aFilterIds,
                aFilterValues,
                oPendingSwapsTemplate,
                fnRecievedHandler,
                that = this;
            this._aPendingSelPaths = [];
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["Contract"];
            aFilterValues = [this._sContract];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            if (!this._oDialogFragment) {
                this._oDialogFragment = sap.ui.xmlfragment("PendingSwaps", "nrg.module.campaign.view.PendingSwaps", this);
            }
            if (this._oCancelDialog === undefined) {
                this._oCancelDialog = new ute.ui.main.Popup.create({
                    title: 'Change Campaign - Cancel',
                    close: this._handleDialogClosed,
                    content: this._oDialogFragment
                });
            }
            sPath = this._i18NModel.getProperty("nrgPendingSwapsSet");
            oPendingSwapsTable = sap.ui.core.Fragment.byId("PendingSwaps", "idnrgCamPds-pendTable");
            oPendingSwapsTemplate = sap.ui.core.Fragment.byId("PendingSwaps", "idnrgCamPds-pendRow");
            // Function received handler is used to update the view with first History campaign.---start
            fnRecievedHandler = function () {
                var oTableBinding = oPendingSwapsTable.getBinding("rows");
                that._oCancelDialog.open();
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if (oTableBinding) {
                    oTableBinding.detachDataReceived(fnRecievedHandler);
                }
            };
            oPendingSwapsTable.setModel(oModel, 'comp-campaign');
            this._oDialogFragment.setModel(this.getView().getModel("localModel"), 'localModel');
            mParameters = {
                model : "comp-campaign",
                path : sPath,
                filters : aFilters,
                template : oPendingSwapsTemplate,
                events: {dataReceived : fnRecievedHandler}
            };
            //this.getView().addDependent(this._oCancelDialog);
            //to get access to the global model
            this._oCancelDialog.addStyleClass("nrgCamHis-dialog");
            oPendingSwapsTable.bindRows(mParameters);

        };

        /**
		 * Handler Function for the History Popup close
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype._handleDialogClosed = function (oControlEvent) {

        };

        /**
		 * Handler Function for the Pending Swaps Selection
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPendingSwapsSelected = function (oEvent) {
            var iSelected = this._oDialogFragment.getModel("localModel").getProperty("/selected"),
                sPath,
                iIndex,
                sTemp;

            sPath = oEvent.getSource().getParent().getBindingContext("comp-campaign").getPath();
            if (oEvent.getSource().getChecked()) {
                if (this._aPendingSelPaths.length === 1) {
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Only One Pending Swap allowed'
                    });
                    oEvent.getSource().setChecked(false);
                    return;
                }
            }
            iIndex = this._aPendingSelPaths.indexOf(sPath);

            if (oEvent.getSource().getChecked()) {
                iSelected = iSelected + 1;
                sTemp = iIndex < 0 && this._aPendingSelPaths.push(sPath);
            } else {
                iSelected = iSelected - 1;
                sTemp = iIndex > -1 && this._aPendingSelPaths.splice(iIndex, 1);
            }
            this._oDialogFragment.getModel("localModel").setProperty("/selected", iSelected);

        };

        /**
		 * Handler Function for the History Popup close
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onSelected = function (oEvent) {
            if (oEvent.getSource().getChecked()) {
                this._oDialogFragment.getModel("localModel").setProperty("/ReqNumber", "");// No Phone checkbox selected
            }
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
                bNoPhone;

            oLocalModel = this._oDialogFragment.getModel("localModel");
            sReqName = oLocalModel.getProperty("/ReqName");
            sReqNumber = oLocalModel.getProperty("/ReqNumber");
            bNoPhone = oLocalModel.getProperty("/NoPhone");
            if ((this._aPendingSelPaths) && (this._aPendingSelPaths.length > 0)) {
                if ((!sReqName) || (sReqName === "")) {
                    sap.ui.commons.MessageBox.alert("Please enter Requestor's Name");
                    return;
                }
                if ((!bNoPhone) && ((!sReqNumber) || (sReqNumber === ""))) {
                    sap.ui.commons.MessageBox.alert("Please enter Requestor's Number or Select No Phone");
                    return;
                }
            } else {
                sap.ui.commons.MessageBox.alert("Select Pending Swap to cancel");
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
        };
        /**
		 * Handle when user clicked on Cancelling of Pending Swaps
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.ContinueWithoutCancel = function (oEvent) {
            this._oCancelDialog.close();
        };

        return Controller;
    }

);
