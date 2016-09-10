/*globals sap*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'nrg/base/view/BaseController',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'jquery.sap.global',
        "sap/ui/model/json/JSONModel"
    ],

    function (CoreController, Filter, FilterOperator, jQuery, JSONModel) {
        'use strict';

        var Controller = CoreController.extend('nrg.module.campaign.view.General');


		/* =========================================================== */
		/* lifecycle method- Init                                     */
		/* =========================================================== */
        Controller.prototype.onInit = function () {
            //this.getOwnerComponent().getRouter().getRoute("campaign").attachPatternMatched(this._onObjectMatched, this);
            //this._i18NModel = this.getOwnerComponent().getModel("comp-i18n-campaign");
        };

        /**
		 * Binds the view to the object path
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 * @private
		 */
        Controller.prototype._onObjectMatched = function (oEvent) {
            var oModel,
                sCurrentPath,
                sEligibilityPath,
                oMetaContext,
                oTemplateView,
                oMetaModel,
                that = this,
                mParameters,
                fnRecievedHandler,
                oJsonModel;

            // Leveraging XML Templates..........................................
            oModel = this.getOwnerComponent().getModel('comp-campaign');
            sEligibilityPath = "/EFLS";
/*            this._sContract = oEvent.getParameter("arguments").coNum;
            sEligibilityPath = sEligibilityPath + "('" + this._sContract + "')";*/
            oJsonModel = new sap.ui.model.json.JSONModel();
            mParameters = {
                success : function (oData) {
                    oJsonModel.setData(oData);
                    oTemplateView = sap.ui.view({
                        preprocessors: {
                            xml: {
/*                                bindingContexts: {
                                    meta : oModel.getContext(sEligibilityPath)
                                },*/
                                models: {
                                    tmpl : oJsonModel
                                }
                            }
                        },
                        type: sap.ui.core.mvc.ViewType.XML,
                        viewName: "nrg.module.campaign.view.EFLData"
                    });
                    oTemplateView.setModel(oJsonModel, "items");
                    that.getView().byId('viewContent').addContent(oTemplateView);
                }.bind(this),
                error: function (oError) {
                    jQuery.sap.log.info("Eligibility Error occured");
                }.bind(this)
            };
            if (oModel) {
                oModel.read(sEligibilityPath, mParameters);
            }

		};

       /**
		 * Assign the filter objects based on the input selection
		 *
		 * @function
		 * @param {Array} aFilterIds to be used as sPath for Filters
         * @param {Array} aFilterValues for each sPath
		 * @private
		 */
        Controller.prototype._createSearchFilterObject = function (aFilterIds, aFilterValues) {
            var aFilters = [],
                iCount;

            for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                aFilters.push(new Filter(aFilterIds[iCount], FilterOperator.EQ, aFilterValues[iCount], ""));
            }
            return aFilters;
        };
        /**
		 * Formats the Type value to display "Current Campaign" or "Pending Campaign"
		 *
		 * @function
		 * @param {String} Type value from the binding
         *
		 *
		 */
        Controller.prototype.formatEFLType = function (oInterface, vRawValue) {
            return "EFL@" + vRawValue;
        };
        return Controller;
    }


);
