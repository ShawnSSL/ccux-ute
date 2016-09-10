/*globals sap, ute*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/base/DataType',
        'sap/ui/core/library'
    ],

	function (jQuery, DataType, Library) {
		'use strict';

		sap.ui.getCore().initLibrary({
			name: 'ute.ui.commons',
			version: '1.0.0',
			dependencies: [
                'sap.ui.core'
            ],

			types: [
                'ute.ui.commons.BadgeDesign',
                'ute.ui.commons.CSSDisplay',
                'ute.ui.commons.CSSPosition',
                'ute.ui.commons.HorizontalDividerDesign',
                'ute.ui.commons.HorizontalDividerHeight',
                'ute.ui.commons.HorizontalDividerSize',
                'ute.ui.commons.ButtonType',
                'ute.ui.commons.ToggleButtonDesign',
                'ute.ui.commons.DropdownArrowColor',
                'ute.ui.commons.DropdownArrowType ',
                'ute.ui.commons.DropdownBorder',
                'ute.ui.commons.DropdownBackground',
                'ute.ui.commons.TextViewDesign',
                'ute.ui.commons.TextViewColor',
                'ute.ui.commons.TooltipDesign'
            ],

			controls: [
				'ute.ui.commons.InfoLine',
                'ute.ui.commons.Dialog',
                'ute.ui.commons.Badge',
                'ute.ui.commons.Button',
                'ute.ui.commons.ToggleButton',
                'ute.ui.commons.Textfield',
                'ute.ui.commons.TextView',
                'ute.ui.commons.CheckBox',
                'ute.ui.commons.RadioButton',
                'ute.ui.commons.RedCrossSign',
				'ute.ui.commons.HorizontalDivider',
                'ute.ui.commons.Dropdown',
                'ute.ui.commons.DropdownListItem',
                'ute.ui.commons.Table',
                'ute.ui.commons.TableColumn',
                'ute.ui.commons.TableRow',
                'ute.ui.commons.Tag',
                'ute.ui.commons.ScrollContainer',
                'ute.ui.commons.Tooltip'
			],

			elements: [],
            interfaces: []
		});

        ute.ui.commons.TableType = {
            InvoiceTable: 'InvoiceTable',
            DppTable: 'DppTable',
            DppDeniedTable: 'DppDeniedTable',
            CampaignTable: 'CampaignTable'
        };

        ute.ui.commons.ButtonType = {
            GeneralAction: 'GeneralAction',
            GeneralCancel: 'GeneralCancel',
            GeneralInfo: 'GeneralInfo',
            SpecialNav: 'SpecialNav',
            SpecialCalculator: 'SpecialCalculator'
        };

        ute.ui.commons.ToggleButtonDesign = {
            ToggleCampaign: 'ToggleCampaign',
            ToggleDashboard: 'ToggleDashboard'
        };

        ute.ui.commons.TextfieldType = {
            Regular: 'Regular',
            Underlined: 'Underlined',
            Noborder: 'Noborder',  //Added for data varification by HL
            Float: 'Float' // Float label pattern by JH
        };

        ute.ui.commons.BadgeDesign = {
            Alert: 'Alert',
            Attention: 'Attention',
            Regular: 'Regular',
            Warning: 'Warning',
            Nrg: 'Nrg'
        };

        ute.ui.commons.HorizontalDividerDesign = {
            Solid: 'Solid',
            Dotted: 'Dotted'
        };

        ute.ui.commons.HorizontalDividerHeight = {
            None: 'None',
            Small: 'Small',
            Medium: 'Medium',
            Large: 'Large'
        };

        ute.ui.commons.HorizontalDividerSize = {
            Small: 'Small',
            Medium: 'Medium',
            Large: 'Large'
        };

        ute.ui.commons.DropdownArrowColor = {
            Blue: 'Blue',
            Grey: 'Grey'
        };

        ute.ui.commons.DropdownArrowType = {
            Solid: 'Solid',
            Hollow: 'Hollow'
        };

        ute.ui.commons.DropdownBorder = {
            All: 'All',
            None: 'None',
            Bottom: 'Bottom'
        };

        ute.ui.commons.DropdownBackground = {
            White: 'White',
            Transparent: 'Transparent',
            Inactive: 'Inactive'
        };

       /*Designs for TextView.*/

        ute.ui.commons.TextViewDesign = {
            Small: "Small",
            Base : "Base",
            Large: "Large"
        };

        ute.ui.commons.TooltipDesign = {
            Black: "Black",
            White : "White"
        };


        /**
         * Semantic Colors of a text.
         */
        ute.ui.commons.TextViewColor = {
            White: 'White',
            DarkGrey: 'DarkGrey',
            InactiveGrey: 'InactiveGrey',
            LightGrey: 'LightGrey',
            Black: 'Black',
            LightBlue: 'LightBlue',
            BlueLink: 'BlueLink',
            BluePearl: 'BluePearl',
            PaleBlue: 'PaleBlue',
            LightPaleBlue: 'LightPaleBlue',
            DarkPaleBlue: 'DarkPaleBlue',
            GreenHighlight: 'GreenHighlight',
            RedAlert: 'RedAlert',
            OrangeAttention: 'OrangeAttention'
        };

        ute.ui.commons.CSSDisplay = DataType.createType('ute.ui.commons.CSSDisplay', {
            isValid : function (sValue) {
                return (/^(inline|block|flex|inline\-block|inline\-flex|inline\-table|list\-item|run\-in|table|table\-caption|table\-column\-group|table\-header\-group|table\-footer\-group|table\-row\-group|table\-cell|table\-column|table\-row|none|initial|inherit)$/).test(sValue);
            }
        }, DataType.getType('string'));

        ute.ui.commons.CSSPosition = DataType.createType('ute.ui.commons.CSSPosition', {
            isValid : function (sValue) {
                return (/^(static|absolute|fixed|relative|initial|inherit)$/).test(sValue);
            }
        }, DataType.getType('string'));

		return ute.ui.commons;
	}
);
