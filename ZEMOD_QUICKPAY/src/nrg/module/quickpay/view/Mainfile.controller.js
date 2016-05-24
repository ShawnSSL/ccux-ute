/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'sap/ui/model/json/JSONModel',
        'sap/ui/core/format/DateFormat'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel, DateFormat) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.quickpay.view.Mainfile');

        /* =========================================================== */
        /* lifecycle method- Init                                      */
        /* =========================================================== */
        /*Controller.prototype.onInit = function () {
        };*/
        /* =========================================================== */
        /* lifecycle method- Before Rendering                          */
        /* =========================================================== */
        Controller.prototype.onBeforeRendering = function () {
            var oModel = this.getView().getModel('comp-quickpay'),
                mParameters,
                sCurrentPath,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oViewModel = new JSONModel({
                    reliantPay : true,
                    message : "",
                    reliantText : "Verify",
                    reliantPress: ".onAcceptReliant",
                    newBankRouting: "",
                    newBankAccount: "",
                    selected : 0,
                    CC: false,
                    BD: false,
                    PCC: false,
                    PBD: false,
                    REC: false,
                    RED: false,
                    PM: true,
                    ABD: false,
                    CL: false,
                    CLI : false,
                    SR: false,
                    showCloseButton : true,
                    showContactLog : true,
                    PendingRefresh : false
                }),
                oContactModel,
                fnRecievedHandler,
                that = this;
            this._oFormatYyyymmdd = DateFormat.getInstance({
                pattern: 'MM/dd/yyyy'
            });
            this.getView().getModel('comp-quickpay').oData = {};
            //this.getView().getModel('comp-quickpay').refresh(true, true);//If set to true then the model data will be removed/cleared.
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();

            oContactModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oContactModel, "quickpay-cl");
            this.getView().setModel(oViewModel, "appView");
            if (this._Process === 'PCC') {
                this.onPendingCreditCard();
            } else if (this._Process === 'PBD') {
                this.onPendingBankDraft();
            } else {
                this._OwnerComponent.getCcuxApp().setOccupied(true);
                sCurrentPath = "/PayAvailFlagsSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')";
                fnRecievedHandler = function (oEvent) {
                    jQuery.sap.log.info("Date Received Succesfully");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                };
                this.getView().bindElement({
                    model : "comp-quickpay",
                    path : sCurrentPath,
                    events: {dataReceived : fnRecievedHandler}
                });
            }
            oMsgArea.addStyleClass("nrgQPPay-hide");
        };

        /**
        * Central function to toggle between screens.
        *
        * @function onQuickPay
        * @param {sScreenView} sScreenView string which screen need to be on.
        */
        Controller.prototype._onToggleViews = function (sScreenView) {
            var oViewModel = this.getView().getModel("appView");
            oViewModel.setProperty("/CC", false);
            oViewModel.setProperty("/BD", false);
            oViewModel.setProperty("/PCC", false);
            oViewModel.setProperty("/PBD", false);
            oViewModel.setProperty("/REC", false);
            oViewModel.setProperty("/RED", false);
            oViewModel.setProperty("/PM", false);
            oViewModel.setProperty("/ABD", false);
            oViewModel.setProperty("/CL", false);
            oViewModel.setProperty("/CLI", false);
            oViewModel.setProperty("/SR", false);
            sScreenView = "/" + sScreenView;
            oViewModel.setProperty(sScreenView, true);
        };
        /********************************  Credit card Related functionality Start
        ***********************************/
        /**
        * Show Stop Voice Log Recording msg
        *
        * @function onQuickPay
        * @param {sap.ui.base.Event} oEvent pattern match event
        */
        Controller.prototype.onCreditCard = function (oEvent) {
            var fnRecievedHandler,
                oCreditCardDropDown = this.getView().byId("idnrgQPCC-DDL"),
                oBindingInfo,
                oCreditCardTemplate = this.getView().byId("idnrgQPCC-DDLItem"),
                sCurrentPath,
                oModel = this.getView().getModel('comp-quickpay'),
                oWaiveReasonTemplate = this.getView().byId("idnrgQPCC-WaiveReasonItem"),
                oWaiveReasonDropDown = this.getView().byId("idnrgQPCC-WR"),
                WRRecievedHandler,
                oCreditCardDate = this.getView().byId("idnrgQPCC-Date"),
                that = this,
                oCreditCardModel = new sap.ui.model.json.JSONModel(),
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oAppViewModel = this.getView().getModel("appView");
            this._bCreditCard = true;
            this._onToggleViews("SR");
            this.onRecordingPause();
            oCreditCardDate.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), true));
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            //oCreditCardDate.setMinDate(new Date());
            this.setShowCloseButton(false);
            this.getView().setModel(oCreditCardModel, "quickpay-cc");
            WRRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                if (oEvent) {
                    if (oEvent.getSource().getLength() === 1) {
                        oWaiveReasonDropDown.setSelectedKey(oEvent.getSource().getContexts()[0].getProperty("ReasonCode"));
                    } else {
                        if ((oEvent) && (oEvent.mParameters) && (oEvent.mParameters.data) && (oEvent.mParameters.data.results)) {
                            oEvent.mParameters.data.results.forEach(function (item) {
                                if ((item) && (item.DefaultFlag)) {
                                    oWaiveReasonDropDown.setSelectedKey(item.ReasonCode);
                                }
                                if ((item) && (item.Message)) {
                                    oMsgArea.removeStyleClass("nrgQPPay-hide");
                                    oMsgArea.addStyleClass("nrgQPPay-black");
                                    oAppViewModel.setProperty("/message", item.Message);
                                }
                            });
                        }
                    }
                }
            };
            fnRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                that._OwnerComponent.getCcuxApp().setOccupied(false);
            };
            sCurrentPath = "/CreditCardSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')";
            oBindingInfo = {
                success : function (oData) {
                    oCreditCardModel.setData(oData);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sCurrentPath, oBindingInfo);
            }
            sCurrentPath = "/CreditCardSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/CardsSet";
            //sCurrentPath = "/CardsSet";
            oBindingInfo = {
                model : "comp-quickpay",
                path : sCurrentPath,
                template : oCreditCardTemplate,
                parameters: {countMode : "None", operationMode : "Server"},
                events: {dataReceived : fnRecievedHandler}
            };
            oCreditCardDropDown.bindAggregation("content", oBindingInfo);
            sCurrentPath = "/CreditCardSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/WaiveReasonsSet";
            oBindingInfo = {
                model : "comp-quickpay",
                path : sCurrentPath,
                template : oWaiveReasonTemplate,
                parameters: {countMode : "None"},
                events: {dataReceived : WRRecievedHandler}
            };
            oWaiveReasonDropDown.bindAggregation("items", oBindingInfo);
        };

        /**
        * Check date function
        *
        *@function _checkDateFormate
        *@param {String, String} sDate, sMsg

        Controller.prototype._checkDateFormat = function (sDate, sMsg) {
            var oDatePattern,
                bValidDateFormat;

            //foo.match(new RegExp(':\\d\\d'));

            bValidDateFormat = sDate.match(new RegExp('^((0?[13578]|10|12)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1}))|(0?[2469]|11)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1})))$)');

            if ((parseInt(sDate.substring(0, 2), 10) === 2) && (parseInt(sDate.substring(3,5), 10) > 29)) {
                this.getView().getModel("appView").setProperty("/message", "Febuary can only have date smaller than or equal to 29");
                return false;
            }

            if (!bValidDateFormat) {
                this.getView().getModel("appView").setProperty("/message", sMsg);
                return false;
            }
            return true;
        };*/
        /**
        * When Credit Card is Accepted
         *
         * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
         */
        Controller.prototype.onAcceptCredit = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                mParameters,
                sCurrentPath,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oCreditCardDate = this.getView().byId("idnrgQPCC-Date"),
                oCreditCardDropDown = this.getView().byId("idnrgQPCC-DDL"),
                oCreditCardAmount = this.getView().byId("idnrgQPCC-Amt"),
                oWaiveReasonDropDown = this.getView().byId("idnrgQPCC-WR"),
                that = this,
                oCreditCardDateValue,
                oContactModel = this.getView().getModel("quickpay-cl"),
                oCreditCardModel = this.getView().getModel("quickpay-cc"),
                oZipCode = this.getView().byId("idnrgQPCC-zipcode"),
                oCVVCode = this.getView().byId("idnrgQPCC-cvv"),
                oInvoiceDate,
                oCallSubmit,
                oConfirmCallbackHandler,
                oPayAvailFlags = "/PayAvailFlagsSet" + "(BP='" + parseInt(this._sBP, 10) + "',CA='" +  parseInt(this._sCA, 10) + "')",
                oContext,
                sName,
                oCheckDateFunction,
                sMessage,
                oConfirmMsgCallBack,
                dCurrentDate = new Date();
            oContext = oModel.getContext(oPayAvailFlags);
            that.getView().getModel("appView").setProperty("/message", "");
            oMsgArea.removeStyleClass("nrgQPPay-hide");
            oMsgArea.addStyleClass("nrgQPPay-black");
            if (!this._ValidateValue(oCreditCardAmount.getValue(), "Enter Amount to be posted")) {
                return false;
            }
            if (!this._ValidateValue(oCreditCardDate.getValue(), "Enter Credit Card Date")) {
                return false;
            }   //Added to check empty date situation(will cause 400 bad request) 05/18/2016
            if (!this._ValidateValue(oCreditCardDropDown.getSelectedKey(), "Select Credit Card")) {
                return false;
            }
            if (!this._ValidateValue(oZipCode.getValue(), "Enter Zip Code")) {
                return false;
            }
            if (!this._ValidateValue(oCVVCode.getValue(), "Enter CVV")) {
                return false;
            }

            sCurrentPath = "/CreditCardPost";
            oCreditCardDateValue = new Date(oCreditCardDate.getValue());
            oInvoiceDate = oCreditCardModel.getProperty("/InvoiceDate");
            if (oCreditCardDateValue) {
                oCreditCardDateValue.setHours("00");
                oCreditCardDateValue.setMinutes("00");
                oCreditCardDateValue.setSeconds("00");
            }

            if (oInvoiceDate) {
                oInvoiceDate.setHours("00");
                oInvoiceDate.setMinutes("00");
                oInvoiceDate.setSeconds("00");
            }
            if (dCurrentDate) {
                dCurrentDate.setHours("00");
                dCurrentDate.setMinutes("00");
                dCurrentDate.setSeconds("00");
            }
            if ((oCreditCardDateValue.getTime() > dCurrentDate.getTime())) {
                sMessage = oContext.getProperty("CaName") + ", just to confirm, you have requested to make a payment today in the amount of  $" + parseFloat(oCreditCardAmount.getValue()).toFixed(2) + " to be processed on " + oCreditCardDate.getValue() + ". Is this correct?";
            } else {
                sMessage = oContext.getProperty("CaName") + ", just to confirm, you have requested to make a payment today in the amount of  $" + parseFloat(oCreditCardAmount.getValue()).toFixed(2) + ". Is this correct?";
            }


            oCallSubmit = function (bForward) {
                if (!bForward) {
                    return;
                }
                mParameters = {
                    method : "POST",
                    urlParameters : {
                        "ContractID" : "",
                        "BP" : that._sBP,
                        "CA" : that._sCA,
                        "CardNumber" : oCreditCardDropDown.getSelectedKey(),
                        "PaymentDate" : oCreditCardDateValue,
                        "Amount" : parseFloat(oCreditCardAmount.getValue()),
                        "WaiveFlag" : oWaiveReasonDropDown.getSelectedKey(),
                        "Cvval" : oCVVCode.getValue().trim(),
                        "ZipCode" : oZipCode.getValue().trim(),
                        "Activit" : "0",
                        "CardType" : "0",
                        "Class" : "0",
                        "Error" : "0",
                        "InvoiceAmount" : "0",
                        "InvoiceDate" : 1436109229000,
                        "Message" : "0",
                        "NameOnCard" : "0",
                        "PopMessage" : "0",
                        "UserDecision" : true,
                        "WaiveReason" : "0"
                    },
                    success : function (oData, oResponse) {
                        if (oData.Error === "") {
                            oContactModel.setData(oData);
                            that.onPaymentSuccess();
                            oMsgArea.addStyleClass("nrgQPPay-hide");
                        } else {
                            that.getView().getModel("appView").setProperty("/message", oData.Message);
                        }
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                    }.bind(this),
                    error: function (oError) {
                        that.getView().getModel("appView").setProperty("/message", oError.statusText);
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                    }.bind(this)
                };
                that._OwnerComponent.getCcuxApp().setOccupied(true);
                oModel.callFunction(sCurrentPath, mParameters);
            };
            oConfirmCallbackHandler = function (sAction) {
                switch (sAction) {
                case ute.ui.main.Popup.Action.Yes:
                    oCallSubmit(true);
                    break;
                case ute.ui.main.Popup.Action.No:
                    oCallSubmit(false);
                    break;
                }
            };
            oCheckDateFunction = function (bForward) {
                if (!bForward) {
                    return;
                }
                if ((oCreditCardDateValue.getTime() > dCurrentDate.getTime())) {
                    if (oCreditCardDateValue.getTime() > oInvoiceDate.getTime()) {
                        ute.ui.main.Popup.Confirm({
                            title: 'Information',
                            message: 'Your Scheduled payment date is after the due date. You will be subject to applicable late fees and/or disconnection.',
                            callback: oConfirmCallbackHandler
                        });
                    } else {
                        oCallSubmit(true);
                    }
                } else {
                    oCallSubmit(true);
                }
            };
            oConfirmMsgCallBack = function (sAction) {
                switch (sAction) {
                case ute.ui.main.Popup.Action.Yes:
                    oCheckDateFunction(true);
                    break;
                case ute.ui.main.Popup.Action.No:
                    oCheckDateFunction(false);
                    break;
                }
            };
            ute.ui.main.Popup.Confirm({
                title: 'Information',
                message: sMessage,
                callback: oConfirmMsgCallBack
            });
        };
       /**
		 * Pending Credit Card Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPendingCreditCard = function (oEvent) {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close"),
                oTableRow = this.getView().byId("idnrgQPTable-Row"),
                oTableRowTemplate = this.getView().byId("idnrgQPTable-Rows"),
                oBindingInfo,
                sPath = "/CreditCardPPSet",
                oModel = this.getView().getModel('comp-quickpay'),
                aFilterIds,
                aFilterValues,
                aFilters,
                fnRecievedHandler,
                oPendingPaymentsModel = new JSONModel(),
                that = this;
            this.setShowCloseButton(false);
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            this._onToggleViews("PCC");
            this._aPendingSelPaths = [];
            //this.getView().getParent().setPosition("begin bottom", "begin bottom");
            //this.setPosition(0);
            oPopup.removeStyleClass("nrgQPPay-Popup");
            oPopup.addStyleClass("nrgQPPay-PopupPayment");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            this.getView().setModel(oPendingPaymentsModel, "QP-quickpay");
            aFilterIds = ["BP", "CA"];
            aFilterValues = [this._sBP, this._sCA];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oBindingInfo = {
                filters : aFilters,
                success : function (oData) {
                    oPendingPaymentsModel.setData(oData);
                    oTableRow.setModel(oPendingPaymentsModel);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Error occured");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * Pending Credit Card Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPendingCCSave = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                oPCCModel = this.getView().getModel('QP-quickpay'),
                mParameters,
                that = this,
                oContactModel = this.getView().getModel("quickpay-cl"),
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oViewModel = this.getView().getModel("appView");
            that._OwnerComponent.getCcuxApp().setOccupied(true);
            if ((this._aPendingSelPaths) && (this._aPendingSelPaths.length > 0)) {
                this._aPendingSelPaths.forEach(function (sCurrentPath) {
                    var oContext = oPCCModel.getContext(sCurrentPath),
                        sPath = "/CreditCardPPSet";
                    sPath = "/CreditCardPPSet(BP='" + that._sBP + "',CA='" + that._sCA + "')";
                    mParameters = {
                        success : function (oData, oResponse) {
/*                            var aFilterIds = ["BP", "CA"],
                                aFilterValues = [this._sBP, this._sCA],
                                aFilters,
                                oBindingInfo,
                                oPendingPaymentsModel = that.getView().getModel("QP-quickpay"),
                                oTableRow = that.getView().byId("idnrgQPTable-Row");
                            aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                            oBindingInfo = {
                                filters : aFilters,
                                success : function (oData) {
                                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                                    ute.ui.main.Popup.Alert({
                                        title: 'Information',
                                        message: 'Update Successfull'
                                    });
                                    oPendingPaymentsModel.setData(oData);
                                    oTableRow.setModel(oPendingPaymentsModel);
                                    jQuery.sap.log.info("Odata Read Successfully:::");

                                }.bind(this),
                                error: function (oError) {
                                    jQuery.sap.log.info("Error occured");
                                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                                    ute.ui.main.Popup.Alert({
                                        title: 'Information',
                                        message: 'Update failed'
                                    });
                                }.bind(this)
                               };
                                if (oModel) {
                                    oModel.read(sPath, oBindingInfo);
                                }
                                that._OwnerComponent.getCcuxApp().setOccupied(false);
                                jQuery.sap.log.info("Odata Read Successfully:::");
                                */
                            if (oData.Error === "") {
                                oContactModel.setData(oData);
                                that.onPaymentSuccess();
                                oMsgArea.addStyleClass("nrgQPPay-hide");
                                oViewModel.setProperty("/PendingRefresh", true);
                                that.attachEventOnce("ContactLogSaved", that.onPendingCreditCard);
                            } else {
                                that.getView().getModel("appView").setProperty("/message", oData.Message);
                            }
                            that._OwnerComponent.getCcuxApp().setOccupied(false);
                        }.bind(this),
                        error: function (oError) {
                            that._OwnerComponent.getCcuxApp().setOccupied(false);
                            jQuery.sap.log.info("Odata Error occured");
                        }.bind(this)
                    };
                    oModel.update(sPath, {"CardID" : oContext.getProperty("CardID"),
                                         "CardNumber" : oContext.getProperty("CardNumber"),
                                         "ScheduledDate" : oContext.getProperty("ScheduledDate"),
                                         "Amount" : oContext.getProperty("Amount"),
                                         "ContractID" : "",
                                         "BP" : oContext.getProperty("BP"),
                                         "CA" : oContext.getProperty("CA"),
                                         "CurrentStatus" : oContext.getProperty("CurrentStatus")}, mParameters);
                });
            } else {
                that._OwnerComponent.getCcuxApp().setOccupied(false);
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: 'No Record Selected'
                });
            }

        };

        /**
		 * Handler when Pending payment record is selected, make fields editable
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         *
		 *
		 */
        Controller.prototype.onPendingCCSelected = function (oEvent) {
            var oRow = oEvent.getSource().getParent(),
                iSelected = this.getView().getModel("appView").getProperty("/selected"),
                sPath,
                iIndex,
                sTemp,
                oModel;
            oModel = oEvent.getSource().getBindingContext("QP-quickpay").getModel();
            sPath = oEvent.getSource().getParent().getBindingContext("QP-quickpay").getPath();
            if (oEvent.getSource().getChecked()) {
                if ((iSelected) && (iSelected === 1)) {
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Only one Record editable'
                    });
                    oEvent.getSource().setChecked(false);
                } else {
                    iIndex = this._aPendingSelPaths.indexOf(sPath);
                    sTemp = iIndex < 0 && this._aPendingSelPaths.push(sPath);
                    iSelected = 1;
                    this.getView().getModel("appView").setProperty("/selected", iSelected);
                    oModel.setProperty(oEvent.getSource().getBindingContext("QP-quickpay").getPath() + "/Editable", true);
                    oRow.addStyleClass("nrgQPTable-RowsSelected");
                }
            } else {
                iIndex = this._aPendingSelPaths.indexOf(sPath);
                sTemp = iIndex > -1 && this._aPendingSelPaths.splice(iIndex, 1);
                iSelected = 0;
                this.getView().getModel("appView").setProperty("/selected", iSelected);
                oRow.removeStyleClass("nrgQPTable-RowsSelected");
            }
        };
        /**
         * handler for Adding Credit card
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAddCC = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                oBindingInfo,
                sPath,
                fnRecievedHandler,
                that = this;
            fnRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
            };
            sPath = "/CCCreateURLSet(BP='" + this._sBP + "',CA='" + this._sCA + "')";
            oBindingInfo = {
                success : function (oData) {
                    var paymentWindow = window.open(oData.URL),
                        timer;
                    timer = setInterval(function () {
                        if (paymentWindow.closed) {
                            clearInterval(timer);
                            that.onRefreshCC();
                        }
                    }, 1000);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Error occured");

                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * When Credit Card is Accepted
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onDeclineCredit = function (oEvent) {
            this.onPopupClose(oEvent);
        };
                /**
		 * When New Credit Card is added and Refresh list for new credit card.
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onRefreshCC = function (oEvent) {
            var fnRecievedHandler,
                oCreditCardDropDown = this.getView().byId("idnrgQPCC-DDL"),
                oBindingInfo,
                oCreditCardTemplate = this.getView().byId("idnrgQPCC-DDLItem"),
                sCurrentPath,
                that = this;
            that._OwnerComponent.getCcuxApp().setOccupied(true);
            fnRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                that._OwnerComponent.getCcuxApp().setOccupied(false);
            };
            sCurrentPath = "/CreditCardSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/CardsSet";
            //sCurrentPath = "/CardsSet";
            oBindingInfo = {
                model : "comp-quickpay",
                path : sCurrentPath,
                template : oCreditCardTemplate,
                parameters: {countMode : "None", operationMode : "Server"},
                events: {dataReceived : fnRecievedHandler}
            };
            oCreditCardDropDown.bindAggregation("content", oBindingInfo);
        };

/********************************  Credit card Related functionality stop ***********************************/

