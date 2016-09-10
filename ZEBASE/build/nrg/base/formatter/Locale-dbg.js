/*globals sap*/

sap.ui.define(
    [
        'jquery.sap.global'
    ],

    function ($) {
        'use strict';

        var Locale;

        Locale = function () {};

        /*
            Replace placeholders with texts .. first entry in the array will be the template with placeholders

            Example
            =======
            <ute:Tag type="span" text="{
                parts: [{path: 'i18n>bpPageTitle'},{path: 'data>/firstname'},{path: 'data>/lastname'}],
                formatter: 'nrg.util.formatter.Locale.getText'
            }" />
        */
        Locale.prototype.getText = function () {
            var aArgs = [].slice.call(arguments),
                sKey = aArgs.shift();

            return $.sap.formatMessage(sKey, aArgs);
        };

        return new Locale();
    }
);
