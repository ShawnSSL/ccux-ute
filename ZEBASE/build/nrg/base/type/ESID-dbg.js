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

        var CustomType = SimpleType.extend('nrg.base.type.ESID', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.ESID';
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
                    jQuery.sap.log.error('Parse Exception: Invalid ESID', oValue);
                    throw new ParseException('Invalid ESID');
                }
            } else {
                if (isNaN(oValue)) {
                    jQuery.sap.log.error('Parse Exception: Invalid ESID', oValue);
                    throw new ParseException('Invalid ESID');
                }

            }
            return oValue;
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: ESID cannot be empty', oValue);
                throw new ValidateException('ESID cannot be empty');
            }
            if (oValue.length > 50) {
                jQuery.sap.log.error('Validate Exception: ESID length exceeds(allowed upto 50 char)', oValue);
                throw new ValidateException('ESID length exceeds(allowed upto 50 char)');
            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

          /*  if (oValue === undefined || oValue === null || oValue.trim() === '') {
                return oValue;
            }
*/
            return oValue;

        };
        return CustomType;
    }
);

