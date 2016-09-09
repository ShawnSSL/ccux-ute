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
                that = this,
                oGlobalDataManager;
            this._oFormatYyyymmdd = DateFormat.getInstance({
                pattern: 'MM/dd/yyyy',
                calendarType: sap.ui.core.CalendarType.Gregorian
            });
            this.getView().getModel('comp-quickpay').oData = {};
            //this.getView().getModel('comp-quickpay').refresh(true, true);//If set to true then the model data will be removed/cleared.
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();

            oContactModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oContactModel, "quickpay-cl");
            this.getView().setModel(oViewModel, "appView");

            /*************************  Add Auto Bank Draft / Pay Card Option to CCUX BY SHAWN SHAO start ******************************/
            oGlobalDataManager = this._OwnerComponent.getGlobalDataManager();
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                current : false,
                newAdd : false,
                co : '',
                HouseNo : '',
                UnitNo : '',
                City : '',
                State: '',
                Country : '',
                AddrLine : '',
                Street : '',
                PoBox: '',
                ZipCode : '',
                NewAddrCheck : false,
                NewAddressflag : false,
                editable : false
            }), 'olocalAddress');
            this.getView().setModel(new JSONModel(), 'oCorrModel');
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                isPrePay : false,
                prePayDes : "Please Use Index to Set Up Prepay Auto Pay"
            }), 'olocalCorrModel');
            if (oGlobalDataManager.isPrepay()) {
                this.getView().getModel("olocalCorrModel").setProperty("/isPrePay", true);
            }
            this._initScrnControl();
            /*************************  Add Auto Bank Draft / Pay Card Option to CCUX BY SHAWN SHAO stop *******************************/

            if (this._Process === 'PCC') {
                this.onPendingCreditCard();
                this._onPayFlagsRead();
            } else if (this._Process === 'PBD') {
                this.onPendingBankDraft();
                this._onPayFlagsRead();
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
        * To Read pay flags data in case OTBD and OTCC is clicked
        *
        * @function _onPayFlagsRead
        *
        */
        Controller.prototype._onPayFlagsRead = function () {
            var oModel = this.getView().getModel('comp-quickpay'),
                sPath = "/PayAvailFlagsSet" + "(BP='" + this._sBP + "',CA='" + this._sCA + "')",
                oBindingInfo = {
                    success : function (oData) {
                        jQuery.sap.log.info("Odata Read Successfully:::");
                    }.bind(this),
                    error: function (oError) {
                        jQuery.sap.log.info("Odata Error occured");
                    }.bind(this)
                };
            if (oModel) {
                oModel.read(sPath, oBindingInfo);
            }
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
            oCreditCardDate.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), false));
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            //oCreditCardDate.setMinDate(new Date());
            this.setShowCloseButton(false);
            this.getView().setModel(oCreditCardModel, "quickpay-cc");
            WRRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Data Received Succesfully");
                if (oEvent) {
                    if (oEvent.getSource().getLength() === 1) {
                        oWaiveReasonDropDown.setSelectedKey(oEvent.getSource().getContexts()[0].getProperty("ReasonCode"));
                        oMsgArea.removeStyleClass("nrgQPPay-hide");
                        oMsgArea.addStyleClass("nrgQPPay-black");
                        oAppViewModel.setProperty("/message", oEvent.getSource().getContexts()[0].getProperty("Message"));
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
                jQuery.sap.log.info("Data Received Succesfully");
                if (oEvent) {
                    if ((oEvent) && (oEvent.mParameters) && (oEvent.mParameters.data) && (oEvent.mParameters.data.results[0])) {
                        oCreditCardDropDown.setPlaceholder('Select');
                    } else {
                        oCreditCardDropDown.setPlaceholder('No stored cards');
                    }
                }
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
            if (!this._ValidateValue(oCreditCardAmount.getValue(), "Enter Amount to be posted", true)) {
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
                        sPath = "/CreditCardPPSet(BP='" + that._sBP + "',CA='" + that._sCA + "',CardID='" + oContext.getProperty("CardID") + "')";
                    mParameters = {
                        method : "POST",
                        urlParameters : {"CardID" : oContext.getProperty("CardID"),
                                         "CardNumber" : oContext.getProperty("CardNumber"),
                                         "ScheduledDate" : oContext.getProperty("ScheduledDate"),
                                         "Amount" : oContext.getProperty("Amount"),
                                         "ZipCode" : oContext.getProperty("ZipCode"),
                                         "BP" : oContext.getProperty("BP"),
                                         "CA" : oContext.getProperty("CA"),
                                         "ExpiryDate" : oContext.getProperty("ExpiryDate")},
                        success : function (oData, oResponse) {
                            if (oData.Error === "") {
                                that._OwnerComponent.getCcuxApp().setOccupied(false);
                                ute.ui.main.Popup.Alert({
                                    title: 'Information',
                                    message: 'Update Successful'
                                });
                                that.onPopupClose();
/*                                var aFilterIds = ["BP", "CA"],
                                    aFilterValues = [oContext.getProperty("BP"), oContext.getProperty("CA")],
                                    aFilters,
                                    oBindingInfo,
                                    oPendingPaymentsModel = that.getView().getModel("QP-quickpay"),
                                    oTableRow = that.getView().byId("idnrgQPTable-Row");
                                sPath = "/CreditCardPPSet";
                                aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                                oBindingInfo = {
                                    filters : aFilters,
                                    success : function (oData) {
                                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                                        ute.ui.main.Popup.Alert({
                                            title: 'Information',
                                            message: 'Update Successful'
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
                                jQuery.sap.log.info("Odata Read Successfully:::");*/
                            } else {
                                that.getView().getModel("appView").setProperty("/message", oData.Message);
                            }
                            that._OwnerComponent.getCcuxApp().setOccupied(false);
                        }.bind(this),
                        error: function (oError) {
                            that._OwnerComponent.getCcuxApp().setOccupied(false);
                            ute.ui.main.Popup.Alert({
                                title: 'Information',
                                message: 'Update failed'
                            });
                            that.onPopupClose();
                        }.bind(this)
                    };
/*                    oModel.update(sPath, {"CardID" : oContext.getProperty("CardID"),
                                         "CardNumber" : oContext.getProperty("CardNumber"),
                                         "ScheduledDate" : oContext.getProperty("ScheduledDate"),
                                         "Amount" : oContext.getProperty("Amount"),
                                         "ContractID" : "",
                                         "BP" : oContext.getProperty("BP"),
                                         "CA" : oContext.getProperty("CA"),
                                         "CurrentStatus" : oContext.getProperty("CurrentStatus")}, mParameters);*/
                    oModel.callFunction("/CreditCardUpdate", mParameters);
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
		 * Handler when Pending payment record is selected, make fields editable
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         *
		 *
		 */
        Controller.prototype.onPCCCancel = function (oEvent) {
            var oPCCModel = this.getView().getModel('QP-quickpay'),
                oModel = this.getView().getModel('comp-quickpay'),
                that = this,
                oPayAvailFlags = "/PayAvailFlagsSet" + "(BP='" + parseInt(this._sBP, 10) + "',CA='" +  parseInt(this._sCA, 10) + "')",
                oContext = oModel.getContext(oPayAvailFlags),
                sCAName =  oContext.getProperty("CaName");

            if ((this._aPendingSelPaths) && (this._aPendingSelPaths.length > 0)) {
                this._aPendingSelPaths.forEach(function (sCurrentPath) {
                    var oContext = oPCCModel.getContext(sCurrentPath),
                        sPath,
                        oFirstConfirmCallBack,
                        oCallFunctionHandler,
                        mParameters,
                        fSecondConfirmHandler,
                        fSecondConfirmCallback;
                    sPath = "/CreditCardPPSet(BP='" + oContext.getProperty("BP") + "',CA='" + oContext.getProperty("CA") + "',CardID='" + oContext.getProperty("CardID") + "')";
                    oContext = oModel.getContext(sPath);
                    mParameters = {
                        method : "POST",
                        urlParameters : {
                            "CardID" : oContext.getProperty("CardID"),
                            "BP" : oContext.getProperty("BP"),
                            "CA" : oContext.getProperty("CA")
                        },
                        success : function (oData, oResponse) {
                            ute.ui.main.Popup.Alert({
                                title: 'Information',
                                message: 'Scheduled Payment succesfully cancelled'
                            });
                            that.onPopupClose();
                        }.bind(this),
                        error: function (oError) {
                            ute.ui.main.Popup.Alert({
                                title: 'Information',
                                message: 'Scheduled Payment Failed to cancel'
                            });
                        }.bind(this)
                    };
                    oCallFunctionHandler = function (bForward) {
                        sPath = "/CreditCardCanc";
                        oModel.callFunction(sPath, mParameters);
                    };
                    fSecondConfirmHandler = function (bForward) {
                        if (!bForward) {
                            return;
                        }
                        var sMessage,
                            oOkButton,
                            oCancelButton,
                            oText,
                            oTag = new ute.ui.commons.Tag(),
                            AlertDialog,
                            sDate = oContext.getProperty("ScheduledDate"),
                            oFormatmmddyy = DateFormat.getInstance({pattern: "MM-dd-yyyy"});
                        sMessage = "<div style='margin:10px; max-height: 200rem; overflow-y:auto'> <div>" + sCAName  + ' has requested to cancel the One Time Scheduled Credit Card Payment below:' + "</div><div style='margin:10px;'> Scheduled Authorization Date :: " + oFormatmmddyy.format(sDate) + "</div> <div style='margin:10px;'> Contract Account Number:: ";
                        sMessage = sMessage + oContext.getProperty("CA");
                        sMessage = sMessage + "</div><div style='margin:10px;'> Payment Amount:: ";
                        sMessage = sMessage + parseFloat(oContext.getProperty("Amount")).toFixed(2);
                        sMessage = sMessage + "</div><div style='margin:10px;'> Do you wish to continue? ";
                        oOkButton = new ute.ui.main.Button({text: 'OK', press: function () {AlertDialog.close(); oCallFunctionHandler(true); } });
                        oCancelButton = new ute.ui.main.Button({text: 'CANCEL', press: function () {AlertDialog.close(); }});
                        oOkButton.addStyleClass("nrgQPCC-btn");
                        oCancelButton.addStyleClass("nrgQPCC-btn");
                        oText = new sap.ui.core.HTML({content: sMessage});
                        oTag.addContent(oText);
                        oTag.addContent(oOkButton);
                        oTag.addContent(oCancelButton);
                        AlertDialog = new ute.ui.main.Popup.create({
                            title: "Validate",
                            content: oTag
                        });
                        AlertDialog.open();
                    };
                    oFirstConfirmCallBack = function (sAction) {
                        switch (sAction) {
                        case ute.ui.main.Popup.Action.Yes:
                            fSecondConfirmHandler(true);
                            break;
                        case ute.ui.main.Popup.Action.No:
                            fSecondConfirmHandler(false);
                            break;
                        }
                    };
                    ute.ui.main.Popup.Confirm({
                        title: 'Validate',
                        message: 'If Scheduled Credit Card Payment is cancelled you may be subject to applicable late fees and/or disconnection, unless other payment is received by the due date. Are you sure you want to cancel?',
                        callback: oFirstConfirmCallBack
                    });

                });

            } else {
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: 'No Record Selected'
                });
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
            oBankDraftDate.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), false));
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
                if (oEvent) {
                    if ((oEvent) && (oEvent.mParameters) && (oEvent.mParameters.data) && (oEvent.mParameters.data.results[0])) {
                        oBankDraftDropDown.setPlaceholder('Select');
                    } else {
                        oBankDraftDropDown.setPlaceholder('No stored cards');
                    }
                }
                that._OwnerComponent.getCcuxApp().setOccupied(false);
            };
            WRRecievedHandler = function (oEvent) {
                jQuery.sap.log.info("Date Received Succesfully");
                if (oEvent) {
                    if (oEvent.getSource().getLength() === 1) {
                        oWaiveReasonDropDown.setSelectedKey(oEvent.getSource().getContexts()[0].getProperty("ReasonCode"));
                        oMsgArea.removeStyleClass("nrgQPPay-hide");
                        oMsgArea.addStyleClass("nrgQPPay-black");
                        oAppViewModel.setProperty("/message", oEvent.getSource().getContexts()[0].getProperty("Message"));
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
            if (!this._ValidateValue(oBankDraftAmount.getValue(), "Enter Amount to be posted", true)) {
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
		 * Pending Bank Draft cancel option
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         *
		 *
		 */
        Controller.prototype.onPBDCancel = function (oEvent) {
            var oPCCModel = this.getView().getModel('QP-quickpay'),
                oModel = this.getView().getModel('comp-quickpay'),
                oPayAvailFlags = "/PayAvailFlagsSet" + "(BP='" + parseInt(this._sBP, 10) + "',CA='" +  parseInt(this._sCA, 10) + "')",
                oContext = oModel.getContext(oPayAvailFlags),
                sCAName =  oContext.getProperty("CaName"),
                that = this;
            if ((this._aPendingSelPaths) && (this._aPendingSelPaths.length > 0)) {
                this._aPendingSelPaths.forEach(function (sCurrentPath) {
                    var oContext = oPCCModel.getContext(sCurrentPath),
                        sPath,
                        oFirstConfirmCallBack,
                        oCallFunctionHandler,
                        mParameters,
                        fSecondConfirmHandler,
                        fSecondConfirmCallback;
                    sPath = "/BankDraftPPSet(BP='" + oContext.getProperty("BP") + "',CA='" + oContext.getProperty("CA") + "',TrackingID='" + oContext.getProperty("TrackingID") + "')";
                    oContext = oModel.getContext(sPath);
                    if (oContext.getProperty("Editable")) {
                        mParameters = {
                            method : "POST",
                            urlParameters : {
                                "TrackingID" : oContext.getProperty("TrackingID"),
                                "BP" : oContext.getProperty("BP"),
                                "CA" : oContext.getProperty("CA")
                            },
                            success : function (oData, oResponse) {
                                ute.ui.main.Popup.Alert({
                                    title: 'Information',
                                    message: 'Bank Draft scheduled Payment successfully cancelled'
                                });
                                that.onPopupClose();
                            }.bind(this),
                            error: function (oError) {
                                ute.ui.main.Popup.Alert({
                                    title: 'Information',
                                    message: 'Bank Draft scheduled Payment cancellation failed'
                                });
                            }.bind(this)
                        };
                        oCallFunctionHandler = function (bForward) {
                            if (!bForward) {
                                return;
                            }
                            sPath = "/BankDraftCanc";
                            oModel.callFunction(sPath, mParameters);
                        };
                        fSecondConfirmHandler = function (bForward) {
                            if (!bForward) {
                                return;
                            }
                            var sMessage,
                                oOkButton,
                                oCancelButton,
                                oText,
                                oTag = new ute.ui.commons.Tag(),
                                AlertDialog,
                                sDate = oContext.getProperty("ScheduledDate"),
                                oFormatmmddyy = DateFormat.getInstance({pattern: "MM-dd-yyyy"});
                            sMessage = "<div style='margin:10px; max-height: 200rem; overflow-y:auto'> <div>" + sCAName  + ' has requested to cancel the One Time Bank Draft below:' + "</div><div style='margin:10px;'> Debt Authorization Date :: " + oFormatmmddyy.format(sDate) + "</div> <div style='margin:10px;'> Contract Account Number:: ";
                            sMessage = sMessage + oContext.getProperty("CA");
                            sMessage = sMessage + "</div><div style='margin:10px;'> Payment Amount:: ";
                            sMessage = sMessage + parseFloat(oContext.getProperty("PaymentAmount")).toFixed(2);
                            sMessage = sMessage + "</div><div style='margin:10px;'> Payment Date Requested :: " + oFormatmmddyy.format(sDate) + "</div>";
                            sMessage = sMessage + "<div style='margin:10px;'> Do you wish to continue? </div></div>";
                            oOkButton = new ute.ui.main.Button({text: 'OK', press: function () {AlertDialog.close(); oCallFunctionHandler(true); } });
                            oCancelButton = new ute.ui.main.Button({text: 'CANCEL', press: function () {AlertDialog.close(); }});
                            oOkButton.addStyleClass("nrgQPCC-btn");
                            oCancelButton.addStyleClass("nrgQPCC-btn");
                            oText = new sap.ui.core.HTML({content: sMessage});
                            oTag.addContent(oText);
                            oTag.addContent(oOkButton);
                            oTag.addContent(oCancelButton);
                            AlertDialog = new ute.ui.main.Popup.create({
                                title: "Validate",
                                content: oTag
                            });
                            AlertDialog.open();
                        };
                        oFirstConfirmCallBack = function (sAction) {
                            switch (sAction) {
                            case ute.ui.main.Popup.Action.Yes:
                                fSecondConfirmHandler(true);
                                break;
                            case ute.ui.main.Popup.Action.No:
                                fSecondConfirmHandler(false);
                                break;
                            }
                        };
                        ute.ui.main.Popup.Confirm({
                            title: 'Validate',
                            message: 'If bank draft request is cancelled you may be subject to applicable late fees and/or disconnection, unless other payment is received by the due date. Are you sure you want to cancel?',
                            callback: oFirstConfirmCallBack
                        });
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Information',
                            message: 'Cannot cancel since it is pass the deadline for same day cancels(5:00pm).'
                        });
                    }


                });

            } else {
                ute.ui.main.Popup.Alert({
                    title: 'Information',
                    message: 'No Record Selected'
                });
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
            oReliantDate.setValue(this._oFormatYyyymmdd.format(new Date(), false));
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
            oReceiptDate.setValue(this._oFormatYyyymmdd.format(new Date(), false));
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
            if (!this._ValidateValue(oReceiptAmount.getValue(), "Enter Amount", true)) {
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
        Controller.prototype._ValidateValue = function (sValue, sMsg, bInt) {
            if (bInt) {
                if ((!sValue) || (sValue <= 0)) {
                    this.getView().getModel("appView").setProperty("/message", sMsg);
                    return false;
                } else {
                    return true;
                }
            } else {
                if ((sValue === undefined) || (sValue === null) || (sValue === "")) {
                    this.getView().getModel("appView").setProperty("/message", sMsg);
                    return false;
                } else {
                    return true;
                }
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

/********************************  Recurring Payment Related functionality start *************************************/
/*************************  Add Auto Bank Draft / Pay Card Option to CCUX BY SHAWN SHAO ******************************/

        /** PM Popup Button Select **/
        Controller.prototype.updateRPSData = function () {
            var oPayAvailFlags = "/PayAvailFlagsSet" + "(BP='" + parseInt(this._sBP, 10) + "',CA='" +  parseInt(this._sCA, 10) + "')",
                oModel = this.getView().getModel('comp-quickpay'),
                oContext = oModel.getContext(oPayAvailFlags),
                oPayOptionModel = this.getView().getModel('olocalCorrModel');
            oPayOptionModel.setProperty('/Rps', oContext.getProperty("Rps"));
            oPayOptionModel.setProperty('/Rpt', oContext.getProperty("Rpt"));
        };
        Controller.prototype.onAutoBankDraft = function (oEvent) {
            var oPpPmt = this.getView().getModel('olocalAddress'),
                oPayOption = this.getView().getModel('olocalCorrModel');
            oPayOption.setProperty('/bankDraft', true);
            oPayOption.setProperty('/creditCard', false);
            oPpPmt.setProperty('/current', false);
            oPpPmt.setProperty('/newAdd', false);
            oPpPmt.setProperty('/NewAddrCheck', false);
            oPpPmt.setProperty('/NewAddressflag', false);
            oPpPmt.setProperty('/editable', false);

            if (!this._oPpCorrespondencePopup) {
                this._oPpCorrespondencePopup = ute.ui.main.Popup.create({
                    content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.quickpay.view.Correspondence", this),
                    title: 'Send Correspondence'
                });
                this.getView().addDependent(this._oPpCorrespondencePopup);
            }
            this._oPpCorrespondencePopup.open();
            this._initToggleArea();
            this.updateRPSData();
            this._selectScrn(true);
            return;
        };

        Controller.prototype.onAutoCreditCard = function (oEvent) {
            var oPpPmt = this.getView().getModel('olocalAddress'),
                oPayOption = this.getView().getModel('olocalCorrModel');
            oPayOption.setProperty('/creditCard', true);
            oPayOption.setProperty('/bankDraft', false);
            oPpPmt.setProperty('/current', false);
            oPpPmt.setProperty('/newAdd', false);
            oPpPmt.setProperty('/NewAddrCheck', false);
            oPpPmt.setProperty('/NewAddressflag', false);
            oPpPmt.setProperty('/editable', false);

            if (!this._oPpCorrespondencePopup) {
                this._oPpCorrespondencePopup = ute.ui.main.Popup.create({
                    content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.quickpay.view.Correspondence", this),
                    title: 'Send Correspondence'
                });
                this.getView().addDependent(this._oPpCorrespondencePopup);
            }
            this._oPpCorrespondencePopup.open();
            this._initToggleArea();
            this.updateRPSData();
            this._selectScrn(true);
            return;
        };

        Controller.prototype._onCancelBtnClick = function () {
            this._oPpCorrespondencePopup.close();
        };

/*        Controller.prototype._initToggleArea = function () {
            var oPayOption = this.getView().getModel('olocalCorrModel');

            this.getView().byId('id_QuickPayTglBtn').setLeftSelected(true);
            if (oPayOption.getProperty('/creditCard')) {
                this.getView().byId('paymentSetUp_BD').setVisible(false);
                this.getView().byId('paymentCancell_BD').setVisible(false);
                this.getView().byId('paymentSetUp_CC').setVisible(true);
                this.getView().byId('paymentCancell_CC').setVisible(false);
            } else if (oPayOption.getProperty('/bankDraft')) {
                this.getView().byId('paymentSetUp_BD').setVisible(true);
                this.getView().byId('paymentCancell_BD').setVisible(false);
                this.getView().byId('paymentSetUp_CC').setVisible(false);
                this.getView().byId('paymentCancell_CC').setVisible(false);
            }
            this.getView().byId('setUpAutoPay').setVisible(true);
            this.getView().byId('removeAutoPay').setVisible(false);
        };*/
        Controller.prototype._initToggleArea = function () {
            if (!this.getView().byId('id_QuickPayTglBtn').getLeftSelected()) {
                this.getView().byId('id_QuickPayTglBtn').setLeftSelected(true);
                this._onToggleButtonPress(null);
            }
        };
        Controller.prototype._retrCorrespondence = function () {
            var oODataMOdel = this.getView().getModel('comp-quickpay'),
                oParameters,
                sPath,
                olocalAddress = this.getView().getModel('olocalAddress'),
                that = this;
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            if (that._sContractId === undefined) {
                this._sContractId = '';
            }
            sPath = "/AutoPayCorrs(BP=\'" + this._sBP + "\',CA=\'" + this._sCA + "\',CO=\'" + this._sContractId + "')";

            oParameters = {
                success : function (oData) {
                    var temp = olocalAddress.oData;
                    if (oData) {
                        this.getView().getModel('oCorrModel').setData(oData);
                        if (oData.AddrCheck) {
                            olocalAddress.setProperty('/current', true);
                            olocalAddress.setProperty('/newAdd', false);
                        }
                        if (oData.Address) {
                            olocalAddress.setProperty('/Address', {});
                            //temp.Address = {};
                            olocalAddress.setProperty('/Address/co', oData.Address.co);
                            //temp.Address.co = oData.Address.co;
                            olocalAddress.setProperty('/Address/HouseNo', oData.Address.HouseNo);
                            //temp.Address.HouseNo = oData.Address.HouseNo;
                            olocalAddress.setProperty('/Address/UnitNo', oData.Address.UnitNo);
                            //temp.Address.UnitNo = oData.Address.UnitNo;
                            olocalAddress.setProperty('/Address/City', oData.Address.City);
                            //temp.Address.City = oData.Address.City;
                            olocalAddress.setProperty('/Address/State', oData.Address.State);
                            //temp.Address.State = oData.Address.State;
                            olocalAddress.setProperty('/Address/Country', oData.Address.Country);
                            //temp.Address.Country = oData.Address.Country;
                            //temp.Address.AddrLine = oData.Address.AddrLine;
                            olocalAddress.setProperty('/Address/Street', oData.Address.Street);
                            //temp.Address.Street = oData.Address.Street;
                            olocalAddress.setProperty('/Address/PoBox', oData.Address.PoBox);
                            //temp.Address.PoBox = oData.Address.PoBox;
                            olocalAddress.setProperty('/Address/ZipCode', oData.Address.ZipCode);
                            //temp.Address.ZipCode = oData.Address.ZipCode;
                        }
                    }
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oODataMOdel) {
                oODataMOdel.read(sPath, oParameters);
            }
        };

        Controller.prototype._sendCorrespondenceClicked = function () {
            var oCorrModel = this.getView().getModel('oCorrModel'),
                oPayOption = this.getView().getModel('olocalCorrModel'),
                oData = oCorrModel.oData,
                olocalAddress = this.getView().getModel('olocalAddress');

            if (oPayOption.getProperty('/creditCard')) {
                oPayOption.setProperty('/creditCard', true);
                oPayOption.setProperty('/bankDraft', false);
                oPayOption.setProperty('/CCSetUp', true);
                oPayOption.setProperty('/BDSetUp', false);
                oPayOption.setProperty('/CCRemove', false);
                oPayOption.setProperty('/BDRemove', false);
            }
            if (oPayOption.getProperty('/bankDraft')) {
                oPayOption.setProperty('/creditCard', false);
                oPayOption.setProperty('/bankDraft', true);
                oPayOption.setProperty('/BDSetUp', true);
                oPayOption.setProperty('/CCSetUp', false);
                oPayOption.setProperty('/CCRemove', false);
                oPayOption.setProperty('/BDRemove', false);
            }

            if (oData.eMailCheck) {
                if (!oData.eMail) {
                    ute.ui.main.Popup.Alert({
                        title: 'Auto Pay',
                        message: 'Email field is empty'
                    });
                    return true;
                }
            }
            if (oData.FaxCheck) {
                if (!(oData.Fax)) {
                    ute.ui.main.Popup.Alert({
                        title: 'Auto Pay',
                        message: 'Please enter Fax Number'
                    });
                    return true;
                }
                if (!(oData.FaxTo)) {
                    ute.ui.main.Popup.Alert({
                        title: 'Auto Pay',
                        message: 'Please enter Fax To'
                    });
                    return true;
                }
            }
            if (oData.AddrCheck) {
                if (olocalAddress.getProperty('/newAdd')) {
                    if (!(((olocalAddress.getProperty('/Address/HouseNo')) && (olocalAddress.getProperty('/Address/Street'))) || (olocalAddress.getProperty('/Address/PoBox')))) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Please enter street no & street name or PO Box'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/City'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Please enter city'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/State'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Please enter state'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/ZipCode'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Please enter zip Code'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/Country'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Please enter country'
                        });
                        return true;
                    }

                    this._TrilliumAddressCheck();
                    return true;
                } else {
                    this._sendCorrespondence();
                    return true;
                }
            }
            this._sendCorrespondence();
            return true;

        };

        Controller.prototype._onRemoveBtnClick = function () {
            var oODataSvc = this.getView().getModel('comp-quickpay'),
                oPayOption = this.getView().getModel('olocalCorrModel'),
                oParameters,
                sPath,
                that = this,
                oRemoveModel = this.getView().getModel('oCorrModel'),
                oData = oRemoveModel.oData;
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            sPath = '/AutoPayCorrs';

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData.Error) {
                        if (oData.Message) {
                            ute.ui.main.Popup.Alert({
                                title: 'Auto Pay',
                                message: oData.Message
                            });
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Auto Pay',
                                message: 'Correspondence Failed'
                            });
                        }
                    } else if (oData.Message) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: oData.Message
                        });
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Correspondence Sucessfully Sent'
                        });
                    }
                    this._oPpCorrespondencePopup.close();
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'Auto Pay',
                        message: 'Correspondence Failed'
                    });
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oODataSvc) {
                oData.BDRemove = oPayOption.getProperty('/BDRemove');
                oData.CCSetUp = oPayOption.getProperty('/CCSetUp');
                oData.BDSetUp = oPayOption.getProperty('/BDSetUp');
                oData.CCRemove = oPayOption.getProperty('/CCRemove');
            }
            oODataSvc.create(sPath, oRemoveModel.oData, oParameters);
        };


        /** Trillium Address Check Function **/
        Controller.prototype._TrilliumAddressCheck = function () {
            var olocalAddress = this.getView().getModel('olocalAddress'),
                oModel = this.getView().getParent().getParent().getParent().getController().getOwnerComponent().getModel('comp-bupa'),
                sPath,
                oParameters,
                that = this,
                aFilters = this._createAddrValidateFilters();
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            olocalAddress.setProperty('/updateSent', true);
            olocalAddress.setProperty('/showVldBtns', true);
            olocalAddress.setProperty('/updateNotSent', false);
            sPath = '/BuagAddrDetails';

            oParameters = {
                filters: aFilters,
                success: function (oData) {
                    if (oData.results[0].AddrChkValid === 'X') {
                        this._sendCorrespondence();
                    } else {
                        olocalAddress.setProperty('/SuggAddrInfo', oData.results[0].TriCheck);
                        this._showSuggestedAddr();
                        this._selectScrn(false, true);//show trillium comparision
                    }
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert('Validatation Call Failed');
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._createAddrValidateFilters = function () {
            var aFilters = [],
                oFilterTemplate,
                oMailEdit = this.getView().getModel('olocalAddress'),
                oMailEditAddrInfo = oMailEdit.getProperty("/Address"),
                key,
                tempPath;

            oFilterTemplate = new Filter({ path: 'FixUpd', operator: FilterOperator.EQ, value1: 'X'});
            aFilters.push(oFilterTemplate);
            oFilterTemplate = new Filter({ path: 'PartnerID', operator: FilterOperator.EQ, value1: this._sBP});
            aFilters.push(oFilterTemplate);
            oFilterTemplate = new Filter({ path: 'ChkAddr', operator: FilterOperator.EQ, value1: 'X'});
            aFilters.push(oFilterTemplate);

            for (key in oMailEditAddrInfo) {
                if (oMailEditAddrInfo.hasOwnProperty(key)) {
                    if (!(key === '__metadata' || key === 'StandardFlag' || key === 'ShortForm' || key === 'ValidFrom' || key === 'ValidTo' || key === 'Supplement')) {
                        tempPath = 'FixAddrInfo/' + key;
                        oFilterTemplate = new Filter({ path: tempPath, operator: FilterOperator.EQ, value1: oMailEditAddrInfo[key]});
                        aFilters.push(oFilterTemplate);
                    }
                }
            }
            return aFilters;
        };

        Controller.prototype._showSuggestedAddr = function () {
            //Address validation error there was. Show system suggested address values we need to.
            var olocalAddress = this.getView().getModel('olocalAddress');
            olocalAddress.setProperty('/updateSent', true);
            olocalAddress.setProperty('/showVldBtns', true);
            olocalAddress.setProperty('/updateNotSent', false);
        };

        /** Trillium Check Button Start**/

        Controller.prototype._onPoBoxEdit = function (oEvent) {
            var olocalAddress = this.getView().getModel('olocalAddress');
            olocalAddress.setProperty('/HouseNo', '');
            olocalAddress.setProperty('/Street', '');
        };

        Controller.prototype._compareSuggChkClicked = function (oEvent) {
            //this.getView().byId('idAddrUpdatePopup-l').getContent()[2].getContent()[0].getValue()
            var oLeftInputArea = this.getView().byId('idAddrUpdatePopup-l').getContent(),
                oRightSuggArea = this.getView().byId('idAddrUpdatePopup-r').getContent(),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 1; i < 8; i = i + 1) {
                    if (oLeftInputArea[i].getContent()[0].getValue() !== oRightSuggArea[i].getContent()[0].getValue()) {
                        oLeftInputArea[i].getContent()[0].addStyleClass('nrgQPPay-cusDataVerifyEditMail-lHighlight');
                        oRightSuggArea[i].getContent()[0].addStyleClass('nrgQPPay-cusDataVerifyEditMail-rHighlight');
                    }
                }
            } else {
                for (i = 1; i < 8; i = i + 1) {
                    if (oLeftInputArea[i].getContent()[0].getValue() !== oRightSuggArea[i].getContent()[0].getValue()) {
                        oLeftInputArea[i].getContent()[0].removeStyleClass('nrgQPPay-cusDataVerifyEditMail-lHighlight');
                        oRightSuggArea[i].getContent()[0].removeStyleClass('nrgQPPay-cusDataVerifyEditMail-rHighlight');
                    }
                }
            }
        };

        Controller.prototype._handleMailingAcceptBtn = function (oEvent) {
            var olocalAddress = this.getView().getModel('olocalAddress'),
                oOriginalInput = olocalAddress.getProperty("/Address"),
                oSuggestedInput = olocalAddress.getProperty("/SuggAddrInfo");

            olocalAddress.setProperty('/Address', oSuggestedInput);
            //oOriginalInput = oSuggestedInput;

            this._sendCorrespondence();
        };

        Controller.prototype._handleMailingDeclineBtn = function (oEvent) {
            this._sendCorrespondence();
        };

        Controller.prototype._handleMailingEditBtn = function (oEvent) {
            var oEditMail = this.getView().getModel('olocalAddress');

            oEditMail.setProperty('/updateSent', false);
            oEditMail.setProperty('/showVldBtns', false);
            oEditMail.setProperty('/updateNotSent', true);
        };

        /** Trillium Check Button Stop**/

        Controller.prototype._initScrnControl = function () {
            var oScrnControl = this.getView().getModel('olocalCorrModel');
            oScrnControl.setProperty('/Correspondence', false);
            oScrnControl.setProperty('/Trillium', false);
        };

        Controller.prototype._selectScrn = function (bCorres, bTrillium) {
            var oScrnControl = this.getView().getModel('olocalCorrModel');

            if (bCorres) {
                oScrnControl.setProperty('/Correspondence', true);
                oScrnControl.setProperty('/Trillium', false);
                this._retrCorrespondence();
            }
            if (bTrillium) {
                oScrnControl.setProperty('/Correspondence', false);
                oScrnControl.setProperty('/Trillium', true);
            }
        };


        Controller.prototype._sendCorrespondence = function () {
            var oODataSvc = this.getView().getModel('comp-quickpay'),
                oPayOption = this.getView().getModel('olocalCorrModel'),
                oParameters,
                sPath,
                that = this,
                oDPPComunication = this.getView().getModel('oCorrModel'),
                oData = oDPPComunication.oData,
                olocalAddress = this.getView().getModel('olocalAddress');
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            sPath = '/AutoPayCorrs';

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData.Error) {
                        if (oData.Message) {
                            ute.ui.main.Popup.Alert({
                                title: 'Auto Pay',
                                message: oData.Message
                            });
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Auto Pay',
                                message: 'Correspondence Failed'
                            });
                        }
                    } else if (oData.Message) {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: oData.Message
                        });
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'Auto Pay',
                            message: 'Correspondence Sucessfully Sent'
                        });
                    }
                    this._oPpCorrespondencePopup.close();
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'Auto Pay',
                        message: 'Correspondence Failed'
                    });
                    that._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            if (oODataSvc) {
                oData.BDRemove = oPayOption.getProperty('/BDRemove');
                oData.CCSetUp = oPayOption.getProperty('/CCSetUp');
                oData.BDSetUp = oPayOption.getProperty('/BDSetUp');
                oData.CCRemove = oPayOption.getProperty('/CCRemove');
                if (olocalAddress.getProperty('/newAdd')) {
                    //oData.Address.co = olocalAddress.getProperty('/Address/co');
                    oData.Address.HouseNo = olocalAddress.getProperty('/Address/HouseNo');
                    oData.Address.UnitNo = olocalAddress.getProperty('/Address/UnitNo');
                    oData.Address.City = olocalAddress.getProperty('/Address/City');
                    oData.Address.State = olocalAddress.getProperty('/Address/State');
                    oData.Address.Country = olocalAddress.getProperty('/Address/Country');
                    oData.Address.AddrLine = olocalAddress.getProperty('/Address/AddrLine');
                    oData.Address.Street = olocalAddress.getProperty('/Address/Street');
                    oData.Address.PoBox = olocalAddress.getProperty('/Address/PoBox');
                    oData.Address.ZipCode = olocalAddress.getProperty('/Address/ZipCode');
                    oData.NewAddr = olocalAddress.getProperty('/NewAddrCheck');
                }
                oODataSvc.create(sPath, oDPPComunication.oData, oParameters);
            }
        };

        /**Edit Mailing Addr functions*/
        Controller.prototype._onComAddrCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/current', true);
            this.getView().getModel('olocalAddress').setProperty('/newAdd', false);
        };
        Controller.prototype._onCurrentAddCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/Address/co', this.getView().getModel('oCorrModel').getProperty('/Address/co'));
            this.getView().getModel('olocalAddress').setProperty('/Address/HouseNo', this.getView().getModel('oCorrModel').getProperty('/Address/HouseNo'));
            this.getView().getModel('olocalAddress').setProperty('/Address/UnitNo', this.getView().getModel('oCorrModel').getProperty('/Address/UnitNo'));
            this.getView().getModel('olocalAddress').setProperty('/Address/City', this.getView().getModel('oCorrModel').getProperty('/Address/City'));
            this.getView().getModel('olocalAddress').setProperty('/Address/State', this.getView().getModel('oCorrModel').getProperty('/Address/State'));
            this.getView().getModel('olocalAddress').setProperty('/Address/Country', this.getView().getModel('oCorrModel').getProperty('/Address/Country'));
            //this.getView().getModel('olocalAddress').setProperty('/Address/AddrLine', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/AddrLine'));
            this.getView().getModel('olocalAddress').setProperty('/Address/Street', this.getView().getModel('oCorrModel').getProperty('/Address/Street'));
            this.getView().getModel('olocalAddress').setProperty('/Address/PoBox', this.getView().getModel('oCorrModel').getProperty('/Address/PoBox'));
            this.getView().getModel('olocalAddress').setProperty('/Address/ZipCode', this.getView().getModel('oCorrModel').getProperty('/Address/ZipCode'));
            this.getView().getModel('olocalAddress').setProperty('/NewAddrCheck', false);
            this.getView().getModel('olocalAddress').setProperty('/NewAddressflag', false);
            this.getView().getModel('olocalAddress').setProperty('/editable', false);

        };
        Controller.prototype._onNewAddCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/Address/co', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/HouseNo', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/UnitNo', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/City', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/State', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/Country', '');
            //this.getView().getModel('olocalAddress').setProperty('/Address/AddrLine', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/Street', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/PoBox', '');
            this.getView().getModel('olocalAddress').setProperty('/Address/ZipCode', '');
            this.getView().getModel('olocalAddress').setProperty('/NewAddrCheck', true);
            this.getView().getModel('olocalAddress').setProperty('/NewAddressflag', true);
            this.getView().getModel('olocalAddress').setProperty('/editable', true);
        };

        /** Toggle Button Select **/
