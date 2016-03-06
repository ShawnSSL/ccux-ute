/*globals sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        "sap/ui/model/json/JSONModel",
        'nrg/module/billing/view/control/AverageBillDetailsChart'
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel, AverageBillDetailsChart) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.ABP');

        Controller.prototype.onInit = function () {

        };

        Controller.prototype.onBeforeRendering = function () {

        };

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
        };
        Controller.prototype._selectScrn = function (bCorres) {
            var oScrnControl = this.getView().getModel('oABPScrnControl');

            if (bCorres) {
                oScrnControl.setProperty('/Table', false);
                oScrnControl.setProperty('/Graph', false);
                oScrnControl.setProperty('/Note', false);
                oScrnControl.setProperty('/Correspondence', true);
                this._retrDppComunication();
            }
        };
        /*------------------------------------------------ Retrieve Methods -------------------------------------------------*/
        Controller.prototype._onComEmailCheck = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            oDPPComunication.setProperty('/eMailCheck', true);
            oDPPComunication.setProperty('/FaxCheck', false);
            oDPPComunication.setProperty('/AddrCheck', false);
        };

        Controller.prototype._onComFaxCheck = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            oDPPComunication.setProperty('/eMailCheck', false);
            oDPPComunication.setProperty('/FaxCheck', true);
            oDPPComunication.setProperty('/AddrCheck', false);
        };

        Controller.prototype._onComAddrCheck = function () {
            var oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            oDPPComunication.setProperty('/eMailCheck', false);
            oDPPComunication.setProperty('/FaxCheck', false);
            oDPPComunication.setProperty('/AddrCheck', true);
        };
        Controller.prototype._postDPPCommunication = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                oDPPComunication = this.getView().getModel('oDppStepThreeCom');

            sPath = '/DPPCorresps';

            oParameters = {
                merge: false,
                success : function (oData) {
                    ute.ui.main.Popup.Alert({
                        title: 'DEFFERED PAYMENT PLAN',
                        message: 'Correspondence Successfully Sent.'
                    });
                    this._ABPPopupControl.close();
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'DEFFERED PAYMENT PLAN',
                        message: 'Correspondence Failed'
                    });
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.create(sPath, oDPPComunication.oData, oParameters);
            }
        };
        Controller.prototype._retrDppComunication = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                sProcess = 'ABP';

            sPath = '/DPPCorresps(CA=\'' + this._caNum + '\',Contract=\'' + this._coNum + '\',BP=\'' + this._bpNum + '\',Process=\'' + sProcess + '\')';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oDppStepThreeCom').setData(oData);
                        this.getView().getModel('oDppStepThreeCom').setProperty('/eMailCheck', true);
                        this.getView().getModel('oDppStepThreeCom').setProperty('/FaxCheck', false);
                        this.getView().getModel('oDppStepThreeCom').setProperty('/AddrCheck', false);
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
                    if (oData.results) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (oData.results[i].Period !== "Total") {
                                dataEntry = {};
                                fullPeriod = oData.results[i].Period;
                                dataEntry = oData.results[i];
                                dataEntry.Period = dataEntry.Period.substr(0, 2) + '/' + dataEntry.Period.substr(6, 4);
                                dataEntry.FullPeriod = fullPeriod;
                                dataEntry.ActualBill = "$" + parseFloat(dataEntry.ActualBill);
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
            var sPath = '/EligibilityS' + '(\'' + sCoNumber + '\')',
                oModel = this.getView().getModel('oDataAvgSvc'),
                oEligibilityModel = this.getView().getModel('oEligibility'),
                oParameters;

            oParameters = {
                success : function (oData) {
                    oEligibilityModel.setData(oData);
                    if (oData.ABPAct === "Y") {
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
                    oEligibilityModel.setProperty('/ABPElig', 'N');
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
                        this._OwnerComponent.getCcuxApp().setOccupied(true);
                        // Check if the customer is eligible for ABP.
                        if (oEligibilityModel.oData.ABPElig === "Y") {
                            // Check if the customer is on ABP now
                            if (oEligibilityModel.oData.ABPAct === "Y") {
                                // Check if there is billing history
                                if (oEligibilityModel.oData.NoBillHistory === "X" || oEligibilityModel.oData.NoBillHistory === "x") {
                                    // Show the confirmation pop up
                                    ute.ui.main.Popup.Confirm({
                                        title: 'No Billing History',
                                        message: 'Customer has no billing history to display. Do you wish to deactivate Average Billing Plan?',
                                        callback: function (sAction) {
                                            if (sAction === 'Yes') {
                                                oWebUiManager.notifyWebUi('openIndex', {
                                                    LINK_ID: "Z_AVGBIL_D"
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    oWebUiManager.notifyWebUi('openIndex', {
                                        LINK_ID: "Z_AVGBIL_D"
                                    });
                                }
                                // Dismiss the loading indicator
                                this._OwnerComponent.getCcuxApp().setOccupied(false);
                                // Stop the error message timeout
                                clearTimeout(retrTimeout);
                                // Close the ABP popup
                                this._ABPPopupControl.close();
                            } else {
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
                            }
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Not Eligible',
                                message: 'You are not eligible for Average Billing Plan.'
                            });
                            // Dismiss the loading indicator
                            this._OwnerComponent.getCcuxApp().setOccupied(false);
                            // Upon successfully retrieving the data, stop the error message timeout
                            clearTimeout(retrTimeout);
                            // Close the ABP popup
                            this._ABPPopupControl.close();
                        }

                        clearInterval(checkDoneRetrEligibility);
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
                ute.ui.main.Popup.Alert({
                    title: 'Contract Not Found',
                    message: 'Contract number is not found in the routing.'
                });
                
                // Close the ABP popup
                this._ABPPopupControl.close();
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
                adjustParameterName;

            oPayload.Contract = this._coNum;
            for (i = 0; i < oHistoryModel.oData.length; i = i + 1) {
                periodParameterName = 'Prd' + this._pad(i + 1);
                basisParameterName = 'Bbs' + this._pad(i + 1);
                adjustParameterName = 'Amt' + this._pad(i + 1);

                oPayload[periodParameterName] = oHistoryModel.oData[i].FullPeriod;
                oPayload[basisParameterName] = oHistoryModel.oData[i].Basis;
                oPayload[adjustParameterName] = (parseFloat(oHistoryModel.oData[i].AdjAmount) || 0).toString();
            }
            if (oHistoryModel.oData.length < 12) {
                for (i = oHistoryModel.oData.length; i < 12; i = i + 1) {
                    periodParameterName = 'Prd' + this._pad(i + 1);
                    basisParameterName = 'Bbs' + this._pad(i + 1);
                    adjustParameterName = 'Amt' + this._pad(i + 1);

                    oPayload[periodParameterName] = '0.0';
                    oPayload[basisParameterName] = '0.0';
                    oPayload[adjustParameterName] = '0.0';
                }
            }
            if (oModel) {
                mParameters = {
                    method : "POST",
                    urlParameters : oPayload,
                    success : function (oData, response) {
                        if (oData.Code === "S") {
                            oHistoryModel.setProperty('/estAmount', "$" + parseFloat(oData.Message));
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'Request failed',
                                message: oData.Message
                            });
                        }
                    }.bind(this),
                    error: function (oError) {
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
                mParameters;

            if (oModel) {
                mParameters = {
                    method : "POST",
                    urlParameters : {
                        "Contract": this._coNum,
                        "Date": oHistoryModel.oData[oHistoryModel.oData.length - 1].FullPeriod,
                        "IsRetro": this.isRetro
                    },
                    success : function (oData, response) {
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
                mParameters;

            if (oModel) {
                mParameters = {
                    method : "POST",
                    urlParameters : {
                        "Contract": this._coNum
                    },
                    success : function (oData, response) {
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

        return Controller;
    }
);
