/*global sap, d3*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'jquery.sap.global',
        'sap/ui/core/Control',
        'sap/ui/thirdparty/d3'
    ],

    function (jQuery, Control) {
        'use strict';

        var CustomControl = Control.extend('nrg.module.usage.view.UsageHistoryChart', {
            metadata: {
                properties: {
                    width: { type: 'int', defaultValue: 1000 },
                    height: { type: 'int', defaultValue: 300 },
                    consumptionGroup: { type: 'string', defaultValue: 'RES' }
                }
            },

            renderer: function (oRm, oCustomControl) {
                oRm.write('<div');
                oRm.writeControlData(oCustomControl);
                oRm.addClass('tmUsageHistChart');
                oRm.writeClasses();
                oRm.write('>');
                oRm.write('</div>');
            }
        });

        CustomControl.prototype.onInit = function () {};
        CustomControl.prototype.onBeforeRendering = function () {};

        CustomControl.prototype.onAfterRendering = function () {
            this._createChart();
            this._createTemperatureChart();
        };

        CustomControl.prototype.onExit = function () {
            this._oDataModel = null;
        };

        CustomControl.prototype.refreshChart = function () {
            this.rerender();
        };

        CustomControl.prototype.setDataModel = function (model) {
            this._oDataModel = model;
            return this;
        };

        CustomControl.prototype.getDataModel = function () {
            return this._oDataModel;
        };

        CustomControl.prototype._getDataSet = function () {
            if (!this.getDataModel()) {
                return [];
            }
            var aData = jQuery.extend(true, [], this.getDataModel().getData().data),
                fnDateParser = d3.time.format('%x').parse;

            aData.forEach(function (data) {
                data.meterReadDate = fnDateParser(data.meterReadDate);
            }, this);

            return aData;
        };

        CustomControl.prototype._createChart = function () {
            var oMargin = { top: 50, right: 40, bottom: 100, left: 80 },
                iWidth = this.getWidth() - oMargin.left - oMargin.right,
                iHeight = this.getHeight() - oMargin.top - oMargin.bottom - 50,
                aDataSet = this._getDataSet(),
                oCanvas,
                aXScaleDomain,
                fnScaleX,
                iYAxisTickSize,
                iMaxKwhUsage,
                fnScaleY,
                iBackgroundBarWidth,
                sOddBgGradientId,
                sEvenBgGradientId,
                fnConsumptionXAxis,
                fnConsumptionYGrid,
                fnConsumptionYAxis,
                oConsumptionLine,
                oConsumptionDataPoint,
                oConsumptionDataPointTooltip;
            if (!((aDataSet) && (aDataSet.length >  0))) {
                return;
            }
            // Create a canvas with margin
            oCanvas = d3.select('#' + this.getId())
                .append('svg')
                    .attr('width', this.getWidth())
                    .attr('height', this.getHeight() - 50)
                    .append('g')
                        .attr('transform', 'translate(' + [ oMargin.left, oMargin.top ] + ')');

            // Base X scale - meter reading date
            aXScaleDomain = d3.extent(aDataSet, function (data) { return data.meterReadDate; });
            aXScaleDomain[0] = new Date(aXScaleDomain[0].getFullYear(), aXScaleDomain[0].getMonth(), 1); // Beginning of month of smallest date
            aXScaleDomain[1] = new Date(aXScaleDomain[1].getFullYear(), aXScaleDomain[1].getMonth() + 1, 0); // End of month of biggest date

            fnScaleX = d3.time.scale()
                .domain(aXScaleDomain)
                .range([0, iWidth]);

            // Base Y scale - kwh usage
            iYAxisTickSize = this.getConsumptionGroup() === 'REBS' ? 1000 : 500;
            iMaxKwhUsage = d3.max(aDataSet, function (data) { return data.kwhUsage; });

            fnScaleY = d3.scale.linear()
                .domain([0, iMaxKwhUsage + (iYAxisTickSize - (iMaxKwhUsage % iYAxisTickSize))])
                .range([iHeight, 0]);

            //Background gradient
            iBackgroundBarWidth = iWidth / aDataSet.length;
            sOddBgGradientId = this.getId() + '-oddBgGradient';
            sEvenBgGradientId = this.getId() + '-evenBgGradient';

            oCanvas.append('linearGradient')
                .attr('id', sOddBgGradientId)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '0%').attr('y2', '0%')
                .selectAll('stop')
                .data([
                    { offset: '0%', stopColor: '#a3bece' },
                    { offset: '100%', stopColor: '#a3bece' }
                ])
                .enter()
                .append('stop')
                    .attr('offset', function (data) { return data.offset; })
                    .attr('stop-color', function (data) { return data.stopColor; });

            oCanvas.append('linearGradient')
                .attr('id', sEvenBgGradientId)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '0%').attr('y2', '100%')
                .selectAll('stop')
                .data([
                    { offset: '5%', stopColor: '#b5cbd8' },
                    { offset: '95%', stopColor: '#9cadb8' }
                ])
                .enter()
                .append('stop')
                    .attr('offset', function (data) { return data.offset; })
                    .attr('stop-color', function (data) { return data.stopColor; });

            oCanvas.append('g')
                .selectAll('rect')
                .data(aDataSet)
                .enter()
                .append('rect')
                    .attr('transform', function (data, index) {
                    return 'translate(' + index * iBackgroundBarWidth + ',0)';
                })
                    .attr('height', iHeight)
                    .attr('width', iBackgroundBarWidth)
                    .style('fill', function (data, index) {
                    var sId = (index + 1) % 2 === 0 ? sEvenBgGradientId : sOddBgGradientId;
                    return 'url(#' + sId + ')';
                });

            // X axis
            fnConsumptionXAxis = d3.svg.axis()
                .orient('bottom')
                .scale(fnScaleX)
                .tickValues(aDataSet.map(function (data) { return data.meterReadDate; }))
                .tickFormat(d3.time.format("%m/%d/%y"));

            oCanvas.append('g')
                .attr('class', 'tmUsageHistChart-consumptionXAxis')
                .attr('transform', 'translate(0,' + (iHeight + 20) + ')')
                .call(fnConsumptionXAxis).selectAll("text").style("text-anchor", "middle")
                    .attr("dx", "-.5em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)");

            // Y axis
            fnConsumptionYAxis = d3.svg.axis()
                .orient('left')
                .scale(fnScaleY)
                .ticks(Math.floor(iMaxKwhUsage / iYAxisTickSize) + 1)
                .tickFormat(d3.format('d'));

            oCanvas.append('g')
                .attr('class', 'tmUsageHistChart-consumptionYAxis')
                .call(fnConsumptionYAxis);

            oCanvas.select('g.tmUsageHistChart-consumptionYAxis')
                .append('text')
                    .attr('class', 'tmUsageHistChart-consumptionYAxisLabel')
                    .attr('x', -iHeight / 2)
                    .attr('y', -65)
                    .attr('transform', 'rotate(-90)')
                    .text('kWh');

            // X grid
            oCanvas.append('g')
                .selectAll('line')
                .data(aDataSet)
                .enter()
                .append('line')
                    .attr('class', 'tmUsageHistChart-consumptionXGrid')
                    .attr('x1', function (data, index) {
                    return index * iBackgroundBarWidth;
                })
                    .attr('y1', 0)
                    .attr('x2', function (data, index) {
                    return index * iBackgroundBarWidth;
                })
                    .attr('y2', iHeight);

            // Y grid
            fnConsumptionYGrid = d3.svg.axis()
                .orient('left')
                .scale(fnScaleY)
                .ticks(Math.floor(iMaxKwhUsage / iYAxisTickSize) + 1)
                .tickSize(-iWidth, 0, 0)
                .tickFormat('');

            oCanvas.append('g')
                .attr('class', 'tmUsageHistChart-consumptionYGrid')
                .call(fnConsumptionYGrid);

            // Consumption line
            oConsumptionLine = d3.svg.line()
                .x(function (data) { return fnScaleX(data.meterReadDate); })
                .y(function (data) { return fnScaleY(data.kwhUsage); });

            oCanvas.append('g').append('path')
                .attr('d', oConsumptionLine(aDataSet))
                .attr('class', 'tmUsageHistChart-consumptionLine');

            // Consumption data points
            oConsumptionDataPoint = oCanvas.append('g').selectAll('circle.tmUsageHistChart-consumptionPoint')
                .data(aDataSet)
                .enter()
                .append('circle')
                    .attr('r', '7')
                    .attr('cx', function (data) { return fnScaleX(data.meterReadDate); })
                    .attr('cy', function (data) { return fnScaleY(data.kwhUsage); })
                    .attr('class', 'tmUsageHistChart-consumptionPoint');

            // Consumption data point tooltip
            oConsumptionDataPointTooltip = oCanvas.append('g')
                .attr('class', 'tmUsageHistChart-consumptionPointTooltip')
                .style('display', 'none');

            // Consumption data point tooltip background
            oConsumptionDataPointTooltip.append('path')
                .attr('d', 'M1,16 C1,7.71572875 7.71655983,1 15.9980512,1 L86.0019488,1 C94.2851438,1 101,7.71390727 101,16 L101,16 C101,24.2842712 94.2823898,31 86.0015316,31 L59.3333333,31 L51,41 L42.6666667,31 L15.9984684,31 C7.71504305,31 1,24.2860927 1,16 L1,16 Z');

            // Consumption data point tooltip text
            oConsumptionDataPointTooltip.append('text')
                .attr('dy', '0.35em');

            function fnOnConsumptionDataPointMouseOver(data) {
                var aCircleXY = [fnScaleX(data.meterReadDate), fnScaleY(data.kwhUsage)];

                oConsumptionDataPointTooltip.select('path')
                    .attr('transform', 'translate(' + [ aCircleXY[0] - 52, aCircleXY[1] - 55 ] + ')');

                oConsumptionDataPointTooltip.select('text')
                    .attr('transform', 'translate(' + [ aCircleXY[0], aCircleXY[1] - 40 ] + ')')
                    .text(data.kwhUsage);

                oConsumptionDataPointTooltip.style('display', null);
            }

            function fnOnConsumptionDataPointMouseOut(data) {
                oConsumptionDataPointTooltip.style('display', 'none');
            }

            oConsumptionDataPoint.on('mouseover', fnOnConsumptionDataPointMouseOver);
            oConsumptionDataPoint.on('mouseout', fnOnConsumptionDataPointMouseOut);
        };

        CustomControl.prototype._createTemperatureChart = function () {
            var oMargin = { top: 0, right: 60, bottom: 0, left: 100 },
                iWidth = this.getWidth() - oMargin.left - oMargin.right,
                iHeight = 30,
                aDataSet = this._getDataSet(),
                oCanvas,
                fnTemperatureColorScale,
                iTemperatureBarWidth,
                oTemperatureBar;
            if (!((aDataSet) && (aDataSet.length >  0))) {
                return;
            }
            oCanvas = d3.select('#' + this.getId())
                .append('svg')
                    .attr('width', this.getWidth())
                    .attr('height', iHeight);

            // Create a canvas with margin
            oCanvas = oCanvas.append('g')
                .attr('transform', 'translate(' + [ oMargin.left, oMargin.top ] + ')');

            // Y label
            oCanvas.append('text')
                .attr('class', 'tmUsageHistChart-temperatureYAxisLabel')
                .attr('x', -oMargin.left + 15)
                .attr('y', iHeight / 2)
                .attr('dy', '0.35em')
                .text('Temperature');

            // Temperature color scale
            fnTemperatureColorScale = d3.scale.linear()
                .domain([30, 100])
                .range(['#3597ce', '#c1563f'])
                .clamp(true);

            // Temperature bar
            iTemperatureBarWidth = iWidth / aDataSet.length;

            oTemperatureBar = oCanvas.append('g').selectAll('g.tmUsageHistChart-temperature')
                .data(aDataSet)
                .enter()
                .append('g')
                    .attr('class', 'tmUsageHistChart-temperature')
                    .attr('transform', function (data, index) {
                    return 'translate(' + index * iTemperatureBarWidth + ',0)';
                });

            oTemperatureBar.append('rect')
                .attr('class', 'tmUsageHistChart-temperatureBar')
                .attr('height', iHeight)
                .attr('width', iTemperatureBarWidth)
                .style('fill', function (data) { return fnTemperatureColorScale(data.avgHighTemp); });

            oTemperatureBar.append('text')
                .attr('class', 'tmUsageHistChart-temperatureText')
                .attr('x', iTemperatureBarWidth / 2)
                .attr('y', iHeight / 2)
                .attr('dy', '0.35em')
                .text(function (data) { return data.avgHighTemp; });
        };


        /*
            a.	Y axis – consumption in increments of 500 for RES and 1000 for REBS
            b.	X axis – Billing Period (instead of having month, please put meter reading date (billing period start and billing period end))
            c.	Data – Trending kWh by contract with hover capability to show usage used for billing period
            d.	Temperature – Shows average monthly high temperature
        */

        return CustomControl;
    }
);
