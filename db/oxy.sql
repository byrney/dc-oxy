create schema if not exists energy;

drop table if exists energy.oxy_meter cascade;
create table energy.oxy_meter (
        meter_id int,
        meter_name text,
        sub_location text,
        equipment_type text,
        unit_type text,
        last_updated timestamp,
        PRIMARY KEY (meter_id)
);

drop table if exists energy.oxy_meter_reading cascade;
create table energy.oxy_meter_reading (
        meter_id int not null references energy.oxy_meter(meter_id),
        date_time timestamp not null,
        net_energy float8,
        cumulative_energy float8,
        net_power float8,
        PRIMARY KEY (meter_id, date_time)
);

insert into energy.oxy_meter (meter_id, meter_name, sub_location, equipment_type, unit_type) VALUES
    ('246','Busbar West','West Wing Busbar','Busbar','kWh'),
    ('247','Mech West','West Wing Mech','Mech Services','kWh'),
    ('248','PDU No.2','West Wing PDUs','PDU','kWh'),
    ('249','Car Park Ltg','Car Park','Lighting','kWh'),
    ('250','Lifts West','West Wing Lifts','Lifts','kWh'),
    ('251','Busbar East','East Wing Busbar','Busbar','kWh'),
    ('252','Mech East','East Wing Mech','Mech Services','kWh'),
    ('253','PDU No.1','East Wing PDUs','PDU','kWh'),
    ('254','Kitchen','Kitchen','Kitchen Equipment','kWh'),
    ('255','Football Lighting','Football Pitch','Lighting','kWh'),
    ('256','Lifts East','East Wing Lifts','Lifts','kWh'),
    ('706','Ground Floor Core Services GWLL','West W Ground Floor','Multiple','kWh'),
    ('707','Ground Floor Power GW2','West W Ground Floor','Power','kWh'),
    ('708','Ground Floor Lighting GW2','West W Ground Floor','Lighting','kWh'),
    ('709','Ground Floor Power GW1','West W Ground Floor','Power','kWh'),
    ('710','Ground Floor Lighting GW1','West W Ground Floor','Lighting','kWh'),
    ('711','First Floor Core Services FWLL','West W First Floor','Multiple','kWh'),
    ('712','First Floor Power FW2','West W First Floor','Power','kWh'),
    ('713','First Floor Lighting FW2','West W First Floor','Lighting','kWh'),
    ('714','First Floor Power FW1','West W First Floor','Power','kWh'),
    ('715','First Floor Lighting FW1','West W First Floor','Lighting','kWh'),
    ('716','Second Floor Core Services SWLL','West W Second Floor','Multiple','kWh'),
    ('717','Second Floor Power SW2','West W Second Floor','Power','kWh'),
    ('718','Second Floor Lighting SW2','West W Second Floor','Lighting','kWh'),
    ('719','Second Floor Power SW1','West W Second Floor','Power','kWh'),
    ('720','Second Floor Lighting SW1','West W Second Floor','Lighting','kWh'),
    ('721','Third Floor Core Services TWLL','West W Third Floor','Multiple','kWh'),
    ('722','Ground Floor Core Services GELL','East W Ground Floor','Multiple','kWh'),
    ('723','Ground Floor Power GE','East W Ground Floor','Power','kWh'),
    ('724','Ground Floor Lighting GE','East W Ground Floor','Lighting','kWh'),
    ('725','First Floor Core Services FELL','East W First Floor','Multiple','kWh'),
    ('726','First Floor Power FE','East W First Floor','Power','kWh'),
    ('727','First Floor Lighting FE','East W First Floor','Lighting','kWh'),
    ('728','Second Floor Core Services SELL','East W Second Floor','Multiple','kWh'),
    ('729','Second Floor Power SE','East W Second Floor','Power','kWh'),
    ('730','Second Floor Lighting SE','East W Second Floor','Lighting','kWh'),
    ('731','Third Floor Light & Power TE','East W Third Floor','Multiple','kWh')
;
