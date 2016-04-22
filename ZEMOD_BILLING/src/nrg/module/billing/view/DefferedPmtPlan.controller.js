/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'jquery.sap.global',
        'nrg/base/type/Price',
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/billing/view/EligPopup',
        'nrg/module/quickpay/view/QuickPayPopup'
    ],

    function (CoreController, jQuery, price, JSONModel, Filter, FilterOperator, EligPopup, QuickPayControl) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.DefferedPmtPlan');

        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxContextManager().getContext().oData;
            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;
            this._isExt = oRouteInfo.isExt;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            this.getView().setModel(this.getOwnerComponent().getModel('comp-dppext'), 'oDataSvc');

            //Model for screen control
            this.getView().setModel(new JSONModel(), 'oDppScrnControl');

            //Model for DPP eligibility/reason
            this.getView().setModel(new JSONModel(), 'oDppEligible');

            // Model for eligibility alerts
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEligibility');
            //Model for DPP denied reasons
            this.getView().setModel(new JSONModel(), 'oDppDeniedReason');

            //Model for SetUp (DPP Step I)
            this.getView().setModel(new JSONModel(), 'oDppReasons');
            this.getView().setModel(new JSONModel(), 'oDppSetUps');
            this.getView().setModel(new JSONModel(), 'oDppStepOnePost');
            this.getView().setModel(new JSONModel(), 'oDppStepOneSelectedData');

            //Model for DppConf (DPP Step II)
            this.getView().setModel(new JSONModel(), 'oDppConfs');
            this.getView().setModel(new JSONModel(), 'oDppConfsChecked');
            this.getView().setModel(new JSONModel(), 'oDppStepTwoPost');
            this.getView().setModel(new JSONModel(), 'oDppStepTwoConfirmdData');
            this.getView().setModel(new JSONModel({
                GrantCL : "",
                DeniedCL : "",
                prepay : false,
                showDownPay : false,
                showFirstInstal : false
            }), 'oLocalModel');
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
            //Model for display
            this.getView().setModel(new JSONModel(), 'oDppDisplay');

            this._setInitScreen();
            this._retrieveNotification();
            this._checkPrePay();
        };

        Controller.prototype.onAfterRendering = function () {
            // Update Footer
           // this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);
            /*this.getView().byId('nrgBilling-dpp-DppStartDate-id').attachBrowserEvent('select', this._handleDppStartDateChange, this);*/
            this.getView().byId('nrgBilling-dpp-DppDueDate-id').attachBrowserEvent('select', this._handleDppFirstDueDateChange, this);
            this.getView().byId('nrgBilling-dpp-DppFirstInstlDate-id').attachBrowserEvent('select', this._handleDppFirstInstlChange, this);
        };

        Controller.prototype._checkPrePay = function () {
            var oModel = this.getOwnerComponent().getModel('comp-feeAdjs'),
                oBindingInfo,
                sPath = "/PrepayFlagS('" + this._caNum + "')",
                that = this,
                oLocalModel = this.getView().getModel('oLocalModel');
            oBindingInfo = {
                success : function (oData) {
                    if (oData && oData.Prepay) {
                        oLocalModel.setProperty("/prepay", true);
                    }
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            };
            if (oModel && this._caNum) {
                oModel.read(sPath, oBindingInfo);
            }
        };

        /****************************************************************************************************************/
        //Init Functions
        /****************************************************************************************************************/
        Controller.prototype._initScrnControl = function () {
            var oScrnControl = this.getView().getModel('oDppScrnControl');

            oScrnControl.setProperty('/StepOne', false);
            oScrnControl.setProperty('/StepTwo', false);
            oScrnControl.setProperty('/StepThree', false);
            oScrnControl.setProperty('/DPPDenied', false);
            oScrnControl.setProperty('/Display', false);

            return oScrnControl;
        };

        Controller.prototype._selectScrn = function (sSelectedScrn) {
            this._initScrnControl().setProperty('/' + sSelectedScrn, true);

            if (sSelectedScrn === 'StepOne') {
                this._retrDppSetUp();
                this._retrDppReason();
            } else if (sSelectedScrn === 'StepTwo') {
                this._retrDPPConf();
                this._retrDisclosureMessage();
            } else if (sSelectedScrn === 'StepThree') {
                this._retrDppComunication();
            } else if (sSelectedScrn === 'DPPDenied') {
                this._retrDppDeniedReason();
            } else if (sSelectedScrn === 'Display') {
                this._retrExistingDpp();
            } else {
                return;
            }
        };

        Controller.prototype._setInitScreen = function () {
            var oDataSvc = this.getView().getModel('oDataSvc'),
                sPath = "/DPPElgbles('" + this._coNum + "')",
                that = this,
                oParameters = {
                    success : function (oData) {
                        if (oData) {
                            that.getView().getModel('oDppEligible').setData(oData);
                            if (oData.Active) {
                                that._selectScrn('Display');
                            } else if (oData.Eligible) {
                                that._selectScrn('StepOne');
                            } else {
                                that._selectScrn('DPPDenied');
                            }
                        }
                    }.bind(this),
                    error: function (oError) {
                        //Need to put error message
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    }.bind(this)
                };

            if (oDataSvc && this._coNum) {
                oDataSvc.read(sPath, oParameters);
            }
        };

        /****************************************************************************************************************/
        //Formatter
        /****************************************************************************************************************/
        Controller.prototype._isOdd = function (iIndex) {
            if (iIndex % 2 === 0) {
                return false;
            } else {
                return true;
            }
        };

        Controller.prototype._isEven = function (iIndex) {
            if (iIndex % 2 === 0) {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._isOddDispConf = function (iIndex, sCleared) {
            if (sCleared === "Yes") {
                return false;
            }

            if (iIndex % 2 === 0) {
                return false;
            } else {
                return true;
            }
        };

        Controller.prototype._isEvenDispConf = function (iIndex, sCleared) {
            if (sCleared === "Yes") {
                return false;
            }

            if (iIndex % 2 === 0) {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._isOddDispPaid = function (iIndex, sCleared) {
            if (sCleared === "Yes") {
                if (iIndex % 2 === 0) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        };

        Controller.prototype._isEvenDispPaid = function (iIndex, sCleared) {
            if (sCleared === "Yes") {
                if (iIndex % 2 === 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };

        Controller.prototype._createSearchFilterObject = function (aFilterIds, aFilterValues, sFilterOperator) {
            var aFilters = [],
                iCount;
            if (!sFilterOperator) {
                sFilterOperator = FilterOperator.EQ;
            }
            if (aFilterIds !== undefined) {
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
                }
            }
            return aFilters;
        };

        /****************************************************************************************************************/
        //Handler
        /****************************************************************************************************************/
        Controller.prototype._onDppDeniedOkClick = function () {    //Navigate to DPP setup if 'OK' is clicked
            var oModel = this.getOwnerComponent().getModel("comp-dppext"),
                that = this,
                oContactLogArea = this.getView().byId('idnrgBilling-DPPDenCL'),
                oLocalModel = this.getView().getModel('oLocalModel');
            oModel.create("/DPPDenieds", {
                "Contract": this._coNum,
                "CA": this._caNum,
                "BP" : this._bpNum,
                "Message" : (oLocalModel.getProperty("/DeniedCL") || "")
            }, {
                success : function (oData, oResponse) {
                    if (oData) {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: oData.Message
                        });
                        that.navTo('billing.CheckBook', {bpNum: that._bpNum, caNum: that._caNum, coNum: that._coNum});
                    }
                },
                error : function (oError) {
                }
            });
        };

        Controller.prototype._onDppOverrideClick = function () {
            var oLocalModel = this.getView().getModel('oLocalModel'),
                bPrePayFlag = oLocalModel.getProperty("/prepay"),
                oWebUiManager = this.getOwnerComponent().getCcuxWebUiManager();
            if (bPrePayFlag) {
                oWebUiManager.notifyWebUi('openIndex', {
                    LINK_ID: "Z_DPP_CR"
                });
            } else {
                this._selectScrn('StepOne');
            }
        };

        Controller.prototype._onDPPThirdStepSend = function () {
            this._postDPPCommunication();
        };

        Controller.prototype._onReasonSelect = function (oEvent) {
            //this.getView().getModel('oDppReasons').setData(oData);
            //this.getView().getModel('oDppReasons').setProperty('/selectedKey', '0000');
            var oDppReason = this.getView().getModel('oDppReasons'),
                i;

            for (i = 0; i < oDppReason.oData.length; i = i + 1) {
                if (oDppReason.oData[i].ReasonCode === oEvent.mParameters.selectedKey) {
                    oDppReason.setProperty('/selectedReason', oDppReason.oData[i].Reason);
                }
            }
        };

        Controller.prototype._onSelectAllCheck = function (oEvent) {
            var oSetUps = this.getView().getModel('oDppSetUps'),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    if (!oSetUps.getProperty('/results/' + i + '/OpenItems/DisplayOnlyRow')) {
                        oSetUps.setProperty('/results/' + i + '/OpenItems/bSelected', true);
                    }

                }
            } else {
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    oSetUps.setProperty('/results/' + i + '/OpenItems/bSelected', false);
                }
            }
        };

        Controller.prototype._onDppConfAllCheck = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {

                    oDppConfs.setProperty('/results/' + i + '/Checked', true);
                }
            } else {
                for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                    oDppConfs.setProperty('/results/' + i + '/Checked', false);
                }
            }
            this._onStepTwoInstlChange(oEvent);
        };

        Controller.prototype._onStepTwoInstlChange = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                iCount,
                fTotalAmount = oDppConfs.getProperty("/results/0/TotOutStd"),
                fCalculateSum = 0,
                sTemp;
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                sTemp = oDppConfs.getProperty('/results/' + iCount + '/ConfirmdItems/Amount');
                if (!(((!isNaN(parseFloat(sTemp)) && isFinite(sTemp))) && parseFloat(sTemp))) {
                    oDppConfs.setProperty('/results/' + iCount + '/ConfirmdItems/Amount', "0.00");
                }
            }
            // First calculate the sum which is not checked and checked separately
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                fCalculateSum = (parseFloat(fCalculateSum) || 0) + parseFloat(oDppConfs.getProperty('/results/' + iCount + '/ConfirmdItems/Amount'));
            }
            oDppConfs.setProperty('/results/0/SelTot', fCalculateSum.toString());
            oDppConfs.setProperty('/results/0/DiffTot', ((parseFloat(fCalculateSum) - parseFloat(fTotalAmount)).toFixed(2)).toString());
        };

        Controller.prototype._onDistributeDiffClick = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                iCount,
                fNonSelSum = 0, // to calculate the non-selected rows total.
                iSelNum = 0, // to count the selected row count
                iNonSelNum = 0, // to count the Non-selected row count
                fTotalAmount = oDppConfs.getProperty("/results/0/TotOutStd"),
                fDividedAmount,
                fSelSum = 0,
                fTempAmount,
                bDifference = false,
                iAssignCount = 1,
                fDifferenceAmount = 0,
                sTemp;

            if (fTotalAmount) {
                fTotalAmount = parseFloat(fTotalAmount); // This is the total amount from backend.
            }
            // First calculate the sum which is not checked and checked separately
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                sTemp = oDppConfs.getProperty('/results/' + iCount + '/ConfirmdItems/Amount');
                if (!(((!isNaN(parseFloat(sTemp)) && isFinite(sTemp))) && parseFloat(sTemp))) {
                    // Remove all checks after distributing the values
                    for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                        oDppConfs.setProperty('/results/' + iCount + '/Checked', false);
                    }
                    oDppConfs.setProperty('/AllChecked', false);
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Installment amount must be number and greater than 0.'
                    });
                    return;
                } else if ((parseFloat(sTemp) < 0.00)) {
                    // Remove all checks after distributing the values
                    for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                        oDppConfs.setProperty('/results/' + iCount + '/Checked', false);
                    }
                    oDppConfs.setProperty('/AllChecked', false);
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Installment amount must be number and greater than 0.'
                    });
                    return;
                }
            }
            // First calculate the sum which is not checked and checked separately
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                if (!oDppConfs.getProperty('/results/' + iCount + '/Checked')) {
                    fNonSelSum = parseFloat(fNonSelSum) + parseFloat(oDppConfs.getProperty('/results/' + iCount + '/ConfirmdItems/Amount'));
                    iNonSelNum = iNonSelNum + 1;
                } else {
                    fSelSum = parseFloat(fNonSelSum) + parseFloat(oDppConfs.getProperty('/results/' + iCount + '/ConfirmdItems/Amount'));
                    iSelNum = iSelNum + 1;
                }
            }

            // find out the value to distribute amount selected items.
            if (iSelNum) {
                fDividedAmount = (parseFloat(fTotalAmount) - parseFloat(fNonSelSum)) / iSelNum;
                if (fDividedAmount) {
                    fDividedAmount = parseFloat(fDividedAmount).toFixed(2);
                }
            }
            // check whether distribution is totaled to right total

            fTempAmount = (parseFloat(fNonSelSum) + (parseFloat(fDividedAmount) * iSelNum)).toFixed(2);

            if (parseFloat(fTempAmount) !== parseFloat(fTotalAmount)) {
                bDifference = true;
                fDifferenceAmount = (parseFloat(fTotalAmount) - parseFloat(fTempAmount)).toFixed(2);
            }
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                if (oDppConfs.getProperty('/results/' + iCount + '/Checked')) {
                    if (!bDifference) {
                        oDppConfs.setProperty('/results/' + iCount + '/ConfirmdItems/Amount', parseFloat(fDividedAmount).toFixed(2));
                    } else {
                        if (iAssignCount === iSelNum) {
                            oDppConfs.setProperty('/results/' + iCount + '/ConfirmdItems/Amount', (parseFloat(fDividedAmount) + parseFloat(fDifferenceAmount)).toFixed(2));
                        } else {
                            oDppConfs.setProperty('/results/' + iCount + '/ConfirmdItems/Amount', parseFloat(fDividedAmount).toFixed(2));
                        }
                        iAssignCount = iAssignCount + 1;
                    }
                }
            }
            oDppConfs.setProperty('/results/0/SelTot', fTotalAmount.toString());
            oDppConfs.setProperty('/results/0/DiffTot', "0.00");
            // Remove all checks after distributing the values
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                oDppConfs.setProperty('/results/' + iCount + '/Checked', false);
            }
            oDppConfs.setProperty('/AllChecked', false);
        };

        Controller.prototype._formatPadZero = function (sNum, iSize) {
            while (sNum.length < iSize) {
                sNum = '0' + sNum;
            }
            return sNum;
        };

        Controller.prototype._onDppConfConfirmClick = function (oEvent) {
            var sMessage = "<div style='margin:10px; max-height: 200rem; overflow-y:auto'>" + this.sDisCloseMessage + "</div>",
                oText = new sap.ui.core.HTML({content: sMessage}),
                that = this,
                AlertDialog,
                oOkButton = new ute.ui.main.Button({text: 'OK', press: function () {AlertDialog.close(); that._postDPPConfRequest(); }}),
                oCancelButton = new ute.ui.main.Button({text: 'CANCEL', press: function () {AlertDialog.close(); }}),
                oTag = new ute.ui.commons.Tag(),
                oDueDate,
                oDppConfs = this.getView().getModel('oDppConfs'),
                oSetUpsPost = this.getView().getModel('oDppStepOnePost'),
                fDifference = oDppConfs.getProperty('/results/0/DiffTot'),
                iCount = 0,
                sTemp,
                bzeroDownPay = false,
                sFirstinstlDate = this.getView().byId('nrgBilling-dpp-DppFirstInstlDate-id').getValue(),
                oCurrentDate = new Date(),
                oLocalModel = this.getView().getModel('oLocalModel'),
                bFirstInstl = false;

            if (!((!isNaN(parseFloat(fDifference)) && isFinite(fDifference)) && (parseFloat(fDifference) === 0.00))) {
                ute.ui.main.Popup.Alert({
                    title: 'DPP',
                    message: 'Difference is not 0.'
                });
                return;
            }
            if (oCurrentDate) {
                oCurrentDate.setHours("00");
                oCurrentDate.setMinutes("00");
                oCurrentDate.setSeconds("00");
            }
            bzeroDownPay = oLocalModel.getProperty("/showDownPay") || false;
            oDueDate = this.getView().byId('nrgBilling-dpp-DppDueDate-id').getValue();
            if (bzeroDownPay) {
                if (!oDueDate) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Please enter Down Payment Due Date.'
                    });
                    return;
                }
                oDueDate = new Date(oDueDate);
                if (oDueDate) {
                    oDueDate.setHours("00");
                    oDueDate.setMinutes("00");
                    oDueDate.setSeconds("00");
                }
