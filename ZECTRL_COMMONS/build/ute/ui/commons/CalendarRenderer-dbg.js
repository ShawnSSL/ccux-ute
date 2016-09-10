/*global sap*/
/*jslint nomen: true */

sap.ui.define(
    [],

    function () {
        'use strict';

        var CalendarRenderer = [];

        /**
         * Main render method for the Calendar control which will call Header method and Days method separately.
         *
         * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
         * @param {ute.ui.commons.Calendar} oCal an object representation of the control that should be rendered
         */
        CalendarRenderer.render = function (oRm, oCal) {

            var sId = oCal.getId(),
                oDate = oCal._getFocusedDate();

            oRm.write('<div');
            oRm.writeControlData(oCal);
            // Adding CSS classes to Calendar
			oRm.addClass('uteCal');
			oRm.writeClasses();

            // Adding CSS styles to Calendar
            if (oCal.getWidth() && oCal.getWidth() !== '') {
                oRm.addStyle('width', oCal.getWidth());
            }
            if (oCal.getHeight() && oCal.getHeight() !== '') {
                oRm.addStyle('height', oCal.getHeight());
            }
            oRm.writeStyles();
            // This makes the calendar focusable and therefore
		    // the white empty areas can be clicked without closing the calendar
		    // by accident.
		    oRm.writeAttribute('tabindex', '-1');
            oRm.write('>');  // div element
            //Rendering Header and Days separately
            this.renderHeader(oRm, oCal, oDate);
            this.renderWeekHead(oRm, oCal, oDate);
            oRm.write('<div id=\'' + sId + '-dayPic\' class=\'uteCal-dayPic\'>');
            this.renderDays(oRm, oCal, oDate);
            oRm.write('</div>');// div element
			oRm.write('</div>');// div element

        };

        /**
         * renderHeader method will display buttons like Prev,Next and Month and Year fields.
         *
         * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
         * @param {ute.ui.commons.Calendar} oCal an object representation of the control that should be rendered
         * @param {Date} oDate current focussed date of the control
         */

        CalendarRenderer.renderHeader = function (oRm, oCal, oDate) {

            var oLocaleData = oCal._getLocaleData(),
                sId = oCal.getId(),
                iMonth = oDate.getUTCMonth(),
                iYear = oDate.getUTCFullYear(),
                aMonthNames = [];

            if (oCal._bLongMonth || !oCal._bNamesLengthChecked) {
                aMonthNames = oLocaleData.getMonthsStandAlone('wide');
            } else {
                aMonthNames = oLocaleData.getMonthsStandAlone('abbreviated');
            }

            oRm.write('<div');
            oRm.addClass('uteCal-hd');
            oRm.writeClasses();
            oRm.write('>'); // div element
            oRm.write('<button id=\'' + sId + '-prev\' class=\'uteCal-hd-btnPrev\' tabindex=\'-1\'>');
            oRm.write('<span id=\'' + sId + '-prev\' class=\'UiIcon UiIcon-left\' >');
            oRm.write('</button>');
            oRm.write('<button');
            oRm.writeAttributeEscaped('id', sId + '-month');
            oRm.addClass('uteCal-hd-btnMonth');
            oRm.writeAttribute('tabindex', '-1');
            oRm.writeClasses();
            oRm.write('>'); // button element
            oRm.write(aMonthNames[iMonth]);
            oRm.write('</button>');
            oRm.write('<button');
            oRm.writeAttributeEscaped('id', sId + '-year');
            oRm.addClass('uteCal-hd-btnYear');
            oRm.writeAttribute('tabindex', '-1');
            oRm.writeClasses();
            oRm.write('>'); // button element
            oRm.write(iYear);
            oRm.write('</button>');
            oRm.write('<button id=\'' + sId + '-next\' class=\'uteCal-hd-btnNext\' tabindex=\'-1\'>');
            oRm.write('<span id=\'' + sId + '-prev\' class=\'UiIcon UiIcon-right\' >');
            oRm.write('</button>');
            oRm.write('</div>');// div element

        };

        /**
         * renderWeekHead method will display header information like Monday,Tuesday,Wednesday etc.
         *
         * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
         * @param {ute.ui.commons.Calendar} oCal an object representation of the control that should be rendered
         * @param {Date} oDate current focussed date of the control
         */

        CalendarRenderer.renderWeekHead = function (oRm, oCal, oDate) {
            var oLocaleData = oCal._getLocaleData(),
                iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
                sId = oCal.getId(),
                aWeekDays = [],
                i;

            if (oCal._bLongWeekDays || !oCal._bNamesLengthChecked) {
                aWeekDays = oLocaleData.getDaysStandAlone('abbreviated');
            } else {
                aWeekDays = oLocaleData.getDaysStandAlone('narrow');
            }

            oRm.write('<div');
            oRm.addClass('uteCal-dayPic-week');
            oRm.writeClasses();
            oRm.write('>'); // div element
            for (i = 0; i < 7; i = i + 1) {
                oRm.write('<div');
                oRm.addClass('uteCal-dayPic-weekHead');
                oRm.writeClasses();
                oRm.write('>'); // div element
                oRm.write(aWeekDays[(i + iFirstDayOfWeek) % 7]);
                oRm.write('</div>');// div element
            }
            oRm.write('</div>');// div element
            // days
        };

         /**
         * renderDays method will display dates based on the Month selected/ Current Month.
         *
         * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
         * @param {ute.ui.commons.Calendar} oCal an object representation of the control that should be rendered
         * @param {Date} oDate current focussed date of the control
         */

        CalendarRenderer.renderDays = function (oRm, oCal, oDate) {
            var oLocaleData = oCal._getLocaleData(),
                sId = oCal.getId(),
                iMonth = oDate.getUTCMonth(),
                iYear = oDate.getUTCFullYear(),
                sLocale = oCal._getLocale(),
                iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
                iWeekendStart = oLocaleData.getWeekendStart(),
                iWeekendEnd = oLocaleData.getWeekendEnd(),
                oFirstDay = new Date(oDate.getTime()),
                iWeekDay,
                iDaysOldMonth,
                oDay,
                sYyyymmdd = '',
                iNextMonth = (iMonth + 1) % 12,
                sIdConcat = '',
                iSelected,
                bSelectedRange;

            if (!oDate) {
			    oDate = oCal._getCurrentDate();
		    }
            oFirstDay.setUTCDate(1);
            iWeekDay = oFirstDay.getUTCDay();
            iDaysOldMonth = iWeekDay - iFirstDayOfWeek;
            if (iDaysOldMonth < 0) {
                iDaysOldMonth = 7 + iDaysOldMonth;
            }
            if (iDaysOldMonth > 0) {
                // determine first day for display
                oFirstDay.setUTCDate(1 - iDaysOldMonth);
            }
            oDay = new Date(oFirstDay.getTime());
            do {
                sYyyymmdd = oCal._oFormatYyyymmdd.format(oDay, true);
                iSelected = oCal._checkDateSelected(oDay);
                bSelectedRange = oCal._checkDateRange(oDay);
                iWeekDay = oDay.getUTCDay();
                oRm.write('<div');
                oRm.writeAttribute('id', sId + '-' + sYyyymmdd);
                oRm.addClass('uteCal-dayPic-day');
                if (iMonth !== oDay.getUTCMonth()) {
                    oRm.addClass('uteCal-dayPic-dayOtherMonth');
                }
                if ((iWeekDay >= iWeekendStart && iWeekDay <= iWeekendEnd) ||
                        (iWeekendEnd < iWeekendStart && (iWeekDay >= iWeekendStart || iWeekDay <= iWeekendEnd))) {
                    oRm.addClass('uteCal-dayPic-dayWeekend');
                }
                if (iSelected === 1) {
                    oRm.addClass('uteCal-dayPic-daySelected');
                }
                if (!bSelectedRange) {
                    oRm.addClass('uteCal-dayPic-dayNoRange');
                }
                oRm.writeAttribute('tabindex', '-1');
                oRm.writeAttribute('data-nrg-day', sYyyymmdd);
                oRm.writeClasses();
                oRm.write('>'); // div element
                oRm.write(oDay.getUTCDate());
                oRm.write('</div>');
                oDay.setUTCDate(oDay.getUTCDate() + 1);

            } while (oDay.getUTCMonth() !== iNextMonth || oDay.getUTCDay() !== iFirstDayOfWeek);
        };

        return CalendarRenderer;
    },

    true
);