/*        Controller.prototype._onToggleButtonPress = function (oEvent) {
            var oPayOption = this.getView().getModel('olocalCorrModel');

            if (this.getView().byId('id_QuickPayTglBtn').getLeftSelected()) {
                if (oPayOption.getProperty('/creditCard')) {
                    this.getView().byId('paymentSetUp_BD').setVisible(false);
                    this.getView().byId('paymentCancell_BD').setVisible(false);
                    this.getView().byId('paymentSetUp_CC').setVisible(true);
                    this.getView().byId('paymentCancell_CC').setVisible(false);
                    oPayOption.setProperty('/BDSetUp', false);
                    oPayOption.setProperty('/CCSetUp', true);
                } else if (oPayOption.getProperty('/bankDraft')) {
                    this.getView().byId('paymentSetUp_BD').setVisible(true);
                    this.getView().byId('paymentCancell_BD').setVisible(false);
                    this.getView().byId('paymentSetUp_CC').setVisible(false);
                    this.getView().byId('paymentCancell_CC').setVisible(false);
                    oPayOption.setProperty('/BDSetUp', true);
                    oPayOption.setProperty('/CCSetUp', false);
                }
                oPayOption.setProperty('/CCRemove', false);
                oPayOption.setProperty('/BDRemove', false);
                this.getView().byId('setUpAutoPay').setVisible(true);
                this.getView().byId('removeAutoPay').setVisible(false);
            } else {
                if (oPayOption.getProperty('/creditCard')) {
                    this.getView().byId('paymentSetUp_BD').setVisible(false);
                    this.getView().byId('paymentCancell_BD').setVisible(false);
                    this.getView().byId('paymentSetUp_CC').setVisible(false);
                    this.getView().byId('paymentCancell_CC').setVisible(true);
                    oPayOption.setProperty('/CCRemove', true);
                    oPayOption.setProperty('/BDRemove', false);
                } else if (oPayOption.getProperty('/bankDraft')) {
                    this.getView().byId('paymentSetUp_BD').setVisible(false);
                    this.getView().byId('paymentCancell_BD').setVisible(true);
                    this.getView().byId('paymentSetUp_CC').setVisible(false);
                    this.getView().byId('paymentCancell_CC').setVisible(false);
                    oPayOption.setProperty('/CCRemove', false);
                    oPayOption.setProperty('/BDRemove', true);
                }
                oPayOption.setProperty('/BDSetUp', false);
                oPayOption.setProperty('/CCSetUp', false);
                this.getView().byId('setUpAutoPay').setVisible(false);
                this.getView().byId('removeAutoPay').setVisible(true);
            }

        };*/
        /** Toggle Button Select **/
        Controller.prototype._onToggleButtonPress = function (oEvent) {
            var oPayOption = this.getView().getModel('olocalCorrModel');

            if (this.getView().byId('id_QuickPayTglBtn').getLeftSelected()) {
                this.getView().byId('paymentSetUp').setVisible(true);
                this.getView().byId('paymentCancell').setVisible(false);
                this.getView().byId('setUpAutoPay').setVisible(true);
                this.getView().byId('removeAutoPay').setVisible(false);
            } else {
                this.getView().byId('paymentSetUp').setVisible(false);
                this.getView().byId('paymentCancell').setVisible(true);
                this.getView().byId('setUpAutoPay').setVisible(false);
                this.getView().byId('removeAutoPay').setVisible(true);
                if (oPayOption.getProperty('/creditCard')) {
                    oPayOption.setProperty('/BDSetUp', false);
                    oPayOption.setProperty('/CCSetUp', false);
                    oPayOption.setProperty('/CCRemove', true);
                    oPayOption.setProperty('/BDRemove', false);
                } else if (oPayOption.getProperty('/bankDraft')) {
                    oPayOption.setProperty('/BDSetUp', false);
                    oPayOption.setProperty('/CCSetUp', false);
                    oPayOption.setProperty('/CCRemove', false);
                    oPayOption.setProperty('/BDRemove', true);
                }
            }

        };

/************************  Add Auto Bank Draft / Pay Card Option to CCUX BY SHAWN SHAO ******************************/
/********************************  Recurring Payment Related functionality stop *************************************/

        return Controller;
    }
);
