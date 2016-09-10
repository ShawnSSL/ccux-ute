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

        var CustomType = SimpleType.extend('nrg.base.type.MeterNumber', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.MeterNumber';
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
            if (isNaN(oValue)) {
                jQuery.sap.log.error('Parse Exception: Invalid Meter number', oValue);
                throw new ParseException('Invalid Meter number');
            }

            return oValue.replace(/^(0+)/g, '');
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: MeterNumber cannot be empty', oValue);
                throw new ValidateException('MeterNumber cannot be empty');
            }
            if (oValue.length > 18) {
                jQuery.sap.log.error('Validate Exception: MeterNumber length exceeds(allowed upto 18 char)', oValue);
                throw new ValidateException('MeterNumber length exceeds(allowed upto 18 char)');
            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null || oValue.trim() === '') {
                return oValue;
            }

            return oValue.replace(/^(0+)/g, '');

        };

        return CustomType;
    }
);
