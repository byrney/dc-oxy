
var crossfilter = require('crossfilter');
var dc = require('dc');
var d3 = require('d3');
require('./main.html'); // force index.html to do into dist
require('./node_modules/dc/dc.css');
require('./node_modules/purecss/build/grids.css');

var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var dtFormat = d3.time.format('%d/%m/%Y %H:%M');
//Magical function which will print out the crossfilter array
function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 
function dataClean(r){
    r.meter_id = +r.meter_id;
    r.net_energy = +r.net_energy;
    r.cumulative_energy = +r.cumulative_energy;
    r.net_power = +r.net_power;
    r.powerTotal =0;
    r.mechTotal =0;
    r.pduTotal =0;
    r.busbarTotal =0;
    r.lightingTotal =0;
    r.kitchenTotal =0;
    r.multipleTotal =0;
    r.date_time = dtFormat.parse(r.date_time);
    r.date = d3.time.day(r.date_time);
    r.dow = r.date_time.getDay();
    r.hour = r.date_time.getHours();
    r.week = d3.time.week(r.date_time);
    if(r['meter_id'] == '246' || r['meter_id'] == '251'){
       r['equipment_type'] ='Busbar';
       r.busbarTotal = +r.net_energy;
    }else if(r['meter_id'] == '247' || r['meter_id'] == '252'){
        r['equipment_type'] = 'Mech Services';
        r.mechTotal = +r.net_energy;
    }else if(r['meter_id'] == '248' || r['meter_id'] == '253'){
        r['equipment_type'] = 'PDU';
        r.pduTotal = +r.net_energy;
    }else if(r['meter_id'] == '249' || r['meter_id'] == '255'|| r['meter_id'] == '718'|| r['meter_id'] == '720'|| r['meter_id'] == '724'|| r['meter_id'] == '720'|| r['meter_id'] == '727'|| r['meter_id'] == '730'|| r['meter_id'] == '730'|| r['meter_id'] == '720'|| r['meter_id'] == '724'|| r['meter_id'] == '720'|| r['meter_id'] == '727'|| r['meter_id'] == '730'|| r['meter_id'] == '730'|| r['meter_id'] == '720'|| r['meter_id'] == '724'|| r['meter_id'] == '720'|| r['meter_id'] == '727'|| r['meter_id'] == '730'|| r['meter_id'] == '708'|| r['meter_id'] == '710'|| r['meter_id'] == '713'|| r['meter_id'] == '715'){
       r['equipment_type'] = 'Lighting';
       r.lightingTotal = +r.net_energy;
    }else if(r['meter_id'] == '250' || r['meter_id'] == '256'){
        r['equipment_type'] = 'Lifts';
        r.liftsTotal = +r.net_energy;
    }else if(r['meter_id'] == '254'){
        r['equipment_type'] = 'Kitchen Equipment';
        r.kitchenTotal = +r.net_energy;
    }else if(r['meter_id'] == '706' || r['meter_id'] == '721' || r['meter_id'] == '722' || r['meter_id'] == '725' || r['meter_id'] == '728' || r['meter_id'] == '731' || r['meter_id'] == '711' || r['meter_id'] == '716'){
        r['equipment_type'] = 'Multiple';
        r.multipleTotal = +r.net_energy;
    }else if(r['meter_id'] == '719' || r['meter_id'] == '723' || r['meter_id'] == '726' || r['meter_id'] == '729' || r['meter_id'] == '707' || r['meter_id'] == '709' || r['meter_id'] == '712' || r['meter_id'] == '714' || r['meter_id'] == '717'){
        r['equipment_type'] = 'Power';
        r.powerTotal = +r.net_energy;
    }
}


function chartOverview(ndx, info, data){
    var dim = ndx.dimension(dc.pluck('week'));
    var grp = dim.group().reduceSum(d => d.net_energy);
    var chart = dc.lineChart('#range', 'other-group');
    chart
        .height(null)
        .width(null)
        .dimension(dim)
        .group(grp)
        .mouseZoomable(false)
        .margins({top: 10, right: 50, bottom: 20, left: 40})
        .xUnits(d3.time.months)
        .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.date;} )))
    ;
    chart.yAxis();
    return chart;
}

function infoLocations(info){
    var locations = {};
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
        .label(d => weekdays[d.key])
    ;
    return chart;
}

