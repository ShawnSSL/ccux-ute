/*global sap*/

sap.ui.define(
    [
        'sap/ui/core/Renderer',
        'sap/m/ScrollContainerRenderer'
    ],

    function (CoreRenderer, ScrollContainerRenderer) {
        'use strict';

        return CoreRenderer.extend(ScrollContainerRenderer);
    },

    true
);
