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

        var CustomType = SimpleType.extend('nrg.base.type.BusinessPartnerNumber', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.setConstraints = function (oConstraints) {
            this.oConstraints = oConstraints;

            if ($.isEmptyObject(this.oConstraints)) {
                this.oConstraints = {
                    mandatory: false,
                    wildCard: false
                };
            }
        };

        CustomType.prototype.parseValue = function (oValue, sInternalType) {

            var allowed = new RegExp("^[" + "0-9+*" + "]*$");

            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            if (this.oConstraints.wildCard) {
                if (!oValue.match(allowed)) {
                    jQuery.sap.log.error('Parse Exception: Invalid business partner number', oValue);
                    throw new ParseException('Invalid business partner number');
                }
            } else {
                if (isNaN(oValue)) {
                    jQuery.sap.log.error('Parse Exception: Invalid business partner number', oValue);
                    throw new ParseException('Invalid business partner number');
                }

            }

            return oValue.replace(/^(0+)/g, '');
        };

        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Business partner number cannot be empty', oValue);
                throw new ValidateException('Business partner number cannot be empty');
            }

            if (oValue.trim() === '') {
                return oValue;
            }

            if (oValue.length > 10) {
                jQuery.sap.log.error('Validate Exception: Business partner number exceeds length (allowed upto 10 char)', oValue);
                throw new ValidateException('Business partner number exceeds length (allowed upto 10 char)');
            }

            return oValue;
        };

        CustomType.prototype.formatValue = function (oValue, sInternalType) {
            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            if (isNaN(oValue)) {
                jQuery.sap.log.error('Parse Exception: Invalid business partner number', oValue);
                throw new ParseException('Invalid business partner number');
            }

            return oValue.replace(/^(0+)/g, '');
        };
    }
);