/*
// // Version of DOW showing average energy for each weekday
// function chartDow(ndx, info, data){
//     var dim = ndx.dimension(dc.pluck('dow'));
//     var grp = dim.group().reduce(
//         (p,v) => {
//             if(v.net_energy == 0){
//                 return p;
//             }
//             var currCount = p.dates[v.date] || 0;
//             p.dates[v.date] = currCount + 1;
//             p.sum += v.net_energy;
//             return p;
//         },
//         (p,v) => {
//             if(v.net_energy == 0){
//                 return p;
//             }
//             if(p.dates[v.date] > 1){
//                 p.dates[v.date] -= 1;
//             } else {
//                 delete p.dates[v.date];
//             }
//             p.sum -= v.net_energy;
//             return p;
//         },
//         () => ({dates: {}, sum: 0})
//     );
//     var chart = dc.barChart('#chart');
//     chart.width(null)
//          .height(null)
//          .x(d3.scale.ordinal())
//          .xAxisLabel('Weekdays')
//          .dimension(dim)
//          .group(grp)
//          .valueAccessor(p => {
//              var dates = Object.keys(p.value.dates).length;
//              if(dates == 0)
//                  return 0;
//              return p.value.sum / dates;
//          })
//          .margins({top: 20, right: 20, bottom: 50, left: 80})
//          .elasticY(true)
//          .gap(10)
//          .xUnits(dc.units.ordinal)
//          .xAxis().tickFormat(d => weekdays[d])
//     ;
//     return chart;
// }
// */

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
    var chart = dc.rowChart('#location');
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
    ;
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

// function chartTime(ndx, locations, data, rangeChart){
//     var dim = ndx.dimension(dc.pluck('date_time'));
//     var grp = remove_empty_bins(dim.group().reduceSum(d => d.net_energy).reduceSum(d => d['equipment_type']));
//     var chart = dc.lineChart('#time');
//     chart
//         .renderArea(true)
//         .width(null)
//         .height(null)
//         .dimension(dim)
//         .group(grp)
//         .mouseZoomable(false)
//         .x(d3.time.scale().domain(d3.extent(data, d => d.date_time)))
//         .elasticY(true)
//         .rangeChart(rangeChart)
//         .margins({top: 20, right: 20, bottom: 50, left: 80})
//     ;
//     return chart;
// }


function stackedChart(ndx, locations, data, rangeChart){
    var dim = ndx.dimension(function(d){return d['date_time']});
    var busbarType =  dim.group().reduceSum(function(d){return d.busbarTotal; });
    var mechType =  dim.group().reduceSum(function(d){return d.mechTotal; });
    var pduType =  dim.group().reduceSum(function(d){return d.pduTotal; });
    var lightType =  dim.group().reduceSum(function(d){return d.lightingTotal; });
    var liftType =  dim.group().reduceSum(function(d){return d.liftsTotal; });
    var kitchenType =  dim.group().reduceSum(function(d){return d.kitchenTotal; });
    var multiType =  dim.group().reduceSum(function(d){return d.multipleTotal; });
    var powerType =  dim.group().reduceSum(function(d){return d.powerTotal; });
    var grp = remove_empty_bins(dim.group().reduceSum(d => d.net_energy));
    var chart = dc.lineChart('#time');
    chart
        .renderArea(true)
        .width(null)
        .height(null)
        .dimension(dim)
        .group(busbarType, 'Busbar')
        .stack(mechType, 'Mech Services')
        .stack(pduType, 'PDU')
        .stack(lightType, 'Lighting')
        .stack(liftType, 'Lifts')
        .stack(kitchenType, 'Kitchen Equipment')
        .stack(multiType, 'Multiple')
        .stack(powerType, 'Power')
        .mouseZoomable(true)
        .x(d3.time.scale().domain(d3.extent(data, d => d.date_time)))
        .legend(dc.legend().x(0).y(10).itemHeight(13).gap(5))
        .rangeChart(rangeChart)
        .margins({top: 20, right: 50, bottom: 50, left: 80})
    ;
    return chart;
}


function init(){
    d3.csv('../data/oxy_info_enh.csv', function(error, info){
        var locations = infoLocations(info);
        d3.csv('../data/oxy_data_2017_feb.csv', function(error, data){
            data.forEach(dataClean);
            var ndxOverview = crossfilter(data);
            var rangeChart = chartOverview(ndxOverview, info, data);
            // create the ndx for the varius subcharts
            var ndx = crossfilter(data);
            pieDow(ndx, info, data);
            chartType(ndx, locations, data);
            chartLocation(ndx, locations, data);
            chartLocDetail(ndx, locations, data);
            // chartTime(ndx, locations, data, rangeChart);
            stackedChart(ndx, locations, data, rangeChart);
            dc.renderAll('other-group');
            dc.renderAll();
        });
    });
}

init();

