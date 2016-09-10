/*global sap*/
/*global jQuery*/
/*jslint nomen:true, regexp: true*/

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

        var CustomType = SimpleType.extend('nrg.base.type.EmailAddress', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.EmailAddress';
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

            var emailRegex = /^[^.\s()\[\],;:@][^\s()\[\],;:@]+[^.\s()\[\],;:@]@[a-zA-Z0-9]+\..+/i;
            if (!(emailRegex.test(oValue))) {
                jQuery.sap.log.error('Parse Exception: Invalid Email Address', oValue);
                throw new ParseException('Invalid Email Address');
            }

            return oValue.toLowerCase();
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Email cannot be empty', oValue);
                throw new ValidateException('Email cannot be empty');
            }

            if (oValue.length > 241) {
                jQuery.sap.log.error('Validate Exception: Email Address length exceeds(allowed upto 241 char)', oValue);
                throw new ValidateException('Email Address length exceeds(allowed upto 241 char)');
            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null) {
                return oValue;
            }
            return oValue.toLowerCase();

        };
        return CustomType;
    }
);

