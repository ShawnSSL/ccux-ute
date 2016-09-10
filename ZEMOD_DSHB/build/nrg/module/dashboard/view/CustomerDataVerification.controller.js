sap.ui.define(["nrg/base/view/BaseController","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/routing/HashChanger","jquery.sap.global","nrg/module/nnp/view/NNPPopup"],function(a,b,c,d,e,f){"use strict";var g=a.extend("nrg.module.dashboard.view.CustomerDataVerification");return g.prototype.onBeforeRendering=function(){this.getOwnerComponent().getCcuxApp().setTitle("CUSTOMER DATA"),this.getOwnerComponent().getModel("comp-dashboard").setSizeLimit(1500),this.getView().setModel(this.getOwnerComponent().getModel("comp-dashboard"),"oODataSvc"),this.getView().setModel(this.getOwnerComponent().getModel("oStateListModel"),"oUSStateList"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDtaVrfyBP"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDtaVrfyBuags"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDtaVrfyContract"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oAllContractsofBuag"),this.getView().getModel("oAllContractsofBuag").setSizeLimit(1500),this.getView().setModel(new sap.ui.model.json.JSONModel,"oAllBuags"),this.getView().getModel("oAllBuags").setSizeLimit(1500),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDtaVrfyMailingTempAddr"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDtaAddrEdit"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oCfrmStatus"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oCoPageModel"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oDayPhoneType"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oEvnPhoneType"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oEditEmailNNP"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oEditEmailValidate"),this._bSiebelCustomer=!1,$(document).on("keydown",function(a){8!==a.which||$(a.target).is("input, textarea")||a.preventDefault()});var a=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();this._bpNum=a.parameters.bpNum,this._caNum=a.parameters.caNum,this._coNum=a.parameters.coNum,this._initToggleArea(),this._initDtaVrfRetr(),this._initCfrmStatus(),this._initPhnTypes(),this._initMailAddrModels()},g.prototype.onAfterRendering=function(){this.getOwnerComponent().getCcuxApp().detachNavLeftAll(),this.getOwnerComponent().getCcuxApp().attachNavLeft(this._dhsbVerificationNavLeftCallBack,this),this.getView().byId("nrgDashBoard-cusDataVerify-Status").attachBrowserEvent("click",this._navToSvcOdr.bind(this))},g.prototype._dhsbVerificationNavLeftCallBack=function(){var a=this.getOwnerComponent().getCcuxWebUiManager();a.notifyWebUi("clearAccount",{},this._navLeftClearAccCallBack,this)},g.prototype._dhsbVerificationNavLeftClearAccCallBack=function(){var a,b;this.getOwnerComponent().getCcuxApp().setOccupied(!1),a=this.getOwnerComponent().getCcuxContextManager().resetContext(),b=this.getOwnerComponent().getRouter(),b.navTo("app.refresh"),b.navTo("search.SearchNoID")},g.prototype._initToggleArea=function(){this.getView().byId("id_DshbTglBtn").getLeftSelected()||(this.getView().byId("id_DshbTglBtn").setLeftSelected(!0),this._onToggleButtonPress(null))},g.prototype._initPhnTypes=function(){var a=this.getView().getModel("oDayPhoneType"),b=this.getView().getModel("oEvnPhoneType"),c=[],d=[];c=[{Key:"WORK",Type:"LANDLINE"},{Key:"CELL",Type:"CELL"}],d=[{Key:"HOME",Type:"LANDLINE"},{Key:"CELL",Type:"CELL"}],a.setProperty("/",c),b.setProperty("/",d)},g.prototype._initCfrmStatus=function(){this.getView().getModel("oCfrmStatus").setProperty("/bEditable",!0),this.getView().getModel("oCfrmStatus").setProperty("/ShowSMSBtn",!1),this.getView().byId("id_confmBtn").setVisible(!0),this.getView().byId("id_unConfmBtn").setVisible(!1),this.getView().byId("id_updtBtn").setEnabled(!0),this.getView().byId("id_updtBtn").setVisible(!0)},g.prototype._onToggleButtonPress=function(){this.getView().byId("mailadd_area").getVisible()?(this.getView().byId("mailadd_area").setVisible(!1),this.getView().byId("serviceadd_area").setVisible(!0),this.getView().byId("idContractDropdown").setVisible(!0)):(this.getView().byId("serviceadd_area").setVisible(!1),this.getView().byId("mailadd_area").setVisible(!0),this.getView().byId("idContractDropdown").setVisible(!1))},g.prototype._handleUpdate=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this.getView().getModel("oDtaVrfyBP").oData,e=this.getOwnerComponent().getGlobalDataManager();d.IsRebs=e.isREBS()?!0:!1,a="/Partners('"+this.getView().getModel("oDtaVrfyBP").getProperty("/PartnerID")+"')",b={merge:!1,success:function(){this.getOwnerComponent().getCcuxApp().setOccupied(!1),ute.ui.main.Popup.Alert({title:"Customer data update ",message:"Update Success"}),this._initDtaVrfRetr()}.bind(this),error:function(){this.getOwnerComponent().getCcuxApp().setOccupied(!1),ute.ui.main.Popup.Alert({title:"Customer data update ",message:"Update Failed"})}.bind(this)},c&&d&&(d.hasOwnProperty("OrgBP")&&delete d.OrgBP,d.hasOwnProperty("PsnBP")&&delete d.PsnBP,c.update(a,d,b))},g.prototype._formatEmailMkt=function(a){return"y"===a||"Y"===a?!0:!1},g.prototype._formatPositiveX=function(a){return"x"===a||"X"===a?!0:!1},g.prototype._formatNegativeX=function(a){return"x"===a||"X"===a?!1:!0},g.prototype._formatChecked=function(a){return"x"===a||"X"===a?!0:!1},g.prototype._formatRemoteLabel=function(a){return"x"===a||"X"===a?!1:!0},g.prototype._formatSMSBtn=function(a){return"x"===a||"X"===a?!1:!0},g.prototype._formatDate=function(a){var b,c,d;return a?(b=a.substring(0,4),c=a.substring(4,6),d=a.substring(6,8),c+"/"+d+"/"+b):" "},g.prototype._formatVrfyMark=function(a){return"x"===a||"X"===a?!0:!1},g.prototype._formatVrfyMarkRedX=function(a,b){return b?"x"===a||"X"===a?!1:!0:!1},g.prototype._cleanUpAddrEditPop=function(){var a;for(this.getView().byId("idAddrUpdatePopup").removeStyleClass("nrgDashboard-cusDataVerifyEditMail-vl"),this.getView().byId("idAddrUpdatePopup-HdrLn").setVisible(!1),this.getView().byId("idAddrUpdatePopup-l").removeStyleClass("nrgDashboard-cusDataVerifyEditMail-l-vl"),this.getView().byId("idAddrUpdatePopup-r").setVisible(!1),a=1;8>a;a+=1)this.getView().byId("idAddrUpdatePopup-l").getContent()[a].getContent()[0].removeStyleClass("nrgDashboard-cusDataVerifyEditMail-lHighlight"),this.getView().byId("idAddrUpdatePopup-r").getContent()[a].getContent()[0].removeStyleClass("nrgDashboard-cusDataVerifyEditMail-rHighlight")},g.prototype._handleMailingAddrUpdate=function(){this._validateInputAddr()},g.prototype._handleMailingAcceptBtn=function(){var a,b,c=this.getView().getModel("oDtaAddrEdit"),d=this.getView().getModel("oDtaVrfyMailingTempAddr");if(a=c.getProperty("/SuggAddrInfo"),delete a.HeaderText1,delete a.HeaderText2,delete a.FooterLine1,delete a.FooterLine2,delete a.FooterLine3,c.getProperty("/bFixAddr")){d.setProperty("/FixUpd","X");for(b in a)a.hasOwnProperty(b)&&"__metadata"!==b&&"StandardFlag"!==b&&"Supplement"!==b&&d.setProperty("/FixAddrInfo/"+b,a[b])}else{d.setProperty("/TempUpd","X");for(b in a)a.hasOwnProperty(b)&&"__metadata"!==b&&"StandardFlag"!==b&&"Supplement"!==b&&d.setProperty("/TempAddrInfo/"+b,a[b])}this._updateMailingAddr()},g.prototype._handleMailingDeclineBtn=function(){var a,b=this.getView().getModel("oDtaAddrEdit"),c=this.getView().getModel("oDtaVrfyMailingTempAddr");a=b.getProperty("/AddrInfo"),b.getProperty("/bFixAddr")?(c.setProperty("/FixAddrInfo",a),c.setProperty("/FixUpd","X")):(c.setProperty("/TempAddrInfo",a),c.setProperty("/TempUpd","X")),this._updateMailingAddr()},g.prototype._handleMailingEditBtn=function(){var a=this.getView().getModel("oDtaAddrEdit");a.setProperty("/showVldBtns",!1),a.setProperty("/updateNotSent",!0)},g.prototype._showSuggestedAddr=function(){this.getView().byId("idAddrUpdatePopup").addStyleClass("nrgDashboard-cusDataVerifyEditMail-vl"),this.getView().byId("idAddrUpdatePopup-l").addStyleClass("nrgDashboard-cusDataVerifyEditMail-l-vl"),this.getView().getModel("oDtaAddrEdit").setProperty("/updateSent",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/showVldBtns",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/updateNotSent",!1)},g.prototype._updateMailingAddr=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/PartnerID"),e=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/ContractAccountID"),f=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/FixedAddressID");a="/BuagMailingAddrs(PartnerID='"+d+"',ContractAccountID='"+e+"',FixedAddressID='"+f+"')",b={urlParameters:{},success:function(a){this.getOwnerComponent().getCcuxApp().setOccupied(!1),sap.ui.commons.MessageBox.alert(a&&a.Message?a.Message:"Address Updated Successfully"),this._retrAllCa(this.getView().getModel("oDtaVrfyBuags").getProperty("/PartnerID")),this._oMailEditPopup.close()}.bind(this),error:function(){this.getOwnerComponent().getCcuxApp().setOccupied(!1),this._oMailEditPopup.close(),ute.ui.main.Popup.Alert({title:"Mailing address update ",message:"Update Failed"})}.bind(this)},c&&c.update(a,this.getView().getModel("oDtaVrfyMailingTempAddr").oData,b)},g.prototype._validateInputAddr=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this._createAddrValidateFilters(),e=this.getView().getModel("oDtaAddrEdit");a="/BuagMailingAddrs",b={filters:d,success:function(a){this.getOwnerComponent().getCcuxApp().setOccupied(!1),"X"===a.results[0].AddrChkValid?this._updateMailingAddr():(e.setProperty("/SuggAddrInfo",a.results[0].TriCheck),this._showSuggestedAddr())}.bind(this),error:function(){this.getOwnerComponent().getCcuxApp().setOccupied(!1),ute.ui.main.Popup.Alert({title:"Input address validation",message:"Validation Call Failed"})}.bind(this)},c&&c.read(a,b)},g.prototype._createAddrValidateFilters=function(){var a,d,e,f=[],g=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/PartnerID"),h=this.getView().getModel("oDtaAddrEdit"),i=h.getProperty("/AddrInfo"),j=h.getProperty("/bFixAddr");j?(a=new b({path:"FixUpd",operator:c.EQ,value1:"X"}),f.push(a)):(a=new b({path:"TempUpd",operator:c.EQ,value1:"X"}),f.push(a)),a=new b({path:"PartnerID",operator:c.EQ,value1:g}),f.push(a),a=new b({path:"ChkAddr",operator:c.EQ,value1:"X"}),f.push(a);for(d in i)i.hasOwnProperty(d)&&"__metadata"!==d&&"StandardFlag"!==d&&"ShortForm"!==d&&"ValidFrom"!==d&&"ValidTo"!==d&&"Supplement"!==d&&(j?(e="FixAddrInfo/"+d,a=new b({path:e,operator:c.EQ,value1:i[d]}),f.push(a)):(e="TempAddrInfo/"+d,a=new b({path:e,operator:c.EQ,value1:i[d]}),f.push(a)));return f},g.prototype._initMailAddrModels=function(){var a=this.getView().getModel("oDtaAddrEdit");a.setProperty("/updateSent",!1),a.setProperty("/showVldBtns",!1),a.setProperty("/updateNotSent",!0)},g.prototype._onPoBoxEdit=function(){this.getView().byId("idEditHouseNum").setValue(""),this.getView().byId("idEditStName").setValue("")},g.prototype._onRegAddrEdit=function(){this.getView().byId("idEditPoBox").setValue("")},g.prototype._onEditMailAddrClick=function(){var a=this.getView().getModel("oDtaAddrEdit"),b={mParameters:{checked:null}},c=this.getView().getModel("oDtaVrfyMailingTempAddr");return c.getProperty("/FixAddrInfo/HouseNo")&&c.getProperty("/FixAddrInfo/Street")||c.getProperty("/FixAddrInfo/PoBox")?(a.setProperty("/AddrInfo",this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/FixAddrInfo")),this._oMailEditPopup||(this._oMailEditPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.dashboard.view.AddrUpdateCaLvlPopUp",this),title:"Edit Mailing Address",close:function(){this._retrCaMailingAddr(this.getView().getModel("oDtaVrfyBuags").getProperty("/PartnerID"),this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),this.getView().getModel("oDtaVrfyBuags").getProperty("/FixedAddressID"))}.bind(this)}),this.getView().addDependent(this._oMailEditPopup)),this._cleanUpAddrEditPop(),this.getView().getModel("oDtaAddrEdit").setProperty("/updateSent",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/showVldBtns",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/updateNotSent",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/bFixAddr",!0),this.getView().byId("idEditMailAddr_UpdtBtn").setVisible(!0),this.getView().byId("idSuggCompareCheck").getChecked()&&(b.mParameters.checked=!1,this._compareSuggChkClicked(b),this.getView().byId("idSuggCompareCheck").setChecked(!1)),void this._oMailEditPopup.open()):(ute.ui.main.Popup.Alert({title:"AVERAGE BILLING",message:"Please enter street no & street name or PO Box"}),!0)},g.prototype._onEditTempAddrClick=function(){var a=this.getView().getModel("oDtaAddrEdit"),b={mParameters:{checked:null}};a.setProperty("/AddrInfo",this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/TempAddrInfo")),this._oMailEditPopup||(this._oMailEditPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.dashboard.view.AddrUpdateCaLvlPopUp",this),title:"Edit Mailing Address"}),this.getView().addDependent(this._oMailEditPopup)),this._cleanUpAddrEditPop(),this.getView().getModel("oDtaAddrEdit").setProperty("/updateSent",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/showVldBtns",!1),this.getView().getModel("oDtaAddrEdit").setProperty("/updateNotSent",!0),this.getView().getModel("oDtaAddrEdit").setProperty("/bFixAddr",!0),this.getView().byId("idEditMailAddr_UpdtBtn").setVisible(!0),this.getView().byId("idSuggCompareCheck").getChecked()&&(b.mParameters.checked=!1,this._compareSuggChkClicked(b),this.getView().byId("idSuggCompareCheck").setChecked(!1)),this._oMailEditPopup.open()},g.prototype._handleTempAddrUpdate=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/PartnerID"),e=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/ContractAccountID"),f=this.getView().getModel("oDtaVrfyMailingTempAddr").getProperty("/TemporaryAddrID");a="/BuagMailingAddrs(PartnerID='"+d+"',ContractAccountID='"+e+"',FixedAddressID='"+f+"')",b={merge:!1,success:function(){ute.ui.main.Popup.Alert({title:"Address update",message:"Update Success"}),this._oTempMailEditPopup.close()}.bind(this),error:function(){ute.ui.main.Popup.Alert({title:"Address update",message:"Update Failed"})}.bind(this)},c&&c.update(a,this.getView().getModel("oDtaVrfyMailingTempAddr").oData,b)},g.prototype._compareSuggChkClicked=function(a){var b,c=this.getView().byId("idAddrUpdatePopup-l").getContent(),d=this.getView().byId("idAddrUpdatePopup-r").getContent();if(a.mParameters.checked)for(b=1;8>b;b+=1)c[b].getContent()[0].getValue()!==d[b].getContent()[0].getValue()&&(c[b].getContent()[0].addStyleClass("nrgDashboard-cusDataVerifyEditMail-lHighlight"),d[b].getContent()[0].addStyleClass("nrgDashboard-cusDataVerifyEditMail-rHighlight"));else for(b=1;8>b;b+=1)c[b].getContent()[0].getValue()!==d[b].getContent()[0].getValue()&&(c[b].getContent()[0].removeStyleClass("nrgDashboard-cusDataVerifyEditMail-lHighlight"),d[b].getContent()[0].removeStyleClass("nrgDashboard-cusDataVerifyEditMail-rHighlight"))},g.prototype._onSMSButtonClicked=function(){var a=this.getView().getModel("oDtaVrfyBP"),b=this.getView().getModel("oDtaVrfyBuags"),c=a.getProperty("/SMSUrl"),d=c.indexOf("contractAccount=");c=c.substr(0,d+16)+b.getProperty("/ContractAccountID")+c.substr(d+16),window.open(c)},g.prototype._handleEmailEdit=function(){var a=this.getView().getModel("oDtaVrfyBP").getProperty("/PartnerID"),b=this.getView().getModel("oDtaVrfyBP").getProperty("/Email"),c=this.getView().getModel("oDtaVrfyBP").getProperty("/EmailConsum"),d=new f;d.attachEvent("NNPCompleted",function(){this.getOwnerComponent().getCcuxApp().updateFooterNotification(this._bpNum,this._caNum,this._coNum,!1),this._initDtaVrfRetr()},this),this.getView().addDependent(d),d.openNNP(a,b,c)},g.prototype._onValidateEmailAddress=function(){var a,b,c,d=this.getView().getModel("oEditEmailValidate"),e=this.getView().getModel("oODataSvc"),f=this.getView().getModel("oEditEmailNNP");f.refresh(!0),c=f.getProperty("/Email"),b="/EmailVerifys('"+c+"')",a={success:function(a){a&&d.setData(a),this.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this),error:function(){ute.ui.main.Popup.Alert({title:"Email address validation",message:"Email Validate Service Error"}),this.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this)},e&&e.read(b,a)},g.prototype._onEditEmailSave=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this.getView().getModel("oEditEmailNNP").getProperty("/PartnerID"),e=this.getView().getModel("oEditEmailNNP").getProperty("/Email"),f=this.getView().getModel("oEditEmailNNP").getProperty("/EmailConsum"),g=this.getView().getModel("oEditEmailNNP"),h=!0;h=e===this.getView().getModel("oDtaVrfyBP").getProperty("/Email")?!1:!0,"000"===f?(a="/EmailNNPs(PartnerID='"+d+"',Email='"+e+"',EmailConsum='')",g.setProperty("/EmailConsum","")):a="/EmailNNPs(PartnerID='"+d+"',Email='"+e+"',EmailConsum='"+f+"')",b={merge:!1,success:function(){ute.ui.main.Popup.Alert(h?{title:"Email save ",message:g.getProperty("/LdapMessage")}:{title:"Email save",message:"Marketing Preference Updated Successfully"}),this._oEmailEditPopup.close(),this._initDtaVrfRetr(),this.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this),error:function(){ute.ui.main.Popup.Alert({title:"Email save",message:"Update Failed"}),this.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this)},c&&c.update(a,g.oData,b)},g.prototype._onEditEmailDelete=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this.getView().getModel("oEditEmailNNP").getProperty("/PartnerID"),e=this.getView().getModel("oEditEmailNNP");return a="/EmailNNPs(PartnerID='"+d+"',Email='',EmailConsum='')",b={success:function(){this._oEmailEditPopup.close(),this._initDtaVrfRetr(),this.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this),error:function(){this.getOwnerComponent().getCcuxApp().setOccupied(!1),this._oEmailEditPopup.close(),ute.ui.main.Popup.Alert({title:"Email delete",message:"Update Failed"})}.bind(this)},"Y"===e.getProperty("/Ecd")||"Y"===e.getProperty("/Mkt")||"Y"===e.getProperty("/Offer")||"Y"===e.getProperty("/Ee")?(this.getOwnerComponent().getCcuxApp().setOccupied(!1),void ute.ui.main.Popup.Alert({title:"Email delete",message:"Cannot delete email when preferences set to YES."})):void(c&&c.remove(a,b))},g.prototype._onMktPrefTogg=function(a){var b=this.getView().getModel("oEditEmailNNP");a.mParameters.id.indexOf("ctaddr")>0?a.getSource().getLeftSelected()?b.setProperty("/Ecd","Y"):b.setProperty("/Ecd","N"):a.mParameters.id.indexOf("rpdsrv")>0?a.getSource().getLeftSelected()?b.setProperty("/Mkt","Y"):b.setProperty("/Mkt","N"):a.mParameters.id.indexOf("thrdpty")>0?a.getSource().getLeftSelected()?b.setProperty("/Offer","Y"):b.setProperty("/Offer","N"):a.getSource().getLeftSelected()?b.setProperty("/Ee","Y"):b.setProperty("/Ee","N")},g.prototype._formatEmailAddressText=function(a){return""===a||void 0===a?"":a},g.prototype._onShowDelEmailBox=function(){var a=sap.ui.core.Fragment.byId("EmailEditPopup","idnrgDB-EmailBox"),b=sap.ui.core.Fragment.byId("EmailEditPopup","idnrgDB-DelEmailBox"),c=this.getView().getModel("oEditEmailNNP");return"Y"===c.getProperty("/Ecd")||"Y"===c.getProperty("/Mkt")||"Y"===c.getProperty("/Offer")||"Y"===c.getProperty("/Ee")?(this.getOwnerComponent().getCcuxApp().setOccupied(!1),void ute.ui.main.Popup.Alert({title:"Email delete",message:"Cannot delete email when preferences set to YES."})):(a.setVisible(!1),void b.setVisible(!0))},g.prototype._onEmailCancel=function(){var a,b,c=sap.ui.core.Fragment.byId("EmailEditPopup","idnrgDB-EmailBox"),d=sap.ui.core.Fragment.byId("EmailEditPopup","idnrgDB-DelEmailBox"),e=this.getView().getModel("oODataSvc"),f=this.getView().getModel("oDtaVrfyBP").getProperty("/PartnerID"),g=this.getView().getModel("oDtaVrfyBP").getProperty("/Email"),h=this.getView().getModel("oDtaVrfyBP").getProperty("/EmailConsum");a="/EmailNNPs(PartnerID='"+f+"',Email='"+g+"',EmailConsum='"+h+"')",b={success:function(a){a&&(this.getView().getModel("oEditEmailNNP").setData(a),this.getOwnerComponent().getCcuxApp().setOccupied(!1))}.bind(this),error:function(){ute.ui.main.Popup.Alert({title:"Email cancel",message:"NNP Entity Service Error"}),this.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this)},e&&e.read(a,b),c.setVisible(!0),d.setVisible(!1)},g.prototype._initDtaVrfRetr=function(){var a=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),b=a.parameters.bpNum,c=(a.parameters.caNum,"/Partners('"+b+"')");this._retrDataVrf(c)},g.prototype._retrDataVrf=function(a){var b,c,d,e,f=this.getView().getModel("oODataSvc"),g=!1,h=!1,i=!1,j=this.getOwnerComponent().getGlobalDataManager();c={success:function(a){if(a){a.SiebelCustomer&&(this._bSiebelCustomer=a.SiebelCustomer,j.setIsSiebel(this._bSiebelCustomer)),this.getView().getModel("oCfrmStatus").setProperty("/ShowSMSBtn",!0),this.getView().getModel("oDtaVrfyBP").setData(a),a.Cell||this.getView().getModel("oDtaVrfyBP").setProperty("/IsSMS","X"),"1"===a.PartnerType?(this.getView().getModel("oDtaVrfyBP").setProperty("/OrgBP",!1),this.getView().getModel("oDtaVrfyBP").setProperty("/PsnBP",!0)):(this.getView().getModel("oDtaVrfyBP").setProperty("/OrgBP",!0),this.getView().getModel("oDtaVrfyBP").setProperty("/PsnBP",!1)),a.PartnerID&&this._retrAllCa(a.PartnerID,function(){g=!0}),d=setInterval(function(){g&&(b=this._getCurrentCaNum(function(){i=!0}),clearInterval(d))}.bind(this),100),e=setInterval(function(){i&&(b?(this._setCurrentCa(b),this._retrAllCo(b,function(){h=!0})):this.getOwnerComponent().getCcuxApp().setOccupied(!1),clearInterval(e))}.bind(this),100);var c=setInterval(function(){h&&(this._routeInfoConfirm(!0),this._updateUsageLink(),clearInterval(c))}.bind(this),100)}}.bind(this),error:function(){}.bind(this)},f&&f.read(a,c)},g.prototype._retrAllCa=function(a,b){{var c,d,e=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),f=e.parameters.caNum,g=this.getView().getModel("oODataSvc"),h="/Partners('"+a+"')/Buags/",i=0;sap.ui.getCore().getEventBus()}c={success:function(a){if(a&&a.results&&a.results.length>0){for(d=0;d<a.results.length;d+=1)a.results[d].iIndex=d.toString(),a.results[d].ContractAccountID&&f&&parseInt(a.results[d].ContractAccountID,10)===parseInt(f,10)&&(i=d);this.getView().getModel("oAllBuags").setData(a.results),this.getView().getModel("oAllBuags").setProperty("/selectedKey",i)}b&&b()}.bind(this),error:function(){}.bind(this)},g&&g.read(h,c)},g.prototype._getCurrentCaNum=function(a){var b=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo(),c=b.parameters.caNum,d="",e=this.getView().getModel("oAllBuags");return c?d=c:e.oData&&Array.isArray(e.oData)&&e.oData.length>0&&(d=e.oData[0].ContractAccountID),a&&a(),d},g.prototype._setCurrentCa=function(a){var b,c=this.getView().getModel("oAllBuags");for(b=0;b<c.oData.length;b+=1)c.oData[b].ContractAccountID&&a&&parseInt(c.oData[b].ContractAccountID,10)===parseInt(a,10)&&(this.getView().getModel("oDtaVrfyBuags").setData(c.oData[b]),this._onCaValidations(),this._retrCaMailingAddr(this.getView().getModel("oDtaVrfyBuags").getProperty("/PartnerID"),this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),this.getView().getModel("oDtaVrfyBuags").getProperty("/FixedAddressID")))},g.prototype._retrAllCo=function(a,b){var c,d,e=this.getView().getModel("oODataSvc"),f=(this.getView().getModel("oCoPageModel"),this),g=this.getView().getModel("oDtaVrfyContract"),h=this.getView().getModel("oAllContractsofBuag");c="/Buags('"+a+"')/Contracts/",d={success:function(a){if(f.getOwnerComponent().getCcuxApp().setOccupied(!1),a){var c=!1,d=-1;a.results&&a.results.length>0?(f._coNum&&a.results.forEach(function(a,b){a&&a.ContractID&&parseInt(a.ContractID,10)===parseInt(f._coNum,10)&&(g.setData(a),f._onCoChange(a),d=b.toString(),c=!0)}),c||(g.setData(a.results[0]),this._onCoChange(a.results[0]),d="0"),this._initCoPageModel(),this._setUpCoPageModel(a.results.length,a.results)):(this._initCoPageModel(),this._setUpCoPageModel(a.results.length,a.results),f._onCoSelected(-1)),this._onCOValidations(),h.setData(a.results),h.setProperty("/selectedKey",d),b&&b()}else this._initCoPageModel()}.bind(this),error:function(){f.getOwnerComponent().getCcuxApp().setOccupied(!1),b&&b()}.bind(this)},e&&e.read(c,d)},g.prototype._initCoPageModel=function(){var a,b,c=this.getView().getModel("oCoPageModel"),d=[];for(b=0;3>b;b+=1)a={exist:!1,con_ind:0,index:b},d.push(a);c.setProperty("/threeLarger",!1),c.setProperty("/paging",d)},g.prototype._setUpCoPageModel=function(a,b){var c,d=this.getView().getModel("oCoPageModel"),e=d.getProperty("/paging");for(0===b.length?d.setProperty("/isShowPagination",!1):d.setProperty("/isShowPagination",!0),c=0;a>c;c+=1)b[c].iIndex=c.toString(),3>c?(e[c].exist=!0,e[c].co_ind=c+1,d.setProperty("/threeLarger",!1)):d.setProperty("/threeLarger",!0);d.setProperty("/paging",e)},g.prototype._routeInfoConfirm=function(a){var b,c=this.getView().getModel("oDtaVrfyBP").getProperty("/PartnerID"),d=this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),e=this.getView().getModel("oDtaVrfyContract").getProperty("/ContractID"),f=this.getOwnerComponent(),g=f.getCcuxWebUiManager(),h=0,i=sap.ui.getCore().getEventBus(),j=this.getOwnerComponent().getGlobalDataManager(),k=!1;a&&(j.isCAConfirm()?k=!0:(j.setCAConfirm(!0),k=!1)),k?h+=1:g.isAvailable()?this._updateWebUI(c,d,e,function(){h+=1},this):h+=1,this._updateCcux(c,d,e,function(){h+=1}),b=setInterval(function(){2===h&&(clearInterval(b),i.publish("nrg.module.dashoard","eAfterConfirmed",{bpNum:c,caNum:d,coNum:e}))},100)},g.prototype._updateWebUI=function(a,b,c,d,e){var f=this.getOwnerComponent(),g=f.getCcuxWebUiManager();g.notifyWebUi("caConfirmed",{BP_NUM:a,CA_NUM:b,CO_NUM:c},d,e)},g.prototype._updateCcux=function(a,b,c,d){var e=this.getOwnerComponent().getCcuxContextManager().getContext();e.setProperty("/bpNum",a),e.setProperty("/caNum",b),e.setProperty("/coNum",c),this.getOwnerComponent().getCcuxApp().updateFooter(a,b,c),d()},g.prototype._updateUsageLink=function(){var a=this.getView().getModel("oDtaVrfyBP").getProperty("/PartnerID"),b=this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),c=this.getView().getModel("oDtaVrfyContract").getProperty("/ContractID");a&&b&&c?(this.getView().byId("nrgDashboard-cusDataVerify-left-usageLink").attachBrowserEvent("click",this._onMeterClick.bind(this)),this.getView().byId("nrgDashboard-cusDataVerify-left-usageLink").addStyleClass("active")):(this.getView().byId("nrgDashboard-cusDataVerify-left-usageLink").detachBrowserEvent("click"),this.getView().byId("nrgDashboard-cusDataVerify-left-usageLink").removeStyleClass("active"))},g.prototype._onCaValidations=function(){var a=this.getOwnerComponent().getGlobalDataManager(),b=this.getView().getModel("oDtaVrfyBuags");a.setPrepay(b.getProperty("/BadgeSS")?!0:!1)},g.prototype._onCOValidations=function(){var a=this.getOwnerComponent().getGlobalDataManager(),b=this.getView().getModel("oDtaVrfyContract");b.getProperty("/IsREBs")?(a.setREBS(!0),this.getView().getModel("oCfrmStatus").setProperty("/isREBS",!0)):(a.setREBS(!1),this.getView().getModel("oCfrmStatus").setProperty("/isREBS",!1))},g.prototype._onCaSelect=function(a){var b=a.getParameters().selectedKey;this._onCaSelected(b)},g.prototype._onCaSelected=function(a,b){var c,d=parseInt(a,10),e=!1;this.getView().getModel("oDtaVrfyBuags").setData(this.getView().getModel("oAllBuags").oData[d]),this._onCaValidations(),this._onCaChange(d),this._retrCaMailingAddr(this.getView().getModel("oDtaVrfyBuags").getProperty("/PartnerID"),this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),this.getView().getModel("oDtaVrfyBuags").getProperty("/FixedAddressID")),this._retrAllCo(this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),function(){e=!0}),c=setInterval(function(){e&&(b&&b(),this._routeInfoConfirm(),this._updateUsageLink(),clearInterval(c))}.bind(this),100)},g.prototype._onCaChange=function(a){var b=sap.ui.getCore().getEventBus(),c={iIndex:a};b.publish("nrg.module.dashoard","eBuagChanged",c)},g.prototype._retrCaMailingAddr=function(a,b,c){var d,e,f=this.getView().getModel("oODataSvc");d="/BuagMailingAddrs(PartnerID='"+a+"',ContractAccountID='"+b+"',FixedAddressID='"+c+"')",e={success:function(a){a&&this.getView().getModel("oDtaVrfyMailingTempAddr").setData(a)}.bind(this),error:function(){}.bind(this)},f&&f.read(d,e)},g.prototype._onCoSelect=function(a){var b=a.getParameters().selectedKey;this._onCoSelected(b)},g.prototype._onCoSelected=function(a){var b=parseInt(a,10);b>=0?(this.getView().getModel("oDtaVrfyContract").setData(this.getView().getModel("oAllContractsofBuag").oData[b]),this._onCOValidations(),this._refreshPaging(),this._onCoChange(this.getView().getModel("oAllContractsofBuag").oData[b]),this._routeInfoConfirm(),this._updateUsageLink()):(this.getView().getModel("oDtaVrfyContract").setData({}),this._refreshPaging(),this._onCoChange({}),this._routeInfoConfirm(),this._updateUsageLink())},g.prototype._onCoChange=function(a){var b=sap.ui.getCore().getEventBus(),c={coInfo:a};b.publish("nrg.module.dashoard","eCoChanged",c)},g.prototype._onGoToBillingInfo=function(){var a=this.getOwnerComponent().getCcuxContextManager().getContext().oData,b=this.getOwnerComponent().getRouter(),c=this.getView().getModel("oDtaVrfyBuags").getProperty("/BadgeSS"),d=!1;c&&(d=!0),d?a.coNum?b.navTo("billing.BillingPrePaid",{bpNum:a.bpNum,caNum:a.caNum,coNum:a.coNum}):b.navTo("billing.BillingPrePaidNoCo",{bpNum:a.bpNum,caNum:a.caNum}):a.coNum?b.navTo("billing.BillingInfo",{bpNum:a.bpNum,caNum:a.caNum,coNum:a.coNum}):b.navTo("billing.BillingInfoNoCo",{bpNum:a.bpNum,caNum:a.caNum})},g.prototype._onMeterClick=function(){var a=this.getOwnerComponent().getRouter(),b=this.getView().getModel("oDtaVrfyBP").getProperty("/PartnerID"),c=this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),d=this.getView().getModel("oDtaVrfyContract").getProperty("/ContractID");a.navTo("usage",{bpNum:b,caNum:c,coNum:d,typeV:"D"})},g.prototype._onConFirst=function(){var a=this.getView().getModel("oAllContractsofBuag"),b=0;this.getView().getModel("oDtaVrfyContract").setData(this.getView().getModel("oAllContractsofBuag").oData[b]),a.setProperty("/selectedKey",b.toString()),this._refreshPaging()},g.prototype._onConLeft=function(){var a=(this.getView().getModel("oCoPageModel").getProperty("/paging"),this.getView().getModel("oAllContractsofBuag")),b=parseInt(a.getProperty("/selectedKey"),10)-1;b>-1&&(this.getView().getModel("oDtaVrfyContract").setData(a.oData[b]),a.setProperty("/selectedKey",b.toString()),this._refreshPaging())},g.prototype._onConPone=function(){var a=this.getView().getModel("oCoPageModel").getProperty("/paging"),b=this.getView().getModel("oAllContractsofBuag"),c=a[0].co_ind-1;this.getView().getModel("oDtaVrfyContract").setData(b.oData[c]),this._onCoChange(this.getView().getModel("oAllContractsofBuag").oData[c]),b.setProperty("/selectedKey",c.toString()),this._refreshPaging(),this._routeInfoConfirm(),this._updateUsageLink()},g.prototype._onConPtwo=function(){var a=this.getView().getModel("oCoPageModel").getProperty("/paging"),b=this.getView().getModel("oAllContractsofBuag"),c=a[1].co_ind-1;this.getView().getModel("oDtaVrfyContract").setData(b.oData[c]),this._onCoChange(this.getView().getModel("oAllContractsofBuag").oData[c]),b.setProperty("/selectedKey",c.toString()),this._refreshPaging(),this._routeInfoConfirm(),this._updateUsageLink()},g.prototype._onConPthree=function(){var a=this.getView().getModel("oCoPageModel").getProperty("/paging"),b=this.getView().getModel("oAllContractsofBuag"),c=a[2].co_ind-1;this.getView().getModel("oDtaVrfyContract").setData(b.oData[c]),this._onCoChange(this.getView().getModel("oAllContractsofBuag").oData[c]),b.setProperty("/selectedKey",c.toString()),this._refreshPaging(),this._routeInfoConfirm(),this._updateUsageLink()},g.prototype._onConRite=function(){var a=(this.getView().getModel("oCoPageModel").getProperty("/paging"),
this.getView().getModel("oAllContractsofBuag")),b=parseInt(a.getProperty("/selectedKey"),10)+1;b<a.oData.length&&(this.getView().getModel("oDtaVrfyContract").setData(a.oData[b]),a.setProperty("/selectedKey",b.toString()),this._refreshPaging())},g.prototype._onConLast=function(){var a=this.getView().getModel("oAllContractsofBuag"),b=a.oData.length-1;this.getView().getModel("oDtaVrfyContract").setData(this.getView().getModel("oAllContractsofBuag").oData[b]),a.setProperty("/selectedKey",b.toString()),this._refreshPaging()},g.prototype._refreshPaging=function(){var a,b=this.getView().getModel("oCoPageModel").getProperty("/paging"),c=this.getView().getModel("oAllContractsofBuag"),d=parseInt(c.getProperty("/selectedKey"),10);if(0===d||2===c.oData.length)for(a=0;3>a;a+=1)b[a].co_ind=a+1;else if(d===c.oData.length-1)for(a=0;3>a;a+=1)b[a].co_ind=d+1-2+a;else for(a=0;3>a;a+=1)b[a].co_ind=d+a;this.getView().getModel("oCoPageModel").setProperty("/paging",b)},g.prototype._navToSvcOdr=function(){var a=this.getOwnerComponent().getCcuxContextManager().getContext().oData;this.navTo("dashboard.ServiceOrder",{bpNum:a.bpNum,caNum:a.caNum,coNum:a.coNum})},g.prototype.formatAddress2=function(a,b,c){var d="";return a&&(d+=a+","),b&&(d+=" "+b),c&&(d+=" "+c),d},g.prototype._onSelectAllContracts=function(){var a,b,c,d,e,f,g,h,i=this.getOwnerComponent().getModel("comp-dashboard"),j=this;e=["BP"],this._SortAsc=!0,g=new sap.ui.model.json.JSONModel,g.setSizeLimit(1500),f=[this._bpNum],d=this._createSearchFilterObject(e,f),this._oDialogFragment||(this._oDialogFragment=sap.ui.xmlfragment("Contracts","nrg.module.dashboard.view.ContractsPopup",this)),void 0===this._oContractsDialog&&(this._oContractsDialog=new ute.ui.main.Popup.create({title:"SERVICE ADDRESS SELECTION",content:this._oDialogFragment})),a="/CaCoS",c=sap.ui.core.Fragment.byId("Contracts","idnrgdashCoTable"),c.setModel(g,"view-dashboard"),h=sap.ui.core.Fragment.byId("Contracts","idnrgdashboard-search"),h.setValue(""),b={filters:d,success:function(a){g.setData(a),j._oContractsDialog.open(),j.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this),error:function(){j.getOwnerComponent().getCcuxApp().setOccupied(!1)}.bind(this)},i&&i.read(a,b)},g.prototype._onCentralSearch=function(a){var b,c,d,e,f,g,h,i,j,k;k=sap.ui.core.Fragment.byId("Contracts","idnrgdashCoTable"),b=new sap.ui.model.Filter("CA",sap.ui.model.FilterOperator.Contains,a),c=new sap.ui.model.Filter("Contract",sap.ui.model.FilterOperator.Contains,a),d=new sap.ui.model.Filter("House",sap.ui.model.FilterOperator.Contains,a),e=new sap.ui.model.Filter("Street",sap.ui.model.FilterOperator.Contains,a),f=new sap.ui.model.Filter("Apt",sap.ui.model.FilterOperator.Contains,a),g=new sap.ui.model.Filter("City",sap.ui.model.FilterOperator.Contains,a),h=new sap.ui.model.Filter("State",sap.ui.model.FilterOperator.Contains,a),i=new sap.ui.model.Filter("ZIP",sap.ui.model.FilterOperator.Contains,a),j=new sap.ui.model.Filter({filters:[b,c,d,e,f,g,h,i],and:!1}),k.getBinding("rows").filter(j)},g.prototype.onLiveSearch=function(a){this._onCentralSearch(a.mParameters.liveValue)},g.prototype.onSearch=function(){var a;a=sap.ui.core.Fragment.byId("Contracts","idnrgdashboard-search"),this._onCentralSearch(a.getValue())},g.prototype.onClearSearch=function(){var a;a=sap.ui.core.Fragment.byId("Contracts","idnrgdashboard-search"),a.setValue(""),this._onCentralSearch(a.getValue())},g.prototype._createSearchFilterObject=function(a,d){var e,f=[];for(e=0;e<a.length;e+=1)f.push(new b(a[e],c.EQ,d[e],""));return f},g.prototype.SelectCO=function(){var a,b,c,d,e,f=sap.ui.core.Fragment.byId("Contracts","idnrgdashCoTable"),g=f.getModel("view-dashboard"),h=this.getView().getModel("oAllBuags").oData,i=this,j=this.getView().getModel("oDtaVrfyBuags").getProperty("/ContractAccountID"),k=this.getView().getModel("oDtaVrfyContract").getProperty("/ContractID"),l=this.getView().getModel("oAllContractsofBuag");if(!this._aCOSelPaths)return void ute.ui.main.Popup.Alert({title:"Information",message:"Please select atleast one Contract"});if(a=g.getContext(this._aCOSelPaths),b=a.getProperty("CA"),c=a.getProperty("Contract"),e=function(){var a=i.getView().getModel("oAllContractsofBuag").oData;for(d=0;d<a.length;d+=1)parseInt(a[d].ContractID,10)===parseInt(c,10)&&(l.setProperty("/selectedKey",d),i._onCoSelected(d))},parseInt(j,10)===parseInt(b,10)){if(parseInt(k,10)===parseInt(c,10))return void this._oContractsDialog.close();e()}else for(d=0;d<h.length;d+=1)parseInt(h[d].ContractAccountID,10)===parseInt(b,10)&&(this.getView().getModel("oAllBuags").setProperty("/selectedKey",d),this._onCaSelected(d,e));this._oContractsDialog.close()},g.prototype.onSelect=function(a){this._aCOSelPaths=a.getSource().getParent().getBindingContext("view-dashboard").getPath(),this.SelectCO()},g.prototype.onSorting=function(a){var b,c,d=a.getSource(),e=d.data("sortField");b=sap.ui.core.Fragment.byId("Contracts","idnrgdashCoTable"),c=new sap.ui.model.Sorter(e,!this._SortAsc),this._SortAsc=!this._SortAsc,b.getBinding("rows").sort(c)},g.prototype.onCancelCO=function(){this._oContractsDialog.close()},g});