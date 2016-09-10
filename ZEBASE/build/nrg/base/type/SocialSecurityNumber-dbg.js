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

        var CustomType = SimpleType.extend('nrg.base.type.SocialSecurityNumber', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.SocialSecurityNumber';
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


            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            if (oValue.length > 12) {
                jQuery.sap.log.error('Parse Exception: SSN length exceeds(allowed upto 12 char)', oValue);
                throw new ParseException('SSN length exceeds(allowed upto 12 char)');
            }


            return oValue;
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            var allowedWC = new RegExp("^[" + "0-9a-zA-Z+*/-" + "]*$"),
                allowed1 = new RegExp("^" + "[0-9a-zA-Z]{3}[/-][0-9a-zA-Z]{2}[/-][0-9]{4}" + "$"),
                allowed2 = new RegExp("^" + "[0-9a-zA-Z]{3}[0-9a-zA-Z]{2}[0-9]{4}" + "$"),
                allowed3 = new RegExp("^" + "[0-9a-zA-Z]{7}-[0-9]{4}" + "$"),
                allowed4 = new RegExp("^" + "[0-9a-zA-Z]{7}[0-9]{4}" + "$");

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: SSN cannot be empty', oValue);
                throw new ValidateException('SSN cannot be empty');
            }
            if (this.oConstraints.wildCard) {
                if (!oValue.match(allowedWC)) {
                    jQuery.sap.log.error('Parse Exception: Invalid SSN', oValue);
                    throw new ParseException('Invalid SSN');
                }
            } else {
                if (!oValue.match(allowed1) && !oValue.match(allowed2) && !oValue.match(allowed3) && !oValue.match(allowed4)) {
                    jQuery.sap.log.error('Parse Exception: Invalid SSN', oValue);
                    throw new ParseException('Invalid SSN');
                }

            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {
            var excludeLastFour, lastFour, masked;

            if (oValue === undefined || oValue === null || oValue.trim() === '') {
                return oValue;
            }

            oValue =  oValue.replace(/(-+)/g, '');
            excludeLastFour = oValue.substring(0, oValue.length - 4);
            lastFour = oValue.substring(oValue.length - 4, oValue.length);
            masked = excludeLastFour.replace(/[0-9a-z-A-Z]/g, '*');

            return masked + lastFour;

        };
        return CustomType;
    }
);

