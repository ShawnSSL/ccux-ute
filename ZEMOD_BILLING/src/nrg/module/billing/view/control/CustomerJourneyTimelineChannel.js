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
        CustomControl.prototype.onmouseout = function (oEvent) {
            var bAlreadySelected = false;
            this._aChannelRegistry.forEach(function (oChannel) {
                if (oChannel) {
                    if (oChannel.getSelected()) {
                        bAlreadySelected = true;
                    }
                }
            }, this);
            if (bAlreadySelected) {
                return;
            }
            this.$().removeClass('nrgCJTChannel-selected');
        };
        CustomControl.prototype.onmouseover = function (oEvent) {
            var bAlreadySelected = false;
            this._aChannelRegistry.forEach(function (oChannel) {
                if (oChannel) {
                    if (oChannel.getSelected()) {
                        bAlreadySelected = true;
                    }
                }
            }, this);
            if (bAlreadySelected) {
                return;
            }
            this.$().addClass('nrgCJTChannel-selected');
            if (this.getDescription()) {
                this.adjustDescription();
            }

/*            this._aChannelRegistry.forEach(function (oChannel) {
                if (oChannel !== this) {
                    oChannel.$().removeClass('nrgCJTChannel-selected');
                } else {

                }
            }, this);*/
        };
        CustomControl.prototype.onfocusout = function (oEvent) {
            //this.setSelected(false);
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
                if (this.getDescription()) {
                    this.adjustDescription();
                }
            }
        };
        CustomControl.prototype.adjustDescription = function () {
            var $this = this.$(),
                $offset = $this.offset(),
                $ChannelContainer = jQuery(".nrgCJT-channelContainer"),
                $ChannelContainerOffSet = $ChannelContainer.offset(),
                oDescription,
                oLeft,
                oDescriptionTitle,
                iDescriptionTTlLeft,
                iTotalDescWidth,
                iTotalDescTitleWidth;
            if ((this.getDomRef()) && (this.getDomRef().firstChild) && (this.getDomRef().firstChild) && (this.getDomRef().firstChild.nextSibling) && (this.getDomRef().firstChild.nextSibling.nextSibling)) {
                oDescription = this.getDomRef().firstChild.nextSibling.nextSibling;
            } else {
                return;
            }
            oLeft = ($offset.left - $ChannelContainerOffSet.left);
            oLeft *= -1;
            jQuery(oDescription).css({
			    "top" : '6.5rem',
			    "left" : oLeft
		    });
            iTotalDescWidth = jQuery(oDescription).innerWidth();
            if (oDescription) {
                oDescriptionTitle = oDescription.firstChild;
            } else {
                return;
            }
            iDescriptionTTlLeft = Math.abs(oLeft) + 5;
            iTotalDescTitleWidth = jQuery(oDescriptionTitle).innerWidth();
            // if Description is overflowing the box, the re-adjust its starting point.
            if ((iTotalDescTitleWidth + iDescriptionTTlLeft) > iTotalDescWidth) {
                iDescriptionTTlLeft = (iTotalDescWidth - iTotalDescTitleWidth) - 10;
            }
            jQuery(oDescriptionTitle).css({
			    "top" : '-1rem',
			    "left" : iDescriptionTTlLeft
		    });
            if ((jQuery(oDescriptionTitle).offset().left - $offset.left) > 10) {
                jQuery(oDescriptionTitle).css({
                    "top" : '-1rem',
                    "left" : '7px'
                });
            }
        };
        CustomControl.prototype.adjustDescriptionOld = function () {
            var oDescription,
                oNavBackDomRef,
                oDescriptionTitle,
                that = this,
                oLeft,
                bBackHidden = false,
                aClassList,
                iCounter,
                iDescriptionTTlLeft;
            if ((this.getDomRef()) && (this.getDomRef().firstChild) && (this.getDomRef().firstChild) && (this.getDomRef().firstChild.nextSibling) && (this.getDomRef().firstChild.nextSibling.nextSibling)) {
                oDescription = this.getDomRef().firstChild.nextSibling.nextSibling;
            } else {
                return;
            }
            oLeft = (this.getParent().getDomRef('channelContainer').scrollLeft - this.getDomRef().offsetLeft) + 500;
            if (Math.abs(oLeft) >= 590) {
                oLeft = -472;
                iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft);
            } else if (Math.abs(oLeft) >= 490) {
                oLeft = -372;
                iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft) + 5;
            } else if (Math.abs(oLeft) >= 390) {
                oLeft = -252;
                iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft) + 5;
            } else if (Math.abs(oLeft) >= 290) {
                oLeft = -172;
                iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft) + 5;
            } else if (Math.abs(oLeft) >= 190) {
                oLeft = -72;
                iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft) + 5;
            } else if (Math.abs(oLeft) >= 90) {
                oLeft = 30;
                iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft);
            } else {
                oLeft = 10;
            }
            jQuery(oDescription).css({
			    "top" : '6.5rem',
			    "left" : oLeft
		    });
            if (oDescription) {
                oDescriptionTitle = oDescription.firstChild;
            } else {
                return;
            }
            //iDescriptionTTlLeft = Math.abs(oDescription.offsetLeft) + 5;
            jQuery(oDescriptionTitle).css({
			    "top" : '-1rem',
			    "left" : iDescriptionTTlLeft
		    });

        };

        return CustomControl;
    }
);
