/*globals sap*/
/*jslint nomen: true */
// Provides control ute.ui.commons.DatePicker.
sap.ui.define(
    [
        'jquery.sap.global',
        'ute/ui/commons/Textfield',
        'sap/ui/model/type/Date',
        './Calendar'
    ],
	function (jQuery, TextField, Date1, Calendar) {
	    'use strict';

        var DatePicker = TextField.extend('ute.ui.commons.DatePicker', {
            metadata: {
                library: 'ute.ui.commons',
                properties: {
                    defaultDate: {
                        type: 'string',
                        defaultValue : null
                    }
                }
            }
        });

        /**
         * Initialization hook for the DatePicker.
         * It initializes some basic configuration.
         * 1) Assuming Default Date format is MM/dd/yyyy for NRG.
         * 2) Setting Min date and Max date for the validation purpose.
         *
         * @private
         */
        DatePicker.prototype.init = function () {
            this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
                pattern: 'MM/dd/yyyy',
                strictParsing: true
            });
            //this._oMinDate = new Date(1, 0, 1);
            //this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
            this._oMinDate = new Date();// Take todays date as minimum date unless changed by setMinDate
            this._oMinDate.setHours(0, 0, 0, 0);//Set to midnight of yesterday
            this._oMaxDate = new Date(9999, 11, 31);
        };
        /**
         * After control Rendering hook for the DatePicker.
         * It initializes some basic configuration.
         * 1) Check if default date is missing set it to todays date
         *
         *
         * @private
         */
        DatePicker.prototype.onAfterRendering = function () {
/*            if (!this.getDefaultDate()) {
                if (this.$("input").val()) {
                    this.setDefaultDate(this.$("input").val());
                } else {
                    this.setDefaultDate(this._oFormatYyyymmdd.format(new Date(), true));
                }
            }*/
        };
         /*
         * Date Picker Exit method for memory leaks
         * 1) Deletes the popup session.
         * 2) Also delete calendar session.
         *
         *@private
         */
        DatePicker.prototype.exit = function () {
            this._oDate = undefined;
            this._oLocale = undefined;

            if (this._oPopup) {
                if (this._oPopup.isOpen()) {
                    this._oPopup.close();
                }
                delete this._oPopup;
            }

            if (this._oCalendar) {
                this._oCalendar.destroy();
                delete this._oCalendar;
            }

        };

       /**
         * gets the used locale for the DatePicker
         * only for internal use
         * @return {string} sLocale
         * @private
         */
        DatePicker.prototype._getLocale = function () {
            var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
            return oLocale;
        };
       /**
         * when user selected particular date in Calendar control that need to be displayed in the Date picker field.
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         * @private
         */
        DatePicker.prototype._selectDate = function (oEvent) {
            var sNewValue = this._oFormatYyyymmdd.format(this._oCalendar._getFocusedDate()),
                $Input;
            this.focus();
            // do not call this._checkChange(); because we already have the date object and no wrong entry is possible
            this._oPopup.close();
            if (this.getEditable() && this.getEnabled() && sNewValue !== this.getValue()) {
                this.setProperty('value', sNewValue, true);
                this.setProperty('defaultDate', sNewValue, true);
                // this.setProperty('yyyymmdd', sYyyymmdd, true);
                // set inputs value after properties because of placeholder logic for IE
                $Input = jQuery(this.getInputDomRef());
                if ($Input.val() !== sNewValue) {
                    $Input.val(sNewValue);
                    this._curpos = sNewValue.length;
                    $Input.cursorPos(this._curpos);
                    this.fireChange({
                        newValue: sNewValue
                    }); // oldValue is not that easy in ComboBox and anyway not in API... thus skip it
                }
            }

        };

       /**
         * To show calendar control when user clicked on icon.
         *
         *
         *
         * @private
         */
        DatePicker.prototype._open = function () {
            var sValue = '',
                eDock;

            if (this.getDefaultDate()) {
                sValue = this.getDefaultDate();
            }
            if (sValue !== this.$("input").val()) {
                this._checkChange(); // to prove is something was typed in manually
            }
            if (!this._oPopup) {
                jQuery.sap.require('sap.ui.core.Popup');
                this._oPopup = new sap.ui.core.Popup();
                this._oPopup.setAutoClose(true);
                this._oPopup.setDurations(0, 0); // no animations
                //oThis._oPopup.attachClosed(_handleClosed, oThis);
            }
            if (!this._oCalendar) {
                this._oCalendar = new Calendar(this.getId() + '-cal');
                this._oCalendar.setSelectedDate(this.getDefaultDate());
                this._oCalendar.setMinDate(this._oMinDate);
                this._oCalendar.setMaxDate(this._oMaxDate);
                this._oCalendar.attachEvent('select', this._selectDate, this);
                this._oCalendar.attachEvent('close', this._close, this);
                this._oPopup.setContent(this._oCalendar);
                this._oCalendar.setParent(this, undefined, true); // don't invalidate DatePicker
            }
            this._oCalendar.addSelectedDate(this.getDefaultDate());
            this._oPopup.setAutoCloseAreas([this.getDomRef()]);
            eDock = sap.ui.core.Popup.Dock;
            this._oPopup.open(0, eDock.BeginTop, eDock.BeginBottom, this, null, null, true);

        };
        /**
         * Handler for popup close.
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype._close = function (oEvent) {
            if ((this._oPopup !== undefined) && (this._oPopup.isOpen())) {
                this._oPopup.close();
                this.focus();
            }
        };
        /**
         * The event to show the calendar control.
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype.onsapshow = function (oEvent) {
            var that = this;
            this._open(that);
            oEvent.preventDefault(); // otherwise IE opens the address bar history
        };

        /**
         * OnClick event for Date Picker
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype.onclick = function (oEvent) {
            if (jQuery(oEvent.target).hasClass('uteDatePicIcon')) {
                this._open(this);
            }
        };

        /**
         * to select default date to be populated in Date picker field and also Calendar control.
         *
         * @param {string} defaultDate
         *
         *
         */
        DatePicker.prototype.setDefaultDate = function (defaultDate) {
            var sOldDefaultDate = this.getDefaultDate(),
                sValue = '',
                sOutputValue = '',
                $Input;

            if (defaultDate === sOldDefaultDate) {
                return this;
            }

            if (defaultDate) {
                this._oDate = this._oFormatYyyymmdd.parse(defaultDate);
                if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                    this._oDate = undefined;
                    jQuery.sap.log.warning('Value can not be converted to a valid date', this);
                }
            } else {
                this._oDate = undefined;
            }

            if (this._oDate) {
                sValue = this._oFormatYyyymmdd.format(this._oDate);
                this.setProperty('defaultDate', defaultDate, true);

            }

            this.setProperty('value', sValue, true);

            if (this.getDomRef()) {
                // update value in input field
                sOutputValue = '';
                $Input = jQuery(this.getInputDomRef());
                // format date again - maybe value uses not the right pattern ???
                sOutputValue = sValue;
                $Input.val(sOutputValue);
            }

            return this;
        };

        /**
         * The event to show the calendar control.
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype.onsapfocusleave = function (oEvent) {
            // Ignore event if DatePicker is opening or clicked on opener.
            if (this._oCalendar && oEvent.relatedControlId &&
                    (jQuery.sap.containsOrEquals(this._oCalendar.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef()) ||
                    this.getId() === oEvent.relatedControlId)) {
                return;
            } else {

                this._checkChange(oEvent);

                if ((this._oPopup !== undefined) && (this._oPopup.isOpen())) {
                    this._oPopup.close();
                    this.focus();
                }

                oEvent.preventDefault();
                oEvent.stopPropagation();
            }
        };
       /**
         * to override the change event of the text field
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype.setMinDate = function (minDate) {
            this._oMinDate = minDate;
            if (this._oCalendar) {
                this._oCalendar.setMinDate(this._oMinDate);
            }
        };
        /**
         * to override the change event of the text field
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype.setMaxDate = function (maxDate) {
            this._oMaxDate = maxDate;
            if (this._oCalendar) {
                this._oCalendar.setMaxDate(this._oMaxDate);
            }
        };
       /**
         * to override the change event of the text field
         *
         * @param {jQuery.EventObject} oEvent The event object
         *
         *
         */
        DatePicker.prototype._checkChange = function (oEvent) {
            var oInput = jQuery(this.getInputDomRef()),
                sNewValue = oInput.val(),
                oldVal = this.getDefaultDate();

            if ((oldVal !== sNewValue)) {

                if (sNewValue !== '') {

                    this._oDate = this._oFormatYyyymmdd.parse(sNewValue);
                    if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
				        this._oDate = undefined;
                        // just format date to right pattern, because maybe a fallback pattern is used in the parsing
                        oInput.val(oldVal);
				    } else {

                        // just format date to right pattern, because maybe a fallback pattern is used in the parsing
                        sNewValue = this._oFormatYyyymmdd.format(this._oDate);
                        oInput.val(sNewValue);

                        this.setProperty('value', sNewValue, true); // suppress rerendering
                        this.setProperty('defaultDate', sNewValue, true); // suppress rerendering

                        this.fireChange({
                            newValue: sNewValue
                        }); // oldValue is not that easy in ComboBox and anyway not in API... thus skip it

                        if (this._oPopup && this._oPopup.isOpen()) {
                            this._oCalendar.focusDate(this._oDate);
                        }
				    }
                }
            }
        };

        return DatePicker;
    },

    true
);
