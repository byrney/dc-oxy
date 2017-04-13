
var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function weekOfYear(date){
    soy = new Date(date.getFullYear(), 0, 0);
    elapsed = date - soy
    weeks = Math.trunc(elapsed/1000/60/60/24/7)
    return weeks
}

function init(){
    d3.csv('oxy_info_enh.csv', function(error, info){
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
        console.log(locations[246]);
        d3.csv('oxy_data_2017_feb.csv', function(error, data){
            data.forEach(function(r){
                r.meter_id = +r.meter_id;
                r.net_energy = +r.net_energy;
                r.cumulative_energy = +r.cumulative_energy;
                r.net_power = +r.net_power;
                date = r.date_time.split(' ')[0]
                parts = date.split('/')
                r.date_time = new Date(parts[2], parts[1] - 1, parts[0])
                r.dow = r.date_time.getDay();
                r.hour = r.date_time.getHours();
                r.week = weekOfYear(r.date_time);
            });
            console.log(data);
            var ndx = crossfilter(data);
            var dims = {
                date: ndx.dimension(dc.pluck('date_time')),
                dow: ndx.dimension(dc.pluck('dow')),
                meter: ndx.dimension(dc.pluck('meter_id')),
                type: ndx.dimension(m => locations[m.meter_id].equipment_type),
                sub_location: ndx.dimension(m => locations[m.meter_id].sub_location),
                location: ndx.dimension(m => locations[m.meter_id].location),
                week: ndx.dimension(dc.pluck('week'))
            };
            var netEnergyGroup = dims.type.group().reduceSum(d => d.net_energy);
            var netEnergyByLoc = dims.location.group().reduceSum(d => d.net_energy);
            var netEnergyByWeek = dims.week.group().reduceSum(d => d.net_energy);
            var netEnergyByDate = dims.date.group().reduceSum(d => d.net_energy);
            var dowGroup = dims.dow.group().reduceSum(d => d.net_energy);
            var meterCount = dims.meter.group().reduceSum(d => d.net_energy > 0 ? 1 : 0)
            var meterEnergy = dims.meter.group().reduceSum(d => d.net_energy > 0 ? 1 : 0)
            var domain = Object.keys(locations)
            // chart.width(800)
            //      .height(400)
            //      .x(d3.scale.ordinal())
            //      .xAxisLabel('dow')
            //      .yAxisLabel('Net Energy')
            //      .dimension(dims.meter)
            //      .group(meterCount)
            //      .elasticY(true)
            //      .gap(50)
            //      .xUnits(dc.units.ordinal)
            // ;
            var dowChart = dc.barChart('#chart')
            dowChart.width(800)
                 .height(400)
                 .x(d3.scale.ordinal())
                 .xAxisLabel('Weekdays')
                 .yAxisLabel('Net Energy')
                 .dimension(dims.dow)
                 .group(dowGroup)
                 .elasticY(true)
                 .gap(50)
                 .xUnits(dc.units.ordinal)
                 .xAxis().tickFormat(d => weekdays[d])
            ;
            var typeChart = dc.pieChart('#pie');
            typeChart
                .width(300)
                .height(300)
                .innerRadius(50)
                .dimension(dims.type)
                .group(netEnergyGroup)

            var locChart = dc.rowChart('#table')
            locChart
                .width(300)
                .height(300)
                .dimension(dims.location)
                .group(netEnergyByLoc)
                .elasticX(true)
                .xAxis().ticks(4)
            ;
            var timeChart = dc.lineChart('#time');
            timeChart
                .renderArea(true)
                .width(800)
                .height(400)
                .dimension(dims.date)
                .group(netEnergyByDate, 'Net Energy')
                .mouseZoomable(true)
                .x(d3.time.scale().domain(d3.extent(data, d => d.date_time)))
                .elasticY(true)

            dc.renderAll();
        });
    });
}

init()

