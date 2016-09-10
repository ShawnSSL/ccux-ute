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

        var CustomType = SimpleType.extend('nrg.base.type.ZipCode', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.ZipCode';
        };

        CustomType.prototype.setFormatOptions = function (oFormatOptions) {
            this.oFormatOptions = oFormatOptions;
        };

        CustomType.prototype.setConstraints = function (oConstraints) {
            this.oConstraints = oConstraints;

            if ($.isEmptyObject(this.oConstraints)) {
                this.oConstraints = {
                    mandatory: false,
                    test: false
                };
            }
        };

        // Expected model type
        CustomType.prototype.parseValue = function (oValue, sInternalType) {


            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            if (isNaN(oValue.substring(0, 5)) || isNaN(oValue.substring(6, 10))) {

                jQuery.sap.log.error('Parse Exception: Invalid Zip code', oValue);
                throw new ParseException('Invalid Zip code');

            }
            if (oValue.length === 10) {
                if (isNaN(oValue.charAt(5)) !== '-') {

                    jQuery.sap.log.error('Parse Exception: Invalid Zip code', oValue);
                    throw new ParseException('Invalid Zip code');

                }
            }

            return oValue;
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {


            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Zip code cannot be empty', oValue);
                throw new ValidateException('Zip code cannot be empty');
            }

            if (oValue.length !== 5 || oValue.length !== 10) {
                jQuery.sap.log.error('Validation Exception: Zip code must have a length of 5 or 10', oValue);
                throw new ParseException('Zip code must have a length of 5 or 10');
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
