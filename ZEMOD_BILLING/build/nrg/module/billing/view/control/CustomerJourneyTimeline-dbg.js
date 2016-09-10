/*global sap*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'nrg/module/billing/view/control/CustomerJourneyTimelineRenderer'
    ],

    function (jQuery, Control, CustomRenderer) {
        'use strict';

        var CustomControl = Control.extend('nrg.module.billing.view.control.CustomerJourneyTimeline', {
            metadata: {
                aggregations: {
                    channel: {
                        type: 'nrg.module.billing.view.control.CustomerJourneyTimelineChannel',
                        multiple: true,
                        singularName: 'channel'
                    }
                },

                defaultAggregation: 'channel'
            },

            renderer: CustomRenderer
        });

        CustomControl.SCROLL_STEP = 330;
        CustomControl.SCROLL_DURATION = 500;

        CustomControl.prototype.exit = function () {
            this.$('navBack').unbind('click', this._onNavBackClick);
            this.$('navForward').unbind('click', this._onNavForwardClick);
        };

        CustomControl.prototype.onBeforeRendering = function () {
            this.$('navBack').unbind('click', this._onNavBackClick);
            this.$('navForward').unbind('click', this._onNavForwardClick);
        };

        CustomControl.prototype.onAfterRendering = function () {
            this.$('navBack').bind('click', this._onNavBackClick.bind(this));
            this.$('navForward').bind('click', this._onNavForwardClick.bind(this));

            jQuery.sap.delayedCall(0, this, function () {
                this._scroll(this.getDomRef('channelContainer').scrollWidth, 50);

                jQuery.sap.delayedCall(50, this, function () {
                    this._checkOverflow();
                });
            });
        };

        CustomControl.prototype._onNavBackClick = function (oRm, oCustomControl) {
            this._scroll(-CustomControl.SCROLL_STEP, CustomControl.SCROLL_DURATION);

            jQuery.sap.delayedCall(CustomControl.SCROLL_DURATION, this, function () {
                this._checkOverflow();
            });
        };

        CustomControl.prototype._onNavForwardClick = function (oRm, oCustomControl) {
            this._scroll(CustomControl.SCROLL_STEP, CustomControl.SCROLL_DURATION);

            jQuery.sap.delayedCall(CustomControl.SCROLL_DURATION, this, function () {
                this._checkOverflow();
            });
        };
        CustomControl.prototype._onCheckDescriptions = function (oRm, oCustomControl) {
            var aContent = this.getAggregation("channel");
            if (aContent) {
                aContent.forEach(function (oitem) {
                    if (oitem.getSelected()) {
                        oitem.setSelected(false);
                    }
                });
            }
        };
        CustomControl.prototype._scroll = function (iDelta, iDuration) {
            var oDomRef = this.getDomRef('channelContainer'),
                iScrollLeft = oDomRef.scrollLeft,
                iScrollTarget = iScrollLeft + iDelta;

            jQuery(oDomRef).stop(true, true).animate({
                scrollLeft: iScrollTarget
            }, iDuration);
        };

        CustomControl.prototype._checkOverflow = function () {
            var oChannelContainerDomRef = this.getDomRef('channelContainer'),
                oNavBack = this.$('navBack'),
                oNavForward = this.$('navForward'),
                iScrollLeft = oChannelContainerDomRef.scrollLeft,
			    iScrollWidth = oChannelContainerDomRef.scrollWidth,
			    iClientWidth = oChannelContainerDomRef.clientWidth,
                bScrollBack = false,
			    bScrollForward = false;

            if (Math.abs(iScrollWidth - iClientWidth) === 1) {
				iScrollWidth = iClientWidth;
			}

            if (iScrollLeft > 0) {
                bScrollBack = true;
            }

            if ((iScrollWidth > iClientWidth) && (iScrollLeft + iClientWidth) < iScrollWidth) {
                bScrollForward = true;
            }

            if (bScrollBack) {
                oNavBack.removeClass('nrgCJT-navBack-hide');
            } else {
                oNavBack.addClass('nrgCJT-navBack-hide');
            }

            if (bScrollForward) {
                oNavForward.removeClass('nrgCJT-navForward-hide');
            } else {
                oNavForward.addClass('nrgCJT-navForward-hide');
            }
            this._onCheckDescriptions();
        };

        return CustomControl;
    }
);
