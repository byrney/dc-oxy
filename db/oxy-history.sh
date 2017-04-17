#!/bin/bash

#
# Import or export oxy meter readings to a set of monthly CSV files
#
# usage:
#   oxy-history.sh import|export  directory


INDEX="select date_trunc('month', date_time)::date, date_trunc('month', date_time + '1 month'::interval)::date from energy.oxy_meter_reading group by 1, 2 order by 1"
PSQL='psql -X --pset pager=off --set ON_ERROR_STOP=1 --set VERBOSITY=terse --quiet'

function cmd_export(){
    local dir="${1:-.}"
    while read -r -d $'\0' start end ; do
        $PSQL -c "\copy (select * from energy.oxy_meter_reading where '$start'::date <= date_time and date_time < '$end'::date) to '$dir/$start.csv' csv header"
    done < <($PSQL -F ' ' -t -0 -A -c "$INDEX")
}

function cmd_import(){
    local dir="${1:-.}"
    for filename in "$dir"/*.csv ; do
        $PSQL -c "\copy energy.oxy_meter_reading from $filename csv header"
    done
}

cmd=${1:-"default"}
shift
"cmd_$cmd" "$@"
