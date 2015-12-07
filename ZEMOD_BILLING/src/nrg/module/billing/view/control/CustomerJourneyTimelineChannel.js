/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'nrg/module/billing/view/control/CustomerJourneyTimelineChannelRenderer'
    ],

    function (jQuery, Control, CustomRenderer) {
        'use strict';

        var CustomControl = Control.extend('nrg.module.billing.view.control.CustomerJourneyTimelineChannel', {
            metadata: {
                properties: {
                    channelIcon: { type: 'sap.ui.core.URI', defaultValue: 'sap-icon://letter' },
                    topLabel: { type: 'string', defaultValue: null },
                    rightDivider: { type: 'boolean', defaultValue: false },
                    selected: { type: 'boolean', defaultValue: false },
                    description: { type: 'string', defaultValue: "" },
                    channel: { type: 'string', defaultValue: "" }
                },
                events: {
                    press: {},
                    doublePress: {}
                }
            },
            renderer: CustomRenderer
        });

        CustomControl.prototype._aChannelRegistry = [];

        CustomControl.prototype.init = function () {
            this._aChannelRegistry.push(this);
        };

        CustomControl.prototype.exit = function () {
            var iIndex = this._aChannelRegistry.indexOf(this);

            if (iIndex && iIndex !== -1) {
                this._aChannelRegistry.splice(iIndex, 1);
            }

            this.$('icon').unbind('click', this._onChannelClick);
            this.$('icon').unbind('dblclick', this._onChannelDoubleClick);
        };

        CustomControl.prototype.onBeforeRendering = function () {
            this.$('icon').unbind('click', this._onChannelClick);
            this.$('icon').unbind('dblclick', this._onChannelDoubleClick);
        };

        CustomControl.prototype.onAfterRendering = function () {
            this.$('icon').bind('click', this._onChannelClick.bind(this));
            this.$('icon').bind('dblclick', this._onChannelDoubleClick.bind(this));
        };
        CustomControl.prototype._onChannelClick = function (oEvent) {
            this._bDoubleClick = false;

            // Wait for a while to determine whether the user intention is to double click.
            // If it is, do not fire single click. Might want to calibrate the delay
            jQuery.sap.delayedCall(300, this, function () {
                if (!this._bDoubleClick) {
                    this.firePress();
                }
            });
        };
        CustomControl.prototype.onmouseover = function (oEvent) {
            //this.firePress();
        };
        CustomControl.prototype.onfocusout = function (oEvent) {
            this.setSelected(false);
        };
        CustomControl.prototype._onChannelDoubleClick = function (oEvent) {
            this._bDoubleClick = true;
            this.setSelected(!this.getSelected());
            this.fireDoublePress();
        };
        CustomControl.prototype.setSelected = function (bSelected) {
            bSelected = !!bSelected;

            if (bSelected) {
                this.$().addClass('nrgCJTChannel-selected');

                this._aChannelRegistry.forEach(function (oChannel) {
                    if (oChannel !== this) {
                        oChannel.setSelected(false);
                    }
                }, this);
            } else {
                this.$().removeClass('nrgCJTChannel-selected');
            }

            this.setProperty('selected', bSelected, true);
            if (bSelected) {
                this.adjustDescription();
            }
        };
        CustomControl.prototype.adjustDescription = function (bSelected) {
            var oDescription,
                oNavBackDomRef,
                oDescriptionTitle,
                that = this,
                oLeft,
                bBackHidden = false,
                aClassList,
                iCounter;
            if ((this.getDomRef()) && (this.getDomRef().firstChild) && (this.getDomRef().firstChild) && (this.getDomRef().firstChild.nextSibling) && (this.getDomRef().firstChild.nextSibling.nextSibling)) {
                oDescription = this.getDomRef().firstChild.nextSibling.nextSibling;
            } else {
                return;
            }
            oLeft = (this.getParent().getDomRef('channelContainer').scrollLeft - this.getDomRef().offsetLeft) + 500;
            if (Math.abs(oLeft) >= 590) {
                oLeft = -510;
            } else if (Math.abs(oLeft) >= 490) {
                oLeft = -410;
            } else if (Math.abs(oLeft) >= 390) {
                oLeft = -310;
            } else if (Math.abs(oLeft) >= 290) {
                oLeft = -210;
            } else if (Math.abs(oLeft) >= 190) {
                oLeft = -110;
            } else if (Math.abs(oLeft) >= 90) {
                oLeft = -10;
            } else {
                oLeft = 10;
            }
            jQuery(oDescription).css({
			    "top" : '6.5rem',
			    "left" : oLeft
		    });
            jQuery(oDescriptionTitle).css({
			    "top" : '-1rem',
			    "left" : Math.abs(oDescription.offsetLeft) + 30
		    });

        };

        return CustomControl;
    }
);
