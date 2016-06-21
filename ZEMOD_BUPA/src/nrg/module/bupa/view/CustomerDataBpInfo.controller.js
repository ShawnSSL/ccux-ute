/*globals sap*/
/*globals ute*/
/*jslint nomen:true*/


sap.ui.define(
    [
        'jquery.sap.global',
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'sap/ui/core/format/DateFormat',
        'sap/ui/core/message/Message',
        'sap/ui/core/message/ControlMessageProcessor',
        'nrg/module/nnp/view/NNPPopup',
        'nrg/base/type/CellPhoneNumber',
        'nrg/base/type/EmailAddress',
        'nrg/base/type/SocialSecurityNumber',
        'nrg/base/type/DrivingLicenseNumber',
        'nrg/base/type/ZipCode'
    ],

    function (jQuery, Controller, Filter, FilterOperator, DateFormat, CoreMessage, CoreControlMessageProcessor, NNPPopup) {
        'use strict';

        var CustomController = Controller.extend('nrg.module.bupa.view.CustomerDataBpInfo');

        Controller.prototype.onBeforeRendering = function () {
            this.getOwnerComponent().getCcuxApp().setTitle('BUSINESS PARTNER');

            this.getView().setModel(this.getOwnerComponent().getModel('comp-bupa'), 'oODataSvc');
            this.getView().setModel(this.getOwnerComponent().getModel('comp-dropdown'), 'oODataDropdownSvc');

            //050192016 US State List Model for Address
            this.getView().setModel(this.getOwnerComponent().getModel('oStateListModel'), 'oUSStateList');

            // Model to track page edit/save status
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oBpInfoConfig');

            // Model to hold BP info
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBP');

            // Model to hold BpName
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpName');

            // Model to hold BpAddress
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpAddress');

            // Model to hold BpPersonal
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpPersonal');

            // Model to hold BpContact
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpContact');

            // Model to hold BpMarkPreferSet
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpMarkPreferSet');

            // Model to hold all titles
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpTitles');

            // Model to hold all acdemic titles
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'ODataBpAccTitles');

            // Model to hold all acdemic titles
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'ODataBpSuffixs');

            // Model to hold legal form
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataBpLegalForms');

            //Model to hold all phone types
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDayPhoneType');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEvnPhoneType');
            this._initPhnTypes();

            // Disable backspace key on this page
            jQuery(document).on("keydown", function (e) {
                if (e.which === 8 && !jQuery(e.target).is("input, textarea")) {
                    e.preventDefault();
                }
            });

            //Model to hold NNP logics
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEditEmailNNP');
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oEditEmailValidate');

            //Model to hold mailing/temp address