/********************************  Bank Draft Related functionality start ***********************************/
        /**
		 * Bank Draft Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onBankDraft = function (oEvent) {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close"),
                oBankDraftDate = this.getView().byId("idnrgQPBD-Date"),
                sCurrentPath,
                aFilterIds,
                aFilterValues,
                aFilters,
                fnRecievedHandler,
                that = this,
                oBindingInfo,
                oWaiveReasonTemplate = this.getView().byId("idnrgQPCC-WaiveReasonItem"),
                oBankDraftTemplate = this.getView().byId("idnrgQPCC-BankDraftItem"),
                oBankDraftDropDown = this.getView().byId("idnrgQPBD-BankAccounts"),
                oWaiveReasonDropDown = this.getView().byId("idnrgQPBD-WaiveReason"),
                WRRecievedHandler,
                oSorter = new sap.ui.model.Sorter("LastUsed", true),// sort descending;
                oBankDraftModel = new sap.ui.model.json.JSONModel(),
                oModel = this.getView().getModel('comp-quickpay'),
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oAppViewModel = this.getView().getModel("appView");
            oBankDraftDate.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), true));
            //oBankDraftDate.setMinDate(new Date());
            this.setShowCloseButton(false);
            oPopup.removeStyleClass("nrgQPPay-Popup");
            oPopup.addStyleClass("nrgQPPay-PopupWhite");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            this._onToggleViews("BD");
            this.getView().setModel(oBankDraftModel, "quickpay-bd");
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            sCurrentPath = "/BankDraftSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/WaiveReasonsSet";
            fnRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                that._OwnerComponent.getCcuxApp().setOccupied(false);
            };
            WRRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                if (oEvent) {
                    if (oEvent.getSource().getLength() === 1) {
                        oWaiveReasonDropDown.setSelectedKey(oEvent.getSource().getContexts()[0].getProperty("ReasonCode"));
                    } else {
                        if ((oEvent) && (oEvent.mParameters) && (oEvent.mParameters.data) && (oEvent.mParameters.data.results)) {
                            oEvent.mParameters.data.results.forEach(function (item) {
                                if ((item) && (item.DefaultFlag)) {
                                    oWaiveReasonDropDown.setSelectedKey(item.ReasonCode);
                                }
                                if ((item) && (item.Message)) {
                                    oMsgArea.removeStyleClass("nrgQPPay-hide");
                                    oMsgArea.addStyleClass("nrgQPPay-black");
                                    oAppViewModel.setProperty("/message", item.Message);
                                }
                            });
                        }
                    }
                }
            };
            sCurrentPath = "/BankDraftSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')";
            oBindingInfo = {
                success : function (oData) {
                    oBankDraftModel.setData(oData);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sCurrentPath, oBindingInfo);
            }
            sCurrentPath = "/BankDraftSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/WaiveReasonsSet";
            oBindingInfo = {
                model : "comp-quickpay",
                path : sCurrentPath,
                template : oWaiveReasonTemplate,
                parameters: {countMode : "None"},
                events: {dataReceived : WRRecievedHandler}
            };
            oWaiveReasonDropDown.bindAggregation("items", oBindingInfo);
            sCurrentPath = "/BankDraftSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/BankAccountSet";
            oBindingInfo = {
                model : "comp-quickpay",
                path : sCurrentPath,
                template : oBankDraftTemplate,
                parameters: {countMode : "None"},
                sorter: oSorter,
                events: {dataReceived : fnRecievedHandler}
            };
            oBankDraftDropDown.bindAggregation("content", oBindingInfo);
        };

        /**
		 * Bank Draft Posting
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAcceptBankDraft = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                mParameters,
                sCurrentPath,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oBankDraftDate = this.getView().byId("idnrgQPBD-Date"),
                oBankAccountDropDown = this.getView().byId("idnrgQPBD-BankAccounts"),
                oBankDraftAmount = this.getView().byId("idnrgQPBD-Amt"),
                oWaiveReasonDropDown = this.getView().byId("idnrgQPBD-WaiveReason"),
                that = this,
                oBankDraftDateValue,
                oContactModel = this.getView().getModel("quickpay-cl"),
                oBankDraftModel = this.getView().getModel("quickpay-bd"),
                sBankKey,
                sBankRouting,
                sBankAccount,
                oCallFunctionHandler,
                oConfirmCallbackHandler,
                iInvoiceAmount,
                oInvoiceDate,
                oConfirmDateHandler,
                oCallDateHandler,
                iBankDraftAmount,
                dCurrentDate = new Date(),
                sMessage,
                oContext,
                oPayAvailFlags = "/PayAvailFlagsSet" + "(BP='" + parseInt(this._sBP, 10) + "',CA='" +  parseInt(this._sCA, 10) + "')",
                oConfirmMsgCallBack,
                oCheckAmountFunction;
            oContext = oModel.getContext(oPayAvailFlags);
            oMsgArea.removeStyleClass("nrgQPPay-hide");
            oMsgArea.addStyleClass("nrgQPPay-black");
            if (!this._ValidateValue(oBankDraftAmount.getValue(), "Enter Amount to be posted")) {
                return false;
            }
            if (!this._ValidateValue(oBankDraftDate.getValue(), "Enter Bank Draft Date")) {
                return false;
            }   //Added to check empty date situation(will cause 400 bad request) 05/18/2016
            if (!this._ValidateValue(oBankAccountDropDown.getSelectedKey(), "Select Bank Account")) {
                return false;
            }
            sCurrentPath = "/BankDraftpost";
            sBankKey = oBankAccountDropDown.getSelectedKey();
            sBankAccount = oModel.getProperty("/BankAccountSet(BP='" + this._sBP + "',CA='" + this._sCA + "',BankKey='" + sBankKey + "')/BankAccNum");
            sBankRouting = oModel.getProperty("/BankAccountSet(BP='" + this._sBP + "',CA='" + this._sCA + "',BankKey='" + sBankKey + "')/BankRouting");

            oBankDraftDateValue = new Date(oBankDraftDate.getValue());
            iInvoiceAmount = parseInt(oBankDraftModel.getProperty("/InvoiceAmount"), 10) || 0;
            oInvoiceDate = oBankDraftModel.getProperty("/InvoiceDate");
            if (oBankDraftDateValue) {
                oBankDraftDateValue.setHours("00");
                oBankDraftDateValue.setMinutes("00");
                oBankDraftDateValue.setSeconds("00");
            }

            if (oInvoiceDate) {
                oInvoiceDate.setHours("00");
                oInvoiceDate.setMinutes("00");
                oInvoiceDate.setSeconds("00");
            }
            if (dCurrentDate) {
                dCurrentDate.setHours("00");
                dCurrentDate.setMinutes("00");
                dCurrentDate.setSeconds("00");
            }
            if ((oBankDraftDateValue.getTime() > dCurrentDate.getTime())) {
                sMessage = oContext.getProperty("CaName") + ", just to confirm, you have requested to make a payment today in the amount of  $" + parseFloat(oBankDraftAmount.getValue()).toFixed(2) + " to be drafted on " + oBankDraftDate.getValue() + ". Is this correct?";
            } else {
                sMessage = oContext.getProperty("CaName") + ", just to confirm, you have requested to make a payment today in the amount of  $" + parseFloat(oBankDraftAmount.getValue()).toFixed(2) + ". Is this correct?";
            }
            oConfirmCallbackHandler = function (sAction) {
                switch (sAction) {
                case ute.ui.main.Popup.Action.Yes:
                    oCallFunctionHandler(true);
                    break;
                case ute.ui.main.Popup.Action.No:
                    oCallFunctionHandler(false);
                    break;
                case ute.ui.main.Popup.Action.Ok:
                    break;
                }
            };
            oConfirmDateHandler = function (sAction) {
                switch (sAction) {
                case ute.ui.main.Popup.Action.Yes:
                    oCallDateHandler(true);
                    break;
                case ute.ui.main.Popup.Action.No:
                    oCallDateHandler(false);
                    break;
                case ute.ui.main.Popup.Action.Ok:
                    break;
                }
            };
            oCallDateHandler = function (bForward) {
                if (!bForward) {
                    return;
                }
                if ((oBankDraftAmount > 0) && (oInvoiceDate.getTime() < oBankDraftDateValue.getTime())) {
                    ute.ui.main.Popup.Confirm({
                        title: 'Information',
                        message: 'Your scheduled payment date is after the due date.  You will be subject to applicable late fees and/or disconnection.',
                        callback: oConfirmCallbackHandler
                    });
                } else {
                    oCallFunctionHandler(true);
                }
            };
            oCallFunctionHandler = function (bForward) {
                if (!bForward) {
                    return;
                }
                mParameters = {
                    method : "POST",
                    urlParameters : {
                        "ContractID" : "",
                        "BP" : that._sBP,
                        "CA" : that._sCA,
                        "BankAccNum" : sBankAccount,
                        "PaymentDate" : oBankDraftDateValue,
                        "Amount" : parseFloat(oBankDraftAmount.getValue()),
                        "WaiveFlag" : oWaiveReasonDropDown.getSelectedKey(),
                        "BankKey" : sBankKey,
                        "BankRouting" : sBankRouting,
                        "Activit" : "0",
                        "Class" : "0",
                        "Error" : "0",
                        "InvoiceAmount" : "0",
                        "InvoiceDate" : 1436109229000,
                        "Message" : "0",
                        "PopMessage" : "0",
                        "UserDecision" : true,
                        "WaiveReason" : "0"
                    },
                    success : function (oData, oResponse) {
                        if (oData.Error === "") {
                            oContactModel.setData(oData);
                            that.onPaymentSuccess();
                            oMsgArea.addStyleClass("nrgQPPay-hide");
                        } else {
                            that.getView().getModel("appView").setProperty("/message", oData.Message);
                        }
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                    }.bind(this),
                    error: function (oError) {
                        that.getView().getModel("appView").setProperty("/message", oError.statusText);
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                    }.bind(this)
                };
                that._OwnerComponent.getCcuxApp().setOccupied(true);
                oModel.callFunction(sCurrentPath, mParameters);
            };
            oCheckAmountFunction = function (bForward) {
                if (!bForward) {
                    return;
                }
                iBankDraftAmount = parseInt(oBankDraftAmount.getValue(), 10) || 0;
                if (iBankDraftAmount > iInvoiceAmount) {
                    ute.ui.main.Popup.Confirm({
                        title: 'Information',
                        message: 'Payment amount is greater than Total amount due. Do you wish to continue?',
                        callback: oConfirmDateHandler
                    });
                } else {
                    oCallDateHandler(true);
                }
            };
            oConfirmMsgCallBack = function (sAction) {
                switch (sAction) {
                case ute.ui.main.Popup.Action.Yes:
                    oCheckAmountFunction(true);
                    break;
                case ute.ui.main.Popup.Action.No:
                    oCheckAmountFunction(false);
                    break;
                }
            };
            ute.ui.main.Popup.Confirm({
                title: 'Information',
                message: sMessage,
                callback: oConfirmMsgCallBack
            });
        };
        /**
		 * Pending Bank Draft Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPendingBankDraft = function (oEvent) {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close"),
                oTableRow = this.getView().byId("idnrgQPTable-BDRow"),
                oTableRowTemplate = this.getView().byId("idnrgQPTable-BDRows"),
                oBindingInfo,
                sPath = "/BankDraftPPSet",
                oModel = this.getView().getModel('comp-quickpay'),
                aFilterIds,
                aFilterValues,
                aFilters,
                fnRecievedHandler,
                oPendingPaymentsModel = new JSONModel(),
                that = this;
            this.setShowCloseButton(false);
            that._OwnerComponent.getCcuxApp().setOccupied(true);
            this._onToggleViews("PBD");
            this._aPendingSelPaths = [];
            oPopup.removeStyleClass("nrgQPPay-Popup");
            oPopup.addStyleClass("nrgQPPay-PopupPayment");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            //this.getView().getParent().setPosition();
            this.getView().setModel(oPendingPaymentsModel, "QP-quickpay");
            aFilterIds = ["BP", "CA"];
            aFilterValues = [this._sBP, this._sCA];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oBindingInfo = {
                filters : aFilters,
                success : function (oData) {
                    oPendingPaymentsModel.setData(oData);
                    oTableRow.setModel(oPendingPaymentsModel);
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Eligibility Error occured");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
        };
        /**
		 * Handler when Pending payment record is selected, make fields editable
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         *
		 *
		 */
        Controller.prototype.onPendingBDSelected = function (oEvent) {
            var oRow = oEvent.getSource().getParent(),
                iSelected = this.getView().getModel("appView").getProperty("/selected"),
                sPath,
                iIndex,
                sTemp,
                oModel;
            oModel = oEvent.getSource().getBindingContext("QP-quickpay").getModel();
            sPath = oEvent.getSource().getParent().getBindingContext("QP-quickpay").getPath();
            if (oEvent.getSource().getChecked()) {
                if ((iSelected) && (iSelected === 1)) {
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Only one Record editable'
                    });
                    oEvent.getSource().setChecked(false);
                } else {
                    iIndex = this._aPendingSelPaths.indexOf(sPath);
                    sTemp = iIndex < 0 && this._aPendingSelPaths.push(sPath);
                    iSelected = 1;
                    this.getView().getModel("appView").setProperty("/selected", iSelected);
                    oModel.setProperty(oEvent.getSource().getBindingContext("QP-quickpay").getPath() + "/Editable", true);
                    oRow.addStyleClass("nrgQPTable-RowsSelected");
                }
            } else {
                iIndex = this._aPendingSelPaths.indexOf(sPath);
                sTemp = iIndex > -1 && this._aPendingSelPaths.splice(iIndex, 1);
                iSelected = 0;
                this.getView().getModel("appView").setProperty("/selected", iSelected);
                oRow.removeStyleClass("nrgQPTable-RowsSelected");
            }
        };
        /**
		 * Pending Credit Card Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPendingBDSave = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                oPCCModel = this.getView().getModel('QP-quickpay'),
                mParameters,
                that = this,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oContactModel = this.getView().getModel("quickpay-cl"),
                oViewModel = this.getView().getModel("appView");


            that._OwnerComponent.getCcuxApp().setOccupied(true);
            if ((this._aPendingSelPaths) && (this._aPendingSelPaths.length > 0)) {
                this._aPendingSelPaths.forEach(function (sCurrentPath) {
                    var oContext = oPCCModel.getContext(sCurrentPath),
                        aFilterIds = ["BP", "CA"],
                        aFilterValues = [oContext.getProperty("BP"), oContext.getProperty("CA")],
                        aFilters,
                        oBindingInfo,
                        oTableRow = that.getView().byId("idnrgQPTable-BDRow"),
                        sPath = "/BankDraftPPSet";
                    that.getView().getModel("appView").setProperty("/selected", 0);
                    mParameters = {
                        method : "POST",
                        urlParameters : {"RoutingNumber" : oContext.getProperty("RoutingNumber"),
                                         "AccountNumber" : oContext.getProperty("AccountNumber"),
                                         "ScheduledDate" : oContext.getProperty("ScheduledDate"),
                                         "PaymentAmount" : oContext.getProperty("PaymentAmount"),
                                         "TrackingID" : oContext.getProperty("TrackingID"),
                                         "ContractID" : "",
                                         "BP" : oContext.getProperty("BP"),
                                         "CA" : oContext.getProperty("CA"),
                                         "CurrentStatus" : oContext.getProperty("CurrentStatus")},
                        success : function (oData, oResponse) {
/*                            jQuery.sap.log.info("Odata Read Successfully:::");
                            aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                            oBindingInfo = {
                                filters : aFilters,
                                success : function (oData) {
                                    oPCCModel.setData(oData);
                                    oTableRow.setModel(oPCCModel);
                                    jQuery.sap.log.info("Odata Read Successfully:::");
                                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                                    ute.ui.main.Popup.Alert({
                                        title: 'Information',
                                        message: 'Update Successfull'
                                    });
                                }.bind(this),
                                error: function (oError) {
                                    jQuery.sap.log.info("Error occured");
                                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                                    ute.ui.main.Popup.Alert({
                                        title: 'Information',
                                        message: 'Update Successfull'
                                    });
                                }.bind(this)
                            };
                            if (oModel) {
                                oModel.read(sPath, oBindingInfo);
                            }*/
                            if (oData.Error === "") {
                                oContactModel.setData(oData);
                                that.onPaymentSuccess();
                                oViewModel.setProperty("/PendingRefresh", true);
                                that.attachEventOnce("ContactLogSaved", that.onPendingBankDraft);
                                oMsgArea.addStyleClass("nrgQPPay-hide");
                            } else {
                                that.getView().getModel("appView").setProperty("/message", oData.Message);
                            }
                            that._OwnerComponent.getCcuxApp().setOccupied(false);
                        }.bind(this),
                        error: function (oError) {
                            jQuery.sap.log.info("Error occured");
                            that._OwnerComponent.getCcuxApp().setOccupied(false);
                            ute.ui.main.Popup.Alert({
                                title: 'Information',
                                message: 'Update failed'
                            });
                        }.bind(this)
                    };
                    oModel.callFunction("/BankDraftUpdate", mParameters);
                });
            } else {
                that._OwnerComponent.getCcuxApp().setOccupied(false);
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: 'No Record Selected'
                });
            }
        };
        /**
         * Handler for Adding new Bank draft
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAddBD = function (oEvent) {
            this._onToggleViews("ABD");

        };
        /**
         * Handler for Adding new Bank draft after data
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAddNewBD = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                oAppViewModel = this.getView().getModel("appView"),
                sCurrentPath = "/BankAccountSet",
                that = this,
                sBankAccount = oAppViewModel.getProperty("/newBankAccount"),
                sBankRouting = oAppViewModel.getProperty("/newBankRouting"),
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea");

            oMsgArea.removeStyleClass("nrgQPPay-hide");
            oMsgArea.addStyleClass("nrgQPPay-black");
            if (!this._ValidateValue(sBankAccount, "Enter Bank Account")) {
                return false;
            }
            if (!this._ValidateValue(sBankRouting, "Enter Routing Number")) {
                return false;
            }
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            oModel.create(sCurrentPath, {
                "ContractID" : "",
                "BP" : this._sBP,
                "CA" : this._sCA,
                "BankAccNum" : sBankAccount,
                "BankRouting" : sBankRouting
            }, {
                success : function (oData, oResponse) {
                    if ((oData.Error) && (oData.Error === "X")) {
                        that.getView().getModel("appView").setProperty("/message", oData.Message);
                    } else {
                        that.getView().getModel("appView").setProperty("/message", "");
                        that.onBankDraft();
                    }
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                },
                error : function (oError) {
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }
            });
        };
/********************************  Bank Draft Related functionality stop ************************************/

