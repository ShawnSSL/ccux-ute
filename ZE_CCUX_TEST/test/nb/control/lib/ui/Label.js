/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Label.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/Popup', 'sap/ui/core/LabelEnablement'],
	function(jQuery, library, Control, Popup, LabelEnablement) {
	"use strict";



	/**
	 * Constructor for a new Label.
	 *
	 *
	 */
	var Label = Control.extend("ute.ui.commons.Label", /** @lends sap.ui.commons.Label.prototype */ { metadata : {

		library : "ute.ui.commons",
		properties : {

			/**
			 *
			 * Labels can have bold format.
			 */
			//design : {type : "sap.ui.commons.LabelDesign", group : "Appearance", defaultValue : sap.ui.commons.LabelDesign.Standard},

			/**
			 *
			 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
			 */
		//	textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * Specifies whether a line wrapping shall be displayed when the text value is longer than the width
			 */
		//	wrapping : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 *
			 * Control width as common CSS-size (px or % as unit, for example).
			 */
			//width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 *
			 * Text to be displayed.
			 */
			text : {type : "string", group : "Misc", defaultValue : ''},

			/**
			 * Icon to be displayed in the control.
			 * This can be an URI to an image or an icon font URI.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 *
			 * Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
			 */
			//textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin},

			/**
			 * Allows to enforce the required indicator even when the associated control doesn't have a getRequired method (a required property) or when the flag is not set.
			 * If the associated control has a required property, the values of both required flags are combined with the OR operator, so a Label can't override a required=true value.
			 * @since 1.11.0
			 */
			//required : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set the required indicator is at the begin of the label, if not set at the end.
			 * @since 1.14.0
			 */
			//requiredAtBegin : {type : "boolean", group : "Misc", defaultValue : null}
		},

	}});

/*	Label.prototype.onAfterRendering = function () {

		var oFor = this._getLabeledControl();

		if (oFor) {
			if (this.getTooltip_AsString() == "" || !(this.getTooltip() instanceof sap.ui.core.TooltipBase)) {
				// no own tooltip use RichTooltip of labeled control if available
				if (oFor.getTooltip() instanceof sap.ui.core.TooltipBase) {
					this.oForTooltip = oFor.getTooltip();
					this.addDelegate(this.oForTooltip);
				}
			}

			// attach to change of required flag of labeled control
			oFor.attachEvent("requiredChanged",this._handleRequiredChanged, this);
			this._oFor = oFor;
		}

	};*/

/*	Label.prototype.onBeforeRendering = function () {

		if (this.oForTooltip) {
			this.removeDelegate(this.oForTooltip);
			this.oForTooltip = null;
		}

		if (this._oPopup) {
			this._oPopup.destroy();
			delete this._oPopup;
		}

		if (this._oFor) {
			this._oFor.detachEvent("requiredChanged",this._handleRequiredChanged, this);
			this._oFor = undefined;
		}

	};
	*/
/*	Label.prototype.exit = function(){

		if (this.oForTooltip) {
			this.removeDelegate(this.oForTooltip);
			this.oForTooltip = null;
		}

		if (this._oPopup) {
			this._oPopup.destroy();
			delete this._oPopup;
		}

		if (this._oFor) {
			this._oFor.detachEvent("requiredChanged",this._handleRequiredChanged, this);
			this._oFor = undefined;
		}

	};*/

	/**
	 * Checks whether either the label itself or the associated control is marked as required.
	 */
	/*Label.prototype.isRequired = function(){

		// the value of the local required flag is ORed with the result of a "getRequired"
		// method of the associated "labelFor" control. If the associated control doesn't
		// have a getRequired method, this is treated like a return value of "false".
		var oFor = this._getLabeledControl();
		return this.getRequired() || (oFor && oFor.getRequired && oFor.getRequired() === true);

	};*/

	/*
	 * if required flag of labeled control changes after Label is rendered,
	 * Label must be rendered again
	 */
/*	Label.prototype._handleRequiredChanged = function(){

		this.invalidate();

	};*/

	/**
	 * @deprecated
	 */
	/*Label.prototype.setReqiuredAtBegin = function(bReqiuredAtBegin){
		return this.setRequiredAtBegin(bReqiuredAtBegin);
	};
	*/
	/**
	 * @deprecated
	 */
/*	Label.prototype.getReqiuredAtBegin = function(){
		return this.getRequiredAtBegin();
	};*/

	/**
	 * Returns the labeled control instance, if exists.
	 * @return {sap.ui.core.Control} the labeled control instance, if exists
	 * @private
	 */
/*	Label.prototype._getLabeledControl = function() {
		var sId = this.getLabelForRendering();
		if (!sId) {
			return null;
		}
		return sap.ui.getCore().byId(sId);
	};*/




	//Enrich Label functionality
//	LabelEnablement.enrich(Label.prototype);

	return Label;

}, /* bExport= */ true);
