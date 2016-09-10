sap.ui.define(["sap/ui/core/Control","sap/ui/thirdparty/d3"],function(a){"use strict";var b=a.extend("ute.ui.main.Chart",{metadata:{properties:{width:{type:"int",defaultValue:900},height:{type:"int",defaultValue:400},usageTickSize:{type:"int",defaultValue:100}}},renderer:function(a,b){a.write("<div"),a.writeControlData(b),a.addClass("AVDChart"),a.writeClasses(),a.write(">"),a.write("</div>")}});return b.prototype.onExit=function(){this._oDataModel=null,this._oCanvas=null},b.prototype.onAfterRendering=function(){this._createChart()},b.prototype.hideUsage=function(a,b){return this._oCanvas&&this._oCanvas.selectAll(".AVDChart-usage").each(function(c){c.key===a&&(b?d3.select(this).style("display","none"):d3.select(this).style("display",null))}),this},b.prototype.refreshChart=function(){this.rerender()},b.prototype.setDataModel=function(a){return this._oDataModel=a,this},b.prototype.getDataModel=function(){return this._oDataModel},b.prototype._getDataSet=function(){var a=jQuery.extend(!0,[],this.getDataModel().getData().data),b=d3.time.format("%x").parse;return a.forEach(function(a){a.usageDate=b(a.usageDate)},this),a},b.prototype._createChart=function(){var a=this,b={top:0,right:60,bottom:60,left:100},c=900-b.left-b.right,d=400-b.top-b.bottom-50,e=a._getDataSet(),f=d3.extent(e,function(a){return a.usageDate.getMonth()}),g=d3.scale.linear().domain(f).range([0,c]),h=a.getUsageTickSize(),i=d3.max(e,function(a){return a.usage}),j=i+(h-i%h),k=d3.min(e,function(a){return a.usage}),l=k-k%h-h;l=0>l?0:l;var m=d3.scale.linear().domain([l,j]).range([d,0]);this._oCanvas=d3.select("#"+this.getId()).append("svg").attr("class","AVDChart").attr("width",a.getWidth()).attr("height",a.getHeight()).attr("viewBox",[0,0,c+b.left+b.right,d+b.top+b.bottom].join(" ")).append("g").attr("transform","translate("+[b.left,b.top]+")");var n=d3.scale.ordinal().domain(d3.range(12)).range(["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]),o=d3.svg.axis().scale(g).orient("bottom").tickValues(d3.range(f[0],f[1]+1)).tickFormat(function(a){return n(a)});this._oCanvas.append("g").attr("class","AVDChart-XAxis").attr("transform","translate("+[0,d+20]+")").call(o);var p=d3.svg.axis().scale(m).orient("left").ticks(Math.floor((i-k)/h)+1).tickFormat(d3.format("d"));this._oCanvas.append("g").attr("class","AVDChart-YAxis").attr("transform","translate("+[-30,0]+")").call(p),this._oCanvas.append("g").selectAll("line").data(d3.range(f[0],f[1]+1)).enter().append("line").attr("class","AVDChart-XGrid").attr("x1",function(a){return g(a)}).attr("y1",0).attr("x2",function(a){return g(a)}).attr("y2",d),this._oCanvas.append("g").selectAll("line").data(d3.range(l,j,h)).enter().append("line").attr("class","AVDChart-YGrid").attr("x1",0).attr("y1",function(a){return m(a)}).attr("x2",c+30).attr("y2",function(a){return m(a)});var q=d3.nest().key(function(a){return a.usageDate.getFullYear()}).entries(e),r=d3.scale.ordinal().domain(q,function(a){return a.key}).range(["#ffffff","#f2a814","#000000","#5092ce"]),s=d3.svg.line().x(function(a){return g(a.usageDate.getMonth())}).y(function(a){return m(a.usage)}),t=this._oCanvas.append("g").selectAll("g").data(q).enter().append("g").attr("class","AVDChart-usage");t.append("path").attr("class","AVDChart-usageLine").attr("d",function(a){return s(a.values)}).style("stroke",function(a){return r(a.key)}).style("fill","none"),t.selectAll("g").data(function(a){return a.values}).enter().append("circle").attr("class","AVDChart-usageDataPoint").attr("r","4").attr("cx",function(a){return g(a.usageDate.getMonth())}).attr("cy",function(a){return m(a.usage)}).style("fill",function(a){return r(a.usageDate.getFullYear())})},b});