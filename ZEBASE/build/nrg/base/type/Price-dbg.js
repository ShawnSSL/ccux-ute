/*global sap*/
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

        var CustomType = FloatType.extend('nrg.base.type.Price', {
            constructor: function (oFormatOptions, oConstraints) {
                FloatType.apply(this, arguments);
            }
        });

        CustomType.prototype.getName = function () {
            return 'nrg.base.type.Price';
        };

        CustomType.prototype.setFormatOptions = function (oFormatOptions) {
            var defaultFormatOptions;

            if ($.isEmptyObject(oFormatOptions)) {
                defaultFormatOptions = {
                    minFractionDigits: 2,
                    maxFractionDigits: 2,
                    currencySymbol: '$',
                    currencyAlignment: 'LHS'
                };
            } else {

                if (!oFormatOptions.minFractionDigits) {
                    oFormatOptions.minFractionDigits = 2;
                }
                if (!oFormatOptions.maxFractionDigits) {
                    oFormatOptions.maxFractionDigits = 2;
                }
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

        CustomType.prototype.parseValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null) {
                return oValue;
            }

            oValue = oValue.toString();
            var regex = /[+\-]?\d+(\.\d+)?/g;

            oValue = oValue.match(regex).map(function (v) { return parseFloat(v); });
            oValue = oValue[0];
            FloatType.prototype.parseValue.call(this, oValue, sInternalType);


            return oValue.toString();

        };

           // Model to Output
        CustomType.prototype.formatValue = function (oValue, sInternalType) {

            if (oValue === undefined || oValue === null || oValue === '') {
                return oValue;
            }
            oValue = parseFloat(oValue);
            oValue = FloatType.prototype.formatValue.call(this, oValue, sInternalType);

            if (oValue.indexOf(this.oFormatOptions.currencySymbol) < 0) {

                if (this.oFormatOptions.currencyAlignment === 'LHS') {
                    oValue = this.oFormatOptions.currencySymbol + oValue;
                } else {
                    oValue = oValue + this.oFormatOptions.currencySymbol;
                }
            }

            return oValue;
        };

        return CustomType;
    }
);
