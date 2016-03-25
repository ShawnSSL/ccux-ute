/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'nrg/base/view/BaseController',
        'sap/ui/model/json/JSONModel',
        'nrg/module/quickpay/view/QuickPayPopup',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ],

    function (jQuery, Controller, JSONModel, QuickPayControl, Filter, FilterOperator) {
        'use strict';

        var CustomController = Controller.extend('nrg.module.billing.view.CustomerDataPrePD');

        CustomController.prototype.onInit = function () {

        };

        CustomController.prototype.onBeforeRendering = function () {
            this.getOwnerComponent().getCcuxApp().setTitle('BILLING');
            this._initRouting();
            this._loadPrepayData();
        };
        CustomController.prototype._loadPrepayData = function () {
            var oModel = this.getOwnerComponent().getModel('comp-feeAdjs'),
                oBindingInfo,
                sPath = "/PrepaySet(BP='" + this._bpNum + "',CA='" + this._caNum + "')",
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            oBindingInfo = {
                success : function (oData) {
                    that.getView().bindElement({
                        model : "comp-feeAdjs",
                        path : sPath
                    });
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("Odata Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        CustomController.prototype.onAfterRendering = function () {
            this.getOwnerComponent().getCcuxApp().showNavLeft(true);
            this.getOwnerComponent().getCcuxApp().attachNavLeft(this._navLeftCallBack, this);
            this.getOwnerComponent().getCcuxApp().showNavRight(true);
            this.getOwnerComponent().getCcuxApp().attachNavRight(this._navRightCallBack, this);
            this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);
        };

        Controller.prototype._navLeftCallBack = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum && this._caNum && this._bpNum) {
                oRouter.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else if (!this._coNum && this._caNum && this._bpNum) {
                oRouter.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
            } else if (!this._coNum && !this._caNum && this._bpNum) {
                oRouter.navTo('dashboard.Verification', {bpNum: this._bpNum});
            }
        };

        Controller.prototype._navRightCallBack = function () {
            //var oRouteManger = this.getOwnerComponent().getCcuxRouteManager();
        };

        CustomController.prototype.onExit = function () {

        };

        CustomController.prototype.onPayNow = function () {
            var QuickControl = new QuickPayControl(),
                that = this;

            this._sContract = this._coNum;
            this._sBP = this._bpNum;
            this._sCA = this._caNum;
            this.getView().addDependent(QuickControl);
            QuickControl.openQuickPay(this._sContract, this._sBP, this._sCA);
            QuickControl.attachEvent("PaymentCompleted", function () {
                that._loadPrepayData();
            }, this);
        };
        /*************************************************************************************************************************/
        //Init Functions
        /*************************************************************************************************************************/
        CustomController.prototype._initRouting = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;
            return;
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
		 * Go to check book page when link clicked
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype._onChkbookLnkClicked = function () {
            if (this._coNum) {
                this.navTo('billing.PrePayCheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.PrePayCheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };
       /**
		 * Go to High Bill page when link clicked
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype._onHighbillLnkClicked = function () {

            if (this._coNum) {
                this.navTo('billing.HighBill', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.HighBillNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

       /**
		 * Show a popup when Communication preferences button clicked.
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype._onCommPreferences = function () {
            var oModel = this.getOwnerComponent().getModel('comp-commprefs'),
                sPath,
                oBindingInfo,
                oCommPrefTag,
                aFilters,
                aFilterIds,
                aFilterValues,
                oCommPrefTemplate,
                fnRecievedHandler,
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["BP", "CA"];
            aFilterValues = [this._bpNum, this._caNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            if (!this._oDialogFragment) {
                this._oDialogFragment = sap.ui.xmlfragment("CommPref", "nrg.module.billing.view.CommPref", this);
            }
            if (this._oCommDialog === undefined) {
                this._oCommDialog = new ute.ui.main.Popup.create({
                    title: 'Communication Preferences',
                    content: this._oDialogFragment
                });
            }
            sPath = "/PrepayCommPrefS";
            oCommPrefTag = sap.ui.core.Fragment.byId("CommPref", "idnrgCommPrefTag");
            oCommPrefTag.setModel(new JSONModel(), 'view-custpref');
            oBindingInfo = {
                filters : aFilters,
                success : function (oData) {
                    oCommPrefTag.getModel('view-custpref').setData(oData);
                    that._oCommDialog.open();
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    jQuery.sap.log.info("oData Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
       /**
		 * Show a popup when Communication preferences button clicked.
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype._onAlertInformation = function () {
            var oModel = this.getOwnerComponent().getModel('comp-feeAdjs'),
                sPath,
                oBindingInfo,
                oAlertsTable,
                aFilters,
                aFilterIds,
                aFilterValues,
                oAlertsTemplate,
                fnRecievedHandler,
                that = this;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["CA"];
            aFilterValues = [this._caNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            if (!this._oAlertsFragment) {
                this._oAlertsFragment = sap.ui.xmlfragment("PPAlerts", "nrg.module.billing.view.PrePayAlerts", this);
            }
            if (this._oAlertsDialog === undefined) {
                this._oAlertsDialog = new ute.ui.main.Popup.create({
                    title: 'Alert Information',
                    content: this._oAlertsFragment
                });
            }
            sPath = "/PpAlertS";
            oAlertsTable = sap.ui.core.Fragment.byId("PPAlerts", "idnrgBilling-Alerts");
            oAlertsTemplate = sap.ui.core.Fragment.byId("PPAlerts", "idnrgBilling-AlertsTemp");
            oAlertsTable.setModel(oModel, 'comp-feeAdjs');
            // Function received handler is used to update the view with first History campaign.---start
            fnRecievedHandler = function (oEvent) {
                var oTableBinding = oAlertsTable.getBinding("rows");
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if ((oTableBinding) && (oTableBinding.getLength() > 0)) {
                    that._oAlertsDialog.open();
                } else {
                    sap.ui.commons.MessageBox.alert("No Data Available");
                }
                if (oTableBinding) {
                    oTableBinding.detachDataReceived(fnRecievedHandler);
                }
            };
            oBindingInfo = {
                model : "comp-feeAdjs",
                path : sPath,
                filters : aFilters,
                template : oAlertsTemplate,
                events: {dataReceived : fnRecievedHandler}
            };
            oAlertsTable.bindRows(oBindingInfo);
        };
       /**
		 * When any checkbox is changes track that changes
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype.onChanged = function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("view-custpref").getPath(),
                oCommPrefTag = sap.ui.core.Fragment.byId("CommPref", "idnrgCommPrefTag"),
                oModel = oCommPrefTag.getModel("view-custpref");
            oModel.setProperty(sPath + "/Changed", true);

        };
       /**
		 * Cancel Customer Preferences.
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype._onCPCancel = function (oEvent) {
            this._oCommDialog.close();
        };
       /**
		 * Submit After Communication Preferences Changed
		 *
		 * @function
		 *
         *
		 * @private
		 */
        CustomController.prototype._onCPSubmit = function (oEvent) {
            var oCommPrefTag = sap.ui.core.Fragment.byId("CommPref", "idnrgCommPrefTag"),
                oModel = oCommPrefTag.getModel("view-custpref"),
                aResults = oModel.oData.results,
                oBillingModel = this.getOwnerComponent().getModel('comp-commprefs'),
                sPath = "/PrepayCommPrefS",
                iCount = 0,
                iFailureCount = 0,
                checkCoRetrComplete,
                iSuccessCount = 0;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aResults.forEach(function (item) {
                var tempPath = sPath;
                if (item.Changed) {
                    iCount = iCount + 1;
                    tempPath = tempPath + "(BP='" + item.BP + "',CA='" + item.CA + "',AttrSet='" + item.AttrSet + "')";
                    oBillingModel.update(tempPath, {
                        Call : item.Call,
                        Email : item.Email,
                        SMS : item.SMS
                    }, {
                        success : function (oData, oResponse) {
                            iSuccessCount = iSuccessCount + 1;
                        },
                        error : function (oError) {
                            iFailureCount = iFailureCount + 1;
                        },
                        merge : false
                    });
                }
            });

            // Check the completion of CO retrieval
            checkCoRetrComplete = setInterval(function () {
                if (iSuccessCount + iFailureCount === iCount) {
                    if (iSuccessCount === iCount) {
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'Communication preferences updated Successfully'
                        });
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'Communication preferences update Failed'
                        });
                    }
                    this._oCommDialog.close();
                    clearInterval(checkCoRetrComplete);
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }
            }.bind(this), 100);

        };


        /*************************************************************************************************************************/
        return CustomController;
    }
);
