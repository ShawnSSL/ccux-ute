/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        "sap/ui/model/json/JSONModel",
        'nrg/base/type/Price',
        'nrg/module/billing/view/control/AverageBillDetailsChart'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel, Price, AverageBillDetailsChart) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.ABP');

        /*   //20160615 Revert to allow other changes first
        Controller.prototype.onInit = function() {
            var oEventBus = sap.ui.getCore().getEventBus();

            // Subscribe ABP change events
            oEventBus.subscribe("nrg.module.billing", "eOpenABPPopup", this._handleOpenABPPopup, this);
        };


        Controller.prototype._handleOpenABPPopup = function() {
            //this._ABPPopupControl = this.getView().getParent();
            //this._ABPPopupControl.open();
            // Get the OwenerComponent from the mother controller
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();

            // Get the ABP popup control
            this._ABPPopupControl = this.getView().getParent();

            // Set up global variables
            this._aYearList = [];
            this._aGraphClors = ['blue', 'gray', 'yellow'];

            // Set up models
            this.getView().setModel(this._OwnerComponent.getModel('comp-billing-avgplan'), 'oDataAvgSvc');
            this.getView().setModel(this._OwnerComponent.getModel('comp-dppext'), 'oDataSvc');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oUsageGraph');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oAmountBtn');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oAmountHistory');
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
                        //Model for DppComunication (DPPIII)
            this.getView().setModel(new JSONModel(), 'oDppStepThreeCom');

            //Model for screen control
            this.getView().setModel(new JSONModel(), 'oABPScrnControl');
            this._initScrnControl();
            // Retrieve routing parameters
            var oRouteInfo = this._OwnerComponent.getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            this._initialCheck();
        };*/


        Controller.prototype.onAfterRendering = function () {
            // Get the OwenerComponent from the mother controller
            this._OwnerComponent = this.getView().getParent().getParent().getParent().getController().getOwnerComponent();

            // Get the ABP popup control
            this._ABPPopupControl = this.getView().getParent();

            // Set up global variables
            this._aYearList = [];
            this._aGraphClors = ['blue', 'gray', 'yellow'];

            // Set up models
            this.getView().setModel(this._OwnerComponent.getModel('comp-billing-avgplan'), 'oDataAvgSvc');
            this.getView().setModel(this._OwnerComponent.getModel('comp-dppext'), 'oDataSvc');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oUsageGraph');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oAmountBtn');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oAmountHistory');
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
                        //Model for DppComunication (DPPIII)
            this.getView().setModel(new JSONModel(), 'oDppStepThreeCom');

            //Model for screen control
            this.getView().setModel(new JSONModel(), 'oABPScrnControl');
            this._initScrnControl();
            // Retrieve routing parameters
            var oRouteInfo = this._OwnerComponent.getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            this._initialCheck();
        };

        Controller.prototype._initScrnControl = function () {
            var oScrnControl = this.getView().getModel('oABPScrnControl');
            oScrnControl.setProperty('/Table', true);
            oScrnControl.setProperty('/Graph', true);
            oScrnControl.setProperty('/Note', true);
            oScrnControl.setProperty('/Correspondence', false);
            oScrnControl.setProperty('/Trillium', false);
        };
        Controller.prototype._selectScrn = function (bCorres, bTrillium) {
            var oScrnControl = this.getView().getModel('oABPScrnControl');

            if (bCorres) {
                oScrnControl.setProperty('/Table', false);
                oScrnControl.setProperty('/Graph', false);
                oScrnControl.setProperty('/Note', false);
                oScrnControl.setProperty('/Correspondence', true);
                oScrnControl.setProperty('/Trillium', false);
                this._retrDppComunication();
            }
            if (bTrillium) {
                oScrnControl.setProperty('/Table', false);
                oScrnControl.setProperty('/Graph', false);
                oScrnControl.setProperty('/Note', false);
                oScrnControl.setProperty('/Correspondence', false);
                oScrnControl.setProperty('/Trillium', true);
            }
        };
        /*------------------------------------------------ Retrieve Methods -------------------------------------------------*/

        Controller.prototype._retrieveTableInfo = function (sCoNumber, fnCallback) {
            var sPath = '/AvgAddS',
                aFilters = [],
                oModel = this.getView().getModel('oDataAvgSvc'),
                oHistoryModel = this.getView().getModel('oAmountHistory'),
                aHistoryData = [],
                fTotalAmount,
                oParameters,
                i,
                dataEntry,
                fullPeriod;
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sCoNumber}));
            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results && oData.results.length > 0) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (oData.results[i].Period !== "Total") {
                                dataEntry = {};
                                fullPeriod = oData.results[i].Period;
                                dataEntry = oData.results[i];
                                dataEntry.Period = dataEntry.Period.substr(0, 2) + '/' + dataEntry.Period.substr(6, 4);
                                dataEntry.FullPeriod = fullPeriod;
                                dataEntry.ActualBill = parseFloat(dataEntry.ActualBill);
                                dataEntry.Usage = parseFloat(dataEntry.Usage);
                                dataEntry.AdjAmount = parseFloat(dataEntry.Adjsmnt);
                                dataEntry.AmtUsdAbp = parseFloat(dataEntry.AmtUsdAbp);
                                aHistoryData.push(dataEntry);
                            } else {
                                fTotalAmount = parseFloat(oData.results[i].AmtUsdAbp);
                            }
                        }
                        oHistoryModel.setData(aHistoryData);
                        oHistoryModel.setProperty('/totalAmount', fTotalAmount);
                        oHistoryModel.setProperty('/estAmount', "$" + parseFloat(oData.results[0].Estimate).toFixed(2));

                        if (fnCallback) {
                            fnCallback();
                        }
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Customer had no Billing History'
                        });
                        this._ABPPopupControl.close();
                    }

                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrieveGraphInfo = function (sCoNumber, fnCallback) {
            var sPath = '/AvgUsgS',
                aFilters = [],
                oModel = this.getView().getModel('oDataAvgSvc'),
                oGraphModel = this.getView().getModel('oUsageGraph'),
                aGraphData = [],
                oParameters,
                i,
                dataEntry;
            aFilters.push(new Filter({ path: 'Contract', operator: FilterOperator.EQ, value1: sCoNumber}));
            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData.results) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            dataEntry = {};
                            dataEntry.usageDate = oData.results[i].Period;
                            dataEntry.usage = parseInt(oData.results[i].Consumption, 10);
                            aGraphData.push(dataEntry);
                        }
                        oGraphModel.setProperty('/data', aGraphData);

                        if (fnCallback) {
                            fnCallback();
                        }
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }

        };

        Controller.prototype._retrieveABPEligibility = function (sCoNumber, fnCallback) {
            var sPath,
                oModel = this.getView().getModel('oDataAvgSvc'),
                oEligibilityModel = this.getView().getModel('oEligibility'),
                oParameters;
            sPath = "/EligibilityS(Contract='" + sCoNumber + "',IsRetro=" + this.isRetro + ")";
            oParameters = {
                success : function (oData) {
                    oEligibilityModel.setData(oData);
                    if (oData.ABPAct) {
                        oEligibilityModel.setProperty('/Activated', true);
                        oEligibilityModel.setProperty('/NonActivated', false);
                    } else {
                        oEligibilityModel.setProperty('/Activated', false);
                        oEligibilityModel.setProperty('/NonActivated', true);
                    }
                    if (fnCallback) {
                        fnCallback();
                    }
                }.bind(this),
                error: function (oError) {
                    oEligibilityModel.setProperty('/ABPElig', false);
                    if (fnCallback) {
                        fnCallback();
                    }
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /*-------------------------------------------------- Initial Check --------------------------------------------------*/

        Controller.prototype._initialCheck = function () {
            var oEligibilityModel = this.getView().getModel('oEligibility'),
                oWebUiManager = this._OwnerComponent.getCcuxWebUiManager(),
                bDoneRetrTable = false,
                bDoneRetrGraph = false,
                bDoneRetrEligibility = false,
                checkRetrTableGraphComplete,
                checkDoneRetrEligibility,
                retrTimeout;

            if (this._coNum) {
                // Retrieve the eligibility for ABP
                this._retrieveABPEligibility(this._coNum, function () {bDoneRetrEligibility = true; });

                checkDoneRetrEligibility = setInterval(function () {
                    var i, graphControlBtn;

                    if (bDoneRetrEligibility) {
                        // Display the loading indicator
                        clearInterval(checkDoneRetrEligibility);
                        this._OwnerComponent.getCcuxApp().setOccupied(true);
                        // Check if the customer is eligible for ABP.
                        if (oEligibilityModel.oData.ABPAct) {
                            this._ABPPopupControl.close();
                            oWebUiManager.notifyWebUi('openIndex', {
                                LINK_ID: "Z_AVGBIL_D"
                            });
                            // Dismiss the loading indicator
                            this._OwnerComponent.getCcuxApp().setOccupied(false);
                            // Upon successfully retrieving the data, stop the error message timeout
                            clearTimeout(retrTimeout);
                            // Close the ABP popup

                            return;
                        } else if (oEligibilityModel.oData.ABPElig) {
                            // Check if there is billing history
                            if (oEligibilityModel.oData.NoBillHistory) {
                                // Show the confirmation pop up
                                this._ABPPopupControl.close();
                                ute.ui.main.Popup.Alert({
                                    title: 'ABP',
                                    message: 'Customer has no Billing History'
                                });
                                // Dismiss the loading indicator
                                this._OwnerComponent.getCcuxApp().setOccupied(false);
                                // Upon successfully retrieving the data, stop the error message timeout
                                clearTimeout(retrTimeout);
                                // Close the ABP popup

                                return;
                            }
                            // 20160610 HJ Added: Trigger open after making sure it's eligible
                            //this._ABPPopupControl.open();
                            // Retrieve the data for table
                            this._retrieveTableInfo(this._coNum, function () {bDoneRetrTable = true; });
                            // Retrieve the data for graph
                            this._retrieveGraphInfo(this._coNum, function () {bDoneRetrGraph = true; });
                            // Check all graph control checkboxes
                            for (i = 0; i < this.getView().byId('nrgBilling-avgBillingPopup-usage-control').getContent().length; i = i + 1) {
                                graphControlBtn = this.getView().byId('nrgBilling-avgBillingPopup-usage-control').getContent()[i];
                                graphControlBtn.getContent()[0].setChecked(true);
                            }

                            checkRetrTableGraphComplete = setInterval(function () {
                                if (bDoneRetrTable && bDoneRetrGraph) {
                                    // Dismiss the loading indicator
                                    this._OwnerComponent.getCcuxApp().setOccupied(false);
                                    // Upon successfully retrieving the data, stop checking the completion of retrieving data
                                    clearInterval(checkRetrTableGraphComplete);
                                    // Upon successfully retrieving the data, stop the error message timeout
                                    clearTimeout(retrTimeout);
                                    // Create graph control
                                    if (!this.graphControl) {
                                        var graphContainer = this.getView().byId('nrgBilling-avgBillingPopup-usage-graph');
                                        this.graphControl = new AverageBillDetailsChart("chart", {width: 700, height: 250, usageTickSize: 200});
                                        this.graphControl.placeAt(graphContainer);
                                        this._ABPPopupControl.$().offset({top: (jQuery(window).height() - this._ABPPopupControl.getDomRef().offsetHeight - 250) / 2 });
                                    }
                                    this.graphControl.setDataModel(this.getView().getModel('oUsageGraph'));

                                    // Render the graph crontrol buttons
                                    this._renderGraphCrontrolBtn();
                                }
                            }.bind(this), 100);

                        } else {
                            this._ABPPopupControl.close();
                            ute.ui.main.Popup.Alert({
                                title: 'Not Eligible',
                                message: 'You are not eligible for Average Billing Plan.'
                            });
                            // Dismiss the loading indicator
                            this._OwnerComponent.getCcuxApp().setOccupied(false);
                            // Upon successfully retrieving the data, stop the error message timeout
                            clearTimeout(retrTimeout);
                            // Close the ABP popup
                        }
                    }
                }.bind(this), 100);

                // Timeout function. If after 30 seconds still cannot done with retrieving data, then raise error message.
                retrTimeout = setTimeout(function () {
                    ute.ui.main.Popup.Alert({
                        title: 'Network service failed',
                        message: 'We cannot retrieve your data. Please try again later.'
                    });
                    // Upon error time out, stop checking the completion of retrieving data
                    clearInterval(checkRetrTableGraphComplete);
                    // Dismiss the loading indicator
                    this._OwnerComponent.getCcuxApp().setOccupied(false);
                }.bind(this), 30000);

            } else {
                this._ABPPopupControl.close();
                ute.ui.main.Popup.Alert({
                    title: 'Contract Not Found',
                    message: 'Customer is not eligible.'
                });
                return;
                // Close the ABP popup
            }
        };

        /*------------------------------------------------- Button Actions --------------------------------------------------*/

        Controller.prototype._onCancelBtnClick = function () {
            this._ABPPopupControl.close();
        };

        Controller.prototype._onCalBtnClick = function () {
            var oModel = this.getView().getModel('oDataAvgSvc'),
                oHistoryModel = this.getView().getModel('oAmountHistory'),
                oPayload = {},
                mParameters,
                i,
                periodParameterName,
                basisParameterName,
                adjustParameterName,
                that = this,
                sTempStatus = "";
            that._OwnerComponent.getCcuxApp().setOccupied(true);
            oPayload.Contract = this._coNum;
            for (i = 0; i < oHistoryModel.oData.length; i = i + 1) {
                periodParameterName = 'Prd' + this._pad(i + 1);
                basisParameterName = 'Bbs' + this._pad(i + 1);
                adjustParameterName = 'Amt' + this._pad(i + 1);

                oPayload[periodParameterName] = oHistoryModel.oData[i].FullPeriod;
                oPayload[basisParameterName] = oHistoryModel.oData[i].Basis;
                oPayload[adjustParameterName] = (parseFloat(oHistoryModel.oData[i].AdjAmount) || 0).toString();
                if (i === 0) {
                    sTempStatus = oHistoryModel.oData[i].Status;
                } else {
                    sTempStatus = sTempStatus + "~" + oHistoryModel.oData[i].Status;
                }

            }
            if (oHistoryModel.oData.length < 12) {
                for (i = oHistoryModel.oData.length; i < 12; i = i + 1) {
                    periodParameterName = 'Prd' + this._pad(i + 1);
                    basisParameterName = 'Bbs' + this._pad(i + 1);
                    adjustParameterName = 'Amt' + this._pad(i + 1);

                    oPayload[periodParameterName] = '0.0';
                    oPayload[basisParameterName] = '0.0';
                    oPayload[adjustParameterName] = '0.0';
                    sTempStatus = sTempStatus + "~" + "NA";
                }
            }
            oPayload.Status = sTempStatus;
            if (oModel) {
                mParameters = {
                    method : "POST",
                    urlParameters : oPayload,
                    success : function (oData, response) {
                        var iCount,
                            sTempValue = "0";
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                        if (oData.Code === "S") {
                            for (iCount = 0; iCount < oHistoryModel.oData.length; iCount = iCount + 1) {
                                sTempValue = oHistoryModel.getProperty("/" + iCount + "/AdjAmount");
                                if ((!isNaN(parseFloat(sTempValue)) && isFinite(sTempValue)) && (parseInt(sTempValue, 10) > 0)) {
                                    oHistoryModel.setProperty("/" + iCount + "/AmtUsdAbp", oHistoryModel.getProperty("/" + iCount + "/AdjAmount"));
                                }
                            }
                            oHistoryModel.setProperty('/estAmount', "$" + parseFloat(oData.Message).toFixed(2));
                            oHistoryModel.setProperty('/totalAmount', "$" + parseFloat(oData.Info).toFixed(2));
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Request failed',
                                message: oData.Message
                            });
                        }
                    }.bind(this),
                    error: function (oError) {
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Request failed',
                            message: 'The request cannot be sent due to the network or the oData service.'
                        });
                    }.bind(this)
                };
                oModel.callFunction("/ABPCalc", mParameters);
            }
        };

        Controller.prototype._onSetBtnClick = function () {
            var oModel = this.getView().getModel('oDataAvgSvc'),
                oHistoryModel = this.getView().getModel('oAmountHistory'),
                mParameters,
                that = this,
                sTotalAmt = oHistoryModel.getProperty('/estAmount');
            if (sTotalAmt) {
                sTotalAmt = sTotalAmt.replace('$', '');
            }
            this._OwnerComponent.getCcuxApp().setOccupied(true);
            if (oModel) {
                mParameters = {
                    method : "POST",
                    urlParameters : {
                        "Contract": this._coNum,
                        "Date": oHistoryModel.oData[0].FullPeriod,
                        "IsRetro": this.isRetro,
                        "AbpAmt" : sTotalAmt
                    },
                    success : function (oData, response) {
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                        if (oData.Code === "S") {
                            // Display the success message
                            ute.ui.main.Popup.Alert({
                                title: 'Success',
                                message: 'ABP activation success and contact log has been created.'
                            });
                            this._selectScrn(true);
                            //this._retrieveABPEligibility(this._coNum);
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Request failed',
                                message: oData.Message
                            });
                        }
                    }.bind(this),
                    error: function (oError) {
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Request failed',
                            message: 'The request cannot be sent due to the network or the oData service.'
                        });
                    }.bind(this)
                };
                oModel.callFunction("/ABPCrte", mParameters);
            }
        };

        Controller.prototype._onDeactBtnClick = function () {
            var oModel = this.getView().getModel('oDataAvgSvc'),
                oHistoryModel = this.getView().getModel('oAmountHistory'),
                mParameters,
                that = this;
            that._OwnerComponent.getCcuxApp().setOccupied(true);
            if (oModel) {
                mParameters = {
                    method : "POST",
                    urlParameters : {
                        "Contract": this._coNum
                    },
                    success : function (oData, response) {
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                        if (oData.Code === "S") {
                            // close the ABP pop up
                            this._ABPPopupControl.close();
                            // Display the success message
                            ute.ui.main.Popup.Alert({
                                title: 'Success',
                                message: 'You have canceled the ABP successfully.'
                            });
                            this._retrieveABPEligibility(this._coNum);
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Request failed',
                                message: oData.Message
                            });
                        }
                    }.bind(this),
                    error: function (oError) {
                        that._OwnerComponent.getCcuxApp().setOccupied(false);
                        ute.ui.main.Popup.Alert({
                            title: 'Request failed',
                            message: 'The request cannot be sent due to the network or the oData service.'
                        });
                    }.bind(this)
                };
                oModel.callFunction("/ABPCanc", mParameters);
            }
        };

        Controller.prototype.onSelected = function (oEvent) {
            var oCheckbox = oEvent.getSource(),
                sYear = this._aYearList[parseInt(oCheckbox.getId().replace(this.getView().getId() + '--' + 'nrgBilling-avgBillingPopup-graphControlChkbox-', ''), 10)].toString(),
                bHide = oCheckbox.getChecked(),
                oChart = this.graphControl;

            if (oChart) {
                oChart.hideUsage(sYear, !bHide);
            }
        };

        Controller.prototype._renderGraphCrontrolBtn = function () {
            var oGraphModel = this.getView().getModel('oUsageGraph'),
                i,
                j,
                parts;

            if (oGraphModel.oData.data.length) {
                for (i = 0; i < oGraphModel.oData.data.length; i = i + 1) {
                    parts = oGraphModel.oData.data[i].usageDate.split("/");
                    if (this._aYearList.indexOf(parts[2]) < 0) {
                        this._aYearList.push(parts[2]);
                    }
                }
            }

            for (j = 0; j < this._aYearList.length; j = j + 1) {
                this.getView().byId("nrgBilling-avgBillingPopup-graphControlBtn-" + j).setVisible(true);
                this.getView().byId("nrgBilling-avgBillingPopup-graphControlText-" + j).setText(this._aYearList[j]).addStyleClass("usageChartLegend-label-" + this._aGraphClors[j]);
            }

        };

        Controller.prototype._pad = function (d) {
            return (d < 10) ? '0' + d.toString() : d.toString();
        };

        Controller.prototype.onPopupClose = function (oEvent) {
            this.getView().getParent().close();
        };
        Controller.prototype._onPoBoxEdit = function (oEvent) {
            var olocalAddress = this.getView().getModel('olocalAddress');
            olocalAddress.setProperty('/HouseNo', '');
            olocalAddress.setProperty('/Street', '');
        };

        /********************************************************************************/
        /**Edit Mailing Addr functions*/
        Controller.prototype._onComAddrCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/current', true);
            this.getView().getModel('olocalAddress').setProperty('/newAdd', false);
        };
        Controller.prototype._onCurrentAddCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/Address/co', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/co'));
            this.getView().getModel('olocalAddress').setProperty('/Address/HouseNo', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/HouseNo'));
            this.getView().getModel('olocalAddress').setProperty('/Address/UnitNo', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/UnitNo'));
            this.getView().getModel('olocalAddress').setProperty('/Address/City', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/City'));
            this.getView().getModel('olocalAddress').setProperty('/Address/State', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/State'));
            this.getView().getModel('olocalAddress').setProperty('/Address/Country', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/Country'));
            //this.getView().getModel('olocalAddress').setProperty('/Address/AddrLine', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/AddrLine'));
            this.getView().getModel('olocalAddress').setProperty('/Address/Street', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/Street'));
            this.getView().getModel('olocalAddress').setProperty('/Address/PoBox', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/PoBox'));
            this.getView().getModel('olocalAddress').setProperty('/Address/ZipCode', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/ZipCode'));
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
        Controller.prototype._postDPPCommunication = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom'),
                oData = oDPPComunication.oData,
                olocalAddress = this.getView().getModel('olocalAddress');
            if (oData.eMailCheck) {
                if (!oData.eMail) {
                    ute.ui.main.Popup.Alert({
                        title: 'AVERAGE BILLING',
                        message: 'Email field is empty'
                    });
                    return true;
                }
            }
            if (oData.FaxCheck) {
                if (!(oData.Fax)) {
                    ute.ui.main.Popup.Alert({
                        title: 'AVERAGE BILLING',
                        message: 'Please enter Fax Number'
                    });
                    return true;
                }
                if (!(oData.FaxTo)) {
                    ute.ui.main.Popup.Alert({
                        title: 'AVERAGE BILLING',
                        message: 'Please enter Fax To'
                    });
                    return true;
                }
            }
            if (oData.AddrCheck) {
                if (olocalAddress.getProperty('/newAdd')) {
                    if (!(((olocalAddress.getProperty('/Address/HouseNo')) && (olocalAddress.getProperty('/Address/Street'))) || (olocalAddress.getProperty('/Address/PoBox')))) {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Please enter street no & street name or PO Box'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/City'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Please enter city'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/State'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Please enter state'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/ZipCode'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Please enter zip Code'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Address/Country'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Please enter country'
                        });
                        return true;
                    }

                    this._TrilliumAddressCheck();
                    return true;
                } else {
                    this._sendDppComunication();
                    return true;
                }
            }
            this._sendDppComunication();
            return true;

        };
        Controller.prototype._compareSuggChkClicked = function (oEvent) {
            //this.getView().byId('idAddrUpdatePopup-l').getContent()[2].getContent()[0].getValue()
            var oLeftInputArea = this.getView().byId('idAddrUpdatePopup-l').getContent(),
                oRightSuggArea = this.getView().byId('idAddrUpdatePopup-r').getContent(),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 1; i < 8; i = i + 1) {
                    if (oLeftInputArea[i].getContent()[0].getValue() !== oRightSuggArea[i].getContent()[0].getValue()) {
                        oLeftInputArea[i].getContent()[0].addStyleClass('nrgABP-cusDataVerifyEditMail-lHighlight');
                        oRightSuggArea[i].getContent()[0].addStyleClass('nrgABP-cusDataVerifyEditMail-rHighlight');
                    }
                }
            } else {
                for (i = 1; i < 8; i = i + 1) {
                    if (oLeftInputArea[i].getContent()[0].getValue() !== oRightSuggArea[i].getContent()[0].getValue()) {
                        oLeftInputArea[i].getContent()[0].removeStyleClass('nrgABP-cusDataVerifyEditMail-lHighlight');
                        oRightSuggArea[i].getContent()[0].removeStyleClass('nrgABP-cusDataVerifyEditMail-rHighlight');
                    }
                }
            }
        };
        Controller.prototype._TrilliumAddressCheck = function () {
            var olocalAddress = this.getView().getModel('olocalAddress'),
                oModel = this._OwnerComponent.getModel('comp-bupa'),
                sPath,
                oParameters,
                aFilters = this._createAddrValidateFilters();
            olocalAddress.setProperty('/updateSent', true);
            olocalAddress.setProperty('/showVldBtns', true);
            olocalAddress.setProperty('/updateNotSent', false);
            sPath = '/BuagAddrDetails';

            oParameters = {
                filters: aFilters,
                success: function (oData) {
                    if (oData.results[0].AddrChkValid === 'X') {
                        this._sendDppComunication();
                    } else {
                        olocalAddress.setProperty('/SuggAddrInfo', oData.results[0].TriCheck);
                        this._showSuggestedAddr();
                        this._selectScrn(false, true);//show trillium comparision
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert('Validatation Call Failed');
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };
        Controller.prototype._showSuggestedAddr = function () {
            //Address validation error there was. Show system suggested address values we need to.
            var olocalAddress = this.getView().getModel('olocalAddress');
            olocalAddress.setProperty('/updateSent', true);
            olocalAddress.setProperty('/showVldBtns', true);
            olocalAddress.setProperty('/updateNotSent', false);
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
            oFilterTemplate = new Filter({ path: 'PartnerID', operator: FilterOperator.EQ, value1: this._bpNum});
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
        Controller.prototype._sendDppComunication = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                oDPPComunication = this.getView().getModel('oDppStepThreeCom'),
                oData = oDPPComunication.oData,
                olocalAddress = this.getView().getModel('olocalAddress');
            sPath = '/DPPCorresps';

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData.Error) {
                        if (oData.Message) {
                            ute.ui.main.Popup.Alert({
                                title: 'AVERAGE BILLING',
                                message: oData.Message
                            });
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'AVERAGE BILLING',
                                message: 'Correspondence Failed'
                            });
                        }
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'AVERAGE BILLING',
                            message: 'Correspondence Successfully Sent.'
                        });
                    }
                    this._ABPPopupControl.close();
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'AVERAGE BILLING',
                        message: 'Correspondence Failed'
                    });
                }.bind(this)
            };
            if (oODataSvc) {
                oDPPComunication.oData.Process = 'ABP';
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
        Controller.prototype._retrDppComunication = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                sProcess = 'ABP',
                olocalAddress = this.getView().getModel('olocalAddress');

            sPath = '/DPPCorresps(CA=\'' + this._caNum + '\',Contract=\'' + this._coNum + '\',BP=\'' + this._bpNum + '\',Process=\'' + sProcess + '\')';

            oParameters = {
                success : function (oData) {
                    var temp = olocalAddress.oData;
                    if (oData) {
                        this.getView().getModel('oDppStepThreeCom').setData(oData);
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
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };
        Controller.prototype._handleMailingAcceptBtn = function (oEvent) {
            var olocalAddress = this.getView().getModel('olocalAddress'),
                oOriginalInput = olocalAddress.Address,
                oSuggestedInput = olocalAddress.Address;
            oOriginalInput = oSuggestedInput;

            this._sendDppComunication();
        };
        Controller.prototype._handleMailingDeclineBtn = function (oEvent) {
            this._sendDppComunication();
        };
        Controller.prototype._handleMailingEditBtn = function (oEvent) {
            var oEditMail = this.getView().getModel('olocalAddress');

            oEditMail.setProperty('/updateSent', false);
            oEditMail.setProperty('/showVldBtns', false);
            oEditMail.setProperty('/updateNotSent', true);
        };
        return Controller;
    }
);
