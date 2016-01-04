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

        var Controller = CoreController.extend('nrg.module.campaign.view.Offers');


		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
        Controller.prototype.onInit = function () {

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
            var oModel,
                sCurrentPath,
                sEligibilityPath,
                mParameters,
                aFilters,
                oTileContainer,
                oTileTemplate,
                oTagContainer = this.getView().byId("idnrgCamOff-Dummydisc"),
                oTagTemplate = this.getView().byId("idnrgCamOff-DummyRow").clone(),
                iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                aFilterIds,
                aFilterValues,
                fnRecievedHandler,
                that = this,
                oNoDataTag,
                oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),
                i18NModel,
                oSelectedButton,
                oSorter = new sap.ui.model.Sorter("Type", false),
                factoryFuntion,
                oViewModel = new JSONModel({
                    invoice : true,  // true for invoice & false for consumption
                    invoiceFirstCard : true,  // true for first Card change, false for second card change for Invoice
                    consumptionFirstCard : true, // true for first Card change, false for second card change for Consumption
                    pinFirstCardInvoice : false,
                    pinFirstCardConsumption : false,
                    pin: false
			    }),
                bInvoiceFirstCard = true;
            this.resetView();
            this._aSelectedComparisionCards = [];
            this._bSearchEnabled = false;
            this.getView().setModel(oViewModel, "localModel");
            i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this._sContract = oRouteInfo.parameters.coNum;
            this._sBP = oRouteInfo.parameters.bpNum;
            this._sCA = oRouteInfo.parameters.caNum;
            this._sType = oRouteInfo.parameters.typeV;
            if ((!this._sType) || (this._sType === undefined) || (this._sType === null) || (this._sType === "")) {
                this._sType = "SE";
            }
            oNoDataTag = this.getView().byId("idnrgCamHisNoData");
            oSelectedButton = this.getView().byId("idCamToggleBtn-" + this._sType);
            oTileContainer = this.getView().byId("idnrgCamOffScroll");
            oTileTemplate = this.getView().byId("idnrgCamOffBt");
            this._oTileTemplate = oTileTemplate;
