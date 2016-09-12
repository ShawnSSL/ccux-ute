sap.ui.define(["nrg/base/view/BaseController","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(a,b,c){"use strict";var d=a.extend("nrg.module.dashboard.view.Reconnect");return d.prototype.onBeforeRendering=function(){this._OwnerComponent=this.getView().getParent().getParent().getParent().getController().getOwnerComponent(),this._ReconnectControl=this.getView().getParent();var a=this._OwnerComponent.getCcuxRouteManager().getCurrentRouteInfo();this._bpNum=a.parameters.bpNum,this._caNum=a.parameters.caNum,this._coNum=a.parameters.coNum,this.getView().setModel(this._OwnerComponent.getModel("comp-dashboard-svcodr"),"oODataSvc"),this.getView().setModel(new sap.ui.model.json.JSONModel,"oReconnectInfo"),this._checkReconnectElgi()},d.prototype._formatEmergencyReco=function(a){return"E"===a||"e"===a?!0:!1},d.prototype._formatStandardReco=function(a){return"S"===a||"s"===a?!0:!1},d.prototype._onReconnectionClick=function(){this._oReconnectPopup||(this._oReconnectPopup=ute.ui.main.Popup.create({content:sap.ui.xmlfragment(this.getView().sId,"nrg.module.dashboard.view.Reconnect",this),title:"RECONNECTION"}),this._oReconnectPopup.addStyleClass("nrgDashboard-reconnectionPopup"),this.getView().addDependent(this._oReconnectPopup)),this._checkReconnectElgi()},d.prototype._onStandardRecoSelected=function(){var a=this.getView().getModel("oReconnectInfo");a.oData.results.length>0&&a.setProperty("/RecoType","S")},d.prototype._onEmergencyRecoSelected=function(){var a=this.getView().getModel("oReconnectInfo");a.oData.results.length>0&&a.setProperty("/RecoType","E")},d.prototype._onMtrAcsYesSelected=function(){var a=this.getView().getModel("oReconnectInfo");a.oData.results.length>0&&a.setProperty("/AccMeter","X")},d.prototype._onMtrAcsNoSelected=function(){var a=this.getView().getModel("oReconnectInfo");a.oData.results.length>0&&a.setProperty("/AccMeter","")},d.prototype._onReconnectClicked=function(){this._confirmReconnectInput()},d.prototype._onReconnectCancelClicked=function(){this._ReconnectControl.close()},d.prototype._confirmReconnectInput=function(){var a=this.getView().getModel("oReconnectInfo");a.getProperty("/ReqName")?a.getProperty("/ReqNumber")?a.getProperty("/AccMeter")||a.getProperty("/AccComment")?this._confirmMeterAccess():ute.ui.main.Popup.Alert({title:"Reconnection -- Confirm",message:"Please input meter access comment."}):ute.ui.main.Popup.Alert({title:"Reconnection -- Confirm",message:"Please input requestor's number."}):ute.ui.main.Popup.Alert({title:"Reconnection -- Confirm",message:"Please input requestor's name."})},d.prototype._confirmMeterAccess=function(){ute.ui.main.Popup.Confirm({title:"Reconnection -- Confirm",message:"Have you confirmed the meter's accessibility?",callback:function(a){"Yes"===a&&this._confirmPowerOnExpect()}.bind(this)})},d.prototype._confirmPowerOnExpect=function(){var a=this;ute.ui.main.Popup.Confirm({title:"Reconnection -- Confirm",message:"Please confirm that you have communicated the Power-on expectations to the customer.",callback:function(b){"Yes"===b&&a._updateRecconectInfo()}})},d.prototype._checkReconnectElgi=function(){var a,b,c=this.getView().getModel("oODataSvc"),d=this;a="/RecoEligS('"+this._caNum+"')",b={success:function(a){return a.RElig?void this._retrReconnectInfo():(ute.ui.main.Popup.Alert({title:"Reconnection",message:a.Message}),d._ReconnectControl.close(),!1)}.bind(this),error:function(){return ute.ui.main.Popup.Alert({title:"Reconnection",message:"Connection error, reconnection eligible call failed."}),!1}.bind(this)},c&&c.read(a,b)},d.prototype._retrReconnectInfo=function(){var a,d,e=[],f=this.getView().getModel("oODataSvc"),g=this;e.push(new b({path:"PartnerID",operator:c.EQ,value1:this._bpNum})),e.push(new b({path:"BuagID",operator:c.EQ,value1:this._caNum})),a="/Reconnects(PartnerID='"+this._bpNum+"',BuagID='"+this._caNum+"')",d={filters:e,success:function(a){g._OwnerComponent.getCcuxApp().setOccupied(!1),a&&this.getView().getModel("oReconnectInfo").setData(a)}.bind(this),error:function(a){if(g._OwnerComponent.getCcuxApp().setOccupied(!1),a&&a.responseText){var b=JSON.parse(a.responseText);ute.ui.main.Popup.Alert(b&&b.error&&b.error.message&&b.error.message.value?{title:"Reconnection",message:b.error.message.value}:{title:"Reconnection",message:"Error in Backend"})}else ute.ui.main.Popup.Alert({title:"Reconnection",message:"Error in Backend"});g._ReconnectControl.close()}.bind(this)},f&&(this._OwnerComponent.getCcuxApp().setOccupied(!0),f.read(a,d))},d.prototype._updateRecconectInfo=function(){var a,b,c,d=this.getView().getModel("oODataSvc"),e=this.getView().getModel("oReconnectInfo"),f=this;a="/Reconnects",b={merge:!1,success:function(a){f._OwnerComponent.getCcuxApp().setOccupied(!1),a&&(c="Reconnect Notification "+a.RecoNumber+" created for contract "+a.VERTRAG,ute.ui.main.Popup.Alert({title:"Reconnection",message:c})),f._ReconnectControl.close()}.bind(this),error:function(){f._OwnerComponent.getCcuxApp().setOccupied(!1),ute.ui.main.Popup.Alert({title:"Reconnection",message:"Recoonection Service Order Request Failed"}),f._ReconnectControl.close()}.bind(this)},d&&(f._OwnerComponent.getCcuxApp().setOccupied(!0),d.create(a,e.getData(),b))},d});