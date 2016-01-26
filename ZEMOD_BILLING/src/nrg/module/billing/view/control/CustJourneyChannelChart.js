/*global sap , d3*/
/*jslint nomen:true*/
sap.ui.define(
    [
        'sap/ui/core/Control',
        'sap/ui/thirdparty/d3'
    ],

    function (Control) {
        'use strict';

        var CustomControl = Control.extend('nrg.module.billing.view.control.CustJourneyChannelChart', {
            metadata: {
                properties: {
                    width: { type: 'int', defaultValue: 500 },
                    height: { type: 'int', defaultValue: 300 }
                },

                events: {
                    totalDoublePress: {},
                    sliceDoublePress: {
                        parameters: {
                            channel: { type: 'string' }
                        }
                    }
                }
            },

            renderer: function (oRm, oCustomControl) {
                oRm.write('<div');
                oRm.writeControlData(oCustomControl);
                oRm.addClass('nrgCustJCChart');
                oRm.writeClasses();
                oRm.write('>');
                oRm.write('</div>');
            }
        });

        CustomControl.prototype.onInit = function () {

        };

        CustomControl.prototype.onBeforeRendering = function () {

        };

        CustomControl.prototype.onAfterRendering = function () {
            this._createChart();
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

        CustomControl.prototype._createChart = function () {
            var oCustomControl = this,
                iWidth = this.getWidth(),
                iHeight = this.getHeight(),
                iRadius = Math.min(iWidth, iHeight) / 3,
                aData,
                oCanvas,
                fnColor,
                oPieRim,
                oTotal,
                fnPie,
                fnPieArc,
                oPieSlice,
                oPie,
                oPieSliceText,
                fnLineInnerArc,
                fnLineOuterArc,
                oLine,
                oLineInnerPoint,
                oLabel;
            if (this.getDataModel() && this.getDataModel().getData() && this.getDataModel().getData().results && this.getDataModel().getData().results.length > 0) {
                aData = this.getDataModel().getData().results;

            } else {
                return;
            }

            // Create a canvas with the center as starting point
            oCanvas = d3.select('#' + this.getId())
                .append('svg')
                    .attr('width', iWidth)
                    .attr('height', iHeight)
                    .append('g')
                        .attr('transform', 'translate(' + [ iWidth / 2, iHeight / 2 ] + ')');

            function fnLabel(data) {
                return data.Channel;
            }
            function fnValue(data) {
                return data.Count;
            }

            function fnMidAngle(data) {
                return data.startAngle + (data.endAngle - data.startAngle) / 2;
            }
/*            fnColor = d3.scale.ordinal()
                .domain(aData, fnLabel)
                .range(['#2AA6DF', '#FDD20A', '#E80E89', '#a6df2a', '#59308c', '#449646', '#f15a24']);*/
            //mobile/website/ivr/phone/chat/survey/correspondence/misc
            fnColor = function (channel) {
                var sChannelColor = '#FFFFFF';// Default one
                channel = channel.toLowerCase();
                switch (channel) {
                case "website":
                    sChannelColor = '#2AA6DF';
                    break;
                case "chat":
                    sChannelColor = '#FDD20A';
                    break;
                case "survey":
                    sChannelColor = '#E80E89';
                    break;
                case "ivr":
                    sChannelColor = '#a6df2a';
                    break;
                case "phone":
                    sChannelColor = '#59308c';
                    break;
                case "correspondence":
                    sChannelColor = '#449646';
                    break;
                case "mobile":
                    sChannelColor = '#f15a24';
                    break;
                }
                return sChannelColor;
            };
            /* Donut rim */
            oPieRim = oCanvas.append('g');

            oPieRim.append('circle')
                .attr('r', iRadius * 0.95)
                .style('fill', 'none')
                .style('stroke', 'black')
                .style('stroke-width', 2);

            oPieRim.append('circle')
                .attr('r', iRadius * 0.8);

            /* Total circle */
            oTotal = oCanvas.append('g');

            oTotal.append('circle')
                .attr('r', iRadius * 0.35)
                .attr('class', 'nrgCustJCChart-totalOuterBg');

            oTotal.append('circle')
                .attr('r', iRadius * 0.25)
                .attr('class', 'nrgCustJCChart-totalInnerBg');

            oTotal.append('text')
                .text(d3.sum(aData, fnValue))
                .attr('dy', '0.35em')
                .attr('class', 'nrgCustJCChart-totalText');

            oTotal.on('dblclick', function () {
                oCustomControl.fireTotalDoublePress();
            });

            /* Donut chart */
            fnPie = d3.layout.pie()
                .sort(null)
                .value(fnValue);

            fnPieArc = d3.svg.arc()
                .outerRadius(iRadius * 0.6)
                .innerRadius(iRadius * 0.35);

            oPie = oCanvas.append('g');

            oPieSlice = oPie.append('g').selectAll('path.nrgCustJCChart-slice')
                .data(fnPie(aData))
                .enter()
                .append('path')
                    .attr('d', fnPieArc)
                    .attr('class', 'nrgCustJCChart-slice')
                    .style('fill', function (data) {
                    return fnColor(fnLabel(data.data));
                });

            oPieSlice.on('dblclick', function (data) {
                oCustomControl.fireSliceDoublePress({
                    channel: data.data.Channel
                });
            });

            /* Donut chart value */
            oPieSliceText = oPie.append('g').selectAll('text.nrgCustJCChart-sliceValue')
                .data(fnPie(aData))
                .enter()
                .append('text')
                    .text(function (data) { return fnValue(data.data); })
                    .attr('dy', '0.35em')
                    .attr('transform', function (data) { return 'translate(' + fnPieArc.centroid(data) + ')'; })
                    .attr('class', 'nrgCustJCChart-sliceValue');

            oPieSliceText.on('dblclick', function (data) {
                oCustomControl.fireSliceDoublePress({
                    channel: data.data.Channel
                });
            });

            /* Line between donut chart and label */
            fnLineInnerArc = d3.svg.arc()
                .outerRadius(iRadius * 0.7)
                .innerRadius(iRadius * 0.7);

            fnLineOuterArc = d3.svg.arc()
                .outerRadius(iRadius)
                .innerRadius(iRadius);

            oLine = oCanvas.append('g').selectAll('polyline.nrgCustJCChart-line')
                .data(fnPie(aData))
                .enter()
                    .append('polyline')
                        .attr('points', function (data) {
                    var aXY = fnLineOuterArc.centroid(data);
                    aXY[0] = iRadius * 0.9 * (fnMidAngle(data) < Math.PI ? 1 : -1);

                    return [fnLineInnerArc.centroid(data), fnLineOuterArc.centroid(data), aXY];
                })
                        .attr('stroke', function (data) {
                    return fnColor(fnLabel(data.data));
                })
                        .attr('class', 'nrgCustJCChart-line');

            /* Line point */
            oLineInnerPoint = oCanvas.append('g').selectAll('circle')
                .data(fnPie(aData))
                .enter()
                    .append('circle')
                        .attr('r', iRadius * 0.03)
                        .attr('fill', '#ffffff')
                        .attr('stroke-width', 2)
                        .attr('stroke', function (data) { return fnColor(fnLabel(data.data)); })
                        .attr('cx', function (data) { return fnLineInnerArc.centroid(data)[0]; })
                        .attr('cy', function (data) { return fnLineInnerArc.centroid(data)[1]; });

            /* Label */
            oLabel = oCanvas.append('g').selectAll('text.nrgCustJCChart-label')
                .data(fnPie(aData))
                .enter()
                    .append('text')
                        .attr('dy', '0.35em')
                        .attr('class', 'nrgCustJCChart-text')
                        .attr('transform', function (data) {
                    var aXY = fnLineOuterArc.centroid(data);
                    aXY[0] = iRadius * 0.9 * (fnMidAngle(data) < Math.PI ? 1 : -1);
                    return 'translate(' + aXY + ')';
                })
                        .style('text-anchor', function (data) {
                    return fnMidAngle(data) < Math.PI ? 'start' : 'end';
                })
                        .text(function (data) { return fnLabel(data.data); });
        };

        return CustomControl;
    }
);
