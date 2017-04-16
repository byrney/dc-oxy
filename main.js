
var crossfilter = require('crossfilter');
var dc = require('dc');
var d3 = require('d3');
require('./main.html'); // force index.html to do into dist
require('./node_modules/dc/dc.css');
require('./node_modules/purecss/build/grids.css');

var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dataClean(r){
    r.meter_id = +r.meter_id;
    r.net_energy = +r.net_energy;
    r.cumulative_energy = +r.cumulative_energy;
    r.net_power = +r.net_power;
    var date = r.date_time.split(' ')[0];
    var parts = date.split('/');
    r.date_time = new Date(parts[2], parts[1] - 1, parts[0]);
    r.dow = r.date_time.getDay();
    r.hour = r.date_time.getHours();
    r.week = new Date(r.date_time);
    r.week.setDate(r.week.getDate() - r.week.getDay());
}

function chartOverview(ndx, info, data){
    var dim = ndx.dimension(dc.pluck('week'));
    var grp = dim.group().reduceSum(d => d.net_energy);
    chart = dc.lineChart('#range', 'other-group');
    chart
        .height(null)
        .width(null)
        .dimension(dim)
        .group(grp)
        .mouseZoomable(false)
        .margins({top: 10, right: 50, bottom: 20, left: 40})
        .xUnits(d3.time.months)
        .x(d3.time.scale().domain([new Date(2017, 0, 1), new Date(2017, 3, 1)]))
    ;
    chart.yAxis().ticks(0);
    return chart;
}

function infoLocations(info){
    var locations = {}
    info.forEach(i => {
        locations[+i.meter_id] = {
            meter_name: i.meter_name,
            sub_location: i.sub_location,
            equipment_type: i.equipment_type,
            location: i.location,
            location_detail: i.location_detail
        };
    });
    return locations;
}

function pieDow(ndx, info, data){
    var dim = ndx.dimension(dc.pluck('dow'));
    var grp = dim.group().reduceSum(d => d.net_energy);
    var chart = dc.pieChart('#dow');
    chart
        .width(null)
        .height(null)
        .innerRadius(25)
        .dimension(dim)
        .group(grp)
    ;
    return chart;
}

function chartDow(ndx, info, data){
    var dim = ndx.dimension(dc.pluck('dow'));
    var grp = dim.group().reduce(
        (p,v) => {
            if(v.net_energy == 0){
                return p;
            }
            var currCount = p.dates[v.date_time] || 0;
            p.dates[v.date_time] = currCount + 1;
            p.sum += v.net_energy;
            return p;
        },
        (p,v) => {
            if(v.net_energy == 0){
                return p;
            }
            if(p.dates[v.date_time] > 1){
                p.dates[v.date_time] -= 1;
            } else {
                delete p.dates[v.date_time];
            }
            p.sum -= v.net_energy;
            return p;
        },
        () => ({dates: {}, sum: 0})
    );
    var chart = dc.barChart('#chart');
    chart.width(null)
         .height(null)
         .x(d3.scale.ordinal())
         .xAxisLabel('Weekdays')
         .dimension(dim)
         .group(grp)
         .valueAccessor(p => {
             var dates = Object.keys(p.value.dates).length;
             if(dates == 0)
                 return 0;
             return p.value.sum / dates;
         })
         .margins({top: 20, right: 20, bottom: 50, left: 80})
         .elasticY(true)
         .gap(10)
         .xUnits(dc.units.ordinal)
         .xAxis().tickFormat(d => weekdays[d])
    ;
    return chart;
}

function chartType(ndx, locations, data){
    var dim = ndx.dimension(m => locations[m.meter_id].equipment_type);
    var grp = dim.group().reduceSum(d => d.net_energy);
    var chart = dc.pieChart('#pie');
    chart
        .width(null)
        .height(null)
        .innerRadius(25)
        .dimension(dim)
        .group(grp)
    ;
    return chart;
}

function chartLocation(ndx, locations, data){
    var dim = ndx.dimension(m => locations[m.meter_id].location);
    var grp = dim.group().reduceSum(d => d.net_energy);
    var chart = dc.rowChart('#location')
    chart
        .width(null)
        .height(null)
        .dimension(dim)
        .group(grp)
        .elasticX(true)
        .xAxis().ticks(4)
    ;
    return chart;
}

function chartLocDetail(ndx, locations, data){
    var dim = ndx.dimension(m => locations[m.meter_id].location_detail);
    var grp = dim.group().reduceSum(d => d.net_energy);
    return dc.rowChart('#location-detail')
        .width(null)
        .height(null)
        .dimension(dim)
        .group(grp)
        .elasticX(true)
        .xAxis().ticks(4)
}

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d && d.value > 1e-7;
            });
        }
    };
}

function chartTime(ndx, locations, data, rangeChart){
    var dim = ndx.dimension(dc.pluck('date_time'));
    var grp = remove_empty_bins(dim.group().reduceSum(d => d.net_energy));
    var chart = dc.lineChart('#time');
    chart
        .renderArea(true)
        .width(null)
        .height(null)
        .dimension(dim)
        .group(grp)
        .mouseZoomable(false)
        .x(d3.time.scale().domain(d3.extent(data, d => d.date_time)))
        .elasticY(true)
        .rangeChart(rangeChart)
        .margins({top: 20, right: 20, bottom: 50, left: 80})
    return chart;
}

function init(){
    d3.csv('../data/oxy_info_enh.csv', function(error, info){
        var locations = infoLocations(info)
        d3.csv('../data/oxy_data_2017_feb.csv', function(error, data){
            data.forEach(dataClean);
            var ndxOverview = crossfilter(data);
            var rangeChart = chartOverview(ndxOverview, info, data);
            // create the ndx for the varius subcharts
            var ndx = crossfilter(data);
            var dowChart = chartDow(ndx, info, data)
            var typeChart = chartType(ndx, locations, data);
            var locChart = chartLocation(ndx, locations, data);
            var locDetailChart = chartLocDetail(ndx, locations, data);
            var timeChart = chartTime(ndx, locations, data, rangeChart);
            dc.renderAll('other-group');
            dc.renderAll();
        });
    });
}

init()