/*                if (oCurrentDate.getTime() > oDueDate.getTime()) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Due Date(s) can not be earlier than today.'
                    });
                    return;
                }*/
            }
            bFirstInstl = oLocalModel.getProperty("/showFirstInstal") || false;
            if (bFirstInstl) {
                if (!sFirstinstlDate) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Please enter First Instalment Date.'
                    });
                    return;
                }
                sFirstinstlDate = new Date(sFirstinstlDate);
                if (sFirstinstlDate) {
                    sFirstinstlDate.setHours("00");
                    sFirstinstlDate.setMinutes("00");
                    sFirstinstlDate.setSeconds("00");
                }
                if (oDueDate.getTime() > sFirstinstlDate.getTime()) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Installment 2 must occur after ' + this.getView().byId('nrgBilling-dpp-DppDueDate-id').getValue()
                    });
                    return;
                }
            }
            // First calculate the sum which is not checked and checked separately
            for (iCount = 0; iCount < oDppConfs.getData().results.length; iCount = iCount + 1) {
                sTemp = oDppConfs.getProperty('/results/' + iCount + '/ConfirmdItems/Amount');
                if (!(((!isNaN(parseFloat(sTemp)) && isFinite(sTemp))) && parseFloat(sTemp))) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Installment amount must be greater 0.'
                    });
                    return;
                } else if ((parseFloat(sTemp) < 0.00)) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Installment amount must be number and greater than 0.'
                    });
                    return;
                }
            }
            oOkButton.addStyleClass("nrgBillingDiscButton");
            oCancelButton.addStyleClass("nrgBillingDiscButton");
            oTag.addContent(oText);
            oTag.addContent(oOkButton);
            oTag.addContent(oCancelButton);
            AlertDialog = new ute.ui.main.Popup.create({
                title: "DISCLOSURE",
                content: oTag
            });
            AlertDialog.open();
        };

        Controller.prototype._onMain = function (oEvent) {
            if (this._coNum) {
                this.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        Controller.prototype._onCheckbook = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        Controller.prototype._onDppCorresCancelClick = function (oEvent) {
            var QuickControl = new QuickPayControl(),
                that = this;
            this.getView().addDependent(QuickControl);
            QuickControl.openQuickPay(that._coNum, that._bpNum, that._caNum);
            QuickControl.attachEvent("PaymentCompleted", function () {
                that._onCheckbook();
            }, this);
        };
        Controller.prototype._onDppConfCancelClick = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        Controller.prototype._onOneItemCheck = function (oEvent) {
            if (!oEvent.mParameters.checked) {
                this.getView().getModel('oDppSetUps').setProperty('/results/bSelectedAll', false);
            }
        };

        Controller.prototype._onDppSetUpOk = function () {
            var oSetUps = this.getView().getModel('oDppSetUps'),
                i,
                oSetUpsPost = this.getView().getModel('oDppStepOnePost'),
                aSelectedInd = [],
                oDppReason = this.getView().getModel('oDppReasons'),
                sInstallments = oSetUpsPost.getProperty('/InstlmntNo');
/*                oStartDate = this.getView().byId('nrgBilling-dpp-DppStartDate-id').getValue();*/


            if (!((!isNaN(parseFloat(sInstallments)) && isFinite(sInstallments)) && (parseInt(sInstallments, 10) > 0))) {
                ute.ui.main.Popup.Alert({
                    title: 'DPP',
                    message: 'Please enter number of Installments'
                });
                return;
            }
/*            if (!oStartDate) {
                ute.ui.main.Popup.Alert({
                    title: 'DPP',
                    message: 'Please enter Start Date.'
                });
                return;
            }*/
            if (oDppReason.getProperty('/selectedReason')) {
               // oSetUpsPost.setProperty('/InstlmntNo', oSetUps.getProperty('/results/0/InstlmntNo'));
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    if (oSetUps.getProperty('/results/' + i + '/OpenItems/bSelected')) {
                        aSelectedInd.push({IND: oSetUps.getProperty('/results/' + i + '/OpenItems/ItemNumber')});
                    }
                }
                if ((aSelectedInd) && (aSelectedInd.length > 0)) {
                    oSetUpsPost.setProperty('/SelectedIndices', aSelectedInd);
                    this.getView().getModel('oDppStepOneSelectedData').setProperty('/SELECTEDDATA', oSetUpsPost.getProperty('/SelectedIndices'));
                    this._selectScrn('StepTwo');//Initiating step 2
                } else {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Please select at least one open item'
                    });
                }

            } else {
                ute.ui.main.Popup.Alert({
                    title: 'DPP Open Items',
                    message: 'Please Select DPP Setup Reason'
                });
            }
        };

        Controller.prototype._handleDppFirstDueDateChange = function (oEvent) {
            var oDppFirstInslDate = new Date(this.getView().byId('nrgBilling-dpp-DppDueDate-id').getValue()),
                aConfData = this.getView().getModel('oDppConfs').oData,
                iCount = 0;

            for (iCount = 0; iCount < aConfData.results.length; iCount = iCount + 1) {
                if (aConfData.results[iCount].ConfirmdItems.IsDownPay) {
                    this.getView().getModel('oDppConfs').setProperty('/results/' + iCount + '/ConfirmdItems/DueDate', oDppFirstInslDate);
                }
            }

        };
        Controller.prototype._handleDppFirstInstlChange = function (oEvent) {
            var oDppFirstInslDate = new Date(this.getView().byId('nrgBilling-dpp-DppFirstInstlDate-id').getValue()),
                aConfData = this.getView().getModel('oDppConfs').oData,
                iCount = 0;

            for (iCount = 0; iCount < aConfData.results.length; iCount = iCount + 1) {
                if (aConfData.results[iCount].ConfirmdItems.Is1stInstall) {
                    this.getView().getModel('oDppConfs').setProperty('/results/' + iCount + '/ConfirmdItems/DueDate', oDppFirstInslDate);
                }
            }

        };

        /****************************************************************************************************************/
        //OData Call
        /****************************************************************************************************************/
        Controller.prototype._retrDPPConf = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                aFilters,
                aFilterValues,
                aFilterIds,
                i,
                sDueDate,
                oSelectedStartDate;

            aFilterIds = ["BP", "CA", "Contract", "SelectedData", "InstlmntNo", "ZeroDwnPay"];
            aFilterValues = [this._bpNum, this._caNum, this._coNum, this.getView().getModel('oDppStepOneSelectedData').getJSON(), this.getView().getModel('oDppStepOnePost').getProperty('/InstlmntNo'), this.getView().getModel('oDppStepOnePost').getProperty('/ZeroDwnPay')];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);

            sPath = '/DPPConfs';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    var tempDate;
                    if (oData) {
                        this.getView().getModel('oDppConfs').setData(oData);
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            this.getView().getModel('oDppConfs').setProperty('/results/' + i + '/Checked', false);
                            this.getView().getModel('oDppConfs').setProperty('/results/' + i + '/ConfirmdItems/Amount', parseFloat(this.getView().getModel('oDppConfs').getProperty('/results/' + i + '/ConfirmdItems/Amount')));
                        }
                        if (this.getView().getModel('oDppConfs').getProperty('/results/0/DPPError')) {
                            ute.ui.main.Popup.Alert({
                                title: 'DPP',
                                message: this.getView().getModel('oDppConfs').getProperty('/results/0/Message')
                            });
                        }
                        this.getView().getModel('oDppConfs').setProperty('/results/AllChecked', false);
                        this.getView().getModel('oDppConfs').setProperty('/results/0/SelTot', 0);
                        this._onStepTwoInstlChange();

                        for (i = 0; i < oData.results.length; i = i + 1) {
                            if (oData.results[i].ConfirmdItems.IsDownPay) {
                                if (oData.results[i].ConfirmdItems.DueDate) {
                                    tempDate = oData.results[i].ConfirmdItems.DueDate;
                                    sDueDate = this._formatInvoiceDate(tempDate.getDate(), tempDate.getMonth() + 1, tempDate.getFullYear());
                                    this.getView().getModel('oLocalModel').setProperty('/showDownPay', true);
                                    this.getView().byId('nrgBilling-dpp-DppDueDate-id').setDefaultDate(sDueDate);
                                }
                            }
                            if (oData.results[i].ConfirmdItems.Is1stInstall) {
                                if (oData.results[i].ConfirmdItems.DueDate) {
                                    tempDate = oData.results[i].ConfirmdItems.DueDate;
                                    sDueDate = this._formatInvoiceDate(tempDate.getDate(), tempDate.getMonth() + 1, tempDate.getFullYear());
                                    this.getView().getModel('oLocalModel').setProperty('/showFirstInstal', true);
                                    this.getView().byId('nrgBilling-dpp-DppFirstInstlDate-id').setDefaultDate(sDueDate);
                                }
                            }
                        }
                        if (!(this.getView().getModel('oDppSetUps').getProperty('/results/0/InstlmntNoAuth'))) {
                            this.getView().getModel('oLocalModel').setProperty('/showDownPay', false);
                            this.getView().getModel('oLocalModel').setProperty('/showFirstInstal', false);
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

        Controller.prototype._formatInvoiceDate = function (day, month, year) {
            // Pad the date and month
            if (day < 10) {day = '0' + day; }
            if (month < 10) {month = '0' + month; }
            // Format the startDate
            return month + '/' + day + '/' + year;
        };

        Controller.prototype._retrDisclosureMessage = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath;

            sPath = '/DPPDisclos';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.sDisCloseMessage = oData.results[0].Text;
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
// clear unnecessary fields
        Controller.prototype._postDPPConfRequest = function (oDataObject) {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                sPath,
                oParameters,
                i,
                oConfPost = this.getView().getModel('oDppStepTwoPost'),
                sMessage,
                oText,
                oButton,
                oTag,
                that = this,
                oConf = this.getView().getModel('oDppConfs'),
                aConfirmData = [],
                sCItemNum = '',
                sCAmt = '',
                sCDueDate = '',
                sCClearDate = '',
                sCCleared = '',
                sCClearedAmt = '',
                sCOpbel = '',
                sCOpupw = '',
                sCOpupk = '',
                sCOpupz = '',
                sTempAmt,
                sTempDueDate,
                sTempClearDate,
                sTempCleared,
                sTempClrAmt,
                sTempCOpbel,
                sTempCOpupw,
                sTempCOpupk,
                sTempCOpupz,
                oContactLogArea = this.getView().byId('idnrgBilling-DPPAccCL'),
                sDwnPayDate = this.getView().byId('nrgBilling-dpp-DppDueDate-id').getValue(),
                oLocalModel = this.getView().getModel('oLocalModel'),
                sFirstInstlDate = this.getView().byId('nrgBilling-dpp-DppFirstInstlDate-id').getValue();

            sPath = '/DPPConfs';
            oConfPost.setProperty('/CA', this._caNum);

            oConfPost.setProperty('/BP', this._bpNum);
            oConfPost.setProperty('/Contract', this._coNum);

            oConfPost.setProperty('/SelectedData', oConf.oData.results[0].SelectedData.replace(/"/g, '\''));

            oConfPost.setProperty('/InstlmntNo', oConf.oData.results[0].InstlmntNo);

            oConfPost.setProperty('/ZeroDwnPay', oConf.oData.results[0].ZeroDwnPay);

            if (sFirstInstlDate) {
                oConfPost.setProperty('/InitialDate', new Date(sFirstInstlDate));
            } else {
                oConfPost.setProperty('/InitialDate', null);
            }
            if (sDwnPayDate) {
                oConfPost.setProperty('/DwnPayDate', new Date(sDwnPayDate));
            } else {
                oConfPost.setProperty('/DwnPayDate', null);
            }

            oConfPost.setProperty('/DwnPay', "'" + parseFloat(oConf.getProperty('/results/0/ConfirmdItems/Amount')) + "'");
            oConfPost.setProperty('/ReasonCode', this.getView().getModel('oDppReasons').getProperty('/selectedKey'));
            oConfPost.setProperty('/Message', (oLocalModel.getProperty("/GrantCL") || ""));

            //oConfPost.setProperty('/Reason', this.getView().getModel('oDppReasons').setProperty('/selectedReason'));

            /*oConfPost.setProperty('/ReasonCode', oConf.oData.results[0].ReasonCode);
            oConfPost.setProperty('/Reason', oConf.oData.results[0].Reason);*/

            for (i = 0; i < oConf.getData().results.length; i = i + 1) {
                if (oConf.getData().results[i].ConfirmdItems.Amount) {
                    sTempAmt = parseFloat(oConf.getData().results[i].ConfirmdItems.Amount).toString();
                } else {
                    sTempAmt = '0.00';
                }

                if (oConf.getData().results[i].ConfirmdItems.DueDate) {
                    sTempDueDate = oConf.getData().results[i].ConfirmdItems.DueDate.getFullYear().toString() + this._formatPadZero(((oConf.getData().results[i].ConfirmdItems.DueDate.getMonth() + 1).toString()), 2) + this._formatPadZero(((oConf.getData().results[i].ConfirmdItems.DueDate.getDate()).toString()), 2);
                } else {
                    sTempDueDate = 'null';
                }

                if (oConf.getData().results[i].ConfirmdItems.ClearDate) {
                    sTempClearDate = oConf.getData().results[i].ConfirmdItems.ClearDate.getFullYear().toString() + this._formatPadZero(((oConf.getData().results[i].ConfirmdItems.ClearDate.getMonth() + 1).toString()), 2) + this._formatPadZero(((oConf.getData().results[i].ConfirmdItems.ClearDate.getDate()).toString()), 2);
                } else {
                    sTempClearDate = 'null';
                }

                if (oConf.getData().results[i].ConfirmdItems.Cleared) {
                    sTempCleared = oConf.getData().results[i].ConfirmdItems.Cleared;
                } else {
                    sTempCleared = 'null';
                }

                if (oConf.getData().results[i].ConfirmdItems.ClearedAmt) {
                    sTempClrAmt = parseFloat(oConf.getData().results[i].ConfirmdItems.ClearedAmt).toString();
                } else {
                    sTempClrAmt = '0.00';
                }

                if (oConf.getData().results[i].ConfirmdItems.Opbel) {
                    sTempCOpbel = oConf.getData().results[i].ConfirmdItems.Opbel;
                } else {
                    sTempCOpbel = 'null';
                }

                if (oConf.getData().results[i].ConfirmdItems.Opupw) {
                    sTempCOpupw = parseInt(oConf.getData().results[i].ConfirmdItems.Opupw, 10).toString();
                } else {
                    sTempCOpupw = '0';
                }

                if (oConf.getData().results[i].ConfirmdItems.Opupk) {
                    sTempCOpupk = parseInt(oConf.getData().results[i].ConfirmdItems.Opupk, 10).toString();
                } else {
                    sTempCOpupk = '0';
                }

                if (oConf.getData().results[i].ConfirmdItems.Opupz) {
                    sTempCOpupz = parseInt(oConf.getData().results[i].ConfirmdItems.Opupz, 10).toString();
                } else {
                    sTempCOpupz = '0';
                }

                if (i === oConf.getData().results.length - 1) {
                    sCItemNum = sCItemNum + oConf.getData().results[i].ConfirmdItems.ItemNumber.toString();
                    sCAmt = sCAmt + sTempAmt;
/*                    sCDueDate = sCDueDate + sTempDueDate;
                    sCClearDate = sCClearDate + sTempClearDate;
                    sCCleared = sCCleared + sTempCleared;
                    sCClearedAmt = sCClearedAmt + sTempClrAmt;
                    sCOpbel = sCOpbel + sTempCOpbel;
                    sCOpupw = sCOpupw + sTempCOpupw;
                    sCOpupk = sCOpupk + sTempCOpupk;
                    sCOpupz = sCOpupz + sTempCOpupz;*/
                } else {
                    sCItemNum = sCItemNum + oConf.getData().results[i].ConfirmdItems.ItemNumber.toString() + ',';
                    sCAmt = sCAmt + sTempAmt + ',';
/*                    sCDueDate = sCDueDate + sTempDueDate + ',';
                    sCClearDate = sCClearDate + sTempClearDate + ',';
                    sCCleared = sCCleared + sTempCleared + ',';
                    sCClearedAmt = sCClearedAmt + sTempClrAmt + ',';
                    sCOpbel = sCOpbel + sTempCOpbel + ',';
                    sCOpupw = sCOpupw + sTempCOpupw + ',';
                    sCOpupk = sCOpupk + sTempCOpupk + ',';
                    sCOpupz = sCOpupz + sTempCOpupz + ',';*/
                }

            }

            oConfPost.setProperty('/CItemNum', sCItemNum);
            oConfPost.setProperty('/CAmt', sCAmt);
/*            oConfPost.setProperty('/CDueDate', sCDueDate);
            oConfPost.setProperty('/CClearDate', sCClearDate);
            oConfPost.setProperty('/CCleared', sCCleared);
            oConfPost.setProperty('/CClearedAmt', sCClearedAmt);
            oConfPost.setProperty('/COpbel', sCOpbel);
            oConfPost.setProperty('/COpupw', sCOpupw);
            oConfPost.setProperty('/COpupk', sCOpupk);
            oConfPost.setProperty('/COpupz', sCOpupz);*/
            oParameters = {
                merge: false,
                success : function (oData) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    var sMessage = "<div style='margin:10px; max-height: 200rem; overflow-y:auto'>" + oData.Message + "</div>",
                        oText = new sap.ui.core.HTML({content: sMessage}),
                        oAlert_Dialog,
                        oOkButton = new ute.ui.main.Button({text: 'OK', press: function () {oAlert_Dialog.close(); }}),
                        oTag = new ute.ui.commons.Tag();
                    oOkButton.addStyleClass("nrgBillingDiscButton");
                    oTag.addContent(oText);
                    oTag.addContent(oOkButton);
                    oAlert_Dialog = new ute.ui.main.Popup.create({
                        title: "DPP",
                        content: oTag
                    });
                    oAlert_Dialog.open();
                    that._selectScrn('StepThree');
                }.bind(this),
                error: function (oError) {
                    that.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'DEFERRED PAYMENT PLAN REQUEST FAILED'
                    });
                }.bind(this)
            };
            if (oODataSvc) {
                this.getOwnerComponent().getCcuxApp().setOccupied(true);
                oODataSvc.create(sPath, oConfPost.oData, oParameters);
            }
        };

        Controller.prototype._retrDppDeniedReason = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i,
                aFilters,
                aFilterValues,
                aFilterIds;

            aFilterIds = ["Contract", "BP", "CA"];
            aFilterValues = [this._coNum, this._bpNum, this._caNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = '/DPPDenieds';

            //sPath = '/DPPElgbles(ContractAccountNumber=\'' + this._caNum + '\',DPPReason=\'\')/DPPDenieds';

            oParameters = {
                filters : aFilters,
                success : function (oData) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oData) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            oData.results[i].DPPDenyed.iIndex = i + 1;
                        }
                        this.getView().getModel('oDppDeniedReason').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrDppReason = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath;

            sPath = '/DPPReasons';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        oData.results.push({ReasonCode: '0000', Reason: ''});
                        this.getView().getModel('oDppReasons').setData(oData.results);
                        if (this.getView().getModel('oDppEligible').getProperty('/DPPReasonYes')) {
                            this.getView().getModel('oDppReasons').setProperty('/selectedKey', '0000');
                            this.getView().getModel('oDppReasons').setProperty('/selectedReason', this.getView().getModel('oDppEligible').getProperty('/DPPReason'));
                        } else {
                            this.getView().getModel('oDppReasons').setProperty('/selectedKey', '0000');
                            this.getView().getModel('oDppReasons').setProperty('/selectedReason', '');
                        }
                        /*this.getView().getModel('oDppReasons').setProperty('/selectedKey', '3400');*/
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

        Controller.prototype._retrDppSetUp = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i,
                sStartDate,
                aFilters,
                aFilterValues,
                aFilterIds;

            //Model created for later posting
            this.getView().getModel('oDppStepOnePost').setData({});

            aFilterIds = ["Contract", "CA"];
            aFilterValues = [this._coNum, this._caNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = '/DPPSetUps';

            //sPath = '/DPPElgbles(ContractAccountNumber=\'' + this._caNum + '\',DPPReason=\'\')/DPPSetUps';

            oParameters = {
                filters : aFilters,
                success : function (oData) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oData) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            //oData.results[i].iIndex = i + 1;
                            oData.results[i].bSelected = false;
                        }
                        this.getView().getModel('oDppSetUps').setData(oData);
                        this.getView().getModel('oDppSetUps').setProperty('/results/bSelectedAll', false);
                        this.getView().getModel('oDppStepOnePost').setProperty('/InstlmntNo', this.getView().getModel('oDppSetUps').getProperty('/results/0/InstlmntNo'));
                        this.getView().getModel('oDppStepOnePost').setProperty('/ZeroDwnPay', false);
