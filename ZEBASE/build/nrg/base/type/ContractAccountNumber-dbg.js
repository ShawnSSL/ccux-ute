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

        var CustomType = SimpleType.extend('nrg.base.type.ContractAccountNumber', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.ContractAccountNumber';
        };

        CustomType.prototype.setFormatOptions = function (oFormatOptions) {
            this.oFormatOptions = oFormatOptions;
        };

        CustomType.prototype.setConstraints = function (oConstraints) {
            this.oConstraints = oConstraints;

            if ($.isEmptyObject(this.oConstraints)) {
                this.oConstraints = {
                    mandatory: false,
                    wildCard: false
                };
            }
        };

        // Expected model type
        CustomType.prototype.parseValue = function (oValue, sInternalType) {

            var allowed = new RegExp("^[" + "0-9+*" + "]*$");

            if (oValue === undefined || oValue === null) {
                return oValue;
            }
            if (this.oConstraints.wildCard) {
                if (!oValue.match(allowed)) {
                    jQuery.sap.log.error('Parse Exception: Invalid contract account number', oValue);
                    throw new ParseException('Invalid contract account number');
                }
            } else {
                if (isNaN(oValue) && oValue.indexOf("*") < 0) {
                    jQuery.sap.log.error('Parse Exception: Invalid contract account number', oValue);
                    throw new ParseException('Invalid contract account number');
                }

            }

            return oValue.replace(/^(0+)/g, '');
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Contract account number cannot be empty', oValue);
                throw new ValidateException('Contract account number cannot be empty');
            }

            if (oValue.length > 12) {
                jQuery.sap.log.error('Validate Exception: Contract account number length exceeds(allowed upto 12 char)', oValue);
                throw new ValidateException('Contract account number length exceeds(allowed upto 12 char)');
            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            return oValue;
        };

        return CustomType;
    }
);
