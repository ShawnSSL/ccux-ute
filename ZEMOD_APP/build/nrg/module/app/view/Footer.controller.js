sap.ui.define(["nrg/base/view/BaseController","sap/ui/model/Filter","sap/ui/model/FilterOperator","nrg/module/nnp/view/NNPPopup","jquery.sap.global"],function(a,b,c,d,e){"use strict";var f=a.extend("nrg.module.app.view.Footer",{constructor:function(){this.bFirstTimeRender=!0}});return f.prototype.onBeforeRendering=function(){this.getView().setModel(this.getOwnerComponent().getModel("main-app"),"oMainODataSvc"),this.getView().setModel(this.getOwnerComponent().getModel("noti-app"),"oNotiODataSvc"),this.getView().setModel(this.getOwnerComponent().getModel("rhs-app"),"oRHSODataSvc"),this.getView().setModel(this.getOwnerComponent().getModel("comp-app"),"oCompODataSvc"),this.getView().setModel(this.getOwnerComponent().getModel("elig-app"),"oDataEligSvc"),this.getView().setModel(this.getOwnerComponent().getModel("dpp-app"),"oDataDppSvc"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oFooterNotification"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oFooterRHS"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oFooterCampaign"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oFooterRouting"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oFooterBpInfo"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oBpInfo"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oEligibility"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oMmDpp");var a=new sap.ui.model.json.JSONModel({showCYP:!1}),b=this.getOwnerComponent().getCcuxRouteManager().getCurrentRouteInfo();this.getView().setModel(a,"localModel"),this._updateRouting(b.parameters.bpNum,b.parameters.caNum,b.parameters.coNum),b.name.indexOf("Verification")>0||b.name.indexOf("Billing")>0?this.footerOpen():this.footerClose(),this.bFirstTimeRender&&(this.bFirstTimeRender=!1,sap.ui.getCore().getEventBus().subscribe("nrg.module.appFooter","eUpdateFooter",this.updateFooter,this),sap.ui.getCore().getEventBus().subscribe("nrg.module.appFooter","eUpdateNotification",this.updateFooterNotification,this),sap.ui.getCore().getEventBus().subscribe("nrg.module.appFooter","eUpdateRhs",this.updateFooterRhs,this),sap.ui.getCore().getEventBus().subscribe("nrg.module.appFooter","eUpdateCampaign",this.updateFooterCampaign,this))},f.prototype.onAfterRendering=function(){this.getView().byId("nrgAppMain-footerCaret").detachBrowserEvent("click",this.footerCaretClick,this),this.getView().byId("nrgAppMain-footerCaret").attachBrowserEvent("click",this.footerCaretClick,this),this.initUiBlocks()},f.prototype._updateRouting=function(a,b,c){var d=this.getView().getModel("oFooterRouting");d.setProperty("/BpNumber",a),d.setProperty("/CaNumber",b),d.setProperty("/CoNumber",c)},f.prototype._retrieveBpInfo=function(a,b){var c,d=this.getView().getModel("oMainODataSvc"),e=this.getView().getModel("oBpInfo"),f="/Partners('"+a+"')";c={success:function(a){e.setData(a),b&&b()}.bind(this),error:function(){}.bind(this)},d&&a&&d.read(f,c)},f.prototype._retrieveEligibility=function(a,b){var c,d=this.getView().getModel("oFooterRouting"),e="/EligCheckS('"+d.oData.CoNumber+"')",f=this.getView().getModel("oDataEligSvc"),g=this.getView().getModel("oEligibility");c={success:function(b){g.setData(b),a&&a()}.bind(this),error:function(){b&&b()}.bind(this)},f&&d.oData.CoNumber&&f.read(e,c)},f.prototype._retrieveMmDppInfo=function(){var a=this.getView().getModel("oFooterRouting"),b="/DppMmInvS('"+a.oData.CaNumber+"')",c=this.getView().getModel("oDataDppSvc"),d=this.getView().getModel("oMmDpp"),e={success:function(a){a.Message.length>0?(ute.ui.main.Popup.Alert({title:"Error",message:a.Message}),this.m2mPopup&&this.m2mPopup.close()):d.setData(a)}.bind(this),error:function(){ute.ui.main.Popup.Alert({title:"Error",message:"Unable to retrieve info for DPP"}),this.m2mPopup&&this.m2mPopup.close()}.bind(this)};c&&a.oData.CaNumber&&c.read(b,e)},f.prototype.footerCaretClick=function(){this.getView().byId("nrgAppMain-footerWrap").hasStyleClass("open")?(this.getView().byId("nrgAppMain-footerWrap").removeStyleClass("open"),e(".uteAppBodyCnt-footer").css("border-bottom","6px solid #FFF")):(this.getView().byId("nrgAppMain-footerWrap").addStyleClass("open"),e(".uteAppBodyCnt-footer").css("border-bottom","none"))},f.prototype.footerClose=function(){this.getView().byId("nrgAppMain-footerWrap").hasStyleClass("open")&&(this.getView().byId("nrgAppMain-footerWrap").removeStyleClass("open"),e(".uteAppBodyCnt-footer").css("border-bottom","6px solid #FFF"))},f.prototype.footerOpen=function(){this.getView().byId("nrgAppMain-footerWrap").hasStyleClass("open")||(this.getView().byId("nrgAppMain-footerWrap").addStyleClass("open"),e(".uteAppBodyCnt-footer").css("border-bottom","none"))},f.prototype.initUiBlocks=function(){this.footerElement={},this.footerElement.notiEmptySec=this.getView().byId("nrgAppFtrDetails-notification-emptySection"),this.footerElement.notiAlertSec=this.getView().byId("nrgAppFtrDetails-notification-alertSection"),this.footerElement.notiEmptySec.setVisible(!0),this.footerElement.notiAlertSec.setVisible(!1),this.footerElement.rhsEmptySec=this.getView().byId("nrgAppFtrDetails-rhs-emptySection"),this.footerElement.rhsProdSec=this.getView().byId("nrgAppFtrDetails-rhs-productSection"),this.footerElement.rhsEmptySec.setVisible(!0),this.footerElement.rhsProdSec.setVisible(!1),this.footerElement.campEmptySec=this.getView().byId("nrgAppFtrDetails-eligibleOffers-emptySection"),this.footerElement.campOfferSec=this.getView().byId("nrgAppFtrDetails-eligibleOffers"),this.footerElement.campBtnSec=this.getView().byId("nrgAppFtrDetails-campaignButton"),this.footerElement.campEmptySec.setVisible(!0),this.footerElement.campOfferSec.setVisible(!1),this.footerElement.campBtnSec.setVisible(!1)},f.prototype.onContactLog=function(){var a=this.getOwnerComponent().getCcuxWebUiManager(),b=this.getView().getModel("oFooterRouting");a.notifyWebUi("openIndex",{LINK_ID:"Z_CLFULLVW",REF_ID:b.getProperty("/CoNumber")})},f.prototype.onCreateLog=function(){var a=this.getOwnerComponent().getCcuxWebUiManager(),b=this.getView().getModel("oFooterRouting");a.notifyWebUi("openIndex",{LINK_ID:"ZUXINQ2",REF_ID:b.getProperty("/CoNumber")})},f.prototype.updateFooter=function(a,b,c){this.updateFooterNotification(a,b,c),this.updateFooterRhs(a,b,c),this.updateFooterCampaign(a,b,c)},f.prototype.updateFooterNotification=function(a,d,e){var f,g,h=this.getView().getModel("oNotiODataSvc"),i="/AlertsSet",j=[];e.bpNum&&e.caNum&&(this._updateRouting(e.bpNum,e.caNum,e.coNum),j.push(new b({path:"BP",operator:c.EQ,value1:e.bpNum})),j.push(new b({path:"CA",operator:c.EQ,value1:e.caNum})),e.coNum&&j.push(new b({path:"Contract",operator:c.EQ,value1:e.coNum})),j.push(new b({path:"Identifier",operator:c.EQ,value1:"FOOTER"})),f={filters:j,success:function(a){if(a.results.length){for(g=0;g<a.results.length;g+=1)a.results[g].Design="M2M"===a.results[g].FilterType||"SMTP"===a.results[g].FilterType||"MAIL"===a.results[g].FilterType||"SMS"===a.results[g].FilterType||"OAM"===a.results[g].FilterType?"Error":"Status";for(this.getView().getModel("oFooterNotification").setData(a.results),this.notificationLinkPressActions={},g=0;g<a.results.length;g+=1)"M2M"===a.results[g].FilterType&&(this.notificationLinkPressActions[a.results[g].MessageText]=this._onM2mLinkPress.bind(this)),"SMTP"===a.results[g].FilterType&&(this.notificationLinkPressActions[a.results[g].MessageText]=this._onSmtpLinkPress.bind(this)),"MAIL"===a.results[g].FilterType&&(this.notificationLinkPressActions[a.results[g].MessageText]=this._onMailLinkPress.bind(this)),"SMS"===a.results[g].FilterType&&(this.notificationLinkPressActions[a.results[g].MessageText]=this._onSmsLinkPress.bind(this)),"OAM"===a.results[g].FilterType&&(this.notificationLinkPressActions[a.results[g].MessageText]=this._onOamLinkPress.bind(this));this.footerElement.notiEmptySec.setVisible(!1),this.footerElement.notiAlertSec.setVisible(!0)}else this.footerElement.notiEmptySec.setVisible(!0),this.footerElement.notiAlertSec.setVisible(!1)}.bind(this),error:function(){this.footerElement.notiEmptySec.setVisible(!0),this.footerElement.notiAlertSec.setVisible(!1)}.bind(this)},h&&h.read(i,f))},f.prototype.updateFooterRhs=function(a,d,e){var f,g="/FooterS",h=[],i=this.getView().getModel("oRHSODataSvc"),j=!1,k=!1,l=!1;e.bpNum&&e.caNum&&(this._updateRouting(e.bpNum,e.caNum,e.coNum),h.push(new b({path:"BP",operator:c.EQ,value1:e.bpNum})),h.push(new b({path:"CA",operator:c.EQ,value1:e.caNum})),f={filters:h,success:function(a){{var b,c,d=this.getView().getModel("oFooterRHS"),e=0,f=[];this.getView().byId("nrgAppFtrDetails-rhs-currentItem")}if(a.results.length>0){for(b=0;b<a.results.length;b+=1)"C"===a.results[b].Type&&(j=!0,a.results[b].key=e+=1,f.push(a.results[b]));for(d.setProperty("/DropdownVis",j),d.setProperty("/NoneVis",!j),d.setProperty("/Current",f),d.setProperty("/DropdownDefautKey",1),this.getView().byId("nrgAppFtrDetails-rhs-currentDropdown").attachBrowserEvent("click",this._onRhsCurrenDropdownClick.bind(this)),c=0;c<a.results.length;c+=1)"P"===a.results[c].Type&&(k=!0,this.getView().byId("nrgAppFtrDetails-rhs-pendingItemContent").setText(a.results[c].ProdName)),"H"===a.results[c].Type&&(l=!0,this.getView().byId("nrgAppFtrDetails-rhs-historyItemContent").setText(a.results[c].ProdName));j===!1&&this.getView().byId("nrgAppFtrDetails-rhs-currentItemContent").setText("None"),k===!1&&this.getView().byId("nrgAppFtrDetails-rhs-pendingItemContent").setText("None"),l===!1&&this.getView().byId("nrgAppFtrDetails-rhs-historyItemContent").setText("None"),this.footerElement.rhsEmptySec.setVisible(!1),this.footerElement.rhsProdSec.setVisible(!0)}else j===!1&&this.getView().byId("nrgAppFtrDetails-rhs-currentItemContent").setText("None"),k===!1&&this.getView().byId("nrgAppFtrDetails-rhs-pendingItemContent").setText("None"),l===!1&&this.getView().byId("nrgAppFtrDetails-rhs-historyItemContent").setText("None"),d.setProperty("/DropdownVis",!1),d.setProperty("/NoneVis",!0),this.footerElement.rhsEmptySec.setVisible(!1),this.footerElement.rhsProdSec.setVisible(!0)}.bind(this),error:function(){this.footerElement.rhsEmptySec.setVisible(!0),this.footerElement.rhsProdSec.setVisible(!1)}.bind(this)},i&&i.read(g,f))},f.prototype._onRhsCurrenItemSelect=function(){}.bind(this),f.prototype._onRhsCurrenDropdownClick=function(){var a=e(".nrgAppFtrDetails-rhs");a.find(".uteMDd-picker").height()>170&&(a.hasClass("scrollBarAppear")?a.removeClass("scrollBarAppear"):a.addClass("scrollBarAppear"))},f.prototype._onRHS=function(){var a=this.getOwnerComponent().getCcuxWebUiManager(),b={},c=this.getView().getModel("oFooterRouting");b.LINK_ID="ZVASOPTSLN",b.REF_ID="ENROLL",c.getProperty("/CoNumber")&&(b.CONTRACT_ID=c.getProperty("/CoNumber")),a.notifyWebUi("openIndex",b)},f.prototype._onRHSStatus=function(){var a=this.getOwnerComponent().getCcuxWebUiManager(),b={},c=this.getView().getModel("oFooterRouting");b.LINK_ID="ZVASOPTSLN",b.REF_ID="CANCEL",c.getProperty("/CoNumber")&&(b.CONTRACT_ID=c.getProperty("/CoNumber")),a.notifyWebUi("openIndex",b)},f.prototype.updateFooterCampaign=function(a,b,c){this._updateRouting(c.bpNum,c.caNum,c.coNum),this._updateFooterCampaignContract(c.coNum),this._updateFooterCampaignButton(c.coNum)},f.prototype._updateFooterCampaignContract=function(a){var d,e="/CpgFtrS",f=[],g=this.getView().getModel("oCompODataSvc");a&&(f.push(new b({path:"Contract",operator:c.EQ,value1:a})),d={filters:f,success:function(a){var b,c=this.getView().getModel("oFooterCampaign");if(a.results.length>0){for(b=0;b<a.results.length;b+=1)"C"===a.results[b].Type&&(c.setProperty("/Current",a.results[b]),"None"!==c.oData.Current.OfferTitle&&""!==c.oData.Current.OfferTitle&&this.getView().byId("nrgAppFtrDetails-eligibleOffers-currentItem").addStyleClass("hasValue")),"PE"===a.results[b].Type&&(c.setProperty("/Pending",a.results[b]),"None"!==c.oData.Pending.OfferTitle&&""!==c.oData.Pending.OfferTitle&&this.getView().byId("nrgAppFtrDetails-eligibleOffers-pendingItem").addStyleClass("hasValue")),"H"===a.results[b].Type&&(c.setProperty("/History",a.results[b]),"None"!==c.oData.History.OfferTitle&&""!==c.oData.History.OfferTitle&&this.getView().byId("nrgAppFtrDetails-eligibleOffers-historyItem").addStyleClass("hasValue"));this.footerElement.campEmptySec.setVisible(!1),this.footerElement.campOfferSec.setVisible(!0),this.footerElement.campBtnSec.setVisible(!0)}else this.footerElement.campEmptySec.setVisible(!0),this.footerElement.campOfferSec.setVisible(!1),this.footerElement.campBtnSec.setVisible(!1)}.bind(this),error:function(){this.footerElement.campEmptySec.setVisible(!0),this.footerElement.campOfferSec.setVisible(!1),this.footerElement.campBtnSec.setVisible(!1)}.bind(this)},g&&g.read(e,d))},f.prototype._checkCYP=function(a){var b,c=this.getOwnerComponent().getModel("comp-campaign"),d="/CYPS('123')",f=this.getView().getModel("localModel");b={success:function(b){b&&b.ShowCYP&&f.setProperty("/showCYP",!0),a()}.bind(this),error:function(){e.sap.log.info("Odata Error occured"),a()}.bind(this)},c&&c.read(d,b)},f.prototype._updateFooterCampaignButton=function(a){var b,c="/ButtonS('"+a+"')",d=this.getView().getModel("oCompODataSvc"),e=this.getView().getModel("localModel"),f=!1;a&&(b={success:function(a){var b,c=this.getView().getModel("oFooterCampaign");a.Contract&&(b=function(){e&&e.getProperty("/showCYP")&&(f=!0),f?c.setProperty("/CampaignButtonText",a.ButtonText):a.InitTab?c.setProperty("/CampaignButtonText","Eligible Offers Available"):c.setProperty("/CampaignButtonText","No Eligible Offers Available")},this._checkCYP(b),c.setProperty("/CampaignFirstBill",a.FirstBill),c.setProperty("/CampaignButtonType",a.InitTab),c.setProperty("/CampaignButtonMoveOut",a.PendMvo),c.setProperty("/CampaignButtonMsg",a.Message))}.bind(this),error:function(){}.bind(this)},d&&a&&d.read(c,b))},f.prototype._formatCampaignTime=function(a){if(a){var b=sap.ui.core.format.DateFormat.getDateInstance({pattern:"MM/yyyy"}),c=b.format(new Date(a.getTime()));return c}},f.prototype._onCampaignItemClick=function(a){var b=this.getOwnerComponent().getRouter(),c=this.getView().getModel("oFooterRouting"),d=a.getSource().getDomRef().childNodes[0];e(d).hasClass("currentItem")&&e(d).hasClass("hasValue")&&b.navTo("campaign",{bpNum:c.oData.BpNumber,caNum:c.oData.CaNumber,coNum:c.oData.CoNumber,typeV:"C"}),e(d).hasClass("pendingItem")&&e(d).hasClass("hasValue")&&b.navTo("campaign",{bpNum:c.oData.BpNumber,caNum:c.oData.CaNumber,coNum:c.oData.CoNumber,typeV:"PE"}),e(d).hasClass("historyItem")&&e(d).hasClass("hasValue")&&b.navTo("campaignhistory",{bpNum:c.oData.BpNumber,caNum:c.oData.CaNumber,coNum:c.oData.CoNumber})},f.prototype._onCampaignBtnClick=function(){var a=this.getView().getModel("oFooterCampaign"),b=a.getProperty("/CampaignFirstBill"),c=a.getProperty("/CampaignButtonMsg"),d=a.getProperty("/CampaignButtonMoveOut"),e=a.getProperty("/CampaignButtonType"),f=(this.getOwnerComponent().getRouter(),this.getView().getModel("oFooterRouting"));return d?void ute.ui.main.Popup.Alert({title:"Information",message:"We are unable to process your campaign change request because you have already requested a move out."}):b?(e&&void 0!==e&&null!==e&&""!==e||(e="SE"),void this._getPendingSwapsCount(f.oData.BpNumber,f.oData.CaNumber,f.oData.CoNumber,e)):void ute.ui.main.Popup.Alert({title:"Information",message:c})},f.prototype._getPendingSwapsCount=function(a,d,f,g){var h,i=this.getOwnerComponent().getRouter(),j=this.getView().getModel("oFooterRouting"),k="/PendSwapS/$count",l=[],m=this.getView().getModel("oCompODataSvc");this._sInitTab=g,l.push(new b({path:"Contract",operator:c.EQ,value1:j.oData.CoNumber})),h={filters:l,success:function(b){b&&(e.sap.log.info("Odata Read Successfully:::"),parseInt(b,10)>0?this._showPendingSwaps():i.navTo("campaignoffers",{bpNum:a,caNum:d,coNum:f,typeV:g}))}.bind(this),error:function(a){e.sap.log.info("Odata Failed:::"+a)}.bind(this)},m&&j.oData.CoNumber&&m.read(k,h)},f.prototype._showPendingSwaps=function(){var a,d,e,f,g=this.getView().getModel("oFooterRouting"),h="/PendSwapS",i=[],j=this.getOwnerComponent().getModel("comp-campaign"),k=new sap.ui.model.json.JSONModel({selected:0,ReqNumber:"",ReqName:"",NoPhone:!1});this.getView().setModel(k,"localModel"),this.getOwnerComponent().getCcuxApp().setOccupied(!0),this._aPendingSelPaths=[],i.push(new b({path:"Contract",operator:c.EQ,value1:g.oData.CoNumber})),this._oPedingSwapsFragment||(this._oPedingSwapsFragment=sap.ui.xmlfragment("FooterPendingSwaps","nrg.module.app.view.FooterPendingSwaps",this)),this._oCancelDialog||(this._oCancelDialog=new ute.ui.main.Popup.create({title:"Change Campaign - Cancel",close:this._handleDialogClosed,content:this._oPedingSwapsFragment}),this._oCancelDialog.addStyleClass("nrgCamHis-dialog")),d=sap.ui.core.Fragment.byId("FooterPendingSwaps","idnrgCamPds-pendTable"),e=sap.ui.core.Fragment.byId("FooterPendingSwaps","idnrgCamPds-pendRow"),d.setModel(j,"comp-campaign"),this._oPedingSwapsFragment.setModel(this.getView().getModel("localModel"),"localModel"),f=function(){var a=d.getBinding("rows");this._oCancelDialog.open(),this.getOwnerComponent().getCcuxApp().setOccupied(!1),a&&a.detachDataReceived(f)}.bind(this),a={model:"comp-campaign",path:h,filters:i,template:e,events:{dataReceived:f}},d.bindRows(a)},f.prototype.onNotiLinkPress=function(a){this.notificationLinkPressActions[a.getSource().getProperty("text")]()},f.prototype._onM2mLinkPress=function(){this.m2mPopup||(this.m2mPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.app.view.AlertM2mPopup",this),title:"Multi-Month Invoice"}),this.m2mPopup.addStyleClass("nrgApp-m2mPopup"),this.getView().addDependent(this.m2mPopup)),this._retrieveMmDppInfo(),this.m2mPopup.open()},f.prototype._onM2mAcceptClick=function(){var a,b,c=this.getOwnerComponent().getCcuxWebUiManager(),d=this.getOwnerComponent().getRouter(),e=this.getView().getModel("oFooterRouting");this.getOwnerComponent().getCcuxApp().setOccupied(!0),this._retrieveEligibility(function(){a="success"},function(){a="fail"}),b=setInterval(function(){if("success"===a){var f=this.getView().getModel("oEligibility");this.getOwnerComponent().getCcuxApp().setOccupied(!1),clearInterval(b),this.m2mPopup.close(),f.oData.DPPActv?c.notifyWebUi("openIndex",{LINK_ID:"Z_DPP"}):d.navTo("billing.DefferedPmtMonths",{bpNum:e.oData.BpNumber,caNum:e.oData.CaNumber,coNum:e.oData.CoNumber,mNum:"5"})}"fail"===a&&(this.getOwnerComponent().getCcuxApp().setOccupied(!1),clearInterval(b),this.m2mPopup.close(),ute.ui.main.Popup.Alert({title:"Retrieve Error",message:"We cannot retrieve the eligibility data of DPP. Please check the Contract number or network and try again later."}))}.bind(this),100)},f.prototype._onM2mDeclineClick=function(){var a=this.getView().getModel("oFooterRouting"),b=this.getView().getModel("oDataDppSvc"),c={method:"POST",urlParameters:{CA:a.oData.CaNumber},success:function(){ute.ui.main.Popup.Alert({title:"Success",message:"Contact log saved"})}.bind(this),error:function(){ute.ui.main.Popup.Alert({title:"Error",message:"Unable to save contact log"})}.bind(this)};b.callFunction("/DppDecline",c),this.m2mPopup.close()},f.prototype._onM2mCloseClick=function(){this.m2mPopup.close()},f.prototype._onSmtpLinkPress=function(){var a,b=new d,c=this.getView().getModel("oFooterRouting"),e=c.oData.BpNumber,f=c.oData.CaNumber,g=c.oData.CoNumber,h=this.getView().getModel("oBpInfo"),i=!1;this._retrieveBpInfo(e,function(){i=!0}),a=setInterval(function(){i&&(b.attachEvent("NNPCompleted",function(){this.updateFooter({},{},{bpNum:e,caNum:f,coNum:g}),this.getOwnerComponent().getCcuxApp().setOccupied(!1)},this),this.getView().addDependent(b),b.openNNP(e,h.oData.Email,h.oData.EmailConsum),clearInterval(a))}.bind(this),100)},f.prototype._onSmsLinkPress=function(){this.invalidSmsPopup||(this.invalidSmsPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.app.view.AlertInvSmsPopup",this),title:"Invalid SMS Number"}),this.invalidSmsPopup.addStyleClass("nrgApp-invalidSmsPopup"),this.getView().addDependent(this.invalidSmsPopup)),this.invalidSmsPopup.open()},f.prototype._onInvSmsCloseClick=function(){this.invalidSmsPopup.close()},f.prototype._onOamLinkPress=function(){var a,b=this.getView().getModel("oFooterNotification");for(a=0;a<b.oData.length;a+=1)"OAM"===b.oData[a].FilterType&&b.setProperty("/ErrorMessage",b.oData[a].MessageText);this.oamPopup||(this.oamPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.app.view.AlertOamPopup",this),title:"Invalid OAM Email"}),this.oamPopup.addStyleClass("nrgApp-oamPopup"),this.getView().addDependent(this.oamPopup)),this.oamPopup.open()},f.prototype._onOamCloseClick=function(){this.oamPopup.close()},f.prototype._onMailLinkPress=function(){this.invalidMailingAddrPopup||(this.invalidMailingAddrPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.app.view.AlertInvMailAddrPopup",this),title:"Invalid Mailing Address"}),this.invalidMailingAddrPopup.addStyleClass("nrgApp-invalidMailingAddrPopup"),this.getView().addDependent(this.invalidMailingAddrPopup)),this.invalidMailingAddrPopup.open()},f.prototype._onInvMailAddrContinueClick=function(){this.invalidMailingAddrPopup.close();var a=this.getView().getModel("oFooterRouting");a.getProperty("/CoNumber")?this.navTo("bupa.caInfo",{bpNum:a.getProperty("/BpNumber"),caNum:a.getProperty("/CaNumber"),coNum:a.getProperty("/CoNumber")}):this.navTo("bupa.caInfoNoCo",{bpNum:a.getProperty("/BpNumber"),caNum:a.getProperty("/CaNumber")})},f.prototype._onInvMailAddrCloseClick=function(){this.invalidMailingAddrPopup.close()},f.prototype.onPendingSwapsSelected=function(a){var b,c,d,e=this._oPedingSwapsFragment.getModel("localModel").getProperty("/selected");return b=a.getSource().getParent().getBindingContext("comp-campaign").getPath(),a.getSource().getChecked()&&1===this._aPendingSelPaths.length?(ute.ui.main.Popup.Alert({title:"Information",message:"Only One Pending Swap allowed"}),void a.getSource().setChecked(!1)):(c=this._aPendingSelPaths.indexOf(b),a.getSource().getChecked()?(e+=1,d=0>c&&this._aPendingSelPaths.push(b)):(e-=1,d=c>-1&&this._aPendingSelPaths.splice(c,1)),void this._oPedingSwapsFragment.getModel("localModel").setProperty("/selected",e))},f.prototype.ProceedwithCancel=function(){var a,b,c,d,f,g=this.getOwnerComponent().getModel("comp-campaign"),h=this.getOwnerComponent().getModel("comp-i18n-campaign"),i=this.getView().getModel("oFooterRouting"),j=i.oData.BpNumber,k=i.oData.CaNumber,l=i.oData.CoNumber;return b=this._oPedingSwapsFragment.getModel("localModel"),c=b.getProperty("/ReqName"),d=b.getProperty("/ReqNumber"),f=b.getProperty("/NoPhone"),this._aPendingSelPaths&&this._aPendingSelPaths.length>0?c&&""!==c?f||d&&""!==d?(g.setRefreshAfterChange(!1),this._aPendingSelPaths.forEach(function(b){var f=g.getContext(b);a={method:"POST",urlParameters:{iDoc:f.getProperty("IdocNo"),ReqNumber:d,Type:f.getProperty("SwapType"),ReqName:c,Contract:f.getProperty("Contract"),Hist:f.getProperty("HistoryNo")},success:function(){e.sap.log.info("Odata Read Successfully:::")}.bind(this),error:function(){e.sap.log.info("Eligibility Error occured")}.bind(this)},g.callFunction("/DeleteCampaign",a)}),this._oCancelDialog.close(),void this.navTo("campaignoffers",{bpNum:j,caNum:k,coNum:l,typeV:this._sInitTab||"SE"})):void ute.ui.main.Popup.Alert({title:"Information",message:h.getProperty("nrgCmpOvrNoPhoneErrMsg")}):void ute.ui.main.Popup.Alert({title:"Information",message:h.getProperty("nrgCmpOvrEntReqName")}):void ute.ui.main.Popup.Alert({title:"Information",message:h.getProperty("nrgCmpOvrPendingSwapSelection")})},f.prototype.ContinueWithoutCancel=function(){var a=this.getView().getModel("oFooterRouting"),b=a.oData.BpNumber,c=a.oData.CaNumber,d=a.oData.CoNumber;this._oCancelDialog.close(),this.navTo("campaignoffers",{bpNum:b,caNum:c,coNum:d,typeV:this._sInitTab||"SE"})},f.prototype.onSelected=function(a){a.getSource().getChecked()&&this._oPedingSwapsFragment.getModel("localModel").setProperty("/ReqNumber","")},f});