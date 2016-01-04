/*global sap, d3*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/Control',
        'jquery.sap.global',
        'sap/ui/thirdparty/d3'
    ],

    function (Control, jQuery) {
        'use strict';

        var CustomControl = Control.extend('nrg.module.billing.view.control.AverageBillDetailsChart', {
            metadata: {
                properties: {
                    width: { type: 'int', defaultValue: 900 },
                    height: { type: 'int', defaultValue: 400 },
                    usageTickSize: { type: 'int', defaultValue: 500 }
                }
            },

            renderer: function (oRm, oCustomControl) {
                oRm.write('<div');
                oRm.writeControlData(oCustomControl);
                oRm.addClass('nrgAVDChart');
                oRm.writeClasses();
                oRm.write('>');
                oRm.write('</div>');
            }
        });

        CustomControl.prototype.onExit = function () {
            this._oDataModel = null;
            this._oCanvas = null;
        };

        CustomControl.prototype.onAfterRendering = function () {
            this._createChart();
        };

        CustomControl.prototype.hideUsage = function (sYear, bHide) {
            if (this._oCanvas) {
                this._oCanvas.selectAll('.nrgAVDChart-usage').each(function (oData) {
                    if (oData.key === sYear) {
                        if (bHide) {
                            d3.select(this).style('display', 'none');
                        } else {
                            d3.select(this).style('display', null);
                        }
                    }
                });
            }

            return this;
        };

        CustomControl.prototype.refreshChart = function () {
            this.rerender();
        };

        CustomControl.prototype.setDataModel = function (model, fnCallback) {
            this._oDataModel = model;
            if (fnCallback) {
                fnCallback();
            }
            return this;
        };

        CustomControl.prototype.getDataModel = function () {
            return this._oDataModel;
        };

        CustomControl.prototype._getDataSet = function () {
            var aData = jQuery.extend(true, [], this.getDataModel().getData().data),
                fnDateParser = d3.time.format('%x').parse;

            aData.forEach(function (data) {
                data.usageDate = fnDateParser(data.usageDate);
            }, this);

            return aData;
        };

        CustomControl.prototype._createChart = function () {
            var oCustomControl = this,
                oMargin = { top: 10, right: 30, bottom: 40, left: 80 },
                iWidth = oCustomControl.getWidth() - oMargin.left - oMargin.right,
                iHeight = oCustomControl.getHeight() - oMargin.top - oMargin.bottom,
                aDataset = oCustomControl._getDataSet(),  // X scale - month
                aMinMaxMonth = d3.extent(aDataset, function (data) { return data.usageDate.getMonth(); }),// X scale - month
                fnScaleMonth,
                iUsageTickSize,
                iMaxUsage,
                iMaxUsageDomain,
                iMinUsage,
                iMinUsageDomain,
                fnScaleUsage,
                fnXAxisLabel,
                fnXAxisMonth,
                fnYAxisUsage,
                aDatasetByYear,
                fnLineColor,
                fnUsageLine,
                oUsageLines;

            fnScaleMonth = d3.scale.linear()
                .domain(aMinMaxMonth)
                .range([0, iWidth]);

            // Y scale - kwh usage
            iUsageTickSize = oCustomControl.getUsageTickSize();
            iMaxUsage = d3.max(aDataset, function (data) { return data.usage; });
            iMaxUsageDomain = iMaxUsage + (iUsageTickSize - (iMaxUsage % iUsageTickSize));
            iMinUsage = d3.min(aDataset, function (data) { return data.usage; });
            iMinUsageDomain = iMinUsage - (iMinUsage % iUsageTickSize) - iUsageTickSize;
            iMinUsageDomain = iMinUsageDomain < 0 ? 0 : iMinUsageDomain;

            fnScaleUsage = d3.scale.linear()
                .domain([iMinUsageDomain, iMaxUsageDomain])
                .range([iHeight, 0]);

            // Create a canvas with margin
            this._oCanvas = d3.select('#' + this.getId())
                .append('svg')
                    .attr('class', 'nrgAVDChart')
                    .attr('width', oCustomControl.getWidth())
                    .attr('height', oCustomControl.getHeight())
                    .attr('viewBox', [0, 0, iWidth + oMargin.left + oMargin.right, iHeight + oMargin.top + oMargin.bottom].join(' '))
                    .append('g')
                        .attr('transform', 'translate(' + [ oMargin.left, oMargin.top ] + ')');

            // X axis - month
            fnXAxisLabel = d3.scale.ordinal()
                .domain(d3.range(12))
                .range(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']);

            fnXAxisMonth = d3.svg.axis()
                .scale(fnScaleMonth)
                .orient('bottom')
                .tickValues(d3.range(aMinMaxMonth[0], aMinMaxMonth[1] + 1))
                .tickFormat(function (data) { return fnXAxisLabel(data); });

            this._oCanvas.append('g')
                .attr('class', 'nrgAVDChart-XAxis')
                .attr('transform', 'translate(' + [0, iHeight + 20] + ')')
                .call(fnXAxisMonth);

            // Y axis - kwh usage based on usage tick size
            fnYAxisUsage = d3.svg.axis()
                .scale(fnScaleUsage)
                .orient('left')
                .ticks(Math.floor((iMaxUsage - iMinUsage) / iUsageTickSize) + 1)
                .tickFormat(d3.format(','));

            this._oCanvas.append('g')
                .attr('class', 'nrgAVDChart-YAxis')
                .attr('transform', 'translate(' + [-30, 0] + ')')
                .call(fnYAxisUsage);

            // X grid
            this._oCanvas.append('g')
                .selectAll('line')
                .data(d3.range(aMinMaxMonth[0], aMinMaxMonth[1] + 1))
                .enter()
                .append('line')
                    .attr('class', 'nrgAVDChart-XGrid')
                    .attr('x1', function (data) { return fnScaleMonth(data); })
                    .attr('y1', 0)
                    .attr('x2', function (data) { return fnScaleMonth(data); })
                    .attr('y2', iHeight);

            // Y grid
            this._oCanvas.append('g')
                .selectAll('line')
                .data(d3.range(iMinUsageDomain, iMaxUsageDomain, iUsageTickSize))
                .enter()
                .append('line')
                    .attr('class', 'nrgAVDChart-YGrid')
                    .attr('x1', 0)
                    .attr('y1', function (data) { return fnScaleUsage(data); })
                    .attr('x2', iWidth + 30)
                    .attr('y2', function (data) { return fnScaleUsage(data); });

            // Average usage lines
            aDatasetByYear = d3.nest()
                .key(function (data) { return data.usageDate.getFullYear(); })
                .entries(aDataset);

            fnLineColor = d3.scale.ordinal()
                .domain(aDatasetByYear, function (data) { return data.key; })
                .range(['#ffffff', '#5092CE', '#545A6A', '#F2A814']);

            fnUsageLine = d3.svg.line()
                .x(function (data) { return fnScaleMonth(data.usageDate.getMonth()); })
                .y(function (data) { return fnScaleUsage(data.usage); });

            oUsageLines = this._oCanvas.append('g').selectAll('g')
                .data(aDatasetByYear)
                .enter().append('g')
                    .attr('class', 'nrgAVDChart-usage');

            oUsageLines.append('path')
                .attr('class', 'nrgAVDChart-usageLine')
                .attr('d', function (data) { return fnUsageLine(data.values); })
                .style('stroke', function (data) { return fnLineColor(data.key); })
                .style('fill', 'none');

            // Average usage data points
            oUsageLines.selectAll('g')
                .data(function (data) { return data.values; })
                .enter()
                .append('circle')
                    .attr('class', 'nrgAVDChart-usageDataPoint')
                    .attr('r', '4')
                    .attr('cx', function (data) { return fnScaleMonth(data.usageDate.getMonth()); })
                    .attr('cy', function (data) { return fnScaleUsage(data.usage); })
                    .style('stroke', function (data) { return fnLineColor(data.usageDate.getFullYear()); })
                    .style('stroke-opacity', 0.3)
                    .style('fill', function (data) { return fnLineColor(data.usageDate.getFullYear()); });
        };

        return CustomControl;
    }
);