/********************************  Reliant Card Related functionality start *********************************/
         /**
		 * Reliant Card Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onReliantCard = function (oEvent) {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close"),
                oReliantDate = this.getView().byId("idnrgQPCC-RedDate"),
                oReliantRedeem = this.getView().byId("idnrgQPCC-reliantRedeem");
            oPopup.removeStyleClass("nrgQPPay-Popup");
            oPopup.addStyleClass("nrgQPPay-PopupWhite");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            oReliantRedeem.addStyleClass("nrgQPPay-hide");
            this._onToggleViews("RED");
            this.setShowCloseButton(false);
            oReliantDate.setValue(this._oFormatYyyymmdd.format(new Date(), true));
            oReliantDate.setEditable(false);
        };

        /**
         * Handler for Accepting Reliant Card Payment
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAcceptReliant = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                mParameters,
                sCurrentPath,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oReliantButton = this.getView().byId("idnrgQPCC-reliantAccept"),
                oReliantRedeem = this.getView().byId("idnrgQPCC-reliantRedeem"),
                oReliantCard = this.getView().byId("idnrgQPCC-ReliantCard"),
                fnRecievedHandler,
                that = this,
                oBindingInfo;
            sCurrentPath = "/ReliantSet";
            oMsgArea.removeStyleClass("nrgQPPay-hide");
            oMsgArea.addStyleClass("nrgQPPay-black");
            if (!this._ValidateValue(oReliantCard.getValue(), "Enter Reliant Card")) {
                return false;
            }
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            sCurrentPath = sCurrentPath + "(BP='" + this._sBP + "',CA='" + this._sCA + "',ReliantCard='" + oReliantCard.getValue() + "')";
/*            fnRecievedHandler = function (oEvent) {
                if (oEvent.mParameters.data.Error !== "") {
                    that.getView().getModel("appView").setProperty("/message", oEvent.mParameters.data.Message);
                } else {
                    that.getView().getModel("appView").setProperty("/message", "Success");
                    oReliantButton.addStyleClass("nrgQPPay-hide");
                    oReliantRedeem.removeStyleClass("nrgQPPay-hide");
                }
                jQuery.sap.log.info("Odata Read Successfully:::");
                that._OwnerComponent.getCcuxApp().setOccupied(false);
            };
            this.getView().byId("idnrgQPCC-Amt2").bindElement({
                model : "comp-quickpay",
                path : sCurrentPath,
                events: {dataReceived : fnRecievedHandler}
            });*/
            oBindingInfo = {
                success : function (oData) {
                    if (oData && (oData.Error !== "")) {
                        that.getView().getModel("appView").setProperty("/message", oData.Message);
                    } else {
                        that.getView().getModel("appView").setProperty("/message", "Success");
                        that.getView().byId("idnrgQPCC-Amt2").bindElement({
                            model : "comp-quickpay",
                            path : sCurrentPath
                        });
                        oReliantButton.addStyleClass("nrgQPPay-hide");
                        oReliantRedeem.removeStyleClass("nrgQPPay-hide");
                    }
                    jQuery.sap.log.info("Odata Read Successfully:::");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sCurrentPath, oBindingInfo);
            }
        };

        /**
         * Handler for Declining Reliant Card Payment
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onDeclineReliant = function (oEvent) {
            this.getView().getParent().close();
        };
        /**
         * handler for Reliant Card change value
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onReliantCardChange = function (oEvent) {
            this.getView().getModel("appView").setProperty("/reliantPay", true);
        };

        /**
         * handler for Reliant Card Redeem
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onReliantRedeem = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                mParameters,
                sCurrentPath,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oContext,
                oReliantCardAmount = this.getView().byId("idnrgQPCC-Amt2"),
                that = this,
                oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close");
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            oContext = oReliantCardAmount.getBindingContext("comp-quickpay");
            sCurrentPath = "/ReliantSet";
            oModel.create(sCurrentPath, {
                "ContractID": "",
                "BP": oContext.getProperty("BP"),
                "CA": oContext.getProperty("CA"),
                "ReliantCard": oContext.getProperty("ReliantCard"),
                "Amount": oContext.getProperty("Amount")
            }, {
                success : function (oData, oResponse) {
                    oPopup.removeStyleClass("nrgQPPay-PopupWhite");
                    oPopup.addStyleClass("nrgQPPay-Popup");
                    oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
                    that.getView().getModel("appView").setProperty("/showContactLog", false);
                    that._onToggleViews("CLI");
                    oMsgArea.addStyleClass("nrgQPPay-hide");
                    jQuery.sap.log.info("Create successfull");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                },
                error : function (oError) {
                    that.getView().getModel("appView").setProperty("/message", "Error at backend");
                    jQuery.sap.log.info("Create Failure");
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }
            });
        };
/********************************  Reliant Card Related functionality stop **********************************/
/********************************  Receipt  Related functionality start *************************************/
        /**
		 * Receipt Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onReceipt = function (oEvent) {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close"),
                aFilterIds,
                aFilterValues,
                aFilters,
                WRRecievedHandler,
                oWaiveReasonDropDown = this.getView().byId("idnrgQPCC-ReceiptDD"),
                oBindingInfo,
                oWaiveReasonTemplate = this.getView().byId("idnrgQPCC-WaiveReasonItem"),
                sCurrentPath,
                oModel = this.getView().getModel('comp-quickpay'),
                oReceiptDate = this.getView().byId("idnrgQPRC-RcDate"),
                that = this;
            //this._OwnerComponent.getCcuxApp().setOccupied(true);
            this.setShowCloseButton(false);
            oReceiptDate.setValue(this._oFormatYyyymmdd.format(new Date(), true));
            oPopup.removeStyleClass("nrgQPPay-Popup");
            oPopup.addStyleClass("nrgQPPay-PopupWhite");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            this._onToggleViews("REC");
            sCurrentPath = "/ReceiptSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')/WaiveReasonsSet";
/*            WRRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                if (oEvent) {
                    if (oEvent.getSource().getLength() === 1) {
                        oWaiveReasonDropDown.setSelectedKey(oEvent.getSource().getContexts()[0].getProperty("ReasonCode"));
                    }
                }
                that._OwnerComponent.getCcuxApp().setOccupied(false);
            };
            oBindingInfo = {
                model : "comp-quickpay",
                path : sCurrentPath,
                template : oWaiveReasonTemplate,
                parameters: {countMode : "None"},
                events: {dataReceived : WRRecievedHandler}
            };
            oWaiveReasonDropDown.bindAggregation("content", oBindingInfo);*/
        };

        /**
		 * Receipt Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAcceptReceipt = function (oEvent) {
            var oModel = this.getView().getModel('comp-quickpay'),
                mParameters,
                sCurrentPath,
                oMsgArea = this.getView().byId("idnrgQPPay-msgArea"),
                oReceiptDate = this.getView().byId("idnrgQPRC-RcDate"),
                oReceiptNum = this.getView().byId("idnrgQPRC-RNum"),
                oReceiptAmount = this.getView().byId("idnrgQPRC-Amt"),
                //oReceiptDropDown = this.getView().byId("idnrgQPCC-ReceiptDD"),
                that = this,
                oContactModel = this.getView().getModel("quickpay-cl");
            oMsgArea.removeStyleClass("nrgQPPay-hide");
            oMsgArea.addStyleClass("nrgQPPay-black");
            if (!this._ValidateValue(oReceiptNum.getValue(), "Enter Receipt Number")) {
                return false;
            }
            if (!this._ValidateValue(oReceiptAmount.getValue(), "Enter Amount")) {
                return false;
            }
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            sCurrentPath = "/ReceiptSet";
            oModel.create(sCurrentPath, {
                "ContractID" : "",
                "BP" : this._sBP,
                "CA" : this._sCA,
                "ReceiptNumber" : oReceiptNum.getValue().trim(),
                "Amount" : oReceiptAmount.getValue().trim()
                //"WaiveFlag" : oReceiptDropDown.getSelectedKey()
            }, {
                success : function (oData, oResponse) {
                    if (oData.Error === "") {
                        oContactModel.setData(oData);
                        that.onPaymentSuccess();
                        oMsgArea.addStyleClass("nrgQPPay-hide");
                    } else {
                        that.getView().getModel("appView").setProperty("/message", oData.Message);
                    }
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                },
                error : function (oError) {
                    that.getView().getModel("appView").setProperty("/message", oError.statusText);
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }
            });
        };
/********************************  Receipt  Related functionality stop **************************************/
/********************************  Formatter function start            **************************************/
         /**
		 * Formats the Bank Account Number only show last three digits
		 *
		 * @function
		 * @param {String} sAccountNumber value from the binding
         *
		 *
		 */
        Controller.prototype.formatAccountNumber = function (sAccountNumber) {
            if ((sAccountNumber !== undefined) && (sAccountNumber !== null) && (sAccountNumber !== "") && (sAccountNumber.split("-").length > 1)) {
                return sAccountNumber.split("-")[1];
            } else {
                return "";
            }
        };
         /**
		 * Formats the Bank Account Number only show last three digits
		 *
		 * @function
		 * @param {String} sAccountNumber value from the binding
         *
		 *
		 */
        Controller.prototype.formatCardNumber = function (sCardNumber) {
            if ((sCardNumber !== undefined) && (sCardNumber !== null) && (sCardNumber !== "") && (sCardNumber.split("-").length > 1)) {
                return sCardNumber.split("-")[2];
            } else {
                return "";
            }
        };
        /**
		 * Validates User Input values
		 *
		 * @function
		 * @param {String} sValue to validate
         * @param {String} sMsg to display when blank/null/undefined
		 *
		 */
        Controller.prototype._ValidateValue = function (sValue, sMsg) {
            if ((sValue === undefined) || (sValue === null) || (sValue === "")) {
                this.getView().getModel("appView").setProperty("/message", sMsg);
                return false;
            } else {
                return true;
            }

        };
        /**
		 * Formats the Credit Card Icon based on type value
		 *
		 * @function
		 * @param {String} sAccountNumber value from the binding
         *
		 *
		 */
        Controller.prototype.formatCCType = function (sCCType) {
            if ((sCCType !== undefined) && (sCCType !== null) && (sCCType !== "")) {
                if (sCCType === "ZVIS") {
                    return "sap-icon://nrg-icon/cc-visa";
                } else if (sCCType === "ZDSC") {
                    return "sap-icon://nrg-icon/cc-discover";
                } else if (sCCType === "ZMCD") {
                    return "sap-icon://nrg-icon/cc-mastercard";
                } else if (sCCType === "ZATM") {
                    return "sap-icon://nrg-icon/cc-visa";
                }
            } else {
                return "";
            }
        };
