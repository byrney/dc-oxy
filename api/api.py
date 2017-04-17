import flask
import database
import io
from psycopg2 import sql

CSV='text/plain'
api = flask.Blueprint('api', __name__)


def query_to_csv(cur, query, args):
    csv = io.StringIO();
    q = cur.mogrify(query, args).decode('UTF-8')
    cur.copy_expert("copy ({}) to STDOUT csv header".format(q), csv)
    return csv.getvalue()


@api.route('/meters')
def csvinfo():
    csv = io.StringIO();
    cur = dict_cursor()
    cur.copy_expert("copy energy.oxy_meter to STDOUT csv header", csv)
    output = flask.make_response(csv.getvalue())
    output.headers['Content-Type'] =  CSV
    return output


@api.route('/history/<measure>')
def history(measure):
    cur = dict_cursor()
    table = sql.Identifier(measure)
    q = sql.SQL("""select date_trunc('week', date_time) as week, sum({}) as {}
               from energy.oxy_meter_reading
               group by 1""").format(table, table).as_string(cur)
    csv = query_to_csv(cur, q, None)
    output = flask.make_response(csv)
    output.headers['Content-Type'] =  CSV
    return output


@api.route('/meters/<id>')
def by_id(id):
    cur = dict_cursor()
    q = "select * from energy.oxy_meter where meter_id = %s"
    csv = query_to_csv(cur, q, (id,))
    output = flask.make_response(csv)
    output.headers['Content-Type'] =  CSV
    return output


def dict_cursor():
    conn = database.connection()
    cur = database.dict_cursor(conn)
    return cur


def init():
    api.Testing = True
    return


if __name__ == "__main__":
    init()
    api.run(debug = True)
