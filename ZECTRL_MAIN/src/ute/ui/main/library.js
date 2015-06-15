/*global sap, ute*/

sap.ui.define(
    [],

    function () {
        'use strict';

        sap.ui.getCore().initLibrary({
            name: 'ute.ui.main',
			version: '1.0.0',
			dependencies: [
                'sap.ui.core'
            ],

			types: [
                'ute.ui.main.ButtonDesign',
                'ute.ui.main.ToggleBarDesign',
                'ute.ui.main.CheckboxDesign',
                'ute.ui.main.RadioButtonDesign',
                'ute.ui.main.InfolineDesign',
                'ute.ui.main.TabPanelDesign'
            ],

			controls: [
				'ute.ui.main.Button',
				'ute.ui.main.ToggleBar',
				'ute.ui.main.ToggleBarItem',
                'ute.ui.main.Label',
                'ute.ui.main.Checkbox',
                'ute.ui.main.RadioButton',
                'ute.ui.main.Infoline'
			],

			elements: [],

            interfaces: []
        });

        ute.ui.main.ButtonDesign = {
            None: 'None',
            Default: 'Default',
            Highlight: 'Highlight',
            Invert: 'Invert'
        };

        ute.ui.main.ToggleBarDesign = {
            None: 'None',
            Default: 'Default',
            Invert: 'Invert'
        };

        ute.ui.main.CheckboxDesign = {
            None: 'None',
            Default: 'Default'
        };

        ute.ui.main.RadioButtonDesign = {
            None: 'None',
            Default: 'Default'
        };

        ute.ui.main.InfolineDesign = {
            None: 'None',
            Default: 'Default'
        };

        return ute.ui.main;
    },

    true
);