//            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDtaVrfyMailingTempAddr');    //not use this model, use 'oDataBpAddress'
            //Model for Edit Popup Screen (Use the model to show on edit screen)
            this.getView().setModel(new sap.ui.model.json.JSONModel(), 'oDataAddrEdit');

            this.getView().attachParseError(function (oEvent) {
                this._addMessage(oEvent, 'attachParseError: ' + oEvent.getParameter('message'), sap.ui.core.MessageType.Error);
            }.bind(this));

            this.getView().attachFormatError(function (oEvent) {
                this._addMessage(oEvent, 'attachFormatError: ' + oEvent.getParameter('message'), sap.ui.core.MessageType.Error);
            }.bind(this));

            this.getView().attachValidationError(function (oEvent) {
                this._addMessage(oEvent, 'attachValidationError: ' + oEvent.getParameter('message'), sap.ui.core.MessageType.Error);
            }.bind(this));

            this.getView().attachValidationSuccess(function (oEvent) {
                var oMessageManager, aMessage;

                oMessageManager = sap.ui.getCore().getMessageManager();
                aMessage = oMessageManager.getMessageModel().getData();
                if (aMessage && !jQuery.isEmptyObject(aMessage)) {
                    aMessage.forEach(function (oMessage) {
                        if (oMessage.target === [oEvent.getParameter('id'), oEvent.getParameter('property')].join('/')) {
                            oMessageManager.removeMessages(oMessage);
                        }
                    }.bind(this));
                }
            });
        };

        /* =========================================================== */
		/* lifecycle method- After Rendering                          */
		/* =========================================================== */
        CustomController.prototype.onAfterRendering = function () {
            // Retrieve routing parameters
            var oRouteInfo = this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();
            
            this._bpNum = oRouteInfo.parameters.bpNum;
            this._caNum = oRouteInfo.parameters.caNum;
            this._coNum = oRouteInfo.parameters.coNum;
            //this.getOwnerComponent().getCcuxApp().updateFooter(this._bpNum, this._caNum, this._coNum);
            // Initialize BP data
            this._initBPData();

            // Initialize BP config
            this._initBpConfig();
        };

        CustomController.prototype.onExit = function () {
            return undefined;
        };

        /*------------------------------------------------ Retrieve Methods -------------------------------------------------*/

        CustomController.prototype._initBPData = function () {
            this.getView().getModel('oDataBP').setProperty('/PartnerID', true);
            // Title Section
            // Do this._retrBpSuffixs() in the callback to keep the data alignment
            this._retrBpTitles(this._bpNum);
            this._retrBpAccTitles();
            this._retrBpSuffixs();
            // Address Section
            this._retrBpAddress(this._bpNum);
            // Personal Section & DNP Section (for organization type)
            // Do this._retrBpPersonal() in the callback to keep the data alignment
            this._retrReferralId();
            this._retrBpLegalForm();
            // Contact Section
            this._retrBpContact(this._bpNum);
            // Market Preference Section
            this._retrBpMarkPrefSet(this._bpNum);
        };

        /*--------------------- Title Section ---------------------*/

        Controller.prototype._retrBpTitles = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')/BpTitle/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.results) {
                        // Create a default empty entry
                        var emptyEntry = (JSON.parse(JSON.stringify(oData.results[0])));
                        emptyEntry.Key = '0000';
                        emptyEntry.Partner = '';
                        emptyEntry.PartnerID = '';
                        emptyEntry.Value = '';
                        oData.results.unshift(emptyEntry);

                        this.getView().getModel('oDataBpTitles').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrBpAccTitles = function () {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/BpAccTitles/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.results) {
                        // Create a default empty entry
                        var emptyEntry = (JSON.parse(JSON.stringify(oData.results[0])));
                        emptyEntry.Key = '0000';
                        emptyEntry.Partner = '';
                        emptyEntry.PartnerID = '';
                        emptyEntry.Value = '';
                        oData.results.unshift(emptyEntry);

                        this.getView().getModel('ODataBpAccTitles').setData(oData);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrBpSuffixs = function () {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/BpSuffixs/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.results) {
                        // Create a default empty 
                        var emptyEntry = (JSON.parse(JSON.stringify(oData.results[0])));
                        emptyEntry.Key = '0000';
                        emptyEntry.Partner = '';
                        emptyEntry.PartnerID = '';
                        emptyEntry.Value = '';
                        oData.results.unshift(emptyEntry);

                        this.getView().getModel('ODataBpSuffixs').setData(oData);
                        this._retrBpName(this._bpNum);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrBpName = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')/BpName/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.PartnerID) {
                        // Make the key of empty value as "0000", so that the dropdown can recognize it.
                        if (oData.Title === "") {
                            oData.Title = "0000";
                        }
                        if (oData.AcademicTitle === "") {
                            oData.AcademicTitle = "0000";
                        }
                        if (oData.Suffix === "") {
                            oData.Suffix = "0000";
                        }

                        this.getView().getModel('oDataBpName').setData(oData);
                        this.oDataBpNameBak = jQuery.extend(true, {}, oData);

                        // Determine BP type
                        if (oData.PartnerType === '1') {
                            this.getView().getModel('oDataBP').setProperty('/OrgBP', false);
                            this.getView().getModel('oDataBP').setProperty('/PsnBP', true);
                        } else {
                            this.getView().getModel('oDataBP').setProperty('/OrgBP', true);
                            this.getView().getModel('oDataBP').setProperty('/PsnBP', false);
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /*-------------------- Address Section --------------------*/

        Controller.prototype._retrBpAddress = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')/BpAddress/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        if (oData.results[0]) {
                            if (!this._addressID) {
                                this._addressID = oData.results[0].AddressID;
                            }
                            this.getView().getModel('oDataBpAddress').setData(oData.results[0]);
                            this.getView().getModel('oDataAddrEdit').setData(oData.results[0]);
                            this.oDataBpAddressBak = jQuery.extend(true, {}, oData);
                        }
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /*----------------- Personal & DNP Section ----------------*/

        Controller.prototype._retrBpLegalForm = function () {
            var oModel = this.getView().getModel('oODataDropdownSvc'),
                sPath = '/LegalFormS',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oDataBpLegalForms').setData(oData);
                        this._retrBpPersonal(this._bpNum);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrBpPersonal = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')/BpPersonal/',
                oParameters,
                that = this;

            oParameters = {
                success : function (oData) {
                    if (oData.PartnerID) {
                        this.getView().getModel('oDataBpPersonal').setData(oData);
                        this.oDataBpPersonalBak = jQuery.extend(true, {}, oData);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        Controller.prototype._retrReferralId = function () {
            var sPath = "/RefIdS('" + this._caNum + "')",
                oParameters = {
                    model : 'comp-bupa',
                    path : sPath
                };
            this.getView().byId('idBpInfoReferralIdNo_Edit').bindElement(oParameters);
        };

        /*--------------------- Contact Section -------------------*/

        Controller.prototype._retrBpContact = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')/BpContact/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.PartnerID) {
                        this.getView().getModel('oDataBpContact').setData(oData);
                        this.oDataBpContactBak = jQuery.extend(true, {}, oData);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /*---------------- Market Preference Section --------------*/

        Controller.prototype._retrBpMarkPrefSet = function (sBpNum) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath = '/Partners' + '(\'' + sBpNum + '\')/BpMarkPreferSet/',
                oParameters;

            oParameters = {
                success : function (oData) {
                    if (oData.results) {
                        this.getView().getModel('oDataBpMarkPreferSet').setData(oData);
                        this.oDataBpMarkPreferSetBak = jQuery.extend(true, {}, oData);
                    }
                }.bind(this),
                error: function (oError) {
                    // Need to put error message
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
        };

        /*------------------------------------------ Data Set Up & Update Methods -------------------------------------------*/

        CustomController.prototype._initBpConfig = function () {
            var oModel = this.getView().getModel('oBpInfoConfig'),
                oGlobalDataManager = this.getOwnerComponent().getGlobalDataManager();
            if (oGlobalDataManager.isREBS()) {
                oModel.setProperty('/isREBS', true);
            } else {
                oModel.setProperty('/isREBS', false);
            }
            // Title Section
            oModel.setProperty('/titleEditVisible', true);
            oModel.setProperty('/titleSaveVisible', false);
            oModel.setProperty('/titleEditable', false);
            // Address Section
            oModel.setProperty('/addrEditVisible', true);
            oModel.setProperty('/addrSaveVisible', false);
            oModel.setProperty('/addrEditable', false);
            // Personal Section
            oModel.setProperty('/personalInfoEditVisible', true);
            oModel.setProperty('/personalInfoSaveVisible', false);
            oModel.setProperty('/personalInfoSSEditable', false);
            oModel.setProperty('/personalInfoDLEditable', false);
            oModel.setProperty('/personalInfoEditable', false);
            // DNP Section (for organization type)
            oModel.setProperty('/dnpEditVisible', true);
            oModel.setProperty('/dnpSaveVisible', false);
            oModel.setProperty('/dnpEditable', false);
            // Contact Section
            oModel.setProperty('/contactInfoEditVisible', true);
            oModel.setProperty('/contactInfoSaveVisible', false);
            oModel.setProperty('/contactInfoEditable', false);
            // Market Preference Section
            oModel.setProperty('/marketPrefEditVisible', true);
            oModel.setProperty('/marketPrefSaveVisible', false);
            oModel.setProperty('/mktPrfEditable', false);
        };

        /*--------------------- Title Section ---------------------*/

        CustomController.prototype.onTitleEdit = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig');

            // Change editability
            oConfigModel.setProperty('/titleEditVisible', false);
            oConfigModel.setProperty('/titleSaveVisible', true);
            oConfigModel.setProperty('/titleEditable', true);
        };

        CustomController.prototype.onTitleSave = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oBpNameModel = this.getView().getModel('oDataBpName'),
                oModel = this.getView().getModel('oODataSvc'),
                sPath = '/BpNames' + '(\'' + this._bpNum + '\')',
                oParameters;

            // Display the loading indicator
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            // Restore editability
            oConfigModel.setProperty('/titleEditVisible', true);
            oConfigModel.setProperty('/titleSaveVisible', false);
            oConfigModel.setProperty('/titleEditable', false);
            // Check if there's any changes
            if (JSON.stringify(oBpNameModel.oData) === JSON.stringify(this.oDataBpNameBak)) {
                sap.ui.commons.MessageBox.alert("There is no change for Title/Name.");
                return;
            }
            // Make the key of empty value as "", so that the system can recognize it.
            if (oBpNameModel.oData.Title === "0000") { oBpNameModel.oData.Title = ""; }
            if (oBpNameModel.oData.AcademicTitle === "0000") { oBpNameModel.oData.AcademicTitle = ""; }
            if (oBpNameModel.oData.Suffix === "0000") { oBpNameModel.oData.Suffix = ""; }
            // Update changes
            oParameters = {
                merge: false,
                success : function (oData) {
                    sap.ui.commons.MessageBox.alert("Title/Name Update Success");
                    // Get the latest BP name info
                    this._retrBpName(this._bpNum);
                    // Dismiss the loading indicator
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Title/Name Update Failed");
                    // If save failed, roll back to previous value
                    oBpNameModel.setData(jQuery.extend(true, {}, this.oDataBpNameBak));
                    // Dismiss the loading indicator
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.update(sPath, oBpNameModel.oData, oParameters);
            }
        };

        CustomController.prototype.onTitleCancel = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oBpNameModel = this.getView().getModel('oDataBpName');

            // Restore editability
            oConfigModel.setProperty('/titleEditVisible', true);
            oConfigModel.setProperty('/titleSaveVisible', false);
            oConfigModel.setProperty('/titleEditable', false);
            // Make the key of empty value as "0000", so that the dropdown can recognize it.
            if (this.oDataBpNameBak.Title === "") { this.oDataBpNameBak.Title = "0000"; }
            if (this.oDataBpNameBak.AcademicTitle === "") { this.oDataBpNameBak.AcademicTitle = "0000"; }
            if (this.oDataBpNameBak.Suffix === "") { this.oDataBpNameBak.Suffix = "0000"; }
            // Roll back to previous value
            oBpNameModel.setData(jQuery.extend(true, {}, this.oDataBpNameBak));
        };

        /*-------------------- Address Section --------------------*/

        CustomController.prototype.onAddrEdit = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig');
            
            // Change editability
            oConfigModel.setProperty('/addrEditVisible', false);
            oConfigModel.setProperty('/addrSaveVisible', true);
            oConfigModel.setProperty('/addrEditable', true);
        };

        CustomController.prototype.onAddrSave = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oBpMailModel = this.getView().getModel('oDataAddrEdit'),
                oBpAddrModel = this.getView().getModel('oDataBpAddress'),
                oModel = this.getView().getModel('oODataSvc'),
                sPath = '/BpAddresses',
                oParameters,
                aFilters = this._createAddrValidateFilters(),
                tempObj2;

            // Restore editability
            oConfigModel.setProperty('/addrEditVisible', true);
            oConfigModel.setProperty('/addrSaveVisible', false);
            oConfigModel.setProperty('/addrEditable', false);
            // Check if there's any changes
            if (JSON.stringify(oBpAddrModel.oData) === JSON.stringify(this.oDataBpAddressBak.results[0])) {
                sap.ui.commons.MessageBox.alert("There is no change for Address.");
                return;
            }

            oBpMailModel.setProperty('/', oBpAddrModel.getProperty('/'));

            oParameters = {
                filters: aFilters,
                success: function (oData) {
                    if (oData.AddrChkValid === 'X') {
                        //Validate success, update the address directly
                        tempObj2 = oBpAddrModel.getProperty('/');
                        delete tempObj2.showVldBtns;
                        delete tempObj2.updateNotSent;
                        delete tempObj2.updateSent;
                        delete tempObj2.SuggAddrInfo;
                        this._updateMailingAddr();
                    } else {
                        //oMailEdit.setProperty('/AddressInfo', oData.AddressInfo);
                        if (!this._oMailEditPopup) {
                            var oDialogFragment = sap.ui.xmlfragment("AddressUpdate", "nrg.module.bupa.view.AddrUpdatePopup", this);
                            this._oMailEditPopup = ute.ui.main.Popup.create({
                                close: this._handleEditMailPopupClose,
                                content: oDialogFragment,
                                title: 'Edit Mailing Address'
                            });
                            this.getView().addDependent(this._oMailEditPopup);
                        }
                        this._oMailEditPopup.open();
                        this._showSuggestedAddr();
                        //oMailEdit.setProperty('/AddressInfo', oData.results[0].AddressInfo);
                        oBpMailModel.setProperty('/SuggAddrInfo', oData.results[0].TriCheck);
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

        CustomController.prototype.onAddrCancel = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oBPAddrModel = this.getView().getModel('oDataBpAddress');
            
            // Restore editability
            oConfigModel.setProperty('/addrEditVisible', true);
            oConfigModel.setProperty('/addrSaveVisible', false);
            oConfigModel.setProperty('/addrEditable', false);
            // Roll back to previous value
            oBPAddrModel.setData(jQuery.extend(true, {}, this.oDataBpAddressBak.results[0]));
        };

        /*-------------------- Personal Section -------------------*/

        CustomController.prototype.onPersonalInfoEdit = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oBpPersonalInfoModel = this.getView().getModel('oDataBpPersonal');
            oConfigModel.setProperty('/personalInfoEditVisible', false);
            oConfigModel.setProperty('/personalInfoSaveVisible', true);

            // Editability
            oConfigModel.setProperty('/personalInfoEditable', true);

            if (oBpPersonalInfoModel.getData().SSN === '') {
                oConfigModel.setProperty('/personalInfoSSEditable', true);
            }

            if (oBpPersonalInfoModel.getData().DL === '') {
                oConfigModel.setProperty('/personalInfoDLEditable', true);
            }
        };

        CustomController.prototype.onPersonalInfoSave = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oModel = this.getView().getModel('oODataSvc'),
                bpPersonalModel = this.getView().getModel('oDataBpPersonal'),
                sPath,
                oParameters,
                bpNumber = this._bpNum;

            oConfigModel.setProperty('/personalInfoEditVisible', true);
            oConfigModel.setProperty('/personalInfoSaveVisible', false);
            
            // Editability
            oConfigModel.setProperty('/personalInfoSSEditable', false);
            oConfigModel.setProperty('/personalInfoDLEditable', false);
            oConfigModel.setProperty('/personalInfoEditable', false);

            if (JSON.stringify(bpPersonalModel.oData) === JSON.stringify(this.oDataBpPersonalBak)) {
                sap.ui.commons.MessageBox.alert("There is no change for Personal Info.");
                return;
            }

            // Flag SSN update
            if (bpPersonalModel.oData.SSN !== this.oDataBpPersonalBak.SSN) {
                bpPersonalModel.oData.SSNUpd = 'X';
            }
            // Flag DL update
            if (bpPersonalModel.oData.DL !== this.oDataBpPersonalBak.DL) {
                bpPersonalModel.oData.DLUpd = 'X';
            }
            // Flag PIN update
            if (bpPersonalModel.oData.PIN !== this.oDataBpPersonalBak.PIN) {
                bpPersonalModel.oData.PINUpd = 'X';
            }
            // Flag TaxID update
            if (bpPersonalModel.oData.TaxID !== this.oDataBpPersonalBak.TaxID) {
                bpPersonalModel.oData.TaxIDUpd = 'X';
            }

            sPath = '/BpPersonals' + '(\'' + bpNumber + '\')';
            oParameters = {
                merge: false,
                success : function (oData) {
                    sap.ui.commons.MessageBox.alert("Personal Info Update Success");
                    this._retrBpPersonal(bpNumber);
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Personal Info Update Failed");
                }.bind(this)
            };

            if (oModel) {
                oModel.update(sPath, this.getView().getModel('oDataBpPersonal').oData, oParameters);
            }
        };

        CustomController.prototype.onPersonalInfoCancel = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                bpPersonalModel = this.getView().getModel('oDataBpPersonal');
            oConfigModel.setProperty('/personalInfoEditVisible', true);
            oConfigModel.setProperty('/personalInfoSaveVisible', false);

            // Editability
            oConfigModel.setProperty('/personalInfoSSEditable', false);
            oConfigModel.setProperty('/personalInfoDLEditable', false);
            oConfigModel.setProperty('/personalInfoEditable', false);


            bpPersonalModel.setData(jQuery.extend(true, {}, this.oDataBpPersonalBak));
        };

        /*------------------- DNP Release Section -----------------*/

        // DNP doesn't have update functionality

        /*--------------------- Contact Section -------------------*/

        CustomController.prototype.onContactInfoEdit = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig');
            oConfigModel.setProperty('/contactInfoEditVisible', false);
            oConfigModel.setProperty('/contactInfoSaveVisible', true);
            oConfigModel.setProperty('/contactInfoEditable', true);
        };

        CustomController.prototype.onContactInfoSave = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                bpNumber = this._bpNum,
                oGlobalDataManager = this.getOwnerComponent().getGlobalDataManager();

            oConfigModel.setProperty('/contactInfoEditVisible', true);
            oConfigModel.setProperty('/contactInfoSaveVisible', false);
            oConfigModel.setProperty('/contactInfoEditable', false);

            if (JSON.stringify(this.getView().getModel('oDataBpContact').oData) === JSON.stringify(this.oDataBpContactBak)) {
                sap.ui.commons.MessageBox.alert("There is no change for Contact Info.");
                return;
            }

            if (oGlobalDataManager.isREBS()) {
                this.getView().getModel('oDataBpContact').oData.IsRebs = true;
            } else {
                this.getView().getModel('oDataBpContact').oData.IsRebs = false;
            }
            sPath = '/BpContacts' + '(\'' + bpNumber + '\')';
            oParameters = {
                merge: false,
                success : function (oData) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Customer data update ',
                        message: 'Contact Info Update Success'
                    });
                    //sap.ui.commons.MessageBox.alert("Contact Info Update Success");
                    this._retrBpContact(bpNumber);
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    ute.ui.main.Popup.Alert({
                        title: 'Customer data update ',
                        message: 'Contact Info Update Failed'
                    });
                }.bind(this)
            };

            if (oModel) {
                this.getOwnerComponent().getCcuxApp().setOccupied(true);
                oModel.update(sPath, this.getView().getModel('oDataBpContact').oData, oParameters);
            }
        };

        CustomController.prototype.onContactInfoCancel = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                bpContactModel = this.getView().getModel('oDataBpContact');
            oConfigModel.setProperty('/contactInfoEditVisible', true);
            oConfigModel.setProperty('/contactInfoSaveVisible', false);
            oConfigModel.setProperty('/contactInfoEditable', false);

            bpContactModel.setData(jQuery.extend(true, {}, this.oDataBpContactBak));
        };

        /*---------------- Market Preference Section --------------*/

        CustomController.prototype.onMarketPrefEdit = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig');
            oConfigModel.setProperty('/marketPrefEditVisible', false);
            oConfigModel.setProperty('/marketPrefSaveVisible', true);
            oConfigModel.setProperty('/mktPrfEditable', true);
        };

        CustomController.prototype.onMarketPrefSave = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                oModel = this.getView().getModel('oODataSvc'),
                bpNumber = this._bpNum,
                sPath,
                attibuteSet,
                attribute,
                i,
                aPathUpdateReq = [],
                oTempUpdate;

            oConfigModel.setProperty('/marketPrefEditVisible', true);
            oConfigModel.setProperty('/marketPrefSaveVisible', false);
            oConfigModel.setProperty('/mktPrfEditable', false);


            for (i = 0; i < this.getView().getModel('oDataBpMarkPreferSet').oData.results.length; i = i + 1) {
                if (JSON.stringify(this.getView().getModel('oDataBpMarkPreferSet').oData.results[i]) !== JSON.stringify(this.oDataBpMarkPreferSetBak.results[i])) {
                    attibuteSet = this.getView().getModel('oDataBpMarkPreferSet').getProperty('/results/' + i.toString() + '/AttributeSet');
                    attribute = this.getView().getModel('oDataBpMarkPreferSet').getProperty('/results/' + i.toString() + '/Attribute');

                    oTempUpdate = {};
                    oTempUpdate.iIndex = i;
                    oTempUpdate.sPath = '/BpMarkPrefers' + '(PartnerID=\'' + bpNumber + '\',AttributeSet=\'' + attibuteSet + '\',Attribute=\'' + attribute + '\')';
                    aPathUpdateReq.push(oTempUpdate);
                }
            }


            if (aPathUpdateReq.length > 0) {
                this._updateSingleMarketPref(aPathUpdateReq, 0);
            }
        };

        CustomController.prototype.onMarketPrefCancel = function () {
            var oConfigModel = this.getView().getModel('oBpInfoConfig'),
                bpMarkPrefModel = this.getView().getModel('oDataBpMarkPreferSet');
            oConfigModel.setProperty('/marketPrefEditVisible', true);
            oConfigModel.setProperty('/marketPrefSaveVisible', false);
            oConfigModel.setProperty('/mktPrfEditable', false);

            bpMarkPrefModel.setData(jQuery.extend(true, {}, this.oDataBpMarkPreferSetBak));
        };

        CustomController.prototype._getMessageProcessor = function () {
            if (!this._oControlMessageProcessor) {
                this._oControlMessageProcessor = new CoreControlMessageProcessor();
            }

            return this._oControlMessageProcessor;
        };

        CustomController.prototype._addMessage = function (oEvent, sMsg, sType) {
            var oMsg = new CoreMessage({
                message: sMsg,
                type: sType,
                target: [oEvent.getParameter('id'), oEvent.getParameter('property')].join('/'),
                processor: this._getMessageProcessor()
            });

            sap.ui.getCore().getMessageManager().addMessages(oMsg);
        };

        CustomController.prototype.onBackToDashboard = function () {
            var oRouter = this.getOwnerComponent().getRouter();

            if (this._coNum) {
                oRouter.navTo('dashboard.VerificationWithCaCo', {bpNum: this._bpNum, caNum: this._caNum, coNum: this._coNum});
            } else if (this._caNum) {
                oRouter.navTo('dashboard.VerificationWithCa', {bpNum: this._bpNum, caNum: this._caNum});
            } else {
                oRouter.navTo('dashboard.Verification', {bpNum: this._bpNum});
            }
        };

        

    

        Controller.prototype._handleMailingAddrUpdate = function (oEvent) {
            this.onAddrSave();
        };





    

        Controller.prototype._updateSingleMarketPref = function (aAllMktPref, iIndex) {
            var oModel = this.getView().getModel('oODataSvc'),
                oParameters,
                bpNumber = this._bpNum,
                oPayload = {};

            oParameters = {
                merge: false,
                success : function (oData) {
                    if (iIndex < aAllMktPref.length - 1) {
                        this._updateSingleMarketPref(aAllMktPref, iIndex + 1);
                    } else {
                        this._retrBpMarkPrefSet(bpNumber);
                        sap.ui.commons.MessageBox.alert("Market Preference Update Success");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Market Preference Update Failed");
                }.bind(this)
            };

            oPayload = this.getView().getModel('oDataBpMarkPreferSet').oData.results[aAllMktPref[iIndex].iIndex];
            delete oPayload.Partner;
            delete oPayload.__metadata;

            if (oModel) {
                oModel.update(aAllMktPref[iIndex].sPath, oPayload, oParameters);
            }

        };
        /*if (oModel) {
                        oModel.update(sPath, this.getView().getModel('oDataBpMarkPreferSet').oData.results[i], oParameters);
                    }*/
        /*
                if (JSON.stringify(this.getView().getModel('oDataBpMarkPreferSet').oData.results[i]) === JSON.stringify(this.oDataBpMarkPreferSetBak.results[i])) {
                    //sap.ui.commons.MessageBox.alert("There is no change for Market Perference index: " + i.toString());
                } else {
                    attibuteSet = this.getView().getModel('oDataBpMarkPreferSet').getProperty('/results/' + i.toString() + '/AttributeSet');
                    attribute = this.getView().getModel('oDataBpMarkPreferSet').getProperty('/results/' + i.toString() + '/Attribute');

                    oTempUpdate.iIndex = i;
                    oTempUpdate.sPath = '/BpMarkPrefers' + '(PartnerID=\'' + bpNumber + '\',AttributeSet=\'' + attibuteSet + '\',Attribute=\'' + attribute + '\')';
                    aPathUpdateReq.push(oTempUpdate);

                    if (oModel) {
                        oModel.update(sPath, this.getView().getModel('oDataBpMarkPreferSet').oData.results[i], oParameters);
                    }
                }*/

        //20160621 take out code not in use by HJL
        /*Controller.prototype._retrUrlHash = function () {
            //Get the hash to retrieve bp #
            var oHashChanger = new HashChanger(),
                sUrlHash = oHashChanger.getHash();

            return sUrlHash;
        };*/

        Controller.prototype._initPhnTypes = function () {
            var oDayPhnType = this.getView().getModel('oDayPhoneType'),
                oEvnPhnType = this.getView().getModel('oEvnPhoneType'),
                oTypes = [],
                oEvnTypes = [];


            oTypes = [ {Key: "WORK", Type: "LANDLINE"}, {Key: "CELL", Type: "CELL"}];
            oEvnTypes = [ {Key: "HOME", Type: "LANDLINE"}, {Key: "CELL", Type: "CELL"}];

            oDayPhnType.setProperty('/', oTypes);
            oEvnPhnType.setProperty('/', oEvnTypes);
        };


        Controller.prototype.onYesSelected = function (oEvent) {
            var sPath, index, oMarkPrefModel, data;
            sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.oDataBpMarkPreferSet.sPath;
            index = parseInt(sPath.split('/')[2], 10);
            oMarkPrefModel = this.getView().getModel('oDataBpMarkPreferSet');
            data = oMarkPrefModel.getData();
            if (data.results[index].Value === 'Y') {
                data.results[index].Value = '';
            } else {
                data.results[index].Value = 'Y';
            }
            oMarkPrefModel.setData(data);
        };

        Controller.prototype.onNoSelected = function (oEvent) {
            var sPath, index, oMarkPrefModel, data;
            sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.oDataBpMarkPreferSet.sPath;
            index = parseInt(sPath.split('/')[2], 10);
            oMarkPrefModel = this.getView().getModel('oDataBpMarkPreferSet');
            data = oMarkPrefModel.getData();
            if (data.results[index].Value === 'N') {
                data.results[index].Value = '';
            } else {
                data.results[index].Value = 'N';
            }
            oMarkPrefModel.setData(data);
        };

        Controller.prototype._showSuggestedAddr = function () {
            this.getView().getModel('oDataAddrEdit').setProperty('/updateSent', true);
            this.getView().getModel('oDataAddrEdit').setProperty('/showVldBtns', true);
            this.getView().getModel('oDataAddrEdit').setProperty('/updateNotSent', false);
        };

        Controller.prototype._createAddrValidateFilters = function () {
            var aFilters = [],
                oFilterTemplate,
//                sBpNum = this.getView().getModel('oDtaVrfyMailingTempAddr').getProperty('/PartnerID'),
                sBpNum = this._bpNum,
                oMailEdit = this.getView().getModel('oDataAddrEdit'),
                oMailEditAddrInfo = oMailEdit.getProperty('/AddressInfo'),
                key,
                //bFixAddr = oMailEdit.getProperty('/bFixAddr'),
                tempPath;

            /*
            if (bFixAddr) {
                oFilterTemplate = new Filter({ path: 'FixUpd', operator: FilterOperator.EQ, value1: 'X'});
                aFilters.push(oFilterTemplate);
            } else {
                oFilterTemplate = new Filter({ path: 'TempUpd', operator: FilterOperator.EQ, value1: 'X'});
                aFilters.push(oFilterTemplate);
            }*/

            oFilterTemplate = new Filter({ path: 'PartnerID', operator: FilterOperator.EQ, value1: sBpNum});
            aFilters.push(oFilterTemplate);

            oFilterTemplate = new Filter({ path: 'ChkAddr', operator: FilterOperator.EQ, value1: 'X'});
            aFilters.push(oFilterTemplate);

            for (key in oMailEditAddrInfo) {
                if (oMailEditAddrInfo.hasOwnProperty(key)) {
                    if (!(key === '__metadata' || key === 'StandardFlag' || key === 'ShortForm' || key === 'ValidFrom' || key === 'ValidTo' || key === 'Supplement')) {
                        tempPath = 'AddressInfo/' + key;
                        oFilterTemplate = new Filter({ path: tempPath, operator: FilterOperator.EQ, value1: oMailEditAddrInfo[key]});
                        aFilters.push(oFilterTemplate);

                    }
                }
            }

            return aFilters;
        };

        Controller.prototype._updateMailingAddr = function () {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                sBpNum = this._bpNum,
                sFixedAddressID = this._addressID;

            sPath = '/BpAddresses' + '(PartnerID=\'' + sBpNum + '\',AddressID=\'' + sFixedAddressID + '\')';

            oParameters = {
                urlParameters: {},
                success : function (oData) {
                    sap.ui.commons.MessageBox.alert("Address Update Success");
                    this._retrBpAddress(sBpNum);
                    this._oMailEditPopup.close();
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Address Update Failed");
                }.bind(this)
            };

            if (oModel) {
                oModel.update(sPath, this.getView().getModel('oDataBpAddress').oData, oParameters);
            }
        };

        Controller.prototype._onPoBoxEdit = function (oEvent) {
            this.getView().byId('idEditHouseNum').setValue('');
            this.getView().byId('idEditStName').setValue('');
        };

        Controller.prototype._onBpInfoPoBoxEdit = function (oEvent) {
            this.getView().byId('idBpInfoStreet_Edit').setValue('');
            this.getView().byId('idBpInfoHouseNo_Edit').setValue('');
        };

        Controller.prototype._onRegAddrEdit = function (oEvent) {
            this.getView().byId('idEditPoBox').setValue('');
        };

        Controller.prototype._onBpInfoRegAddrEdit = function (oEvent) {
            this.getView().byId('idBpInfoPobox_Edit').setValue('');
        };

        Controller.prototype._compareSuggChkClicked = function (oEvent) {
            var oLeftInputArea = this._oMailEditPopup.getContent()[0].getContent()[1].getContent(),
                oRightSuggArea = this._oMailEditPopup.getContent()[0].getContent()[2].getContent(),
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

        Controller.prototype._handleMailingAcceptBtn = function (oEvent) {
            var oMailEdit = this.getView().getModel('oDataAddrEdit'),
                oMailTempModel = this.getView().getModel('oDataBpAddress'),    //replace oDtaVrfyMailingTempAddr with oDataBpAddress because we submit 'oDataBpAddress' in updating call
                tempObj,
                tempObj2,
                key;

            tempObj = oMailEdit.getProperty('/SuggAddrInfo');
            delete tempObj.HeaderText1;
            delete tempObj.HeaderText2;
            delete tempObj.FooterLine1;
            delete tempObj.FooterLine2;
            delete tempObj.FooterLine3;
            tempObj2 = oMailTempModel.getProperty('/');
            delete tempObj2.showVldBtns;
            delete tempObj2.updateNotSent;
            delete tempObj2.updateSent;
            delete tempObj2.SuggAddrInfo;



            for (key in tempObj) {
                if (tempObj.hasOwnProperty(key)) {
                    if (!(key === '__metadata' || key === 'StandardFlag' || key === 'Supplement')) {
                        oMailTempModel.setProperty('/AddressInfo/' + key, tempObj[key]);
                    }
                }
            }

            this._updateMailingAddr();
        };

        Controller.prototype._handleMailingDeclineBtn = function (oEvent) {
            var oMailEdit = this.getView().getModel('oDataAddrEdit'),
                oMailTempModel = this.getView().getModel('oDataBpAddress'), //replace oDtaVrfyMailingTempAddr with oDataBpAddress because we submit 'oDataBpAddress' in updating call
                tempObj,
                tempObj2;

            tempObj = oMailEdit.getProperty('/AddressInfo');
            tempObj2 = oMailTempModel.getProperty('/');
            delete tempObj2.showVldBtns;
            delete tempObj2.updateNotSent;
            delete tempObj2.updateSent;
            delete tempObj2.SuggAddrInfo;

            oMailTempModel.setProperty('/AddressInfo', tempObj);

            this._updateMailingAddr();
        };

        Controller.prototype._handleMailingEditBtn = function (oEvent) {
            var oEditMail = this.getView().getModel('oDataAddrEdit');

            //oEditMail.setProperty('/updateSent', false);
            oEditMail.setProperty('/showVldBtns', false);
            oEditMail.setProperty('/updateNotSent', true);
        };

        Controller.prototype._formatLanguage = function (sLanguage) {
            if (sLanguage === 'E' || sLanguage === 'e') {
                return 'EN';
            } else if (sLanguage === 'S' || sLanguage === 's') {
                return 'SP';
            } else {
                return 'N/A';
            }
        };

        Controller.prototype._formatDate = function (dob) {
            if (dob) {
                var oDateFormat = DateFormat.getInstance({pattern: "MM/dd/yyyy"});
                return oDateFormat.format(dob);
            }
        };

        Controller.prototype._formatBooleanY = function (bPref) {
            if (bPref === 'Y') {
                return true;
            } else {
                return false;
            }

        };

        Controller.prototype._formatBooleanN = function (bPref) {
            if (bPref === 'N') {
                return true;
            } else {
                return false;
            }

        };

        Controller.prototype._formatGreenCheck = function (sIndicator) {
            if (sIndicator === 'x' || sIndicator === 'X') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._formatRedX = function (sIndicator, sDLSSN) {
            if (sDLSSN) {
                if (sIndicator === 'x' || sIndicator === 'X') {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        };
        /*************************************************************************************************************/
        /*Email Edit NNP logic*/
        Controller.prototype._formatEmailAddressText = function (sEmail) {
            if ((sEmail === '') || (sEmail === undefined)) {
                return ' ';
            } else {
                return sEmail;
            }
        };

        Controller.prototype._formatEmailMkt = function (sIndicator) {
            if (sIndicator === 'y' || sIndicator === 'Y') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._formatPositiveX = function (sIndicator) {
            if (sIndicator === 'x' || sIndicator === 'X') {
                return true;
            } else {
                return false;
            }
        };

        Controller.prototype._formatNegativeX = function (sIndicator) {
            if (sIndicator === 'x' || sIndicator === 'X') {
                return false;
            } else {
                return true;
            }
        };

        Controller.prototype._handleNnpClose = function () {
            var sBpNum = this._bpNum,
                oConfigModel = this.getView().getModel('oBpInfoConfig');

            //this._retrBpContact(sBpNum);
            //oConfigModel.setProperty('/contactInfoEditVisible', true);
            //oConfigModel.setProperty('/contactInfoSaveVisible', false);
            //oConfigModel.setProperty('/contactInfoEditable', true);
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
            this._retrBpMarkPrefSet(sBpNum);
            this.getOwnerComponent().getCcuxApp().setOccupied(false);
        };

        Controller.prototype._handleEmailEdit = function (oEvent) {
            var sBpNum = this._bpNum,
                sBpEmail = this.getView().getModel('oDataBpContact').getProperty('/Email'),
                sBpEmailConsum = this.getView().getModel('oDataBpContact').getProperty('/EmailConsum'),
                NNPPopupControl = new NNPPopup();


            NNPPopupControl.attachEvent("NNPCompleted", this._handleNnpClose, this);
            this.getView().addDependent(NNPPopupControl);
            NNPPopupControl.openNNP(sBpNum, sBpEmail, sBpEmailConsum);


            
                //oModel = this.getView().getModel('oODataSvc'),
                //oParameters,
                //sPath,
                //oNNP = this.getView().getModel('oEditEmailNNP'),
                //oEmailBox,
                //oDelEmailBox;

            /*
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            

            //Start loading NNP logics and settings
            sPath = '/EmailNNPs' + '(' + 'PartnerID=\'' + sBpNum + '\'' + ',Email=\'' + sBpEmail + '\'' + ',EmailConsum=\'' + sBpEmailConsum + '\')';
            
            //Preapre Popup for Email Edit to show
            if (!this._oPopupContent) {
                this._oPopupContent = sap.ui.xmlfragment(this.getView().sId, "nrg.module.bupa.view.CustomerVerificationPopup", this);
            }

            oEmailBox = sap.ui.core.Fragment.byId(this.getView().sId, "idnrgDB-EmailBox");
            oDelEmailBox = sap.ui.core.Fragment.byId(this.getView().sId, "idnrgDB-DelEmailBox");
            oEmailBox.setVisible(true);
            oDelEmailBox.setVisible(false);

            //this.getView().byId("idBpInfoEmailEditPopup").setVisible(true);
            if(!this._oEmailEditPopup) {
                this._oEmailEditPopup = ute.ui.main.Popup.create({
                    //close: this._handleEditMailPopupClose,
                    content: this._oPopupContent,
                    title: 'Email Address and Preferences'
                });
                this._oEmailEditPopup.setShowCloseButton(false);
                this.getView().addDependent(this._oEmailEditPopup);
                this._oEmailEditPopup.open();
            } else {
                this._oEmailEditPopup.open();
            }



            oParameters = {
                success : function (oData) {
                    if (oData) {
                        oNNP.setData(oData);
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    }
                }.bind(this),
                error: function (oError) {
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    sap.ui.commons.MessageBox.alert("NNP Entity Service Error");
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }*/
        };

        Controller.prototype._onValidateEmailAddress = function (oEvent) {
            var oEmailValidate = this.getView().getModel('oEditEmailValidate'),
                oModel = this.getView().getModel('oODataSvc'),
                oParameters,
                sPath,
                sEmailAddr = this.getView().getModel('oEditEmailNNP').getProperty('/Email');
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            sPath = '/EmailVerifys' + '(\'' + sEmailAddr + '\')';

            oParameters = {
                success : function (oData) {
                    if (oData) {
                        oEmailValidate.setData(oData);
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Email Validate Service Error");
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }

        };

        Controller.prototype._onEditEmailSave = function (oEvent) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                sBpNum = this.getView().getModel('oEditEmailNNP').getProperty('/PartnerID'),
                sBpEmail = this.getView().getModel('oEditEmailNNP').getProperty('/Email'),
                sBpEmailConsum = this.getView().getModel('oEditEmailNNP').getProperty('/EmailConsum'),
                oNNP = this.getView().getModel('oEditEmailNNP'),
                bEmailChanged = true,
                oConfigModel = this.getView().getModel('oBpInfoConfig');
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            if (sBpEmail === this.getView().getModel('oDataBpContact').getProperty('/Email')) {
                bEmailChanged = false;
            } else {
                bEmailChanged = true;
            }


            if (sBpEmailConsum === '000') {   //If it is 'CREATE'
                sPath = '/EmailNNPs' + '(' + 'PartnerID=\'' + sBpNum + '\'' + ',Email=\'' + sBpEmail + '\'' + ',EmailConsum=\'\')';
                oNNP.setProperty('/EmailConsum', '');
            } else {    //If it is 'UPDATE'
                sPath = '/EmailNNPs' + '(' + 'PartnerID=\'' + sBpNum + '\'' + ',Email=\'' + sBpEmail + '\'' + ',EmailConsum=\'' + sBpEmailConsum + '\')';
            }


            oParameters = {
                merge: false,
                success : function (oData) {
                    if (bEmailChanged) {
                        sap.ui.commons.MessageBox.alert(oNNP.getProperty('/LdapMessage'));
                    } else {
                        sap.ui.commons.MessageBox.alert('Marketing Preference Updated Successfully');
                    }
                    this._oEmailEditPopup.close();
                    this._retrBpContact(sBpNum);
                    oConfigModel.setProperty('/contactInfoEditVisible', true);
                    oConfigModel.setProperty('/contactInfoSaveVisible', false);
                    oConfigModel.setProperty('/contactInfoEditable', false);
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    this._retrBpMarkPrefSet(sBpNum);
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Update Failed");
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.update(sPath, oNNP.oData, oParameters);
            }
        };

        Controller.prototype._onEditEmailDelete = function (oEvent) {
            var oModel = this.getView().getModel('oODataSvc'),
                sPath,
                oParameters,
                sBpNum = this.getView().getModel('oEditEmailNNP').getProperty('/PartnerID'),
                //sBpEmailConsum = this.getView().getModel('oDtaVrfyBP').getProperty('/EmailConsum');
                oNNP = this.getView().getModel('oEditEmailNNP'),
                oConfigModel = this.getView().getModel('oBpInfoConfig');

            sPath = '/EmailNNPs' + '(' + 'PartnerID=\'' + sBpNum + '\'' + ',Email=\'\'' + ',EmailConsum=\'\')';
            this.getOwnerComponent().getCcuxApp().setOccupied(true);

            oParameters = {
                success : function (oData) {
                    //sap.ui.commons.MessageBox.alert('Email Successfully Removed');
                   // sap.ui.commons.MessageBox.alert("CONFIRMATION NEEDED: I just want to make sure you're aware that deleting email address will remove you from any Internet-based services we offer, including Online Account Management, online bill payment and Paperless Billing, and that all your bills and accounts notices will be sent via regular mail. Are you sure you want to do this? ");
                    this._oEmailEditPopup.close();
                    this._retrBpContact(sBpNum);
                    this._retrBpMarkPrefSet(sBpNum);
                    oConfigModel.setProperty('/contactInfoEditVisible', true);
                    oConfigModel.setProperty('/contactInfoSaveVisible', false);
                    oConfigModel.setProperty('/contactInfoEditable', false);
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("Update Failed");
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    this._oEmailEditPopup.close();
                }.bind(this)
            };

            if ((oNNP.getProperty('/Ecd') === 'Y') || (oNNP.getProperty('/Mkt') === 'Y') || (oNNP.getProperty('/Offer') === 'Y') || (oNNP.getProperty('/Ee') === 'Y')) {
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
                sap.ui.commons.MessageBox.alert("Cannot delete email when preferences set to YES.");
                return;
            } else {
                if (oModel) {
                    oModel.remove(sPath, oParameters);
                }
            }
        };

        Controller.prototype._onMktPrefTogg = function (oEvent) {
            var oNNP = this.getView().getModel('oEditEmailNNP');

            if (oEvent.mParameters.id.indexOf('ctaddr') > 0) {
                if (oEvent.getSource().getLeftSelected()) {
                    oNNP.setProperty('/Ecd', 'Y');
                } else {
                    oNNP.setProperty('/Ecd', 'N');
                }
            } else if (oEvent.mParameters.id.indexOf('rpdsrv') > 0) {
                if (oEvent.getSource().getLeftSelected()) {
                    oNNP.setProperty('/Mkt', 'Y');
                } else {
                    oNNP.setProperty('/Mkt', 'N');
                }
            } else if (oEvent.mParameters.id.indexOf('thrdpty') > 0) {
                if (oEvent.getSource().getLeftSelected()) {
                    oNNP.setProperty('/Offer', 'Y');
                } else {
                    oNNP.setProperty('/Offer', 'N');
                }
            } else { //('engeff')
                if (oEvent.getSource().getLeftSelected()) {
                    oNNP.setProperty('/Ee', 'Y');
                } else {
                    oNNP.setProperty('/Ee', 'N');
                }
            }
        };
        /**
		 * Handler for first cancel of the email, show additional message and request for cancel or delete email.
		 *
		 * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
         */
        Controller.prototype._onShowDelEmailBox = function (oEvent) {
            var oEmailBox = sap.ui.core.Fragment.byId(this.getView().sId, "idnrgDB-EmailBox"),
                oDelEmailBox = sap.ui.core.Fragment.byId(this.getView().sId, "idnrgDB-DelEmailBox"),
                oNNP = this.getView().getModel('oEditEmailNNP');
            if ((oNNP.getProperty('/Ecd') === 'Y') || (oNNP.getProperty('/Mkt') === 'Y') || (oNNP.getProperty('/Offer') === 'Y') || (oNNP.getProperty('/Ee') === 'Y')) {
                this.getOwnerComponent().getCcuxApp().setOccupied(false);
                sap.ui.commons.MessageBox.alert("Cannot delete email when preferences set to YES.");
                return;
            } else {
                oEmailBox.setVisible(false);
                oDelEmailBox.setVisible(true);
            }
        };
        /**
         * Handler for Email Cancel, so refresh the data from backend for complete popup
         *
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event
         */
        Controller.prototype._onEmailCancel = function (oEvent) {
            var oEmailBox = sap.ui.core.Fragment.byId(this.getView().sId, "idnrgDB-EmailBox"),
                oDelEmailBox = sap.ui.core.Fragment.byId(this.getView().sId, "idnrgDB-DelEmailBox"),
                sPath,
                oModel = this.getView().getModel('oODataSvc'),
                sBpNum = this.getView().getModel('oEditEmailNNP').getProperty('/PartnerID'),
                sBpEmail = this.getView().getModel('oDataBpContact').getProperty('/Email'),
                sBpEmailConsum = this.getView().getModel('oDataBpContact').getProperty('/EmailConsum'),
                oParameters;
            this.getOwnerComponent().getCcuxApp().setOccupied(true);
            //Start loading NNP logics and settings
            sPath = '/EmailNNPs' + '(' + 'PartnerID=\'' + sBpNum + '\'' + ',Email=\'' + sBpEmail + '\'' + ',EmailConsum=\'' + sBpEmailConsum + '\')';
            oParameters = {
                /*urlParameters: {"$expand": "Buags"},*/
                success : function (oData) {
                    if (oData) {
                        this.getView().getModel('oEditEmailNNP').setData(oData);
                        this.getOwnerComponent().getCcuxApp().setOccupied(false);
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.commons.MessageBox.alert("NNP Entity Service Error");
                    this.getOwnerComponent().getCcuxApp().setOccupied(false);
                }.bind(this)
            };

            if (oModel) {
                oModel.read(sPath, oParameters);
            }
            oEmailBox.setVisible(true);
            oDelEmailBox.setVisible(false);
        };
        /*************************************************************************************************************/

        return CustomController;
    }
);