/*                        sStartDate = this._formatInvoiceDate(this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate').getDate(), this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate').getMonth() + 1, this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate').getFullYear());
                        this.getView().byId('nrgBilling-dpp-DppStartDate-id').setDefaultDate(sStartDate);*/
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrExistingDpp = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i,
                sStartDate,
                aFilters,
                aFilterValues,
                aFilterIds;

            //Model created for later posting
            this.getView().getModel('oDppDisplay').setData({});

            sPath = "/DppDisplayS(BP='" + this._bpNum + "',CA='" + this._caNum + "')";
            oParameters = {
                //filters : aFilters,
                urlParameters : {$expand: "Items"},
                success : function (oData) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    if (oData) {
                        this.getView().getModel('oDppDisplay').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.read(sPath, oParameters);
            }
        };

        /*-------------------------------------- Notificatiob Area (Jerry 11/18/2015) ---------------------------------------*/

        Controller.prototype._retrieveNotification = function () {
            var sPath = '/EligCheckS(\'' + this._coNum + '\')',
                oModel = this.getOwnerComponent().getModel('comp-eligibility'),
                oEligModel = this.getView().getModel('oEligibility'),
                oParameters,
                alert,
                i,
                i18NModel = this.getOwnerComponent().getModel("comp-i18n-billing");

            oParameters = {
                success : function (oData) {
                    oEligModel.setData(oData);
                    var container = this.getView().byId('idnrgBilling-dpp-notifications');
                    if (container && container.getContent() && container.getContent().length > 0) {
                        container.removeAllContent();
                    }
                // If already has eligibility alerts, then skip
                    this._eligibilityAlerts = [];

                    // Check ABP
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.ABPElig) ? i18NModel.getProperty("nrgNotfABPT") : i18NModel.getProperty("nrgNotfABPF"),
                        linkPress: this._openEligABPPopup.bind(this)
                    });
                    this._eligibilityAlerts.push(alert);

                    // Check EXTN
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.EXTNElig) ? i18NModel.getProperty("nrgNotfEXTT") : i18NModel.getProperty("nrgNotfEXTF"),
                        linkPress: this._openEligEXTNPopup.bind(this)
                    });
                    this._eligibilityAlerts.push(alert);

                    // Check RBB
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: true,
                        design: 'Information',
                        text: (oData.RBBElig) ? i18NModel.getProperty("nrgNotfRBPT") : i18NModel.getProperty("nrgNotfRBPF"),
                        linkPress: this._openEligRBBPopup.bind(this)
                    });
                    this._eligibilityAlerts.push(alert);

                    // Check DPP
                    alert = new ute.ui.app.FooterNotificationItem({
                        link: false,
                        design: 'Information',
                        text: (oData.DPPElig) ? i18NModel.getProperty("nrgNotfDPPT") : i18NModel.getProperty("nrgNotfDPPF")
                    });
                    this._eligibilityAlerts.push(alert);
                    if (oData.EXTNPend) {
                        // Check DPP
                        alert = new ute.ui.app.FooterNotificationItem({
                            link: false,
                            design: 'Information',
                            text: i18NModel.getProperty("nrgNotfPE")
                        });
                        this._eligibilityAlerts.push(alert);
                    }
                    if (oData.CollAccActv) {
                        // Check DPP
                        alert = new ute.ui.app.FooterNotificationItem({
                            link: false,
                            design: 'Information',
                            text: i18NModel.getProperty("nrgNotfCB")
                        });
                        this._eligibilityAlerts.push(alert);
                    }
                    if (oData.CSAActv) {
                        // Check DPP
                        alert = new ute.ui.app.FooterNotificationItem({
                            link: false,
                            design: 'Information',
                            text: i18NModel.getProperty("nrgNotfCSA")
                        });
                        this._eligibilityAlerts.push(alert);
                    }
                    if (oData.RBankDActv) {
                        // Check DPP
                        alert = new ute.ui.app.FooterNotificationItem({
                            link: false,
                            design: 'Information',
                            text: i18NModel.getProperty("nrgNotfRBD")
                        });
                        this._eligibilityAlerts.push(alert);
                    }
                    if (oData.RCCardActv) {
                        // Check DPP
                        alert = new ute.ui.app.FooterNotificationItem({
                            link: false,
                            design: 'Information',
                            text: i18NModel.getProperty("nrgNotfRCC")
                        });
                        this._eligibilityAlerts.push(alert);
                    }

                    // Insert all alerts to DOM
                    for (i = 0; i < this._eligibilityAlerts.length; i = i + 1) {
                        this._eligibilityAlerts[i].placeAt(container);
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            };

            if (oModel && this._coNum) {
                oModel.read(sPath, oParameters);
            }
        };
        Controller.prototype._openEligABPPopup = function () {
            if (!this.EligABPPopupCustomControl) {
                this.EligABPPopupCustomControl = new EligPopup({ eligType: "ABP" });
                this.EligABPPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligABPPopupCustomControl);
                this.EligABPPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - AVERAGE BILLING PLAN');
            }
            this.EligABPPopupCustomControl.prepare();
        };

        Controller.prototype._openEligEXTNPopup = function () {
            if (!this.EligEXTNPopupCustomControl) {
                this.EligEXTNPopupCustomControl = new EligPopup({ eligType: "EXTN" });
                this.EligEXTNPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligEXTNPopupCustomControl);
                this.EligEXTNPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - EXTENSION');
            }
            this.EligEXTNPopupCustomControl.prepare();
        };

        Controller.prototype._openEligRBBPopup = function () {
            if (!this.EligRBBPopupCustomControl) {
                this.EligRBBPopupCustomControl = new EligPopup({ eligType: "RBB" });
                this.EligRBBPopupCustomControl.attachEvent("EligCompleted", function () {}, this);
                this.getView().addDependent(this.EligRBBPopupCustomControl);
                this.EligRBBPopupCustomControl._oEligPopup.setTitle('ELIGIBILITY CRITERIA - RETRO BILLING PLAN');
            }
            this.EligRBBPopupCustomControl.prepare();
        };
        Controller.prototype._onComAddrCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/current', true);
            this.getView().getModel('olocalAddress').setProperty('/newAdd', false);
        };
        Controller.prototype._onCurrentAddCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/co', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/co'));
            this.getView().getModel('olocalAddress').setProperty('/HouseNo', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/HouseNo'));
            this.getView().getModel('olocalAddress').setProperty('/UnitNo', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/UnitNo'));
            this.getView().getModel('olocalAddress').setProperty('/City', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/City'));
            this.getView().getModel('olocalAddress').setProperty('/State', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/State'));
            this.getView().getModel('olocalAddress').setProperty('/Country', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/Country'));
            this.getView().getModel('olocalAddress').setProperty('/AddrLine', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/AddrLine'));
            this.getView().getModel('olocalAddress').setProperty('/Street', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/Street'));
            this.getView().getModel('olocalAddress').setProperty('/PoBox', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/PoBox'));
            this.getView().getModel('olocalAddress').setProperty('/ZipCode', this.getView().getModel('oDppStepThreeCom').getProperty('/Address/ZipCode'));
            this.getView().getModel('olocalAddress').setProperty('/NewAddrCheck', false);
            this.getView().getModel('olocalAddress').setProperty('/NewAddressflag', false);
            this.getView().getModel('olocalAddress').setProperty('/editable', false);

        };
        Controller.prototype._onNewAddCheck = function (oEvent) {
            this.getView().getModel('olocalAddress').setProperty('/co', '');
            this.getView().getModel('olocalAddress').setProperty('/HouseNo', '');
            this.getView().getModel('olocalAddress').setProperty('/UnitNo', '');
            this.getView().getModel('olocalAddress').setProperty('/City', '');
            this.getView().getModel('olocalAddress').setProperty('/State', '');
            this.getView().getModel('olocalAddress').setProperty('/Country', '');
            this.getView().getModel('olocalAddress').setProperty('/AddrLine', '');
            this.getView().getModel('olocalAddress').setProperty('/Street', '');
            this.getView().getModel('olocalAddress').setProperty('/PoBox', '');
            this.getView().getModel('olocalAddress').setProperty('/ZipCode', '');
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
                        title: 'DPP',
                        message: 'Email field is empty'
                    });
                    return true;
                }
            }
            if (oData.FaxCheck) {
                if (!(oData.Fax)) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Please enter Fax Number'
                    });
                    return true;
                }
                if (!(oData.FaxTo)) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Please enter Fax To'
                    });
                    return true;
                }
            }
            if (oData.AddrCheck) {
                if (olocalAddress.getProperty('/newAdd')) {
                    if (!(((olocalAddress.getProperty('/HouseNo')) && (olocalAddress.getProperty('/Street'))) || (olocalAddress.getProperty('/PoBox')))) {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: 'Please enter street no & street name or PO Box'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/City'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: 'Please enter city'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/State'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: 'Please enter state'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/ZipCode'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: 'Please enter zip Code'
                        });
                        return true;
                    }
                    if (!(olocalAddress.getProperty('/Country'))) {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: 'Please enter country'
                        });
                        return true;
                    }

                    //this._TrilliumAddressCheck();
                    //return true;
                }
            }
            this._sendDppComunication();
            return true;

        };
        Controller.prototype._TrilliumAddressCheck = function () {
            var olocalAddress = this.getView().getModel('olocalAddress'),
                oModel = this.getOwnerComponent().getModel('comp-bupa'),
                sPath,
                oParameters,
                aFilters = this._createAddrValidateFilters(),
                oMailEdit = this.getView().getModel('oDtaAddrEdit');
            olocalAddress.setProperty('/updateSent', true);
            olocalAddress.setProperty('/showVldBtns', true);
            olocalAddress.setProperty('/updateNotSent', false);
            sPath = '/BuagAddrDetails';

            oParameters = {
                filters: aFilters,
                success: function (oData) {
                    if (oData.results[0].AddrChkValid === 'X') {
                        //Validate success, update the address directly
                        this._oMailEditPopup.close();
                        this._updateMailingAddr();
                    } else {
                        oMailEdit.setProperty('/SuggAddrInfo', oData.results[0].TriCheck);
                        this._showSuggestedAddr();
                        //this._oMailEditPopup.open();
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert('Validatation Call Failed');
                }.bind(this)
            };


            //oMailEdit.setProperty('/SuggAddrInfo', oMailEdit.getProperty('/AddrInfo'));
            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };
        Controller.prototype._createAddrValidateFilters = function () {
            var aFilters = [],
                oFilterTemplate,
                sBpNum = this.getView().getModel('oDataBuagAddrDetails').getProperty('/PartnerID'),
                oMailEdit = this.getView().getModel('oDtaAddrEdit'),
                oMailEditAddrInfo = oMailEdit.getProperty('/AddrInfo'),
                key,
                bFixAddr = oMailEdit.getProperty('/bFixAddr'),
                tempPath;

            if (bFixAddr) {
                oFilterTemplate = new Filter({ path: 'FixUpd', operator: FilterOperator.EQ, value1: 'X'});
                aFilters.push(oFilterTemplate);
            } else {
                oFilterTemplate = new Filter({ path: 'TempUpd', operator: FilterOperator.EQ, value1: 'X'});
                aFilters.push(oFilterTemplate);
            }

            oFilterTemplate = new Filter({ path: 'PartnerID', operator: FilterOperator.EQ, value1: sBpNum});
            aFilters.push(oFilterTemplate);

            oFilterTemplate = new Filter({ path: 'ChkAddr', operator: FilterOperator.EQ, value1: 'X'});
            aFilters.push(oFilterTemplate);

            for (key in oMailEditAddrInfo) {
                if (oMailEditAddrInfo.hasOwnProperty(key)) {
                    if (!(key === '__metadata' || key === 'StandardFlag' || key === 'ShortForm' || key === 'ValidFrom' || key === 'ValidTo' || key === 'Supplement')) {
                        if (bFixAddr) {
                            tempPath = 'FixAddrInfo/' + key;
                            oFilterTemplate = new Filter({ path: tempPath, operator: FilterOperator.EQ, value1: oMailEditAddrInfo[key]});
                            aFilters.push(oFilterTemplate);
                        } else {
                            tempPath = 'TempAddrInfo/' + key;
                            oFilterTemplate = new Filter({ path: tempPath, operator: FilterOperator.EQ, value1: oMailEditAddrInfo[key]});
                            aFilters.push(oFilterTemplate);
                        }
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
                olocalAddress = this.getView().getModel('olocalAddress'),
                that = this,
                callQuickPay;
            sPath = '/DPPCorresps';
            callQuickPay = function () {
                var QuickControl = new QuickPayControl();
                that.getView().addDependent(QuickControl);
                QuickControl.openQuickPay(that._coNum, that._bpNum, that._caNum);
                QuickControl.attachEvent("PaymentCompleted", function () {
                    that._onCheckbook();
                }, this);
            };
            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData.Error) {
                        if (oData.Message) {
                            ute.ui.main.Popup.Alert({
                                title: 'DPP',
                                message: oData.Message,
                                callback: callQuickPay
                            });
                        } else {
                            ute.ui.main.Popup.Alert({
                                title: 'DPP',
                                message: 'Correspondence Failed',
                                callback: callQuickPay
                            });
                        }
                    } else {
                        ute.ui.main.Popup.Alert({
                            title: 'DPP',
                            message: 'Correspondence Successfully Sent.',
                            callback: callQuickPay
                        });
                    }
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'DPP',
                        message: 'Correspondence Failed'
                    });
                }.bind(this)
            };
            if (oODataSvc) {
                oDPPComunication.oData.Process = 'DPP';
                if (olocalAddress.getProperty('/newAdd')) {
                    oData.Address.co = olocalAddress.getProperty('/co');
                    oData.Address.HouseNo = olocalAddress.getProperty('/HouseNo');
                    oData.Address.UnitNo = olocalAddress.getProperty('/UnitNo');
                    oData.Address.City = olocalAddress.getProperty('/City');
                    oData.Address.State = olocalAddress.getProperty('/State');
                    oData.Address.Country = olocalAddress.getProperty('/Country');
                    oData.Address.AddrLine = olocalAddress.getProperty('/AddrLine');
                    oData.Address.Street = olocalAddress.getProperty('/Street');
                    oData.Address.PoBox = olocalAddress.getProperty('/PoBox');
                    oData.Address.ZipCode = olocalAddress.getProperty('/ZipCode');
                    oData.NewAddr = olocalAddress.getProperty('/NewAddrCheck');
                }
                oODataSvc.create(sPath, oDPPComunication.oData, oParameters);
            }
        };
        Controller.prototype._retrDppComunication = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                sProcess = 'DPP',
                olocalAddress = this.getView().getModel('olocalAddress');

            sPath = '/DPPCorresps(CA=\'' + this._caNum + '\',Contract=\'' + this._coNum + '\',BP=\'' + this._bpNum + '\',Process=\'' + sProcess + '\')';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oDppStepThreeCom').setData(oData);
                        if (oData.AddrCheck) {
                            olocalAddress.setProperty('/current', true);
                            olocalAddress.setProperty('/newAdd', false);
                        }
                        if (oData.Address) {
                            olocalAddress.setProperty('/co', oData.Address.co);
                            olocalAddress.setProperty('/HouseNo', oData.Address.HouseNo);
                            olocalAddress.setProperty('/UnitNo', oData.Address.UnitNo);
                            olocalAddress.setProperty('/City', oData.Address.City);
                            olocalAddress.setProperty('/State', oData.Address.State);
                            olocalAddress.setProperty('/Country', oData.Address.Country);
                            olocalAddress.setProperty('/AddrLine', oData.Address.AddrLine);
                            olocalAddress.setProperty('/Street', oData.Address.Street);
                            olocalAddress.setProperty('/PoBox', oData.Address.PoBox);
                            olocalAddress.setProperty('/ZipCode', oData.Address.ZipCode);
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
        /**
		 * formats installment number for zero downpayment case
		 *
		 * @function
		 * @param {String} instalmentNum
         * @param {boolean} bzerodown zero down payment true or false
		 * @return {string} updated instalmentNum
		 */
        Controller.prototype._formatInstalments = function (instalmentNum, bzerodown) {

            if (instalmentNum) {
                if (bzerodown) {
                    return parseInt(instalmentNum, 10) - 1;
                } else {
                    return instalmentNum;
                }
            } else {
                return "";
            }
        };

        return Controller;
    }
);
