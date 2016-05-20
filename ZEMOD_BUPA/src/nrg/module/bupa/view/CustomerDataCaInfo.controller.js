/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        'nrg/base/view/BaseController',
        'sap/ui/model/json/JSONModel',
        'sap/ui/core/routing/HashChanger',
        'sap/ui/core/format/DateFormat'
    ],

    function (Filter, FilterOperator, jQuery, CoreController, JSONModel, HashChanger, DateFormat) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.bupa.view.CustomerDataCaInfo');

        Controller.prototype.onBeforeRendering = function () {
            //if (!this._beforeOpenEditAddrDialogue) {
            //var oModel;

            this.getOwnerComponent().getCcuxApp().setTitle('BUSINESS PARTNER');

            this.getView().setModel(this.getOwnerComponent().getModel('comp-bupa'), 'oODataSvc');

            //050192016 US State List Model for Address
            this.getView().setModel(this.getOwnerComponent().getModel('oStateListModel'), 'oUSStateList');

                //Model to track page edit/save status
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oCaInfoConfig');

            //Model to hold BuagAddrDetail
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBuagAddrDetails');

            //Model to hold CA accounts and mailing address short form
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataCAs');

            //Model to hold all Buags
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oAllBuags');
            this.getView().getModel('oAllBuags').setSizeLimit(1500);

            //Model for Edit Popup Screen (Use the model to show on edit screen)
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDtaAddrEdit');


            this._initCaInfoConfigModel();
            this._initDataModel();
            this._initMailAddrModels();
            //} else {
            //    this._beforeOpenEditAddrDialogue = false;
            //}
        };
        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        Controller.prototype.onAfterRendering = function () {
            // Update Footer
           // this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);
        };
        Controller.prototype._initCaInfoConfigModel = function () {
            var configModel = this.getView().getModel('oCaInfoConfig');
            configModel.setProperty('/mailAddrUpdateVisible', true);
            configModel.setProperty('/mailAddrAddnewVisible', true);
            configModel.setProperty('/mailAddrSaveVisible', false);
            configModel.setProperty('/mailAddrEditable', false);

            configModel.setProperty('/tempAddrAddnewVisible', false);
            configModel.setProperty('/tempAddrSaveVisible', false);
            configModel.setProperty('/tempAddrEditable', false);

            configModel.setProperty('/bAllBuagSelected', false);
            configModel.setProperty('/bAllBuagenabled', false);
        };

        Controller.prototype._initDataModel = function () {
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();

            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;

            /*
            var sPath, aSplitHash, iSplitHashL;

            aSplitHash = (this._retrUrlHash()).split('/');
            iSplitHashL = aSplitHash.length;

            this._bpNum = aSplitHash[iSplitHashL - 3];
            this._caNum = aSplitHash[iSplitHashL - 1];*/

            this._retrAllBuags(this._bpNum);
            this._retrBuagAddrDetail(this._caNum);
        };

        Controller.prototype._retrAllBuags = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                oCaModel = this.getView().getModel('oAllBuags'),
                sPath,
                oParameters,
                sCurrentCa = this._caNum;

            sPath = '/Partners' + '(\'' + sBpNum + '\')/Buags/';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        oCaModel.setData(oData.results);
                        oCaModel.setProperty('/selectedKey', sCurrentCa);
                    }
                }.bind(this),
                error: function (oError) {
                    //Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrBuagAddrDetail = function (caNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                configModel = this.getView().getModel('oCaInfoConfig');

            sPath = '/Buags(ContractAccountID=' + '\'' + caNum + '\')/BuagAddrDetail/';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        if (oData.results.length !== 0) {
                            if (!this._fixedAddrID) {
                                this._fixedAddrID = oData.results[0].FixedAddressID;
                            }
                            if (oData.results[0].TempAddrYes === 'X') {
                                configModel.setProperty('/tempAddrAddnewVisible', true);
                                configModel.setProperty('/mailAddrUpdateVisible', false);
                                configModel.setProperty('/mailAddrAddnewVisible', false);
                            }
                            this.getView().getModel('oDataBuagAddrDetails').setData(oData.results[0]);
                            this.oDataBuagAddrDetailsBak = jQuery.extend(true, {}, oData.results[0]);
                        } else {
                            configModel.setProperty('/mailAddrUpdateVisible', false);
                            configModel.setProperty('/mailAddrAddnewVisible', true);
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Error loading /Buags{caNum}/BuagAddrDetail");
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._onCaSelected = function (oEvent) {
            var sSelectedKey = oEvent.getParameters().selectedKey,
                eventBus = sap.ui.getCore().getEventBus(),
                oPayload = {caNum: sSelectedKey};

            if (sSelectedKey) {
                this._caNum = sSelectedKey;
                this._retrBuagAddrDetail(this._caNum);
                eventBus.publish("nrg.module.dashoard", "eBuagChangedFromCaInfo", oPayload);
            }

            return;
        };

        Controller.prototype._onAllBuagsSelected = function (oEvent) {
            //var bAllBuagsSelected = oEvent.mParameters.checked;

            //this.getView().getModel('oCaInfoConfig').setProperty('/bAllBuagSelected', bAllBuagsSelected);
        };

        /********************************************************************************/
        /**Edit Mailing Addr functions*/

        Controller.prototype._handleMailingAcceptBtn = function (oEvent) {
            var oMailEdit = this.getView().getModel('oDtaAddrEdit'),
                oMailTempModel = this.getView().getModel('oDataBuagAddrDetails'),
                tempObj,
                key;

            tempObj = oMailEdit.getProperty('/SuggAddrInfo');
            delete tempObj.HeaderText1;
            delete tempObj.HeaderText2;
            delete tempObj.FooterLine1;
            delete tempObj.FooterLine2;
            delete tempObj.FooterLine3;

            if (oMailEdit.getProperty('/bFixAddr')) {
                oMailTempModel.setProperty('/FixUpd', 'X');
                for (key in tempObj) {
                    if (tempObj.hasOwnProperty(key)) {
                        if (!(key === '__metadata' || key === 'StandardFlag' || key === 'Supplement')) {
                            oMailTempModel.setProperty('/FixAddrInfo/' + key, tempObj[key]);
                        }
                    }
                }
            } else {
                oMailTempModel.setProperty('/TempUpd', 'X');
                for (key in tempObj) {
                    if (tempObj.hasOwnProperty(key)) {
                        if (!(key === '__metadata' || key === 'StandardFlag' || key === 'Supplement')) {
                            oMailTempModel.setProperty('/TempAddrInfo/' + key, tempObj[key]);
                        }
                    }
                }
            }
            this._updateMailingAddr();
        };

        Controller.prototype._handleMailingDeclineBtn = function (oEvent) {
            var oMailEdit = this.getView().getModel('oDtaAddrEdit'),
                oMailTempModel = this.getView().getModel('oDataBuagAddrDetails'),
                tempObj;

            tempObj = oMailEdit.getProperty('/AddrInfo');

            if (oMailEdit.getProperty('/bFixAddr')) {
                oMailTempModel.setProperty('/FixAddrInfo', tempObj);
                oMailTempModel.setProperty('/FixUpd', 'X');
            } else {
                oMailTempModel.setProperty('/TempAddrInfo', tempObj);
                oMailTempModel.setProperty('/TempUpd', 'X');
            }

            this._updateMailingAddr();
        };

        Controller.prototype._handleMailingEditBtn = function (oEvent) {
            var oEditMail = this.getView().getModel('oDtaAddrEdit');

            oEditMail.setProperty('/updateSent', false);
            oEditMail.setProperty('/showVldBtns', false);
            oEditMail.setProperty('/updateNotSent', true);
        };

        Controller.prototype._showSuggestedAddr = function () {
            //Address validation error there was. Show system suggested address values we need to.
            this.getView().byId('idAddrUpdatePopup').addStyleClass('nrgBupa-cusDataVerifyEditMail-vl');
            this.getView().byId('idAddrUpdatePopup-l').addStyleClass('nrgBupa-cusDataVerifyEditMail-l-vl');
            this.getView().getModel('oDtaAddrEdit').setProperty('/updateSent', true);
            this.getView().getModel('oDtaAddrEdit').setProperty('/showVldBtns', true);
            this.getView().getModel('oDtaAddrEdit').setProperty('/updateNotSent', false);
        };

        Controller.prototype._getFromDate = function () {
            var oDateNow = new Date(),
                sCuYear,
                sCuMonth,
                sCuDay,
                sCurrentTime;

            sCuYear = oDateNow.getFullYear();
            sCuMonth = oDateNow.getMonth() + 1;
            sCuDay = oDateNow.getDate();

            sCurrentTime = sCuYear + '-' + sCuMonth + '-' + sCuDay + 'T00:00:00';

            return sCurrentTime;
        };

        Controller.prototype._updateMailingAddr = function () {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                sBpNum = this.getView().getModel('oDataBuagAddrDetails').getProperty('/PartnerID'),
                sBuagNum = this.getView().getModel('oDataBuagAddrDetails').getProperty('/ContractAccountID'),
                sFixedAddressID = this.getView().getModel('oDataBuagAddrDetails').getProperty('/FixedAddressID'),
                sFromDate = this._getFromDate();

            if (this.getView().getModel('oCaInfoConfig').getProperty('/bAllBuagSelected')) {
                this.getView().getModel('oDataBuagAddrDetails').setProperty('/SaveToAllCa', 'X');
            }

            if (this.getView().getModel('oDtaAddrEdit').getProperty('/bCreateFirst')) {
                if (this.getView().getModel('oDataBuagAddrDetails').getProperty('/FixUpd') === 'X') {
                    this.getView().getModel('oDataBuagAddrDetails').setProperty('/FixAddrInfo/ValidFrom', this._getFromDate());
                    this.getView().getModel('oDataBuagAddrDetails').setProperty('/FixAddrInfo/ValidTo', '9999-12-31T00:00:00');
                } else {
                    this.getView().getModel('oDataBuagAddrDetails').setProperty('/TempAddrInfo/ValidFrom', this._getFromDate());
                    this.getView().getModel('oDataBuagAddrDetails').setProperty('/TempAddrInfo/ValidTo', '9999-12-31T00:00:00');
                }
            }



            oParameters = {
                urlParameters: {},
                success : function (oData) {
                    if (oData && oData.Message) {
                        sap.ui.commons.MessageBox.alert(oData.Message);
                    } else {
                        sap.ui.commons.MessageBox.alert("Address Updated Successfully");
                    }
                    //this._retrBuag(this.getView().getModel('oDtaVrfyBuags').getProperty('/PartnerID'), this.getView().getModel('oAllBuags').getProperty('/selectedKey'));
                    this._oMailEditPopup.close();
                    this._retrAllBuags(this._bpNum);
                    this._retrBuagAddrDetail(this._caNum);
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Update Failed");
                }.bind(this)
            };

            if (oModel) {
                if (this.getView().getModel('oDtaAddrEdit').getProperty('/bCreateFirst')) {
                    sPath = '/BuagAddrDetails';
                    oModel.create(sPath, this.getView().getModel('oDataBuagAddrDetails').oData, oParameters);
                } else {
                    sPath = '/BuagAddrDetails' + '(' + 'PartnerID=\'' + sBpNum + '\'' + ',ContractAccountID=\'' + sBuagNum + '\'' + ',FixedAddressID=\'' + sFixedAddressID + '\')';
                    oModel.update(sPath, this.getView().getModel('oDataBuagAddrDetails').oData, oParameters);
                }
            }
        };

        Controller.prototype._validateInputAddr = function () {
            //this._showSuggestedAddr();
            var oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                aFilters = this._createAddrValidateFilters(),
                oMailEdit = this.getView().getModel('oDtaAddrEdit');

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

        Controller.prototype._initMailAddrModels = function () {
            /*this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBuagAddrDetails');
              this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDtaAddrEdit');*/
            var oEditMail = this.getView().getModel('oDtaAddrEdit');

            oEditMail.setProperty('/updateSent', false);
            oEditMail.setProperty('/showVldBtns', false);
            oEditMail.setProperty('/updateNotSent', true);
        };

        Controller.prototype._onPoBoxEdit = function (oEvent) {
            this.getView().byId('idEditHouseNum').setValue('');
            this.getView().byId('idEditStName').setValue('');
        };

        Controller.prototype._onRegAddrEdit = function (oEvent) {
            this.getView().byId('idEditPoBox').setValue('');
        };

        Controller.prototype._onMailingPoBoxChanged = function (oEvent) {
            this.getView().byId('idMailingAddrHouseNo').setValue('');
            this.getView().byId('idMailingAddrStreet').setValue('');
        };

        Controller.prototype._onMailingRegAddrChanged = function (oEvent) {
            this.getView().byId('idMailingAddrPobox').setValue('');
        };

        Controller.prototype._cleanUpAddrEditPop = function () {
            var i;

            this.getView().byId('idAddrUpdatePopup').removeStyleClass('nrgBupa-cusDataVerifyEditMail-vl');
            this.getView().byId('idAddrUpdatePopup-HdrLn').setVisible(false);
            this.getView().byId('idAddrUpdatePopup-l').removeStyleClass('nrgBupa-cusDataVerifyEditMail-l-vl');
            this.getView().byId('idAddrUpdatePopup-r').setVisible(false);


            for (i = 1; i < 8; i = i + 1) {
                this.getView().byId('idAddrUpdatePopup-l').getContent()[0].removeStyleClass('nrgBupa-cusDataVerifyEditMail-lHighlight');
                this.getView().byId('idAddrUpdatePopup-r').getContent()[0].removeStyleClass('nrgBupa-cusDataVerifyEditMail-rHighlight');
            }
        };

        Controller.prototype._onEditMailAddrClick = function (oEvent) {
            var oEditMail = this.getView().getModel('oDtaAddrEdit'),
                oCompareEvnet = {mParameters: {checked: null}},
                oBuagAddressDetails = this.getView().getModel('oDataBuagAddrDetails');

            if (!(((oBuagAddressDetails.getProperty('/FixAddrInfo/HouseNo')) && (oBuagAddressDetails.getProperty('/FixAddrInfo/Street'))) || (oBuagAddressDetails.getProperty('/FixAddrInfo/PoBox')))) {
                ute.ui.main.Popup.Alert({
                    title: 'AVERAGE BILLING',
                    message: 'Please enter street no & street name or PO Box'
                });
                return true;
            }
            oEditMail.setProperty('/AddrInfo', oBuagAddressDetails.getProperty('/FixAddrInfo'));
            this.getView().getModel('oDataBuagAddrDetails').setProperty('/FixUpd', 'X');

            if (!this._oMailEditPopup) {
                this._oMailEditPopup = ute.ui.main.Popup.create({
                    close: this._handleEditMailPopupClose.bind(this),
                    content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.bupa.view.AddrUpdateCaLvlPopUp", this),
                    title: 'Edit Mailing Address'
                });
                this.getView().addDependent(this._oMailEditPopup);
            }

            //Control what to or not to display
            this._cleanUpAddrEditPop();
            this.getView().getModel('oDtaAddrEdit').setProperty('/updateSent', false);
            this.getView().getModel('oDtaAddrEdit').setProperty('/showVldBtns', false);
            this.getView().getModel('oDtaAddrEdit').setProperty('/updateNotSent', true);
            this.getView().getModel('oDtaAddrEdit').setProperty('/bFixAddr', true);
            this.getView().byId('idEditMailAddr_UpdtBtn').setVisible(true);
            if (this.getView().byId('idSuggCompareCheck').getChecked()) {
                oCompareEvnet.mParameters.checked = false;
                this._compareSuggChkClicked(oCompareEvnet);
                this.getView().byId('idSuggCompareCheck').setChecked(false);
            }

            //this._beforeOpenEditAddrDialogue = true;
            this._oMailEditPopup.open();
            this._showSuggestedAddr();
            this._validateInputAddr();
        };

        Controller.prototype._onEditTempAddrClick = function (oEvent) {
            var oEditMail = this.getView().getModel('oDtaAddrEdit'),
                oCompareEvnet = {mParameters: {checked: null}};

            oEditMail.setProperty('/AddrInfo', this.getView().getModel('oDataBuagAddrDetails').getProperty('/TempAddrInfo'));
            this.getView().getModel('oDataBuagAddrDetails').setProperty('/TempUpd', 'X');


            if (!this._oMailEditPopup) {
                this._oMailEditPopup = ute.ui.main.Popup.create({
                    close: this._handleEditMailPopupClose.bind(this),
                    content: sap.ui.xmlfragment(this.getView().sId, "nrg.module.bupa.view.AddrUpdateCaLvlPopUp", this),
                    title: 'Edit Mailing Address'
                });
                this.getView().addDependent(this._oMailEditPopup);
            }

            //Control what to or not to display
            this._cleanUpAddrEditPop();
            this.getView().getModel('oDtaAddrEdit').setProperty('/updateSent', false);
            this.getView().getModel('oDtaAddrEdit').setProperty('/showVldBtns', false);
            this.getView().getModel('oDtaAddrEdit').setProperty('/updateNotSent', true);
            this.getView().getModel('oDtaAddrEdit').setProperty('/bFixAddr', true);
            this.getView().byId('idEditMailAddr_UpdtBtn').setVisible(true);
            if (this.getView().byId('idSuggCompareCheck').getChecked()) {
                oCompareEvnet.mParameters.checked = false;
                this._compareSuggChkClicked(oCompareEvnet);
                this.getView().byId('idSuggCompareCheck').setChecked(false);
            }

            //this._beforeOpenEditAddrDialogue = true;
            this._oMailEditPopup.open();
            this._showSuggestedAddr();
            this._validateInputAddr();
        };


        Controller.prototype._handleEditMailPopupClose = function (oEvent) {
            this._initCaInfoConfigModel();
            this._initDataModel();
            this._initMailAddrModels();
        };


        Controller.prototype._compareSuggChkClicked = function (oEvent) {
            //this.getView().byId('idAddrUpdatePopup-l').getContent()[2].getContent()[0].getValue()
            var oLeftInputArea = this.getView().byId('idAddrUpdatePopup-l').getContent(),
                oRightSuggArea = this.getView().byId('idAddrUpdatePopup-r').getContent(),
                i;

            if (oEvent.mParameters.checked) {
                for (i = 1; i < 8; i = i + 1) {
                    if (oLeftInputArea[i].getContent()[0].getValue() !== oRightSuggArea[i].getContent()[0].getValue()) {
                        oLeftInputArea[i].getContent()[0].addStyleClass('nrgBupa-cusDataVerifyEditMail-lHighlight');
                        oRightSuggArea[i].getContent()[0].addStyleClass('nrgBupa-cusDataVerifyEditMail-rHighlight');
                    }
                }
            } else {
                for (i = 1; i < 8; i = i + 1) {
                    if (oLeftInputArea[i].getContent()[0].getValue() !== oRightSuggArea[i].getContent()[0].getValue()) {
                        oLeftInputArea[i].getContent()[0].removeStyleClass('nrgBupa-cusDataVerifyEditMail-lHighlight');
                        oRightSuggArea[i].getContent()[0].removeStyleClass('nrgBupa-cusDataVerifyEditMail-rHighlight');
                    }
                }
            }
        };

        Controller.prototype._onSMSButtonClicked = function (oEvent) {
            var oCurBpModel = this.getView().getModel('oDtaVrfyBP'),
                oCurCaModel = this.getView().getModel('oDtaVrfyBuags'),
                sSmsUrl = oCurBpModel.getProperty('/SMSUrl'),
                iCAstringIndex = sSmsUrl.indexOf('contractAccount=');


            sSmsUrl = sSmsUrl.substr(0, iCAstringIndex + 16) + oCurCaModel.getProperty('/ContractAccountID') + sSmsUrl.substr(iCAstringIndex + 16);
            window.open(sSmsUrl);
        };

        /********************************************************************************/

        Controller.prototype._formatDate = function (dob) {
            if (dob) {
                var oDateFormat = DateFormat.getInstance({pattern: "MM/dd/yyyy"});
                return oDateFormat.format(dob);
            }
        };

        Controller.prototype.onMailAddrUpdate = function () {
            var configModel = this.getView().getModel('oCaInfoConfig');
            configModel.setProperty('/mailAddrUpdateVisible', false);
            configModel.setProperty('/mailAddrSaveVisible', true);
            configModel.setProperty('/mailAddrEditable', true);
            configModel.setProperty('/mailAddrAddnewVisible', false);
            configModel.setProperty('/bAllBuagenabled', true);
        };

        Controller.prototype.onMailAddrAddnew = function () {
            var configModel = this.getView().getModel('oCaInfoConfig'),
                addrModel = this.getView().getModel('oDataBuagAddrDetails'),
                oEditAddrModel = this.getView().getModel('oDtaAddrEdit');

            configModel.setProperty('/mailAddrAddnewVisible', false);
            configModel.setProperty('/mailAddrUpdateVisible', false);
            configModel.setProperty('/mailAddrSaveVisible', true);
            configModel.setProperty('/mailAddrEditable', true);
            configModel.setProperty('/bAllBuagenabled', true);

            addrModel.setProperty('/FixAddrInfo/PoBox', '');
            addrModel.setProperty('/FixAddrInfo/Street', '');
            addrModel.setProperty('/FixAddrInfo/HouseNo', '');
            addrModel.setProperty('/FixAddrInfo/UnitNo', '');
            addrModel.setProperty('/FixAddrInfo/City', '');
            addrModel.setProperty('/FixAddrInfo/State', '');
            addrModel.setProperty('/FixAddrInfo/ZipCode', '');

            /*addrModel.setProperty('/FixAddrInfo/ValidFrom', '');
            addrModel.setProperty('/FixAddrInfo/ValidTo', '');*/

            oEditAddrModel.setProperty('/bCreateFirst', true);
        };

        Controller.prototype.onMailAddrCancel = function () {
            var configModel = this.getView().getModel('oCaInfoConfig'),
                addrModel = this.getView().getModel('oDataBuagAddrDetails');
            configModel.setProperty('/mailAddrUpdateVisible', true);
            configModel.setProperty('/mailAddrSaveVisible', false);
            configModel.setProperty('/mailAddrEditable', false);
            configModel.setProperty('/mailAddrAddnewVisible', true);
            configModel.setProperty('/bAllBuagenabled', false);

            addrModel.setData(jQuery.extend(true, {}, this.oDataBuagAddrDetailsBak));
        };

        Controller.prototype.onMailAddrSave = function () {
            var configModel = this.getView().getModel('oCaInfoConfig'),
                oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters;

            configModel.setProperty('/mailAddrUpdateVisible', true);
            configModel.setProperty('/mailAddrSaveVisible', false);
            configModel.setProperty('/mailAddrEditable', false);

            if (JSON.stringify(this.getView().getModel('oDataBuagAddrDetails').oData.results[0].MailingAddress) === JSON.stringify(this.oDataBuagAddrDetailsBak.results[0].MailingAddress)) {
                sap.ui.commons.MessageBox.alert("There is no change for Mailing Address.");
                return;
            }

            sPath = '/BuagAddrDetails(PartnerID=\'' + this._bpNum + '\',ContractAccountID=\'' + this._caNum + '\',FixedAddressID=\'' + this._fixedAddrID + '\')/';
            oParameters = {
                merge: false,
                success : function (oData) {
                    sap.ui.commons.MessageBox.alert("Mailing Address Update Success");
                    this.oDataBuagAddrDetailsBak = jQuery.extend(true, {}, this.getView().getModel('oDataBuagAddrDetails').getData());
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Mailing Address Update Failed");
                    this.getView().getModel('oDataBuagAddrDetails').setData(jQuery.extend(true, {}, this.oDataBuagAddrDetailsBak));
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, this.getView().getModel('oDataBuagAddrDetails').oData.results[0], oParameters);
            }
        };

        Controller.prototype.onTempAddrUpdate = function () {
            var configModel = this.getView().getModel('oCaInfoConfig');
            configModel.setProperty('/tempAddrAddnewVisible', false);
            configModel.setProperty('/tempAddrSaveVisible', true);
            configModel.setProperty('/tempAddrEditable', true);
        };

        Controller.prototype.onTempAddrCancel = function () {
            var configModel = this.getView().getModel('oCaInfoConfig'),
                addrModel = this.getView().getModel('oDataBuagAddrDetails');
            configModel.setProperty('/tempAddrAddnewVisible', true);
            configModel.setProperty('/tempAddrSaveVisible', false);
            configModel.setProperty('/tempAddrEditable', false);

            addrModel.setData(jQuery.extend(true, {}, this.oDataBuagAddrDetailsBak));
        };

        Controller.prototype.onTempAddrSave = function () {
            var configModel = this.getView().getModel('oCaInfoConfig'),
                oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters;

            configModel.setProperty('/tempAddrAddnewVisible', true);
            configModel.setProperty('/tempAddrSaveVisible', false);
            configModel.setProperty('/tempAddrEditable', false);

            if (JSON.stringify(this.getView().getModel('oDataBuagAddrDetails').oData.results[0].TemporaryAddress) === JSON.stringify(this.oDataBuagAddrDetailsBak.results[0].TemporaryAddress)) {
                sap.ui.commons.MessageBox.alert("There is no change for Temporary Address.");
                return;
            }

            sPath = '/BuagAddrDetails(PartnerID=\'' + this._bpNum + '\',ContractAccountID=\'' + this._caNum + '\',FixedAddressID=\'' + this._fixedAddrID + '\')/';
            oParameters = {
                merge: false,
                success : function (oData) {
                    sap.ui.commons.MessageBox.alert("Temporary Address Update Success");
                    this.oDataBuagAddrDetailsBak = jQuery.extend(true, {}, this.getView().getModel('oDataBuagAddrDetails').getData());
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Temporary Address Update Failed");
                    this.getView().getModel('oDataBuagAddrDetails').setData(jQuery.extend(true, {}, this.oDataBuagAddrDetailsBak));
                }.bind(this)
            };

            if (oModel) {
                oModel.update(sPath, this.getView().getModel('oDataBuagAddrDetails').oData.results[0], oParameters);
            }
        };

        Controller.prototype.onBackToDashboard = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum) {
                oRouter.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else {
                oRouter.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
            }
        };

        Controller.prototype._retrUrlHash = function () {
            //Get the hash to retrieve bp #
            var oHashChanger = new HashChanger(),
                sUrlHash = oHashChanger.getHash();

            return sUrlHash;
        };

        return Controller;
    }
);
