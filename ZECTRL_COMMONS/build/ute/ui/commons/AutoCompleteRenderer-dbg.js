/*global sap*/
/*jslint nomen:true*/
/*jslint regexp: true*/
// Provides default renderer for control sap.ui.commons.AutoComplete
sap.ui.define(['jquery.sap.global', 'ute/ui/commons/TextfieldRenderer', 'sap/ui/core/Renderer'],
	function (jQuery, TextfieldRenderer, Renderer) {
	    "use strict";


	/**
	 * Renderer for the sap.ui.commons.AutoComplete
	 * @namespace
	 */
	    var AutoCompleteRenderer = Renderer.extend(TextfieldRenderer);


	    return AutoCompleteRenderer;

    }, /* bExport= */ true);
