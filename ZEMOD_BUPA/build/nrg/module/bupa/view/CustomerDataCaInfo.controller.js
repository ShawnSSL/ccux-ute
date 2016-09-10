sap.ui.define(["sap/ui/model/Filter","sap/ui/model/FilterOperator","jquery.sap.global","nrg/base/view/BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/HashChanger","sap/ui/core/format/DateFormat"],function(a,b,c,d,e,f,g){"use strict";var h=d.extend("nrg.module.bupa.view.CustomerDataCaInfo");return h.prototype.onBeforeRendering=function(){this.getView().setModel(this.getOwnerComponent().getModel("oStateListModel"),"oUSStateList"),this.getOwnerComponent().getCcuxApp().setTitle("BUSINESS PARTNER"),this.getView().setModel(this.getOwnerComponent().getModel("comp-bupa"),"oODataSvc"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oCaInfoConfig"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDataBuagAddrDetails"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDataCAs"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oAllBuags"),this.getView().getModel("oAllBuags").setSizeLimit(1500),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDtaAddrEdit"),this.getView().getModel("oDataBuagAddrDetails").setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay),this._initCaInfoConfigModel(),this._initDataModel(),this._initMailAddrModels()},h.prototype.onAfterRendering=function(){},h.prototype._initCaInfoConfigModel=function(){var a=this.getView().getModel("oCaInfoConfig");a.setProperty("/mailAddrUpdateVisible",!0),a.setProperty("/mailAddrAddnewVisible",!0),a.setProperty("/mailAddrSaveVisible",!1),a.setProperty("/mailAddrEditable",!1),a.setProperty("/tempAddrAddnewVisible",!1),a.setProperty("/tempAddrSaveVisible",!1),a.setProperty("/tempAddrEditable",!1),a.setProperty("/bAllBuagSelected",!1),a.setProperty("/bAllBuagenabled",!1)},h.prototype._initDataModel=function(){var a=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();this._bpNum=a.parameters.bpNum,this._caNum=a.parameters.caNum,this._coNum=a.parameters.coNum,this._retrAllBuags(this._bpNum),this._retrBuagAddrDetail(this._caNum)},h.prototype._retrAllBuags=function(a){var b,c,d=this.getView().getModel("oODataSvc"),e=this.getView().getModel("oAllBuags"),f=this._caNum;b="/Partners('"+a+"')/Buags/",c={success:function(a){a&&(e.setData(a.results),e.setProperty("/selectedKey",f))}.bind(this),error:function(){}.bind(this)},d&&d.read(b,c)},h.prototype._retrBuagAddrDetail=function(a){var b,d,e=this.getView().getModel("oODataSvc"),f=this.getView().getModel("oCaInfoConfig");b="/Buags(ContractAccountID='"+a+"')/BuagAddrDetail/",d={success:function(a){a&&(0!==a.results.length?(this._fixedAddrID||(this._fixedAddrID=a.results[0].FixedAddressID),"X"===a.results[0].TempAddrYes&&(f.setProperty("/tempAddrAddnewVisible",!0),f.setProperty("/mailAddrUpdateVisible",!1),f.setProperty("/mailAddrAddnewVisible",!1)),this.getView().getModel("oDataBuagAddrDetails").setData(a.results[0]),this.oDataBuagAddrDetailsBak=c.extend(!0,{},a.results[0])):(f.setProperty("/mailAddrUpdateVisible",!1),f.setProperty("/mailAddrAddnewVisible",!0)))}.bind(this),error:function(){sap.ui.commons.MessageBox.alert("Error loading /Buags{caNum}/BuagAddrDetail")}.bind(this)},e&&e.read(b,d)},h.prototype._onCaSelected=function(a){var b=a.getParameters().selectedKey,c=sap.ui.getCore().getEventBus(),d={caNum:b};b&&(this._caNum=b,this._retrBuagAddrDetail(this._caNum),c.publish("nrg.module.dashoard","eBuagChangedFromCaInfo",d))},h.prototype._onAllBuagsSelected=function(){},h.prototype._handleMailingAcceptBtn=function(){var a,b,c=this.getView().getModel("oDtaAddrEdit"),d=this.getView().getModel("oDataBuagAddrDetails");if(a=c.getProperty("/SuggAddrInfo"),delete a.HeaderText1,delete a.HeaderText2,delete a.FooterLine1,delete a.FooterLine2,delete a.FooterLine3,c.getProperty("/bFixAddr")){d.setProperty("/FixUpd","X");for(b in a)a.hasOwnProperty(b)&&"__metadata"!==b&&"StandardFlag"!==b&&"Supplement"!==b&&d.setProperty("/FixAddrInfo/"+b,a[b])}else{d.setProperty("/TempUpd","X");for(b in a)a.hasOwnProperty(b)&&"__metadata"!==b&&"StandardFlag"!==b&&"Supplement"!==b&&d.setProperty("/TempAddrInfo/"+b,a[b])}this._updateMailingAddr()},h.prototype._handleMailingDeclineBtn=function(){var a,b=this.getView().getModel("oDtaAddrEdit"),c=this.getView().getModel("oDataBuagAddrDetails");a=b.getProperty("/AddrInfo"),b.getProperty("/bFixAddr")?(c.setProperty("/FixAddrInfo",a),c.setProperty("/FixUpd","X")):(c.setProperty("/TempAddrInfo",a),c.setProperty("/TempUpd","X")),this._updateMailingAddr()},h.prototype._handleMailingEditBtn=function(){var a=this.getView().getModel("oDtaAddrEdit");a.setProperty("/updateSent",!1),a.setProperty("/showVldBtns",!1),a.setProperty("/updateNotSent",!0)},h.prototype._showSuggestedAddr=function(){this.getView().byId("idAddrUpdatePopup").addStyleClass("nrgBupa-cusDataVerifyEditMail-vl"),this.getView().byId("idAddrUpdatePopup-l").addStyleClass("nrgBupa-cusDataVerifyEditMail-l-vl"),this.getView().getModel("oDtaAddrEdit").setProperty("/updateSent",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/showVldBtns",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/updateNotSent",!1)},h.prototype._getFromDate=function(){var a,b,c,d,e=new Date;return a=e.getFullYear(),b=e.getMonth()+1,c=e.getDate(),d=a+"-"+b+"-"+c+"T00:00:00"},h.prototype._updateMailingAddr=function(){{var a,b,c=this.getView().getModel("oODataSvc"),d=this.getView().getModel("oDataBuagAddrDetails").getProperty("/PartnerID"),e=this.getView().getModel("oDataBuagAddrDetails").getProperty("/ContractAccountID"),f=this.getView().getModel("oDataBuagAddrDetails").getProperty("/FixedAddressID");this._getFromDate()}this.getView().getModel("oCaInfoConfig").getProperty("/bAllBuagSelected")&&this.getView().getModel("oDataBuagAddrDetails").setProperty("/SaveToAllCa","X"),this.getView().getModel("oDtaAddrEdit").getProperty("/bCreateFirst")&&("X"===this.getView().getModel("oDataBuagAddrDetails").getProperty("/FixUpd")?(this.getView().getModel("oDataBuagAddrDetails").setProperty("/FixAddrInfo/ValidFrom",this._getFromDate()),this.getView().getModel("oDataBuagAddrDetails").setProperty("/FixAddrInfo/ValidTo","9999-12-31T00:00:00")):(this.getView().getModel("oDataBuagAddrDetails").setProperty("/TempAddrInfo/ValidFrom",this._getFromDate()),this.getView().getModel("oDataBuagAddrDetails").setProperty("/TempAddrInfo/ValidTo","9999-12-31T00:00:00"))),b={urlParameters:{},success:function(a){sap.ui.commons.MessageBox.alert(a&&a.Message?a.Message:"Address Updated Successfully"),this._oMailEditPopup.close(),this._retrAllBuags(this._bpNum),this._retrBuagAddrDetail(this._caNum)}.bind(this),error:function(){sap.ui.commons.MessageBox.alert("Update Failed")}.bind(this)},c&&(this.getView().getModel("oDtaAddrEdit").getProperty("/bCreateFirst")?(a="/BuagAddrDetails",c.create(a,this.getView().getModel("oDataBuagAddrDetails").oData,b)):(a="/BuagAddrDetails(PartnerID='"+d+"',ContractAccountID='"+e+"',FixedAddressID='"+f+"')",c.update(a,this.getView().getModel("oDataBuagAddrDetails").oData,b)))},h.prototype._validateInputAddr=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this._createAddrValidateFilters(),e=this.getView().getModel("oDtaAddrEdit");a="/BuagAddrDetails",b={filters:d,success:function(a){"X"===a.results[0].AddrChkValid?(this._oMailEditPopup.close(),this._updateMailingAddr()):(e.setProperty("/SuggAddrInfo",a.results[0].TriCheck),this._showSuggestedAddr())}.bind(this),error:function(){sap.ui.commons.MessageBox.alert("Validatation Call Failed")}.bind(this)},c&&c.read(a,b)},h.prototype._createAddrValidateFilters=function(){var c,d,e,f=[],g=this.getView().getModel("oDataBuagAddrDetails").getProperty("/PartnerID"),h=this.getView().getModel("oDtaAddrEdit"),i=h.getProperty("/AddrInfo"),j=h.getProperty("/bFixAddr");j?(c=new a({path:"FixUpd",operator:b.EQ,value1:"X"}),f.push(c)):(c=new a({path:"TempUpd",operator:b.EQ,value1:"X"}),f.push(c)),c=new a({path:"PartnerID",operator:b.EQ,value1:g}),f.push(c),c=new a({path:"ChkAddr",operator:b.EQ,value1:"X"}),f.push(c);for(d in i)i.hasOwnProperty(d)&&"__metadata"!==d&&"StandardFlag"!==d&&"ShortForm"!==d&&"ValidFrom"!==d&&"ValidTo"!==d&&"Supplement"!==d&&(j?(e="FixAddrInfo/"+d,c=new a({path:e,operator:b.EQ,value1:i[d]}),f.push(c)):(e="TempAddrInfo/"+d,c=new a({path:e,operator:b.EQ,value1:i[d]}),f.push(c)));return f},h.prototype._initMailAddrModels=function(){var a=this.getView().getModel("oDtaAddrEdit");a.setProperty("/updateSent",!1),a.setProperty("/showVldBtns",!1),a.setProperty("/updateNotSent",!0)},h.prototype._onPoBoxEdit=function(){this.getView().byId("idEditHouseNum").setValue(""),this.getView().byId("idEditStName").setValue("")},h.prototype._onRegAddrEdit=function(){this.getView().byId("idEditPoBox").setValue("")},h.prototype._onMailingPoBoxChanged=function(){this.getView().byId("idMailingAddrHouseNo").setValue(""),this.getView().byId("idMailingAddrStreet").setValue("")},h.prototype._onMailingRegAddrChanged=function(){this.getView().byId("idMailingAddrPobox").setValue("")},h.prototype._cleanUpAddrEditPop=function(){var a;for(this.getView().byId("idAddrUpdatePopup").removeStyleClass("nrgBupa-cusDataVerifyEditMail-vl"),this.getView().byId("idAddrUpdatePopup-HdrLn").setVisible(!1),this.getView().byId("idAddrUpdatePopup-l").removeStyleClass("nrgBupa-cusDataVerifyEditMail-l-vl"),this.getView().byId("idAddrUpdatePopup-r").setVisible(!1),a=1;8>a;a+=1)this.getView().byId("idAddrUpdatePopup-l").getContent()[0].removeStyleClass("nrgBupa-cusDataVerifyEditMail-lHighlight"),this.getView().byId("idAddrUpdatePopup-r").getContent()[0].removeStyleClass("nrgBupa-cusDataVerifyEditMail-rHighlight")},h.prototype._onEditMailAddrClick=function(){var a=this.getView().getModel("oDtaAddrEdit"),b={mParameters:{checked:null}},c=this.getView().getModel("oDataBuagAddrDetails");return c.getProperty("/FixAddrInfo/HouseNo")&&c.getProperty("/FixAddrInfo/Street")||c.getProperty("/FixAddrInfo/PoBox")?(a.setProperty("/AddrInfo",c.getProperty("/FixAddrInfo")),this.getView().getModel("oDataBuagAddrDetails").setProperty("/FixUpd","X"),this._oMailEditPopup||(this._oMailEditPopup=ute.ui.main.Popup.create({close:this._handleEditMailPopupClose.bind(this),content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.bupa.view.AddrUpdateCaLvlPopUp",this),title:"Edit Mailing Address"}),this.getView().addDependent(this._oMailEditPopup)),this._cleanUpAddrEditPop(),this.getView().getModel("oDtaAddrEdit").setProperty("/updateSent",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/showVldBtns",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/updateNotSent",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/bFixAddr",!0),this.getView().byId("idEditMailAddr_UpdtBtn").setVisible(!0),this.getView().byId("idSuggCompareCheck").getChecked()&&(b.mParameters.checked=!1,this._compareSuggChkClicked(b),this.getView().byId("idSuggCompareCheck").setChecked(!1)),this._oMailEditPopup.open(),this._showSuggestedAddr(),void this._validateInputAddr()):(ute.ui.main.Popup.Alert({title:"EDIT MAILING ADDRESS",message:"Please enter street no & street name or PO Box"}),!0)},h.prototype._onEditTempAddrClick=function(){var a=this.getView().getModel("oDtaAddrEdit"),b={mParameters:{checked:null}};a.setProperty("/AddrInfo",this.getView().getModel("oDataBuagAddrDetails").getProperty("/TempAddrInfo")),this.getView().getModel("oDataBuagAddrDetails").setProperty("/TempUpd","X"),this._oMailEditPopup||(this._oMailEditPopup=ute.ui.main.Popup.create({close:this._handleEditMailPopupClose.bind(this),content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.bupa.view.AddrUpdateCaLvlPopUp",this),title:"Edit Mailing Address"}),this.getView().addDependent(this._oMailEditPopup)),this._cleanUpAddrEditPop(),this.getView().getModel("oDtaAddrEdit").setProperty("/updateSent",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/showVldBtns",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/updateNotSent",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/bFixAddr",!0),this.getView().byId("idEditMailAddr_UpdtBtn").setVisible(!0),this.getView().byId("idSuggCompareCheck").getChecked()&&(b.mParameters.checked=!1,this._compareSuggChkClicked(b),this.getView().byId("idSuggCompareCheck").setChecked(!1)),this._oMailEditPopup.open(),this._showSuggestedAddr(),this._validateInputAddr()},h.prototype._handleEditMailPopupClose=function(){this._initCaInfoConfigModel(),this._initDataModel(),this._initMailAddrModels()},h.prototype._compareSuggChkClicked=function(a){var b,c=this.getView().byId("idAddrUpdatePopup-l").getContent(),d=this.getView().byId("idAddrUpdatePopup-r").getContent();if(a.mParameters.checked)for(b=1;8>b;b+=1)c[b].getContent()[0].getValue()!==d[b].getContent()[0].getValue()&&(c[b].getContent()[0].addStyleClass("nrgBupa-cusDataVerifyEditMail-lHighlight"),d[b].getContent()[0].addStyleClass("nrgBupa-cusDataVerifyEditMail-rHighlight"));else for(b=1;8>b;b+=1)c[b].getContent()[0].getValue()!==d[b].getContent()[0].getValue()&&(c[b].getContent()[0].removeStyleClass("nrgBupa-cusDataVerifyEditMail-lHighlight"),d[b].getContent()[0].removeStyleClass("nrgBupa-cusDataVerifyEditMail-rHighlight"))},h.prototype._onSMSButtonClicked=function(){var a=this.getView().getModel("oDtaVrfyBP"),b=this.getView().getModel("oDtaVrfyBuags"),c=a.getProperty("/SMSUrl"),d=c.indexOf("contractAccount=");c=c.substr(0,d+16)+b.getProperty("/ContractAccountID")+c.substr(d+16),window.open(c)},h.prototype._formatDate=function(a){if(a){var b=g.getInstance({pattern:"MM/dd/yyyy"});return b.format(a)}},h.prototype.onMailAddrUpdate=function(){var a=this.getView().getModel("oCaInfoConfig");a.setProperty("/mailAddrUpdateVisible",!1),a.setProperty("/mailAddrSaveVisible",!0),a.setProperty("/mailAddrEditable",!0),a.setProperty("/mailAddrAddnewVisible",!1),a.setProperty("/bAllBuagenabled",!0)},h.prototype.onMailAddrAddnew=function(){var a=this.getView().getModel("oCaInfoConfig"),b=this.getView().getModel("oDataBuagAddrDetails"),c=this.getView().getModel("oDtaAddrEdit");a.setProperty("/mailAddrAddnewVisible",!1),a.setProperty("/mailAddrUpdateVisible",!1),a.setProperty("/mailAddrSaveVisible",!0),a.setProperty("/mailAddrEditable",!0),a.setProperty("/bAllBuagenabled",!0),b.setProperty("/FixAddrInfo/PoBox",""),b.setProperty("/FixAddrInfo/Street",""),b.setProperty("/FixAddrInfo/HouseNo",""),b.setProperty("/FixAddrInfo/UnitNo",""),b.setProperty("/FixAddrInfo/City",""),b.setProperty("/FixAddrInfo/State",""),b.setProperty("/FixAddrInfo/ZipCode",""),c.setProperty("/bCreateFirst",!0)},h.prototype.onMailAddrCancel=function(){var a=this.getView().getModel("oCaInfoConfig"),b=this.getView().getModel("oDataBuagAddrDetails");a.setProperty("/mailAddrUpdateVisible",!0),a.setProperty("/mailAddrSaveVisible",!1),a.setProperty("/mailAddrEditable",!1),a.setProperty("/mailAddrAddnewVisible",!0),a.setProperty("/bAllBuagenabled",!1),b.setData(c.extend(!0,{},this.oDataBuagAddrDetailsBak))},h.prototype.onMailAddrSave=function(){var a,b,d=this.getView().getModel("oCaInfoConfig"),e=this.getView().getModel("oODataSvc");return d.setProperty("/mailAddrUpdateVisible",!0),d.setProperty("/mailAddrSaveVisible",!1),d.setProperty("/mailAddrEditable",!1),JSON.stringify(this.getView().getModel("oDataBuagAddrDetails").oData.results[0].MailingAddress)===JSON.stringify(this.oDataBuagAddrDetailsBak.results[0].MailingAddress)?void sap.ui.commons.MessageBox.alert("There is no change for Mailing Address."):(a="/BuagAddrDetails(PartnerID='"+this._bpNum+"',ContractAccountID='"+this._caNum+"',FixedAddressID='"+this._fixedAddrID+"')/",b={merge:!1,success:function(){sap.ui.commons.MessageBox.alert("Mailing Address Update Success"),this.oDataBuagAddrDetailsBak=c.extend(!0,{},this.getView().getModel("oDataBuagAddrDetails").getData())}.bind(this),error:function(){sap.ui.commons.MessageBox.alert("Mailing Address Update Failed"),this.getView().getModel("oDataBuagAddrDetails").setData(c.extend(!0,{},this.oDataBuagAddrDetailsBak))}.bind(this)},void(e&&e.read(a,this.getView().getModel("oDataBuagAddrDetails").oData.results[0],b)))},h.prototype.onTempAddrUpdate=function(){var a=this.getView().getModel("oCaInfoConfig");a.setProperty("/tempAddrAddnewVisible",!1),a.setProperty("/tempAddrSaveVisible",!0),a.setProperty("/tempAddrEditable",!0)},h.prototype.onTempAddrCancel=function(){var a=this.getView().getModel("oCaInfoConfig"),b=this.getView().getModel("oDataBuagAddrDetails");a.setProperty("/tempAddrAddnewVisible",!0),a.setProperty("/tempAddrSaveVisible",!1),a.setProperty("/tempAddrEditable",!1),b.setData(c.extend(!0,{},this.oDataBuagAddrDetailsBak))},h.prototype.onTempAddrSave=function(){var a,b,d=this.getView().getModel("oCaInfoConfig"),e=this.getView().getModel("oODataSvc");return d.setProperty("/tempAddrAddnewVisible",!0),d.setProperty("/tempAddrSaveVisible",!1),d.setProperty("/tempAddrEditable",!1),JSON.stringify(this.getView().getModel("oDataBuagAddrDetails").oData.results[0].TemporaryAddress)===JSON.stringify(this.oDataBuagAddrDetailsBak.results[0].TemporaryAddress)?void sap.ui.commons.MessageBox.alert("There is no change for Temporary Address."):(a="/BuagAddrDetails(PartnerID='"+this._bpNum+"',ContractAccountID='"+this._caNum+"',FixedAddressID='"+this._fixedAddrID+"')/",b={merge:!1,success:function(){sap.ui.commons.MessageBox.alert("Temporary Address Update Success"),this.oDataBuagAddrDetailsBak=c.extend(!0,{},this.getView().getModel("oDataBuagAddrDetails").getData())}.bind(this),error:function(){sap.ui.commons.MessageBox.alert("Temporary Address Update Failed"),this.getView().getModel("oDataBuagAddrDetails").setData(c.extend(!0,{},this.oDataBuagAddrDetailsBak))}.bind(this)},void(e&&e.update(a,this.getView().getModel("oDataBuagAddrDetails").oData.results[0],b)))},h.prototype.onBackToDashboard=function(){var a=this.getOwnerComponent().getRouter();this._coNum?a.navTo("dashboard.VerificationWithCaCo",{bpNum:this._bpNum,caNum:this._caNum,coNum:this._coNum}):a.navTo("dashboard.VerificationWithCa",{bpNum:this._bpNum,caNum:this._caNum})},h.prototype._retrUrlHash=function(){var a=new f,b=a.getHash();return b},h});