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

        var CustomType = SimpleType.extend('nrg.base.type.DrivingLicenseNumber', {
            constructor: function (oFormatOptions, oConstraints) {
                SimpleType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.DrivingLicenseNumber';
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

            var allowed   = new RegExp("^[" + "0-9a-zA-Z/-" + "]*$"),
                allowedWC = new RegExp("^[" + "0-9a-zA-Z+*/-" + "]*$");

            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            if (this.oConstraints.wildCard) {
                if (!oValue.match(allowedWC)) {
                    jQuery.sap.log.error('Parse Exception: Invalid DL', oValue);
                    throw new ParseException('Invalid DL');
                }
            } else {
                if (!oValue.match(allowed)) {
                    jQuery.sap.log.error('Parse Exception: Invalid DL', oValue);
                    throw new ParseException('Invalid DL');
                }

            }

            return oValue.toUpperCase();
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Driving License cannot be empty', oValue);
                throw new ValidateException('Driving License cannot be empty');
            }
            if (oValue.length > 20) {
                jQuery.sap.log.error('Validate Exception: DL length exceeds(allowed upto 20 char)', oValue);
                throw new ValidateException('DL length exceeds(allowed upto 20 char)');
            }

            return oValue;
        };

        // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            /*No formatting added to mask the original DL as the masking should be done at server level itself to  protect from hacking*/

            return oValue;

        };

        return CustomType;
    }
);