/*            if (this._sType === "SE") {
                oNoDataTag.removeStyleClass("nrgCamOff-hide");
                oTileContainer.addStyleClass("nrgCamOff-hide");
                oSelectedButton.addStyleClass("nrgCamOff-btn-selected");
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
            } else {*/
            aFilterIds = ["Contract"];
            aFilterValues = [this._sContract];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sCurrentPath = i18NModel.getProperty("nrgCpgChangeOffSet");
            oModel = this.getOwnerComponent().getModel('comp-campaign');
            oSelectedButton.addStyleClass("nrgCamOff-btn-selected");
            // Handler function for tile container
            fnRecievedHandler = function (oEvent) {
                var aContent = oTileContainer.getContent(),
                    oBinding = oTileContainer.getBinding("content");
                if ((aContent !== undefined) && (aContent.length > 0)) {
                    oNoDataTag.addStyleClass("nrgCamOff-hide");
                    oTileContainer.removeStyleClass("nrgCamOff-hide");
                    aFilterIds = ["Type", "Type"];
                    aFilterValues = ["C", that._sType];
                    aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                    oBinding.sOperationMode = "Client";
                    oBinding.aAllKeys = oEvent.getSource().aKeys;
                    oBinding.filter(aFilters, "Application");
                    if ((oTileContainer.getContent()) && (oTileContainer.getContent().length > 0)) {
                        oTileContainer.getContent().forEach(function (item) {
                            if (item) {
                                if (item.getBindingContext("comp-campaign").getProperty("Type") !== "C") {
                                    if (bInvoiceFirstCard) {
                                        that._changeSelectedObject(item, 0, true);
                                        that._bindCard(item, 1);
                                        bInvoiceFirstCard = false;
                                        oViewModel.setProperty("/invoiceFirstCard", false); // enable false to make sure next turn is second card in invoice
                                    } else {
                                        that._changeSelectedObject(item, 1, true);
                                        that._bindCard(item, 2);
                                        oViewModel.setProperty("/invoiceFirstCard", true); // enable false to make sure next turn is first card in invoice
                                    }
                                }
                            }
                        });
                    }
                } else {
                    oNoDataTag.removeStyleClass("nrgCamOff-hide");
                    oTileContainer.addStyleClass("nrgCamOff-hide");
                }
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
                if (oBinding) {
                    oBinding.detachDataReceived(fnRecievedHandler);
                }
            };
            factoryFuntion = function () {
				return oTileTemplate.clone(Math.floor((Math.random() * 1000) + 1));
			};
            mParameters = {
                model : "comp-campaign",
                path : sCurrentPath,
                factory : factoryFuntion,
                filters : aFilters,
                sorter: oSorter,
                parameters : {expand: "EFLs"},
                events: {dataReceived : fnRecievedHandler}
            };
            oTileContainer.bindAggregation("content", mParameters);
            sCurrentPath = "/CustMsgS";
            mParameters = {
                model : "comp-campaign",
                path : sCurrentPath,
                template : oTagTemplate,
                filters : aFilters
               /* events: {dataReceived : fnTagDataRecHandler}*/
            };
            oTagContainer.bindAggregation("content", mParameters);
            //}
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
                if (aFilterIds[iCount] && aFilterValues[iCount]) {
                    aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
                }
            }
            return aFilters;
        };

         /**
		 * When the user choosed to select a Campaign for comparision
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         * @private
		 */
        Controller.prototype.onOfferSelected = function (oEvent) {
            var aChildren,
                sPath,
                iCount,
                oContext,
                sStartDate,
                sDate,
                oViewModel = this.getView().getModel("localModel"),
                oFirstCardInvoice,
                oSecondCardInvoice,
                oFirstCardConsumption,
                oSecondCardConsumption,
                oSelectedObject = oEvent.getSource(),
                that = this,
                bAlreadyExisted = false;
            if ((oEvent.getSource()) && (oEvent.getSource().hasStyleClass("nrgCamOff-btnSelected"))) { // checking whether tile is already selected or not
                that._aSelectedComparisionCards.forEach(function (oSelectedContent) {
                    var sPath1,
                        sPath2;
                    if (oSelectedContent) {
                        sPath1 = oSelectedContent.getBindingContext("comp-campaign").getPath() || "";
                        sPath2 = oSelectedObject.getBindingContext("comp-campaign").getPath() || "";
                        if (sPath1 === sPath2) {
                            bAlreadyExisted = true;
                            return;
                        }
                    }
                });
            }
            if (!bAlreadyExisted) {
                if ((oViewModel) && (oViewModel.getProperty("/invoice"))) { // comparision is enabled for Invoice
                    if (oViewModel.getProperty("/pin")) {
                        if (oViewModel.getProperty("/pinFirstCardInvoice")) {
                            oViewModel.setProperty("/invoiceFirstCard", false); // Dont change first card if pin is set
                        } else {
                            oViewModel.setProperty("/invoiceFirstCard", true);// Dont change second card if pin is set
                        }
                    }
                    if ((oViewModel) && (oViewModel.getProperty("/invoiceFirstCard"))) {
                        oViewModel.setProperty("/invoiceFirstCard", false);  // change it to false to show next product in second card
                        this._changeSelectedObject(oSelectedObject, 0);
                        this._bindCard(oSelectedObject, 1);
                    } else {
                        oViewModel.setProperty("/invoiceFirstCard", true);
                        this._changeSelectedObject(oSelectedObject, 1);
                        this._bindCard(oSelectedObject, 2);
                    }
                } else { // comparision is enabled for consumption
                    if (oViewModel.getProperty("/pin")) {
                        if (oViewModel.getProperty("/pinFirstCardConsumption")) {
                            oViewModel.setProperty("/consumptionFirstCard", false); // Dont change first card if pin is set
                        } else {
                            oViewModel.setProperty("/consumptionFirstCard", true);// Dont change second card if pin is set
                        }
                    }
                    if ((oViewModel) && (oViewModel.getProperty("/consumptionFirstCard"))) {
                        this._changeSelectedObject(oSelectedObject, 0);
                        this._bindCard(oSelectedObject, 3);
                        oViewModel.setProperty("/consumptionFirstCard", false);

                    } else {
                        this._changeSelectedObject(oSelectedObject, 0);
                        this._bindCard(oSelectedObject, 4);
                        oViewModel.setProperty("/consumptionFirstCard", true);
                    }
                }
            }

        };
        /**
		 * Assign custom data to change the CSS based on that
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         * @private
		 */
        Controller.prototype._changeSelectedObject = function (item, index, bFirstTime) {
            var oSelectedObject,
                aCustomData;
            if (!bFirstTime) {
                if ((this._aSelectedComparisionCards) && (this._aSelectedComparisionCards.length >= 1)) {// always assuming that selected cards will always be 2
                    oSelectedObject = this._aSelectedComparisionCards[index];
                    if (oSelectedObject) {
                        oSelectedObject.removeStyleClass("nrgCamOff-btnSelected");
                        item.removeStyleClass("nrgCamOff-btnSelected");
                    }
                    this._aSelectedComparisionCards[index] = item;
                    if (this._aSelectedComparisionCards[index]) {
                        this._aSelectedComparisionCards.forEach(function (oSelectedContent) {
                            oSelectedContent.addStyleClass("nrgCamOff-btnSelected");
                        });
                    }
                } else {
                    if (!this._aSelectedComparisionCards) {
                        this._aSelectedComparisionCards = [];
                    }
                    this._aSelectedComparisionCards[index] = item;
                    if (this._aSelectedComparisionCards[index]) {
                        item.addStyleClass("nrgCamOff-btnSelected");
                    }
                }
            } else {
                if (!this._aSelectedComparisionCards) {
                    this._aSelectedComparisionCards = [];
                }
                this._aSelectedComparisionCards[index] = item;
                if (this._aSelectedComparisionCards[index]) {
                    item.addStyleClass("nrgCamOff-btnSelected");
                }
            }
        };
        /**
		 * Bind the object to selected Card in either Invoice or Consumption
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         * @private
		 */
        Controller.prototype._bindCard = function (object, iCounter) {
            var oFirstCardInvoice = this.getView().byId("idnrgCamOff-firstCardI"),
                oSecondCardInvoice = this.getView().byId("idnrgCamOff-SecondCardI"),
                oFirstCardConsumption = this.getView().byId("idnrgCamOff-firstCardC"),
                oSecondCardConsumption = this.getView().byId("idnrgCamOff-SecondCardC"),
                oSelectedObject,
                sPath = object.getBindingContext("comp-campaign").getPath(),
                aEFLDatapaths,
                iCount,
                aResults = [],
                oTemplateModel = new JSONModel(),
                that = this,
                oTemplateView,
                oTableTag,
                oModel = this.getOwnerComponent().getModel('comp-campaign');// need to be assigned
            if (iCounter === 1) {
                oSelectedObject = this.getView().byId("idnrgCamOff-firstCardI");
                oTableTag = that.byId(sap.ui.core.Fragment.createId("Invoice1", "idnrgCamOffPriceT"));
            } else if (iCounter === 2) {
                oSelectedObject = this.getView().byId("idnrgCamOff-SecondCardI");
                oTableTag = that.byId(sap.ui.core.Fragment.createId("Invoice2", "idnrgCamOffPriceT"));
            } else if (iCounter === 3) {
                oSelectedObject = this.getView().byId("idnrgCamOff-firstCardC");
                oTableTag = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffPriceT"));
            } else if (iCounter === 4) {
                oSelectedObject = this.getView().byId("idnrgCamOff-SecondCardC");
                oTableTag = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffPriceT"));
            }
            if (oTableTag) {
                oTableTag.removeAllAggregation("content");
            }
            if (oSelectedObject.getBindingContext("comp-campaign")) {
                oSelectedObject.unbindElement("comp-campaign");
            }
           // aContent[0].addStyleClass("nrgCamHisBut-Selected");
            aEFLDatapaths = oModel.getProperty(sPath + "/EFLs");
            if ((aEFLDatapaths !== undefined) && (aEFLDatapaths.length > 0)) {
                for (iCount = 0; iCount < aEFLDatapaths.length; iCount = iCount + 1) {
                    aResults.push(oModel.getProperty("/" + aEFLDatapaths[iCount]));
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
                oTableTag.removeAllAggregation("content");
                oTableTag.addContent(oTemplateView);
            }
            oSelectedObject.bindElement({
                model : "comp-campaign",
                path : sPath
            });
        };
        /**
		 * when the user chooses one of the comparision option Invoice/Consumption
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
         * @private
		 */
        Controller.prototype.onComparisionChanged = function (oEvent) {
            var aTabBarItems = oEvent.getSource().getContent(),
                oViewModel = this.getView().getModel("localModel"),
                bSelectedType = true,
                that = this,
                oIcon,
                oCheckBox;
            //myControl = this.byId(sap.ui.core.Fragment.createId("part1", "nrgCamOff-PinId"))
            aTabBarItems.forEach(function (item) {
                if ((item.getSelected) && (item.getSelected())) {
                    if ((item.getKey()) && (item.getKey() ===  "Invoice")) {
                        bSelectedType = true;
                        oViewModel.setProperty("/invoice", true);
                    } else {
                        bSelectedType = false;
                        oViewModel.setProperty("/invoice", false);
                    }
                }
            });
            if (bSelectedType) {
                this._aSelectedComparisionCards.forEach(function (item, index) {
                    if (index === 0) {
                        that._bindCard(item, 1);
                        oViewModel.setProperty("/invoiceFirstCard", false);
                    } else {
                        that._bindCard(item, 2);
                        oViewModel.setProperty("/invoiceFirstCard", true);
                    }
                });
                // Convert pinning of cards also if needed
                if (oViewModel.getProperty("/pin")) {
                    if (oViewModel.getProperty("/pinFirstCardConsumption")) {
                        oIcon = that.byId(sap.ui.core.Fragment.createId("Invoice1", "nrgCamOff-PinId"));
                        oCheckBox = that.byId(sap.ui.core.Fragment.createId("Invoice1", "idnrgCamOffpin"));
                        oIcon.setSrc("sap-icon://pushpin-on");
                        oCheckBox.setChecked(true);
                        oViewModel.setProperty("/pinFirstCardInvoice", true);
                    } else {
                        oIcon = that.byId(sap.ui.core.Fragment.createId("Invoice2", "nrgCamOff-PinId"));
                        oCheckBox = that.byId(sap.ui.core.Fragment.createId("Invoice2", "idnrgCamOffpin"));
                        oIcon.setSrc("sap-icon://pushpin-on");
                        oCheckBox.setChecked(true);
                        oViewModel.setProperty("/pinFirstCardInvoice", false);
                    }
                }
            } else {
                this._aSelectedComparisionCards.forEach(function (item, index) {
                    if (index === 0) {
                        that._bindCard(item, 3);
                        oViewModel.setProperty("/consumptionFirstCard", false);
                    } else {
                        that._bindCard(item, 4);
                        oViewModel.setProperty("/consumptionFirstCard", true);
                    }
                });
                // Convert pinning of cards also if needed
                if (oViewModel.getProperty("/pin")) {
                    if (oViewModel.getProperty("/pinFirstCardInvoice")) {
                        oIcon = that.byId(sap.ui.core.Fragment.createId("Cons1", "nrgCamOff-PinId"));
                        oCheckBox = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffpin"));
                        oIcon.setSrc("sap-icon://pushpin-on");
                        oCheckBox.setChecked(true);
                        oViewModel.setProperty("/pinFirstCardConsumption", true);
                    } else {
                        oIcon = that.byId(sap.ui.core.Fragment.createId("Cons2", "nrgCamOff-PinId"));
                        oCheckBox = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffpin"));
                        oIcon.setSrc("sap-icon://pushpin-on");
                        oCheckBox.setChecked(true);
                        oViewModel.setProperty("/pinFirstCardConsumption", false);
                    }
                }
            }

        };
        /**
		 * Binds the view based on the Tier selected like Proactive, Reactive, Save and Final Save
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 * @private
		 */
        Controller.prototype.toggleTier = function (oEvent) {
            var aChildren,
                sPath,
                i,
                sButtonText,
                aFilters,
                oTileContainer,
                oTileTemplate,
                mParameters,
                sCurrentPath,
                aContent,
                aFilterIds,
                aFilterValues,
                fnRecievedHandler,
                that = this,
                oProactiveButton = this.getView().byId("idCamToggleBtn-P"),
                oReactiveButton = this.getView().byId("idCamToggleBtn-R"),
                oSaveButton = this.getView().byId("idCamToggleBtn-S"),
                oFinalSaveButton = this.getView().byId("idCamToggleBtn-FS"),
                oSearchButton = this.getView().byId("idCamToggleBtn-SE"),
                oNoDataTag = this.getView().byId("idnrgCamHisNoData"),
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
            oProactiveButton.removeStyleClass("nrgCamOff-btn-selected");
            oReactiveButton.removeStyleClass("nrgCamOff-btn-selected");
            oSaveButton.removeStyleClass("nrgCamOff-btn-selected");
            oSearchButton.removeStyleClass("nrgCamOff-btn-selected");
            oFinalSaveButton.removeStyleClass("nrgCamOff-btn-selected");
            sButtonText = oEvent.getSource().getId();
            sButtonText = sButtonText.substring(sButtonText.length - 1, sButtonText.length);
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            aFilterIds = ["Type", "Type"];
            switch (sButtonText) {
            case "P":
                aFilterValues = ["P", "C"];
                break;
            case "R":
                aFilterValues = ["R", "C"];
                break;
            case "S":
                aFilterValues = ["S", "C"];
                break;
            case "F":
                aFilterValues = ["F", "C"];
                break;
            default:
                aFilterValues = ["F", "C"];
            }
            oEvent.getSource().addStyleClass("nrgCamOff-btn-selected");
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            oTileContainer = this.getView().byId("idnrgCamOffScroll");
            //aContent = oTileContainer.getContent();
            oTileTemplate = this._oTileTemplate;
            sCurrentPath = i18NModel.getProperty("nrgCpgChangeOffSet");
            if (oTileContainer.getBinding("content")) {
                oTileContainer.getBinding("content").filter(aFilters, "Application");
            }
            if ((oTileContainer.getContent()) && (oTileContainer.getContent().length > 0)) {
                oTileContainer.getContent().forEach(function (oItem) {
                    if (oItem) {
                        that._aSelectedComparisionCards.forEach(function (oSelectedContent) {
                            var sPath1,
                                sPath2;
                            if (oSelectedContent) {
                                sPath1 = oSelectedContent.getBindingContext("comp-campaign").getPath() || "";
                                sPath2 = oItem.getBindingContext("comp-campaign").getPath() || "";
                                if (sPath1 === sPath2) {
                                    oItem.addStyleClass("nrgCamOff-btnSelected");
                                    oSelectedContent = oItem;
                                }
                            }
                        });
                    }
                });
            } else {
                oNoDataTag.removeStyleClass("nrgCamOff-hide");
                oTileContainer.addStyleClass("nrgCamOff-hide");
            }
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
        };
        /**
		 * Searching for promo code
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 *
		 */
        Controller.prototype.promoSearch = function (oEvent, query) {
            var oSearchField = this.getView().byId("idnrgCamOff-search"),
                that = this,
                oProactiveButton = this.getView().byId("idCamToggleBtn-P"),
                oReactiveButton = this.getView().byId("idCamToggleBtn-R"),
                oSaveButton = this.getView().byId("idCamToggleBtn-S"),
                oFinalSaveButton = this.getView().byId("idCamToggleBtn-FS"),
                oSearchButton = this.getView().byId("idCamToggleBtn-SE"),
                oNoDataTag = this.getView().byId("idnrgCamHisNoData"),
                aFilterIds,
                aFilterValues,
                aFilters,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign"),
                sCurrentPath = i18NModel.getProperty("nrgCpgChangeOffSet"),
                fnRecievedHandler,
                oTileContainer = this.getView().byId("idnrgCamOffScroll"),
                oTileTemplate = this.getView().byId("idnrgCamOffBt").clone(),
                mParameters,
                oSorter = new sap.ui.model.Sorter("Type", false);

            oProactiveButton.removeStyleClass("nrgCamOff-btn-selected");
            oReactiveButton.removeStyleClass("nrgCamOff-btn-selected");
            oSaveButton.removeStyleClass("nrgCamOff-btn-selected");
            oFinalSaveButton.removeStyleClass("nrgCamOff-btn-selected");
            oSearchButton.addStyleClass("nrgCamOff-btn-selected");
            that.getOwnerComponent().getCcuxApp().setOccupied(true);
            if ((oSearchField) && (oSearchField.getValue())) {
                this._bSearchEnabled = true;
                aFilterIds = ["Contract", "Promo"];
                aFilterValues = [this._sContract, oSearchField.getValue()];
                aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
                // Handler function for tile container
                fnRecievedHandler = function (oEvent, oData) {
                    var aContent = oTileContainer.getContent(),
                        oBinding = oTileContainer.getBinding("content");
                    if ((aContent !== undefined) && (aContent.length > 0)) {
                        oNoDataTag.addStyleClass("nrgCamOff-hide");
                        oTileContainer.removeStyleClass("nrgCamOff-hide");
                        aFilterIds = ["Type", "Type"];
                        aFilterValues = ["C", "SE"];
                        aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                        oBinding.sOperationMode = "Client";
                        oBinding.aAllKeys = oEvent.getSource().aKeys;
                        oBinding.filter(aFilters, "Application");
                        oSearchField.setValue("");
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    } else {
                        oNoDataTag.removeStyleClass("nrgCamOff-hide");
                        oTileContainer.addStyleClass("nrgCamOff-hide");
                    }
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oBinding) {
                        oBinding.detachDataReceived(fnRecievedHandler);
                    }
                };
                mParameters = {
                    model : "comp-campaign",
                    path : sCurrentPath,
                    template : oTileTemplate,
                    filters : aFilters,
                    sorter: oSorter,
                    parameters : {expand: "EFLs", operationMode : "Server"},
                    events: {dataReceived : fnRecievedHandler}
                };
                oTileContainer.bindAggregation("content", mParameters);
            } else {
                aFilterIds = ["Type", "Type"];
                aFilterValues = ["SE", "C"];
                aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
                oTileContainer.getBinding("content").filter(aFilters, "Application");
                that.getOwnerComponent().getCcuxApp().setOccupied(false);
            }
        };
        /**
		 * Move to Campaign details view when the user selected a particular campaign
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 *
		 */
        Controller.prototype.selectCampaign = function (oEvent) {
            var sDate,
                sPath,
                sOfferCode,
                oContext,
                sLPCode,
                fnhandleDialogClosed,
                oViewModel,
                sPromo,
                sLPReqName,
                that = this;
            that.getOwnerComponent().getCcuxApp().setOccupied(true);
            oContext = oEvent.getSource().getBindingContext("comp-campaign");
            if (oContext) {
                sPath = oContext.getPath();
                sDate = sPath.substring(sPath.lastIndexOf("=") + 1, sPath.lastIndexOf(")"));
                sOfferCode = oContext.getProperty("OfferCode");
                sLPCode = oContext.getProperty("LPcode");
                sPromo = oContext.getProperty("Promo");
                sLPReqName = oContext.getProperty("LPReqName");
                oViewModel = new JSONModel({
                    lprefId : "",
                    showNames : (sLPReqName === "X"),
                    firstName : "",
                    lastName : "",
                    OfferCode : sOfferCode,
                    Date : sDate,
                    LPCode: sLPCode,
                    Promo : sPromo,
                    message : ""
                });
                fnhandleDialogClosed = function (oEvent) {
                };
                if (sLPCode) {
                    if (!this._oDialogFragment) {
                        this._oDialogFragment = sap.ui.xmlfragment("LoyalityFragment", "nrg.module.campaign.view.Loyalty", this);
                    }
                    this._oDialogFragment.setModel(oViewModel, "oLoyalModel");
                    if (!this._oLoyalityDialog) {
                        this._oLoyalityDialog = new ute.ui.main.Popup.create({
                            title: 'Loyalty Information',
                            close: fnhandleDialogClosed,
                            content: this._oDialogFragment
                        });
                    }
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    this._oLoyalityDialog.open();
                } else {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    that.getOwnerComponent().setModel(oViewModel, 'comp-campLocal');
                    this.navTo("campaignchg", {bpNum: this._sBP, caNum: this._sCA, coNum: this._sContract, offercodeNum: sOfferCode, sDate : sDate});
                }
            }

        };

        /**
		 * Formats the Cancellation fee and Incentive values
		 *
		 * @function
		 * @param {sCancellationFee} CancellationFee value from the binding
         * @param {sIncentive} Incentive value from the binding
		 *
		 */
        Controller.prototype.formatCancelFee = function (sCancellationFee, sIncentive) {
            return "Canc: " + sCancellationFee + " / " + "Inc: " + sIncentive;
        };
        /**
		 * Pin the comparision cards
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern
		 *
		 */
        Controller.prototype.pinComparisionCard = function (oEvent) {
            var oSelectedCheckBox = oEvent.getSource(),
                oIcon,
                that = this,
                oSelectedCardContext,
                sSelectedPath,
                oViewModel = this.getView().getModel("localModel"),
                bPinSelected = oViewModel.getProperty("/pin");
            if ((oSelectedCheckBox) && (oSelectedCheckBox.getChecked())) { // check box is selected
                if (bPinSelected) { // if Pin is already selected for other card
                    oSelectedCheckBox.setChecked(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Information',
                        message: 'Only one Pin at a time'
                    });
                } else { // if pin is not already selected
                    oViewModel.setProperty("/pin", true);
                    oSelectedCardContext = oSelectedCheckBox.getBindingContext("comp-campaign");
                    sSelectedPath = oSelectedCardContext.getPath();
                    that._aSelectedComparisionCards.forEach(function (oSelectedContent, index) {
                        var oContext,
                            sPath;
                        if (oSelectedContent) {
                            oContext = oSelectedContent.getBindingContext("comp-campaign");
                            if (oContext) {
                                sPath = oContext.getPath();
                                if (sSelectedPath === sPath) {
                                    if (oViewModel.getProperty("/invoice")) {
                                        if (index === 0) { //if First Card and Invoice
                                            oViewModel.setProperty("/pinFirstCardInvoice", true);
                                            oIcon = that.byId(sap.ui.core.Fragment.createId("Invoice1", "nrgCamOff-PinId"));
                                            oIcon.setSrc("sap-icon://pushpin-on");
                                        } else { //if Second Card and invoice
                                            oViewModel.setProperty("/pinFirstCardInvoice", false);
                                            oIcon = that.byId(sap.ui.core.Fragment.createId("Invoice2", "nrgCamOff-PinId"));
                                            oIcon.setSrc("sap-icon://pushpin-on");
                                        }
                                    } else {
                                        if (index === 0) {
                                            oViewModel.setProperty("/pinFirstCardConsumption", true);
                                            oIcon = that.byId(sap.ui.core.Fragment.createId("Cons1", "nrgCamOff-PinId"));
                                            oIcon.setSrc("sap-icon://pushpin-on");
                                        } else { //if Second Card and invoice
                                            oViewModel.setProperty("/pinFirstCardConsumption", false);
                                            oIcon = that.byId(sap.ui.core.Fragment.createId("Cons2", "nrgCamOff-PinId"));
                                            oIcon.setSrc("sap-icon://pushpin-on");
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            } else if ((oSelectedCheckBox) && (!oSelectedCheckBox.getChecked())) { // check box is de-selected
                oViewModel.setProperty("/pin", false);
                oSelectedCardContext = oSelectedCheckBox.getBindingContext("comp-campaign");
                sSelectedPath = oSelectedCardContext.getPath();
                that._aSelectedComparisionCards.forEach(function (oSelectedContent, index) {
                    var oContext,
                        sPath;
                    if (oSelectedContent) {
                        oContext = oSelectedContent.getBindingContext("comp-campaign");
                        if (oContext) {
                            sPath = oContext.getPath();
                            if (sSelectedPath === sPath) {
                                if (oViewModel.getProperty("/invoice")) {
                                    if (index === 0) { //if First Card and Invoice
                                        oIcon = that.byId(sap.ui.core.Fragment.createId("Invoice1", "nrgCamOff-PinId"));
                                        oIcon.setSrc("sap-icon://pushpin-off");
                                    } else { //if Second Card and invoice
                                        oIcon = that.byId(sap.ui.core.Fragment.createId("Invoice2", "nrgCamOff-PinId"));
                                        oIcon.setSrc("sap-icon://pushpin-off");
                                    }
                                } else {
                                    if (index === 0) {
                                        oIcon = that.byId(sap.ui.core.Fragment.createId("Cons1", "nrgCamOff-PinId"));
                                        oIcon.setSrc("sap-icon://pushpin-off");
                                    } else { //if Second Card and invoice
                                        oIcon = that.byId(sap.ui.core.Fragment.createId("Cons2", "nrgCamOff-PinId"));
                                        oIcon.setSrc("sap-icon://pushpin-off");
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };
        /**
		 * Formats the Promo Code binding value
		 *
		 * @function
		 * @param {sPromoCode} Promo Code value from the binding
         *
		 *
		 */
        Controller.prototype.formatPromo = function (sPromoCode) {
            return "Promo: " + sPromoCode;
        };
        /**
		 * Formats the Invoice Amount in Campaign consumption
		 *
		 * @function
		 * @param {sPromoCode} Promo Code value from the binding
         *
		 *
		 */
        Controller.prototype.formatCurrentConsAmount = function (sCurInvoiceAmount, sSimulateInvoiceAmount) {
            if (sSimulateInvoiceAmount || sCurInvoiceAmount) {
                return "$ " + (sSimulateInvoiceAmount || sCurInvoiceAmount);
            } else {
                return "N/A";
            }

        };
        /**
		 * Calculate the difference Amount
		 *
		 * @function
		 * @param {sPromoCode} Promo Code value from the binding
         *
		 *
		 */
        Controller.prototype.formatDifference = function (sCurInvoiceAmount, sEstimateInvoiceAmount) {
            if ((sCurInvoiceAmount) && (sEstimateInvoiceAmount)) {
                if ((parseFloat(sCurInvoiceAmount)) && (parseFloat(sEstimateInvoiceAmount))) {
                    return "$ " + (parseFloat(sCurInvoiceAmount) - parseFloat(sEstimateInvoiceAmount)).toFixed(2);
                } else {
                    return "$ " + "0.0";
                }
            } else {
                return "N/A";
            }
        };
        /**
		 * Handler for loyality Cancel option
		 *
		 * @function
		 * @param {sPromoCode} Promo Code value from the binding
         *
		 *
		 */
        Controller.prototype.onDeclineLoyalty = function (oEvent) {
            this._oLoyalityDialog.close();
        };
        /**
		 * Handler for loyality Accept option
		 *
		 * @function
		 * @param {sPromoCode} Promo Code value from the binding
         *
		 *
		 */
        Controller.prototype.onAcceptLoyalty = function (oEvent) {
            var mParameters,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                sReqNumber,
                oLoyalModel = this._oDialogFragment.getModel("oLoyalModel"),
                sLPCode,
                sPromo,
                that = this,
                sOfferCode,
                sDate;
            that.getOwnerComponent().getCcuxApp().setOccupied(true);
            sReqNumber = oLoyalModel.getProperty("/lprefId");
            sLPCode = oLoyalModel.getProperty("/LPCode");
            sPromo = oLoyalModel.getProperty("/Promo");
            sOfferCode = oLoyalModel.getProperty("/OfferCode");
            sDate = oLoyalModel.getProperty("/Date");
            mParameters = {
                method : "POST",
                urlParameters : {"LP_Code" : sLPCode,
                                 "LP_RefID" : sReqNumber,
                                 "PromoCode" : sPromo},
                success : function (oData, oResponse) {
                    if (oData.Code === "E") {
                        oLoyalModel.setProperty("/message", "Please enter correct Reference Id");
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        //jQuery.sap.log.info("Odata Read Successfully:::");
                    } else if (oData.Code === "S") {
                        //jQuery.sap.log.info("Odata Read Successfully:::");
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        that._oLoyalityDialog.close();
                        that.getOwnerComponent().setModel(oLoyalModel, 'comp-campLocal');
                        that.navTo("campaignchg", {bpNum: that._sBP, caNum: that._sCA, coNum: that._sContract, offercodeNum: sOfferCode, sDate : sDate});
                    }
                }.bind(this),
                error: function (oError) {
                    //jQuery.sap.log.info("Eligibility Error occured");
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };
            oModel.callFunction("/CheckLoyalty", mParameters);
        };
        /**
		 * Back to Overview page function
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
		 */
        Controller.prototype.backToOverview = function (oEvent) {
            this.navTo("campaign", {bpNum: this._sBP, caNum: this._sCA, coNum : this._sContract, typeV : "C"});
        };
        /**
		 * Reset back to original
		 *
		 * @function
         *
		 */
        Controller.prototype.resetView = function () {
            var oFirstCardInvoice = this.getView().byId("idnrgCamOff-firstCardI"),
                oSecondCardInvoice = this.getView().byId("idnrgCamOff-SecondCardI"),
                oFirstCardConsumption = this.getView().byId("idnrgCamOff-firstCardC"),
                oSecondCardConsumption = this.getView().byId("idnrgCamOff-SecondCardC"),
                oProactiveButton = this.getView().byId("idCamToggleBtn-P"),
                oReactiveButton = this.getView().byId("idCamToggleBtn-R"),
                oSaveButton = this.getView().byId("idCamToggleBtn-S"),
                oFinalSaveButton = this.getView().byId("idCamToggleBtn-FS"),
                oSearchButton = this.getView().byId("idCamToggleBtn-SE"),
                oTableTag;

            if (oFirstCardInvoice.getBindingContext("comp-campaign")) {
                oFirstCardInvoice.unbindElement("comp-campaign");
            }
            if (oSecondCardInvoice.getBindingContext("comp-campaign")) {
                oSecondCardInvoice.unbindElement("comp-campaign");
            }
            if (oFirstCardConsumption.getBindingContext("comp-campaign")) {
                oFirstCardConsumption.unbindElement("comp-campaign");
            }
            if (oSecondCardConsumption.getBindingContext("comp-campaign")) {
                oSecondCardConsumption.unbindElement("comp-campaign");
            }
            oTableTag = this.byId(sap.ui.core.Fragment.createId("Invoice1", "idnrgCamOffPriceT"));
            if (oTableTag) {
                oTableTag.removeContent();
            }
            oTableTag = this.byId(sap.ui.core.Fragment.createId("Invoice2", "idnrgCamOffPriceT"));
            if (oTableTag) {
                oTableTag.removeContent();
            }
            oTableTag = this.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffPriceT"));
            if (oTableTag) {
                oTableTag.removeContent();
            }
            oTableTag = this.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffPriceT"));
            if (oTableTag) {
                oTableTag.removeContent();
            }
            oProactiveButton.removeStyleClass("nrgCamOff-btn-selected");
            oReactiveButton.removeStyleClass("nrgCamOff-btn-selected");
            oSaveButton.removeStyleClass("nrgCamOff-btn-selected");
            oFinalSaveButton.removeStyleClass("nrgCamOff-btn-selected");
            oSearchButton.removeStyleClass("nrgCamOff-btn-selected");
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
            aJsonDataNew = {};
            aJsonDataNew.results = {};
            aJsonDataNew.results.columns = columns;
            aJsonDataNew.results.rows = [];
            for (iCount2 = 0; iCount2 < tempTypes.length; iCount2  = iCount2 + 1) {
                oBRCells = [];
                for (iCount1 = 0; iCount1 < results.length; iCount1 = iCount1 + 1) {
                    temp = results[iCount1];
                    if ((temp !== undefined) && (temp.EFLLevel !== undefined) && (temp.EFLType !== undefined)) {
                        if (temp.EFLType === tempTypes[iCount2]) {
                            oBRCells.push({
                                "EFLPrice": temp.EFLPrice
                            });
                        }

                    }
                }
                aJsonDataNew.results.rows.push({
                    "cells" : oBRCells
                });
            }
            return aJsonDataNew;
        };
        // Fire search function when detect user hit the enter key in the search textfields
        Controller.prototype.onEnterKeyPress = function (oEvent) {
            this._updateConsCmp(oEvent.getSource().getBindingContext("comp-campaign"));
        };
        // Fire search function when detect user hit the enter key in the search textfields
        Controller.prototype.updateCmp = function (oEvent) {
            this._updateConsCmp(oEvent.getSource().getBindingContext("comp-campaign"));
        };
        // Fire search function when detect user hit the enter key in the search textfields
        Controller.prototype._updateConsCmp = function (oContext) {
            var sSelectedPath,
                oViewModel = this.getView().getModel("localModel"),
                that = this,
                bFirstCard = true,
                oCurrentAmount,
                oEstAmount,
                oDifference,
                oEstCents,
                sContract,
                sRateCategory,
                sConsValue,
                oConsAmountField,
                oModel = this.getOwnerComponent().getModel('comp-campaign'),
                oBindingInfo;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sSelectedPath = oContext.getPath();
            this._aSelectedComparisionCards.forEach(function (oSelectedContent, index) {
                var oContext,
                    sPath;
                if (oSelectedContent) {
                    oContext = oSelectedContent.getBindingContext("comp-campaign");
                    if (oContext) {
                        sPath = oContext.getPath();
                        if (sSelectedPath === sPath) {
                            if (index === 0) {
                                bFirstCard = true;
                            } else { //if Second Card and invoice
                                bFirstCard = false;
                            }
                        }
                    }
                }
            });
            if (bFirstCard) {
                oCurrentAmount = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffCurrAm"));
                oEstAmount = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffEstAmt"));
                oDifference = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffEstDiff"));
                oEstCents = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffEstcents"));
                oConsAmountField = that.byId(sap.ui.core.Fragment.createId("Cons1", "idnrgCamOffCons"));
            } else {
                oCurrentAmount = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffCurrAm"));
                oEstAmount = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffEstAmt"));
                oDifference = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffEstDiff"));
                oEstCents = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffEstcents"));
                oConsAmountField = that.byId(sap.ui.core.Fragment.createId("Cons2", "idnrgCamOffCons"));
            }
            sContract = oContext.getProperty("Contract");
            sRateCategory = oContext.getProperty("RateCat");
            sConsValue =  oConsAmountField.getValue();
            if (sContract && sRateCategory && sConsValue) {
                sSelectedPath = "/CpgCmpbyConsS(Contract='" + sContract + "',RateCat='" + sRateCategory + "',Consumption=" + sConsValue + ")";
                oBindingInfo = {
                    //filters : aFilters,
                    success : function (oData) {
                        if (oData) {
                            oCurrentAmount.setText(("$ " + oData.SimCurrInv)  || "");
                            oEstAmount.setText(("$ " + oData.EstInvAmt) || "");
                            oEstCents.setText((oData.EstCents || "") + " ¢/kWh");
                            if (oData.SimCurrInv && oData.EstInvAmt) {
                                oDifference.setText("$ " + (parseFloat(oData.SimCurrInv) - parseFloat(oData.EstInvAmt)).toFixed(2));
                            }
                        }
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        //jQuery.sap.log.info("Odata Read Successfully:::");
                    }.bind(this),
                    error: function (oError) {
                        that.getOwnerComponent().getCcuxApp().setOccupied(false);
                        //jQuery.sap.log.info("Eligibility Error occured");
                    }.bind(this)
                };
                if (oModel) {
                    oModel.read(sSelectedPath, oBindingInfo);
                }
            } else {
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
            }
        };
        return Controller;
    }
);
