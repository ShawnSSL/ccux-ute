/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/billing/view/ABPPopup'
    ],

    function (Controller, Filter, FilterOperator, ABPPopup) {
        'use strict';

        var CustomController = Controller.extend('nrg.module.billing.view.HighBill');

        /* =========================================================== */
		/* lifecycle method- Before Rendering                          */
		/* =========================================================== */
        CustomController.prototype.onBeforeRendering = function () {
			var oModel = this.getOwnerComponent().getModel('comp-highbill'),
                mParameters,
                aFilters,
                sCurrentPath,
                oDropDownList = this.getView().byId("idnrgBillinvoiceDropdown"),
                oDropDownListItemTemplate = this.getView().byId("idnrgBillDDitemTemplate").clone(),
                aFilterIds,
                aFilterValues,
                fnRecievedHandler,
                that = this,
                oNotifications = this.getView().byId("idnrgBillNotifications"),
                oNotificationTempl = this.getView().byId("idnrgBillNotificationsTemp"),
                oEligibilityModel = this.getOwnerComponent().getModel('comp-eligibility'),
                oEligibilityJsonModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oEligibilityJsonModel, 'hb-Eligiblity');
            this.initRouterParameter();
            this.getOwnerComponent().getCcuxApp().setTitle('BILL WIZARD');
            this.getView().unbindElement("comp-highbill");
            oDropDownList.unbindAggregation("content");
            oNotifications.unbindAggregation("content");
            that.getOwnerComponent().getCcuxApp().setOccupied(true);
            sCurrentPath = "/BillWizardS";
            aFilterIds = ["Contract"];
            aFilterValues = [this._coNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            fnRecievedHandler = function (oEvent) {
                var aContent = oDropDownList.getContent(),
                    sPath,
                    oContext,
                    oBindingInfo;
                if ((aContent !== undefined) && (aContent.length > 0)) {
                    oContext = aContent[0].getBindingContext("comp-highbill");
                    sPath = oContext.getPath();
                    oDropDownList.setSelectedKey(oContext.getProperty("Begin"));
                    that.getView().bindElement({
                        model : "comp-highbill",
                        path : sPath
                    });
                }
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
            };
            mParameters = {
                model : "comp-highbill",
                path : sCurrentPath,
                template : oDropDownListItemTemplate,
                filters : aFilters,
                parameters : {expand : "CustDrv,NonCustDrv"},
                events: {dataReceived : fnRecievedHandler}
            };
            oDropDownList.bindAggregation("content", mParameters);
            sCurrentPath = "/NotificationS";
            mParameters = {
                model : "comp-highbill",
                path : sCurrentPath,
                template : oNotificationTempl,
                filters : aFilters
            };
            oNotifications.bindAggregation("content", mParameters);
            sCurrentPath = "/EligCheckS('" + this._coNum + "')";
            mParameters = {
                success : function (oData) {
                    oEligibilityJsonModel.setData(oData);
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };
            if (oEligibilityModel && this._coNum) {
                oEligibilityModel.read(sCurrentPath, mParameters);
            }
        };
        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        CustomController.prototype.onAfterRendering = function () {
            var oCustDriv = this.getView().byId("idnrgHighBill-CustDriv"),
                oNonCustDriv = this.getView().byId("idnrgHighBill-NonCustDriv"),
                oNoDataTag = this.getView().byId("idnrgBillNoData");
            if ((oCustDriv) && (oCustDriv.getContent()) && (oCustDriv.getContent()[0].getContent())) {
                if ((oCustDriv.getContent()[0].getContent().length === 0)) {
                    oCustDriv.getContent()[0].removeAllContent();
                    oCustDriv.getContent()[0].addContent(oNoDataTag.clone());
                }
            }
            if ((oNonCustDriv) && (oNonCustDriv.getContent()) && (oNonCustDriv.getContent()[0].getContent())) {
                if ((oNonCustDriv.getContent()[0].getContent().length === 0)) {
                    oNonCustDriv.getContent()[0].removeAllContent();
                    oNonCustDriv.getContent()[0].addContent(oNoDataTag.clone());
                }
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
		 * Priave function to initialize routing parameters
		 *
		 * @function
		 * @private
		 */
        CustomController.prototype.initRouterParameter = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;
        };

        /**
		 * Handler for Invoice Select option
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        CustomController.prototype._onInvoiceSelect = function (oEvent) {
            var sPath,
                sSelectedKey,
                oModel = this.getOwnerComponent().getModel('comp-highbill'),
                oDropDownList = this.getView().byId("idnrgBillinvoiceDropdown");
            sSelectedKey = oEvent.getSource().getProperty("selectedKey");
            if ((oDropDownList) && (oDropDownList.getContent())) {
                oDropDownList.getContent().forEach(function (item) {
                    var oContext = item.getBindingContext("comp-highbill"),
                        dSelectedDate,
                        dTempDate;
                    if ((sSelectedKey) && (oContext.getProperty("Begin"))) {
                        dSelectedDate = new Date(sSelectedKey);
                        dTempDate = new Date(oContext.getProperty("Begin"));
                        if ((dSelectedDate) && (dTempDate)) {
                            if (dSelectedDate.getTime() === dTempDate.getTime()) {
                                sPath = oContext.getPath();
                            }
                        } else {
                            return;
                        }

                    }

                });
            }
            if (sPath) {
                this.getView().bindElement({
                    model : "comp-highbill",
                    path : sPath
                });
            }
        };
        /**
		 * Handler for Invoice Select option
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        CustomController.prototype._onShowInvoice = function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext("comp-highbill"),
                sInvoiceUrl;
            sInvoiceUrl = oBindingContext.getProperty("InvURL");
            window.open(sInvoiceUrl);
        };
        /**
		 * Handler for Back to Dashboard link click
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        CustomController.prototype._onBackToCheckBook = function () {
            var oRouter = this.getOwnerComponent().getRouter();
            if (this._coNum) {
                oRouter.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        /**
		 * Handler for Rate historty button click
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		CustomController.prototype._onRatehistory = function () {
			/*var oRouter = this.getOwnerComponent().getRouter();*/

			if (this._coNum) {
				this.navTo('campaignhistory', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
			}
		};

        /**
		 * Handler for Usage historty button click
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		CustomController.prototype._onUsagehistory = function () {
			var _coNum = "0006970391",
			    _typeV = "B";
			   /* oRouter = this.getOwnerComponent().getRouter();*/

			if (this._coNum) {
				this.navTo('usage', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum, typeV: "B"});
			}
		};

        /*------------------------------------------------ UI Element Actions -----------------------------------------------*/

        CustomController.prototype._onRetroAverageBillingClick = function () {
            if (!this.ABPPopupCustomControl) {
                this.ABPPopupCustomControl = new ABPPopup({ isRetro: true });

                this.ABPPopupCustomControl._oABPPopup.setTitle('RETRO AVERAGE BILLING PLAN: ACTIVATE');

                //this.ABPPopupCustomControl._oABPPopup.setTitle('The title you want to change to.');

                this.ABPPopupCustomControl.attachEvent("ABPCompleted", function () {}, this);
                this.getView().addDependent(this.ABPPopupCustomControl);
            }
            this.ABPPopupCustomControl.prepareABP();
        };

        CustomController.prototype._onAverageBillingClick = function () {
            if (!this.ABPPopupCustomControl) {
                this.ABPPopupCustomControl = new ABPPopup({ isRetro: false });

                this.ABPPopupCustomControl._oABPPopup.setTitle('AVERAGE BILLING PLAN: ACTIVATE');

                //this.ABPPopupCustomControl._oABPPopup.setTitle('The title you want to change to.');

                this.ABPPopupCustomControl.attachEvent("ABPCompleted", function () {}, this);
                this.getView().addDependent(this.ABPPopupCustomControl);
            }
            this.ABPPopupCustomControl.prepareABP();

        };

        return CustomController;
    }
);
