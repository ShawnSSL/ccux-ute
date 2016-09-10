/*global sap*/
/*global jQuery */
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/model/SimpleType',
        'sap/ui/model/FormatException',
        'sap/ui/model/ParseException',
        'sap/ui/model/ValidateException'
    ],

    function ($, SimpleType, FormatException, ParseException, ValidateException) {
        'use strict';

        var CustomType = SimpleType.extend('nrg.base.type.CellPhoneNumber', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.CellPhoneNumber';
        };

        CustomType.prototype.setFormatOptions = function (oFormatOptions) {
            this.oFormatOptions = oFormatOptions;
        };

        CustomType.prototype.setConstraints = function (oConstraints) {
            this.oConstraints = oConstraints;

            if ($.isEmptyObject(this.oConstraints)) {
                this.oConstraints = {
                    mandatory: false
                };
            }
        };

        // Expected model type
        CustomType.prototype.parseValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            if (!oValue.match(/[\d\-]/i) && oValue !== "") {
                jQuery.sap.log.error('Parse Exception: Invalid Cell phone number', oValue);
                throw new ParseException('Invalid Cell phone number');
            }

            return oValue;
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null) && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Cell phone number cannot be empty', oValue);
                throw new ValidateException('Cell phone number cannot be empty');
            }
            if (oValue.length > 30) {
                jQuery.sap.log.error('Validate Exception: Cell phone number length exceeds(allowed upto 30 char)', oValue);
                throw new ValidateException('Cell phone number length exceeds(allowed upto 30 char)');
            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null || oValue.trim() === '') {
                return oValue;
            }

            oValue = oValue.replace(/-/g, '');
            oValue = oValue.replace(' ', '');
            oValue = oValue.replace('+', '');

            // If the length is more than 11 digits, take the first 11 digit as phone number and make the first digit country code.
            if (oValue.length >= 11) {
                return ('+' + oValue.substr(0, 1) + ' ' + oValue.substr(1, 3) + '-' + oValue.substr(4, 3) + '-' + oValue.substr(7, 4) + ' ');
            } else {
                return (oValue.substr(0, 3) + '-' + oValue.substr(3, 3) + '-' + oValue.substr(6, 4) + ' ' + oValue.substr(10));
            }
        };

        return CustomType;
    }
);
