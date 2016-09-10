/*global sap*/
/*global jQuery*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/model/type/Float',
        'sap/ui/model/FormatException',
        'sap/ui/model/ParseException',
        'sap/ui/model/ValidateException'
    ],

    function ($, FloatType, FormatException, ParseException, ValidateException) {
        'use strict';

        var CustomType = FloatType.extend('nrg.base.type.Consumption', {
            constructor: function (oFormatOptions, oConstraints) {
                FloatType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.Consumption';
        };

        CustomType.prototype.setFormatOptions = function (oFormatOptions) {
            var defaultFormatOptions;

            if ($.isEmptyObject(oFormatOptions)) {
                defaultFormatOptions = {
                    minFractionDigits: 2,
                    maxFractionDigits: 2,
                    unitAlignment: 'RHS'
                };
            } else {
                defaultFormatOptions = oFormatOptions;
            }

            FloatType.prototype.setFormatOptions.call(this, defaultFormatOptions);
        };

        CustomType.prototype.setConstraints = function (oConstraints) {
            var defaultConstraints;

            if ($.isEmptyObject(oConstraints)) {
                defaultConstraints = {
                    mandatory: false
                };
            } else {
                defaultConstraints = oConstraints;
            }

            FloatType.prototype.setConstraints.call(this, defaultConstraints);
        };

        // Expected model type
        CustomType.prototype.parseValue = function (oValue, sInternalType) {

          /*  if (oValue === undefined || oValue === null) {
                return oValue;
            }*/

            return oValue;
        };

        // Model value meets constraint requirements
        CustomType.prototype.validateValue = function (oValue) {

            if ((oValue === undefined || oValue === null || oValue.trim() === '') && this.oConstraints.mandatory) {
                jQuery.sap.log.error('Validate Exception: Consumption cannot be empty', oValue);
                throw new ValidateException('Consumption cannot be empty');
            }

            return oValue;
        };

         // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null) {
                return oValue;
            }
            oValue = oValue.toString();
            oValue = oValue.replace(/[kwh]/ig, '');

            if (this.oFormatOptions.unitAlignment === 'LHS') {
                oValue = 'kWh ' + oValue;
            } else {
                oValue = oValue + 'kWh';
            }

            return oValue;

        };

        return CustomType;
    }
);
