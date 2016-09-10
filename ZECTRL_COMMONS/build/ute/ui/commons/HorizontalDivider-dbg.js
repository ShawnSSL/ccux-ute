/*global sap, ute*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

	function (Control) {
	    'use strict';

	    var HDiv = Control.extend('ute.ui.commons.HorizontalDivider', {
			metadata: {
				library: 'ute.ui.commons',
		        properties: {
					width: {
                        type: 'sap.ui.core.CSSSize',
                        defaultValue: '100%'
                    },
					design: {
                        type: 'ute.ui.commons.HorizontalDividerDesign',
                        defaultValue: ute.ui.commons.HorizontalDividerDesign.Solid
                    },
					height: {
                        type: 'ute.ui.commons.HorizontalDividerHeight',
                        defaultValue: ute.ui.commons.HorizontalDividerHeight.Medium
                    },
                    size: {
                        type: 'ute.ui.commons.HorizontalDividerSize',
                        defaultValue: ute.ui.commons.HorizontalDividerSize.Small
                    }
				}
			}
		});

		return HDiv;
	},

    true
);
