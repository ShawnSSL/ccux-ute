/*global sap, ute*/

sap.ui.define(
    [
        'sap/ui/core/Control'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('ute.ui.app.FooterNotificationItem', {
            metadata: {
                library: 'ute.ui.app',

                properties: {
                    design: { type: 'ute.ui.app.FooterNotificationItemDesign', defaultValue: ute.ui.app.FooterNotificationItemDesign.Information },
                    customIcon: { type: 'sap.ui.core.Icon', defaultValue: 'sap-icon://nrg-icon/notification' },
                    text: { type: 'string', defaultValue: null },
                    link: { type: 'boolean', defaultValue: false }
                },

                events: {
                    linkPress: {}
                }
            }
        });

        CustomControl.prototype.onclick = function (oEvent) {
            if (this.getLink()) {
                this.fireLinkPress();
            }
        };

        return CustomControl;
    },

    true
);
