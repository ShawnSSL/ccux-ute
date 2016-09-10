/*globals sap*/
/*jslint nomen: true */

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'sap/ui/core/Locale',
        'sap/ui/core/LocaleData',
        'sap/ui/core/format/DateFormat',
        'sap/ui/core/date/UniversalDate'
    ],

	function (jQuery, Control, Locale, LocaleData, DateFormat, UniversalDate) {
	    'use strict';

        var Calendar = Control.extend('ute.ui.commons.Calendar', {
            metadata: {
                library: 'ute.ui.commons',
                properties: {
                    /*Calendar Width*/
                    width: {
                        type: 'sap.ui.core.CSSSize',
                        defaultValue: '340px'
                    },

                    /*Calendar height*/
                    height: {
                        type : 'sap.ui.core.CSSSize',
                        defaultValue : '250px'
                    },

                    /*Calendar selected Date*/
                    selectedDate: {
                        type : 'string',
                        defaultValue : ''
                    }
                }
            }
        });

        /**
         * Initialization hook for the dialog.
         * It initializes some basic configuration for it.
         *
         * @private
         */
        Calendar.prototype.init = function () {
            this._oFormatYyyymmdd = DateFormat.getInstance({
                pattern: 'MM/dd/yyyy',
                calendarType: sap.ui.core.CalendarType.Gregorian
            });
        };

        /**
         * gets localeData for used locale, if no locale is given use rendered one
         *
         * @return {Date} in UTC timezone
         * @private
         */
        Calendar.prototype._getLocaleData = function () {
            var sLocale, oLocale;

            if (!this._oLocaleData) {
                sLocale = this._getLocale();
                oLocale = new Locale(sLocale);
                this._oLocaleData = LocaleData.getInstance(oLocale);
            }

            return this._oLocaleData;
        };
        /**
         * Creates a Date in local timezone from UTC timezone
         * @param {Date} oDate in UTC timezone
         * @param {boolean} bTime if set the time part of the date will be used too, otherwise it will be initial
         * @return {Date} in local timezone
         * @private
         */
        Calendar.prototype._createLocalDate = function (oDate, bTime) {

            var oLocaleDate,
                oMyDate;

            if (oDate) {

                if (oDate instanceof UniversalDate) {
                    oMyDate = new Date(oDate.getTime());
                } else {
                    oMyDate = oDate;
                }

                oLocaleDate = new Date(oMyDate.getUTCFullYear(), oMyDate.getUTCMonth(), oMyDate.getUTCDate());
                if (oMyDate.getFullYear() < 1000) {
                    oLocaleDate.setFullYear(oMyDate.getFullYear());
                }

                if (bTime) {
                    oLocaleDate.setHours(oMyDate.getUTCHours());
                    oLocaleDate.setMinutes(oMyDate.getUTCMinutes());
                    oLocaleDate.setSeconds(oMyDate.getUTCSeconds());
                    oLocaleDate.setMilliseconds(oMyDate.getUTCMilliseconds());
                }
            }

            return oLocaleDate;

        };
        /**
         * Creates a Date in UTC timezone from local timezone
         * @param {Date} oDate in local timezone
         * @param {boolean} bTime if set the time part of the date will be used too, otherwise it will be initial
         * @return {Date} in UTC timezone
         * @private
         */
        Calendar.prototype._createUTCDate = function (oDate, bTime) {

            var oUTCDate,
                oMyDate;

            if (oDate) {

                if (oDate instanceof UniversalDate) {
                    oMyDate = new Date(oDate.getTime());
                } else {
                    oMyDate = oDate;
                }

                oUTCDate = new Date(Date.UTC(oMyDate.getFullYear(), oMyDate.getMonth(), oMyDate.getDate()));
                if (oMyDate.getFullYear() < 1000) {
                    oUTCDate.setUTCFullYear(oMyDate.getFullYear());
                }

                if (bTime) {
                    oUTCDate.setUTCHours(oMyDate.getHours());
                    oUTCDate.setUTCMinutes(oMyDate.getMinutes());
                    oUTCDate.setUTCSeconds(oMyDate.getSeconds());
                    oUTCDate.setUTCMilliseconds(oMyDate.getMilliseconds());
                }
            }
            return oUTCDate;

        };

        /**
         * Gives a  Current Date in UTC timezone from local timezone
         *
         * @return {Date} in UTC timezone
         * @private
         */

        Calendar.prototype._getCurrentDate = function () {
            this._oFocusedDate = this._createLocalDate(new Date());
            return this._oFocusedDate;
        };

        /**
         * Gives current focussed date for the session.
         *
         * @return focused {Date}
         * @private
         */

        Calendar.prototype._getFocusedDate = function () {
            var aSelectedDate = this.getSelectedDate();

            if (!this._oFocusedDate) {
                if (aSelectedDate) {
                    this._oFocusedDate = this._oFormatYyyymmdd.parse(aSelectedDate);
                } else {
                    this._getCurrentDate();
                }
            }

            return this._oFocusedDate;
        };

        /**
         * To focus the date for the session..
         *
         *
         * @private
         */

        Calendar.prototype._setFocusedDate = function (oDate) {
            this._oFocusedDate = oDate;
        };

        /**
         * render the previous and next months when the user selected to toggle.
         *
         *
         * @private
         */

        Calendar.prototype._renderMonth = function () {
            var oDate = this._getFocusedDate(),
                $Container = this.$('dayPic'),
                oRm,
                aMonthNames = [];

            this._sRenderMonth = undefined; // initialize delayed call

            if ($Container.length > 0) {
                oRm = sap.ui.getCore().createRenderManager();
                this.getRenderer().renderDays(oRm, this, oDate);
                oRm.flush($Container[0]);
                oRm.destroy();
            }

            // change month and year
            if (this._bLongMonth || !this._bNamesLengthChecked) {
                aMonthNames = this._getLocaleData().getMonthsStandAlone('wide');
            } else {
                aMonthNames = this._getLocaleData().getMonthsStandAlone('abbreviated');
            }
            this.$('month').text(aMonthNames[oDate.getUTCMonth()]);
            this.$('year').text(oDate.getUTCFullYear());
        };

        /**
         * change the selected date in the calendar control.
         *
         *
         * @private
         */

        Calendar.prototype._selectDay = function (oDate) {
            var aSelectedDates = this.getSelectedDate(),
                aDomRefs = this.$('dayPic').children('.uteCal-dayPic-day'),
                $DomRef,
                sYyyymmdd,
                i = 0,
                temp;

            sYyyymmdd = this._oFormatYyyymmdd.format(oDate, true);
            for (i = 0; i < aDomRefs.length; i = i + 1) {
                $DomRef = jQuery(aDomRefs[i]);
                temp = $DomRef.attr('data-nrg-day');
                if (!$DomRef.hasClass('uteCal-dayPic-dayOtherMonth') && $DomRef.attr('data-nrg-day') === sYyyymmdd) {
                    $DomRef.addClass('uteCal-dayPic-daySelected');
                } else if ($DomRef.hasClass('uteCal-dayPic-daySelected')) {
                    $DomRef.removeClass('uteCal-dayPic-daySelected');
                }
            }
            this.setProperty('selectedDate', sYyyymmdd, true);

        };

        /**
         * onClick event will have following functionality.
         * 1) when user is toggling between months.
         * 2) when user selected previous month and next month date so that function will render respective month.
         * 3) User selected a particular date in the calendar, which will populate in to textfield.
         *@param {jQuery.EventObject} oEvent The event object
         *
         */

        Calendar.prototype.onclick = function (oEvent) {
            var oFocusedDate = this._getFocusedDate(),
                $Target,
                oOldFocusedDate;

            if (jQuery.sap.containsOrEquals(this.getDomRef('next'), oEvent.target) && !this.$('next').attr('disabled')) {

                oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() + 1, 1);
                this._renderMonth();

            } else if (jQuery.sap.containsOrEquals(this.getDomRef('prev'), oEvent.target) && !this.$('prev').attr('disabled')) {

                oFocusedDate.setUTCDate(1);
                oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
                this._renderMonth();

            } else {

                $Target = jQuery(oEvent.target);
                if ($Target.hasClass('uteCal-dayPic-dayNoRange')) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                    return false;
                }
                if ($Target.hasClass('uteCal-dayPic-day')) {
                    oFocusedDate = this._getFocusedDate();
                    oOldFocusedDate = oFocusedDate;
                    oFocusedDate = this._oFormatYyyymmdd.parse($Target.attr('data-nrg-day'), false);
                    if (oFocusedDate.getTime() !== oOldFocusedDate.getTime()) {
                        if ($Target.hasClass('uteCal-dayPic-dayOtherMonth')) {
                            // in other month -> change month
                            this._setFocusedDate(oFocusedDate);
                            this._renderMonth();
                            oEvent.stopPropagation();
                            oEvent.preventDefault();
                        } else if ($Target.hasClass('uteCal-dayPic-dayNoRange')) { // Can remove this condition but just to keep checking again.
                            //to prevent bubbling into input field if in DatePicker
                            oEvent.stopPropagation();
                            oEvent.preventDefault();
                            return false;
                        } else {
                            this._setFocusedDate(oFocusedDate);
                            this._selectDay(this._getFocusedDate());
                            this.fireEvent('select');
                            //to prevent bubbling into input field if in DatePicker
                            oEvent.stopPropagation();
                            oEvent.preventDefault();
                        }
                    } else {
                        this.fireEvent('select');
                    }
                }
            }

        };


       /**
         * gets the used locale for the Calendar
         * only for internal use
         * @return {string} sLocale
         * @private
         */


        Calendar.prototype._getLocale = function () {
            if (!this._sLocale) {
                this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
            }

            return this._sLocale;
        };


        /*
         * Checks if a date is selected and what kind of selected
         * @return {int} iSelected 0: not selected; 1: single day selected
         * @private
         */
        Calendar.prototype._checkDateSelected = function (oDate) {
            var iSelected = 0,
                oSelectedDate = this.getSelectedDate(),
                oDateTimeStamp = oDate.getTime(),
                oSelectedDateTimeStamp;

            if (!(oDate instanceof Date)) {
                throw new Error('Date must be a JavaScript date object; ' + this);
            }

            oSelectedDate = this._oFormatYyyymmdd.parse(oSelectedDate, false);
            if (oSelectedDate) {
                oSelectedDateTimeStamp = oSelectedDate.getTime();
            }
            if (oSelectedDateTimeStamp === oDateTimeStamp) {
                iSelected = 1; // single day selected
            }

            return iSelected;
        };
        /*
         * Checks if a date between selectable range
         * @return {boolean} true : with in Range; false : outside range
         * @private
         */
        Calendar.prototype._checkDateRange = function (oDate) {
            var bSelectedRange = true,
                oMinDateTimeStamp = this.getMinDate().getTime(),
                oDateTimeStamp = oDate.getTime(),
                oMaxDateTimeStamp = this.getMaxDate().getTime();
            if (!(oDate instanceof Date)) {
                throw new Error('Date must be a JavaScript date object; ' + this);
            }
            if ((oDateTimeStamp >= oMinDateTimeStamp) && (oDateTimeStamp <= oMaxDateTimeStamp)) {
                bSelectedRange = true; // single day selected
            } else {
                bSelectedRange = false;
            }
            return bSelectedRange;
        };
       /**
         * Change the focusdate and also the render month again in the calendar control
         * only for internal use
         * @return {string} sLocale
         * @private
         */
        Calendar.prototype.focusDate = function (oFocusedDate) {
            this._setFocusedDate(oFocusedDate);
            this.setProperty('selectedDate', this._oFormatYyyymmdd.format(oFocusedDate), true);
            this._renderMonth();
        };
       /**
         * Change the selectedDate
         * only for internal use
         * @Parameter {string} oSelectedDate
         *
         */
        Calendar.prototype.addSelectedDate = function (oSelectedDate) {
            this.setProperty('selectedDate', oSelectedDate, true);
            this._oFocusedDate = this._oFormatYyyymmdd.parse(oSelectedDate);
            this._renderMonth();
        };
       /**
         * Sets the Minimum Date
         * only for internal use
         * @Parameter {Date} oMinDate
         *
         */
        Calendar.prototype.setMinDate = function (oMinDate) {
            if (!(oMinDate instanceof Date)) {
                throw new Error('Date must be a JavaScript date object; ' + this);
            }
            this._oMinDate = oMinDate;
        };
        /**
         * Sets the Maximum Date
         * only for internal use
         * @Parameter {Date} oMaxDate
         *
         */
        Calendar.prototype.setMaxDate = function (oMaxDate) {
            if (!(oMaxDate instanceof Date)) {
                throw new Error('Date must be a JavaScript date object; ' + this);
            }
            this._oMaxDate = oMaxDate;
        };
       /**
         * Gets the Minimum Date
         * only for internal use
         *
         *
         */
        Calendar.prototype.getMinDate = function () {
            return this._oMinDate;
        };
        /**
         * Sets the Maximum Date
         * only for internal use
         *
         *
         */
        Calendar.prototype.getMaxDate = function () {
            return this._oMaxDate;
        };

        return Calendar;
    },

    true
);