/********************************  Formatter function stop             **************************************/
        /**
		 * Credit Card Process initialization
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onStopRec = function (oEvent) {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close");
            oPopup.removeStyleClass("nrgQPPay-Popup");
            oPopup.addStyleClass("nrgQPPay-PopupWhite");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            this._onToggleViews("CC");
        };

        /**
		 * Recording Stop and Resume
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPopupClose = function (oEvent) {
            var sPath = "/RecordingSet(BP='" + this._sBP + "',CA='" + this._sCA + "')",
                mParameters = {
                    success : function (oData, oResponse) {
                    }.bind(this),
                    error: function (oError) {
                    }.bind(this)
                },
                oModel = this.getView().getModel('comp-quickpay');
            if (this._bCreditCard) {
                oModel.update(sPath, {
                    "Resume" : true
                }, mParameters);
                this._bCreditCard = false;
            }
            this.getView().getParent().close();
        };
        /**
		 * Recording Pause
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onRecordingPause = function () {
            var sPath = "/RecordingSet(BP='" + this._sBP + "',CA='" + this._sCA + "')",
                mParameters = {
                    success : function (oData, oResponse) {
                    }.bind(this),
                    error: function (oError) {
                    }.bind(this)
                },
                oModel = this.getView().getModel('comp-quickpay');
            if (this._bCreditCard) {
                oModel.update(sPath, {
                    "Resume" : false
                }, mParameters);
            }
        };
        /**
		 * Enable Payment Success
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onPaymentSuccess = function () {
            var oPopup = this.getView().byId("idnrgQPPay-Popup"),
                oCloseButton = this.getView().byId("idnrgQPPayBt-close");
            oPopup.removeStyleClass("nrgQPPay-PopupPayment");
            oPopup.removeStyleClass("nrgQPPay-PopupWhite");
            oPopup.addStyleClass("nrgQPPay-Popup");
            oCloseButton.addStyleClass("nrgQPPayBt-closeBG");
            this._onToggleViews("CLI");
        };
        /**
		 * Enable Contact Log
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onContactLog = function () {
            var oPopup = this.getView().byId("idnrgQPPay-Popup");
            if (this.getView().getModel("appView").getProperty("/showContactLog")) {
                this._onToggleViews("CL");
                oPopup.removeStyleClass("nrgQPPay-Popup");
                oPopup.addStyleClass("nrgQPPay-PopupPayment");
            } else {
                this.onPopupClose();
            }

        };
        /**
         * handler for contact log maintenance
		 *
		 * @function onQuickPay
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.onAcceptContactLog = function (oEvent) {
            var oContactLogModel = this.getView().getModel("quickpay-cl"),
                oModel = this.getView().getModel('comp-quickpay'),
                sCurrentPath = "/ContactLogSet",
                that = this,
                oViewModel = this.getView().getModel("appView");
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            oModel.create(sCurrentPath, {
                "ContractID" : "",
                "BP" : oContactLogModel.getProperty("/BP"),
                "CA" : oContactLogModel.getProperty("/CA"),
                "Class" : oContactLogModel.getProperty("/Class"),
                "Activit" : oContactLogModel.getProperty("/Activit"),
                "PopMessage" : oContactLogModel.getProperty("/PopMessage")
            }, {
                success : function (oData, oResponse) {
                    if (oData.ContactLogID !== "") {
                        that.onPopupClose();
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'Contact log not created successfully.'
                        });
                        that.onPopupClose();
                    }
                    that._OwnerComponent.getCcuxApp().setOccupied(false);

                },
                error : function (oError) {
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Contact log not created successfully.'
                    });
                    if (!oContactLogModel.getProperty("/PendingRefresh")) {
                        that.onPopupClose();
                    } else {
                        this.fireEvent("ContactLogSaved");
                    }
                }
            });
        };
        /**
         * handler close button issues
		 *
		 * @function onQuickPay
         * @param {boolean} bValue = true to show; false to hide
		 */
        Controller.prototype.setShowCloseButton = function (bValue) {
            var oAppViewModel = this.getView().getModel("appView");
            if (oAppViewModel.getProperty("/showCloseButton") !== bValue) {
                oAppViewModel.setProperty("/showCloseButton", bValue);
            }
        };
        /**
         * handler for contact log maintenance
		 *
		 * @function onQuickPay
         * @param {interger} iType = 0 is small, 1 is large
		 */
        Controller.prototype.setPosition = function (iType) {
            if (iType === 0) {
                this.getView().getParent().setPosition("left bottom", "left bottom");
            } else {
                this.getView().getParent().setPosition("left bottom", "left bottom");
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
        return Controller;
    }
);
