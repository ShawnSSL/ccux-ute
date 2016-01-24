/*globals sap, ute*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'jquery.sap.global',
        'nrg/base/type/Price',
        'sap/ui/core/routing/HashChanger',
        "sap/ui/model/json/JSONModel",
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'nrg/module/quickpay/view/QuickPayPopup'
    ],

    function (CoreController, jQuery, price, HashChanger, JSONModel, Filter, FilterOperator, QuickPayControl) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.billing.view.DefferedPmtPlan');

        Controller.prototype.onInit = function () {
        };


        Controller.prototype.onBeforeRendering = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxContextManager().getContext().oData;
            this._bpNum = oRouteInfo.bpNum;
            this._caNum = oRouteInfo.caNum;
            this._coNum = oRouteInfo.coNum;
            this._isExt = oRouteInfo.isExt;

            this.getView().setModel(this.getOwnerComponent().getModel('comp-dppext'), 'oDataSvc');

            //Model for screen control
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppScrnControl');

            //Model for DPP eligibility/reason
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppEligible');

            //Model for DPP denied reasons
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppDeniedReason');

            //Model for SetUp (DPP Step I)
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppReasons');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppSetUps');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppStepOnePost');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppStepOneSelectedData');

            //Model for DppConf (DPP Step II)
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppConfs');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppConfsChecked');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppStepTwoPost');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppStepTwoConfirmdData');

            //Model for DppComunication (DPPIII)
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDppStepThreeCom');

            //Model for Ext Function (EXT Step I)
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oExtEligible');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oExtExtensions');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oExtExtReasons');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oExtPostRequest');


            this._initScrnControl();
            this._startScrnControl();
        };

        Controller.prototype.onAfterRendering = function () {
            this.getView().byId('nrgBilling-dpp-ExtNewDate-id').attachBrowserEvent('select', this._handleExtDateChange, this);
            this.getView().byId('nrgBilling-dpp-DppStartDate-id').attachBrowserEvent('select', this._handleDppStartDateChange, this);
            this.getView().byId('nrgBilling-dpp-DppDueDate-id').attachBrowserEvent('select', this._handleDppFirstDueDateChange, this);
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
            oScrnControl.setProperty('/EXTGrant', false);
            oScrnControl.setProperty('/EXTDenied', false);
        };

        Controller.prototype._onDownPayment = function (oEvent) {
            var QuickControl = new QuickPayControl();

            this.getView().addDependent(QuickControl);
            QuickControl.openQuickPay(this._coNum, this._bpNum, this._caNum);
        };
        Controller.prototype._startScrnControl = function () {
            var oScrnControl = this.getView().getModel('oDppScrnControl'),
                oHashChanger = new HashChanger(),
				sUrlHash = oHashChanger.getHash(),
                aSplitHash = sUrlHash.split('/');

            if (aSplitHash[1] === 'defferedpaymentplan') {
                this._isDppElgble();
            } else if (aSplitHash[1] === 'defferedpaymentext') {
                this._isExtElgble();
            }

            //oScrnControl.setProperty('/StepOne', true);
        };

        Controller.prototype._selectScrn = function (sSelectedScrn) {
            var oScrnControl = this.getView().getModel('oDppScrnControl');

            oScrnControl.setProperty('/StepOne', false);
            oScrnControl.setProperty('/StepTwo', false);
            oScrnControl.setProperty('/StepThree', false);
            oScrnControl.setProperty('/DPPDenied', false);
            oScrnControl.setProperty('/EXTGrant', false);
            oScrnControl.setProperty('/EXTDenied', false);
            oScrnControl.setProperty('/' + sSelectedScrn, true);

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
            } else if (sSelectedScrn === 'EXTGrant') {
                this._retrExtReasons();
                this._retrExtensions();
            } else if (sSelectedScrn === 'EXTDenied') {
                this._retrExtensions();
            } else {
                return;
            }
        };

        /****************************************************************************************************************/
        //Formatter
        /****************************************************************************************************************/
        Controller.prototype._postiveXFormatter = function (cIndicator) {
            if (cIndicator === 'X' || cIndicator === 'x') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._negativeXFormatter = function (cIndicator) {
            if (cIndicator === 'X' || cIndicator === 'x') {
                return false;
            } else {
                return true;
            }
        };


        Controller.prototype._reverseBooleanFormatter = function (bIndicator) {
            return !bIndicator;
        };

        Controller.prototype._formatShowDownPayment = function (ExtOverride, bExtActive, EligibleYes) {
            if (EligibleYes) {
                if (bExtActive) {
                    return false;
                } else {
                    if (ExtOverride) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                if (ExtOverride) {
                    if (!bExtActive) { return true; } else { return false; }
                } else {
                    return false;
                }
            }

        };
        Controller.prototype._formatShowConfirm = function (ExtOverride, bExtActive, EligibleYes) {
            if (EligibleYes) {
                if (!bExtActive) { return true; } else { return false; }
            }
            if (ExtOverride) {
                if (!bExtActive) { return true; } else { return false; }
            } else {
                return false;
            }
        };
        Controller.prototype._formatShowChangeExt = function (ExtOverride, bExtActive, EligibleYes) {
            if (EligibleYes) {
                if (bExtActive) { return true; } else { return false; }
            }
            if (ExtOverride) {
                if (bExtActive) { return true; } else { return false; }
            } else {
                return false;
            }
        };

        Controller.prototype._formatShowChangDwnPmt = function (sDwnPay, bExtActive) {
            if (sDwnPay === 'X' || sDwnPay === 'x') {
                if (!bExtActive) { return true; } else { return false; }
            } else {
                return false;
            }
        };

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

        Controller.prototype._formatDate = function (oDate) {
            var sFormattedDate;

            if (!oDate) {
                return null;
            } else {
                sFormattedDate = (oDate.getMonth() + 1).toString() + '/' + oDate.getDate().toString() + '/' + oDate.getFullYear().toString().substring(2, 4);
                return sFormattedDate;
            }
        };

        Controller.prototype._formatInvoiceDate = function (day, month, year) {
            // Pad the date and month
            if (day < 10) {day = '0' + day; }
            if (month < 10) {month = '0' + month; }
            // Format the startDate
            return month + '/' + day + '/' + year;
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

        Controller.prototype._onExtDeniedOkClick = function () {    //Navigate to DPP setup if 'OK' is clicked
            var oModel = this.getOwnerComponent().getModel("comp-dppext"),
                that = this;
            oModel.create("/ExtDeniedS", {
                "Contract": this._coNum,
                "ContAccount": this._caNum,
                "Partner" : this._bpNum
            }, {
                success : function (oData, oResponse) {
                    if (oData) {
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
                            message: oData.Message
                        });
                        that.navTo('billing.CheckBook', {bpNum: that._bpNum, caNum: that._caNum, coNum: that._coNum});
                    }
                },
                error : function (oError) {
                }
            });
        };
        Controller.prototype._onDppDeniedOkClick = function () {    //Navigate to DPP setup if 'OK' is clicked
            var oModel = this.getOwnerComponent().getModel("comp-dppext"),
                that = this;
            oModel.create("/DPPDenieds", {
                "Contract": this._coNum,
                "ContAccount": this._caNum,
                "Partner" : this._bpNum
            }, {
                success : function (oData, oResponse) {
                    if (oData) {
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
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
            this._selectScrn('StepOne');
        };

        Controller.prototype._onExtOverrideClick = function () {
            this._selectScrn('EXTGrant');
            this._bOverRide = true;
        };

        Controller.prototype._onDppExtChangeClick = function () {
            //Show Ext Edit Screen
            var oExtElgble = this.getView().getModel('oExtEligible');

            oExtElgble.setProperty('/ExtActive', false);
        };

        Controller.prototype._onDppExtConfirmClick = function () {
            //Send the Extension request out.
            this._postExtRequest();
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

        Controller.prototype._onExtReasonSelect = function (oEvent) {
            this._extReason = oEvent.mParameters.Reason;
        };

        Controller.prototype._onSelectAllCheck = function (oEvent) {
            var oSetUps = this.getView().getModel('oDppSetUps'),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    oSetUps.setProperty('/results/' + i + '/OpenItems/bSelected', true);
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
        };

        Controller.prototype._onStepTwoInstlChange = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                iTempTol = 0,
                iDifTol = 0,
                i;

            for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                iTempTol = iTempTol + parseFloat(oDppConfs.getProperty('/results/' + i + '/ConfirmdItems/Amount'));
            }

            iDifTol = parseFloat(oDppConfs.getProperty('/results/0/TotOutStd')) - iTempTol;
            oDppConfs.setProperty('/results/0/DiffTot', iDifTol.toString());
            oDppConfs.setProperty('/results/0/DppTot', iTempTol.toString());
        };

        Controller.prototype._onDistributeDiffClick = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                i,
                iSelSum = 0,
                iSelNum;

            for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                if (oDppConfs.getProperty('/results/' + i + '/Checked')) {
                    iSelSum = parseFloat(iSelSum) + parseFloat(oDppConfs.getProperty('/results/' + i + '/ConfirmdItems/Amount'));
                    iSelNum = i + 1;
                }
            }

            for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                if (oDppConfs.getProperty('/results/' + i + '/Checked')) {
                    oDppConfs.setProperty('/results/' + i + '/ConfirmdItems/Amount', parseFloat(iSelSum) / parseFloat(iSelNum));
                }
            }

            for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                oDppConfs.setProperty('/results/' + i + '/Checked', false);
            }
            oDppConfs.setProperty('/AllChecked', false);
        };

        Controller.prototype._onDppConfItemCheck = function (oEvent) {
            var oDppConfs = this.getView().getModel('oDppConfs'),
                i,
                iSelTol = 0,
                iDiffTot = 0;

            for (i = 0; i < oDppConfs.getData().results.length; i = i + 1) {
                if (oDppConfs.getProperty('/results/' + i + '/Checked')) {
                    iSelTol = parseFloat(iSelTol) + parseFloat(oDppConfs.getProperty('/results/' + i + '/ConfirmdItems/Amount'));
                }
            }

            //iDiffTot =  parseFloat(oDppConfs.getProperty('/results/0/DppTot')) - iSelTol;

            oDppConfs.setProperty('/results/0/SelTot', iSelTol.toString());
            //oDppConfs.setProperty('/results/0/DiffTot', iDiffTot.toString());
        };

        Controller.prototype._formatPadZero = function (sNum, iSize) {
            while (sNum.length < iSize) {
                sNum = '0' + sNum;
            }
            return sNum;
        };

        Controller.prototype._onDppConfConfirmClick = function (oEvent) {
            var oConf = this.getView().getModel('oDppConfs'),
                i,
                oConfPost = this.getView().getModel('oDppStepTwoPost'),
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
                sTempCOpupz;


            oConfPost.setProperty('/ContAccount', oConf.oData.results[0].ContractAccountNumber);

            oConfPost.setProperty('/PartnerID', oConf.oData.results[0].PartnerID);
            oConfPost.setProperty('/Contract', this._coNum);

            oConfPost.setProperty('/SelectedData', oConf.oData.results[0].SelectedData.replace(/"/g, '\''));

            oConfPost.setProperty('/InstlmntNo', oConf.oData.results[0].InstlmntNo);

            oConfPost.setProperty('/ZeroDwnPay', oConf.oData.results[0].ZeroDwnPay);

            oConfPost.setProperty('/InitialDate', oConf.oData.results[0].InitialDate);

            oConfPost.setProperty('/ReasonCode', this.getView().getModel('oDppReasons').getProperty('/selectedKey'));

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
                    sCDueDate = sCDueDate + sTempDueDate;
                    sCClearDate = sCClearDate + sTempClearDate;
                    sCCleared = sCCleared + sTempCleared;
                    sCClearedAmt = sCClearedAmt + sTempClrAmt;
                    sCOpbel = sCOpbel + sTempCOpbel;
                    sCOpupw = sCOpupw + sTempCOpupw;
                    sCOpupk = sCOpupk + sTempCOpupk;
                    sCOpupz = sCOpupz + sTempCOpupz;
                } else {
                    sCItemNum = sCItemNum + oConf.getData().results[i].ConfirmdItems.ItemNumber.toString() + ',';
                    sCAmt = sCAmt + sTempAmt + ',';
                    sCDueDate = sCDueDate + sTempDueDate + ',';
                    sCClearDate = sCClearDate + sTempClearDate + ',';
                    sCCleared = sCCleared + sTempCleared + ',';
                    sCClearedAmt = sCClearedAmt + sTempClrAmt + ',';
                    sCOpbel = sCOpbel + sTempCOpbel + ',';
                    sCOpupw = sCOpupw + sTempCOpupw + ',';
                    sCOpupk = sCOpupk + sTempCOpupk + ',';
                    sCOpupz = sCOpupz + sTempCOpupz + ',';
                }

                /*aConfirmData.push({IND: oConf.getData().results[i].ConfirmdItems.ItemNumber, AMT: sTempAmt, DUEDATE: sTempDueDate, CLRDT: sTempClearDate, CLRED: oConf.getData().results[i].ConfirmdItems.Cleared, CLRAMT: sTempClrAmt, OPBEL: oConf.getData().results[i].ConfirmdItems.Opbel, OPUPW: oConf.getData().results[i].ConfirmdItems.Opupw, OPUPK: oConf.getData().results[i].ConfirmdItems.Opupk, OPUPZ: oConf.getData().results[i].ConfirmdItems.Opupz});*/
            }

            oConfPost.setProperty('/CItemNum', sCItemNum);
            oConfPost.setProperty('/CAmt', sCAmt);
            oConfPost.setProperty('/CDueDate', sCDueDate);
            oConfPost.setProperty('/CClearDate', sCClearDate);
            oConfPost.setProperty('/CCleared', sCCleared);
            oConfPost.setProperty('/CClearedAmt', sCClearedAmt);
            oConfPost.setProperty('/COpbel', sCOpbel);
            oConfPost.setProperty('/COpupw', sCOpupw);
            oConfPost.setProperty('/COpupk', sCOpupk);
            oConfPost.setProperty('/COpupz', sCOpupz);
            //oConfPost.setProperty('/DwnPay', );
            //oConfPost.setProperty('/DwnPayDate', );



            //this.getView().getModel('oDppStepTwoConfirmdData').setProperty('/CONFIRMDATA', aConfirmData);
            //oConfPost.setProperty('/ConfirmData', this.getView().getModel('oDppStepTwoConfirmdData').getJSON().replace(/"/g, '\''));

            this._postDPPConfRequest(oConfPost.oData);
        };
        Controller.prototype._onCheckbook = function (oEvent) {
            if (this._coNum) {
                this.navTo('billing.CheckBook', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                this.navTo('billing.CheckBookNoCo', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };
        Controller.prototype._onDppConfCancelClick = function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum) {
                oRouter.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
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
                oDppReason = this.getView().getModel('oDppReasons');

            if (oDppReason.getProperty('/selectedReason')) {
                oSetUpsPost.setProperty('/InstlmntNo', oSetUps.getProperty('/results/0/InstlmntNo'));
                for (i = 0; i < oSetUps.getData().results.length; i = i + 1) {
                    if (oSetUps.getProperty('/results/' + i + '/OpenItems/bSelected')) {
                        aSelectedInd.push({IND: oSetUps.getProperty('/results/' + i + '/OpenItems/ItemNumber')});
                    }
                }
                oSetUpsPost.setProperty('/SelectedIndices', aSelectedInd);
                this.getView().getModel('oDppStepOneSelectedData').setProperty('/SELECTEDDATA', oSetUpsPost.getProperty('/SelectedIndices'));

                this._selectScrn('StepTwo');//Initiating step 2
            } else {
                ute.ui.main.Popup.Alert({
                    title: 'DPP REASON',
                    message: 'Please Select DPP Setup Reason'
                });
            }
        };

        Controller.prototype._handleExtDateChange = function (oEvent) {
            var extDate = new Date(this.getView().byId('nrgBilling-dpp-ExtNewDate-id').getValue()),
                oExtensions = this.getView().getModel('oExtExtensions'),
                i;

            for (i = 0; i < oExtensions.oData.results.length; i = i + 1) {
                oExtensions.setProperty('/results/' + i + '/OpenItems/DefferalDate', extDate);
            }
            //this.getView().byId('nrgBilling-dpp-ExtNewDate-id')
        };

        Controller.prototype._handleDppStartDateChange = function (oEvent) {
            var oDppStartDate = new Date(this.getView().byId('nrgBilling-dpp-DppStartDate-id').getValue());

            this.getView().getModel('oDppSetUps').setProperty('/results/0/StartDate', oDppStartDate);
        };

        Controller.prototype._handleDppFirstDueDateChange = function (oEvent) {
            var oDppFirstInslDate = new Date(this.getView().byId('nrgBilling-dpp-DppDueDate-id').getValue());

            this.getView().getModel('oDppConfs').setProperty('/results/0/ConfirmdItems/DueDate', oDppFirstInslDate);
        };

        /****************************************************************************************************************/
        //OData Call
        /****************************************************************************************************************/
        Controller.prototype._postDPPCommunication = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                oDPPComunication = this.getView().getModel('oDppStepThreeCom'),
                oRouter = this.getOwnerComponent().getRouter();

            sPath = '/DPPCorresps';

            oParameters = {
                merge: false,
                success : function (oData) {
                    ute.ui.main.Popup.Alert({
                        title: 'DEFFERED PAYMENT PLAN',
                        message: 'Correspondence Successfully Sent.'
                    });
                    if (this._coNum) {
                        oRouter.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
                    } else {
                        oRouter.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
                    }
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
                sPath;

            sPath = '/DPPCorresps(ContractAccountNumber=\'' + this._caNum + '\',PartnerID=\'' + this._bpNum + '\')';

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

            //oSelectedStartDate = this.getView().byId('nrgBilling-dpp-DppStartDate-id')._oDate;
            if (oSelectedStartDate) {
                oSelectedStartDate = this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate');
            } else {
                oSelectedStartDate = new Date();
            }

            aFilterIds = ["ContractAccountNumber", "SelectedData", "InstlmntNo", "ZeroDwnPay", "InitialDate"];
            aFilterValues = [this._caNum, this.getView().getModel('oDppStepOneSelectedData').getJSON(), this.getView().getModel('oDppStepOnePost').getProperty('/InstlmntNo'), this.getView().getModel('oDppStepOnePost').getProperty('/ZeroDwnPay'), oSelectedStartDate];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);

            sPath = '/DPPConfs';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oDppConfs').setData(oData);
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            this.getView().getModel('oDppConfs').setProperty('/results/' + i + '/Checked', false);
                            this.getView().getModel('oDppConfs').setProperty('/results/' + i + '/ConfirmdItems/Amount', parseFloat(this.getView().getModel('oDppConfs').getProperty('/results/' + i + '/ConfirmdItems/Amount')));
                        }
                        this.getView().getModel('oDppConfs').setProperty('/results/AllChecked', false);
                        this.getView().getModel('oDppConfs').setProperty('/results/0/SelTot', 0);

                        sDueDate = this._formatInvoiceDate(this.getView().getModel('oDppConfs').getProperty('/results/0/ConfirmdItems/DueDate').getDate(), this.getView().getModel('oDppConfs').getProperty('/results/0/ConfirmdItems/DueDate').getMonth() + 1, this.getView().getModel('oDppConfs').getProperty('/results/0/ConfirmdItems/DueDate').getFullYear());
                        this.getView().byId('nrgBilling-dpp-DppDueDate-id').setDefaultDate(sDueDate);
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

        Controller.prototype._retrDisclosureMessage = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath;

            sPath = '/DPPDisclos';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.sDisCloseMessage = oData.results[0].Message;
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

        Controller.prototype._postDPPConfRequest = function (oDataObject) {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                //oConf = this.getView().getModel('oDppConfs'),
                sPath,
                oParameters,
                i,
                oConfPost = this.getView().getModel('oDppStepTwoPost');

            sPath = '/DPPConfs';

            /*delete oConf.oData.results.AllChecked;
            for (i = 0; i < oConf.oData.results.length; i = i + 1) {
                delete oConf.oData.results[i].Checked;
            }*/

            oParameters = {
                merge: false,
                success : function (oData) {
                    ute.ui.main.Popup.Alert({
                        title: 'DEFFERED PAYMENT PLAN',
                        message: 'DEFFERED PAYMENT PLAN request Success'
                    });
                    this._selectScrn('StepThree');
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'DEFFERED PAYMENT PLAN',
                        message: 'DEFFERED PAYMENT PLAN request failed'
                    });
                    //this._selectScrn('StepThree');
                }.bind(this)
            };

            ute.ui.main.Popup.Confirm({
                title: 'DISCLOSURE',
                message: this.sDisCloseMessage,
                callback: function (sAction) {
                    if (sAction === 'Yes') {
                        if (oODataSvc) {
                            oODataSvc.create(sPath, oDataObject, oParameters);
                        }
                    }
                }
            });
        };

        Controller.prototype._isDppElgble = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                aFilters,
                aFilterValues,
                aFilterIds;

           // aFilterIds = ["Contract"];
            //aFilterValues = [this._coNum];
            //aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/DPPElgbles('" + this._coNum + "')";

            //sPath = '/DPPElgbles(ContractAccountNumber=\'' + this._caNum + '\',DPPReason=\'\')';

            oParameters = {
               //filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oDppEligible').setData(oData);
                        if (oData.EligibleYes) {
                            this._selectScrn('StepOne');
                        } else {
                            this._selectScrn('DPPDenied');
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc && this._coNum) {
                oODataSvc.read(sPath, oParameters);
            }
        };

        Controller.prototype._isExtElgble = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                aFilters,
                aFilterValues,
                aFilterIds;

            //aFilterIds = ["Contract"];
            //aFilterValues = [this._coNum];
            //aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = "/ExtElgbles('" + this._coNum + "')";  //(ContractAccountNumber=\'' + this._caNum + '\',ExtActive=false)';

            oParameters = {
                //filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        oData.NewExtActive = oData.ExtActive;
                        this.getView().getModel('oExtEligible').setData(oData);
                        if (this.getView().getModel('oExtEligible').getProperty('/EligibleYes')) {
                            this._selectScrn('EXTGrant');
                        } else {
                            this._selectScrn('EXTDenied');
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oODataSvc && this._coNum) {
                oODataSvc.read(sPath, oParameters);
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

            aFilterIds = ["ContractAccountNumber"];
            aFilterValues = [this._caNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = '/DPPDenieds';

            //sPath = '/DPPElgbles(ContractAccountNumber=\'' + this._caNum + '\',DPPReason=\'\')/DPPDenieds';

            oParameters = {
                filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            oData.results[i].DPPDenyed.iIndex = i + 1;
                        }
                        this.getView().getModel('oDppDeniedReason').setData(oData);
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

            aFilterIds = ["ContractAccountNumber"];
            aFilterValues = [this._caNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);
            sPath = '/DPPSetUps';

            //sPath = '/DPPElgbles(ContractAccountNumber=\'' + this._caNum + '\',DPPReason=\'\')/DPPSetUps';

            oParameters = {
                filters : aFilters,
                success : function (oData) {
                    if (oData) {
                        for (i = 0; i < oData.results.length; i = i + 1) {
                            //oData.results[i].iIndex = i + 1;
                            oData.results[i].bSelected = false;
                        }
                        this.getView().getModel('oDppSetUps').setData(oData);
                        this.getView().getModel('oDppSetUps').setProperty('/results/bSelectedAll', false);
                        this.getView().getModel('oDppStepOnePost').setProperty('/InstlmntNo', this.getView().getModel('oDppSetUps').getProperty('/results/0/InstlmntNo'));
                        this.getView().getModel('oDppStepOnePost').setProperty('/ZeroDwnPay', '');
                        sStartDate = this._formatInvoiceDate(this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate').getDate(), this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate').getMonth() + 1, this.getView().getModel('oDppSetUps').getProperty('/results/0/StartDate').getFullYear());
                        this.getView().byId('nrgBilling-dpp-DppStartDate-id').setDefaultDate(sStartDate);
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

        Controller.prototype._retrExtReasons = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i;

            sPath = '/ExtReasons';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oExtExtReasons').setData(oData);
                        this.getView().getModel('oExtExtReasons').setProperty('/selectedKey', '2800');
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

        Controller.prototype._retrExtensions = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oParameters,
                sPath,
                i,
                extDate,
                aFilters,
                aFilterValues,
                aFilterIds;

            aFilterIds = ["Contract"];
            aFilterValues = [this._coNum];
            aFilters = this._createSearchFilterObject(aFilterIds, aFilterValues);

            sPath = '/Extensions';//(ContractAccountNumber=\'' + this._caNum + '\',ExtActive=false)/ExtensionSet';

            oParameters = {
                filters: aFilters,
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oExtExtensions').setData(oData);
                        this.getView().getModel('oExtExtensions').setProperty('/results/0/iDwnPay', 0);
                        extDate = this._formatInvoiceDate(oData.results[0].OpenItems.DefferalDate.getDate(), oData.results[0].OpenItems.DefferalDate.getMonth() + 1, oData.results[0].OpenItems.DefferalDate.getFullYear());
                        this.getView().byId('nrgBilling-dpp-ExtNewDate-id').setDefaultDate(extDate);
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

        Controller.prototype._postExtRequest = function () {
            var oODataSvc = this.getView().getModel('oDataSvc'),
                oPost = this.getView().getModel('oExtPostRequest'),
                oExt = this.getView().getModel('oExtExtensions'),
                oEligble = this.getView().getModel('oExtEligible'),
                oReason = this.getView().getModel('oExtExtReasons'),
                sDwnPayDate = this.getView().byId('nrgBilling-dpp-dwnPayDueDate-id').getValue(),
                sDwnPayValue = this.getView().byId('nrgBilling-dpp-dwnPayvalue-id').getValue(),
                sPath,
                oParameters,
                oDataObject = {},
                that = this;


            oDataObject.Contract = this._coNum;
            oDataObject.Partner = this._bpNum;
            oDataObject.ContAccount = this._caNum;
            oDataObject.DefDtNew = oExt.getProperty('/results/0/OpenItems/DefferalDate');
            if (this._bOverRide) {
                oDataObject.OverRide  = 'X';
            } else {
                oDataObject.OverRide  = '';
            }
            //oPost.setProperty('/DwnPay', oExt.getProperty('/results/0/iDwnPay'));
            oDataObject.DwnPay  = oExt.getProperty('/results/0/iDwnPay');
            if (oDataObject.DwnPay) {
                oDataObject.DwnPay = oDataObject.DwnPay.toString();
            }
            if (sDwnPayDate) {
                //oPost.setProperty('/DwnPayDate', new Date(sDwnPayDate));//Date
                oDataObject.DwnPayDate = new Date(sDwnPayDate);
            } //else {
                //oPost.setProperty('/DwnPayDate', null);
            //}
            if (oReason.getProperty("/selectedKey")) {
                //oPost.setProperty('/ExtReason', oReason.getProperty());
                oDataObject.ExtReason = oReason.getProperty("/selectedKey");
            }
            if (this._extReason) {
                //oPost.setProperty('/ExtReason', this._extReason);
                oDataObject.ExtReason = this._extReason;
            }

            //oPost.setProperty('/ExtActive', false);
            oDataObject.ExtActive = false;
            //oPost.setProperty('/ChgOpt', false);
            //oDataObject.ChgOpt = false;

            sPath = '/ExtConfs';

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (oData) {
                        ute.ui.main.Popup.Alert({
                            title: 'Extension',
                            message: oData.Message
                        });
                        if (!oData.Error) {
                            that._onCheckbook();
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    ute.ui.main.Popup.Alert({
                        title: 'Extension',
                        message: 'Extension request failed'
                    });
                }.bind(this)
            };

            if (oODataSvc) {
                oODataSvc.create(sPath, oDataObject, oParameters);
            }

        };

        return Controller;
    }
);
