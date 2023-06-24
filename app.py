from flask import Flask, jsonify, render_template
from pyarrow.flight import FlightClient, Ticket, FlightCallOptions
import requests
import csv
import json

from influxdb_client_3 import InfluxDBClient3

app = Flask(__name__)

host = 'us-east-1-2.aws.cloud2.influxdata.com'
token = 'LaOJ8cVxJfE3xc7pAz2dstxNwl-YJv7DcH0jZVrE61UvuYSbrxX8Op7CIhAUHjvpB1G_fdsTcLoELIi3Cj4wgg=='
org = "5d59ccc5163fc318"
options = FlightCallOptions(headers=[(b"authorization",f"Bearer {token}".encode('utf-8'))])
client = FlightClient(f"grpc+tls://{host}:443")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/get-columns/<database>/<table>', methods=['GET'])
def get_columns(database, table):
    ticket_data = {
    "database": database,
    "sql_query": f"show columns from {table}",
    "query_type": "sql"}
    ticket_bytes = json.dumps(ticket_data)
    ticket = Ticket(ticket_bytes)
    try:
        flight_reader = client.do_get(ticket, options)
        df = flight_reader.read_all().to_pandas()
        data = df.to_dict(orient='records')
        formatted_data = [{'text': d['column_name'], 
                    'id': f"{table}_{d['column_name']}",
                    'type': 'column',
                    'database':database,
                    'table':table} for d in data]
        return jsonify(formatted_data)
    except:
        return jsonify([{
            'text':'Empty',
            'disabled':'true',
            'type': 'table',
            'database':database,
            'a_attr': {'class': 'disabled'},
            'li_attr': {'class': 'disabled'},
            'icon': '/static/images/table.png'
        }])
@app.route('/api/get-tables/<database>', methods=['GET'])
def get_tables(database):
    ticket_data = {
    "database": database,
    "sql_query": "show measurements",
    "query_type": "influxql"}
    
    ticket_bytes = json.dumps(ticket_data)
    ticket = Ticket(ticket_bytes)
    print(ticket)
    # execute the query and return all the data
    try:
        flight_reader = client.do_get(ticket, options)
        df = flight_reader.read_all().to_pandas()
        
        data = df.to_dict(orient='records')
        print(data)
        formatted_data = [{'text': d['name'], 
                           'id': d['name'],
                           'type': 'table',
                           'database':database,
                           'icon': '/static/images/table.png'} for d in data]

        return jsonify(formatted_data)
    except:
        return jsonify([{
            'text':'Empty',
            'disabled':'true',
            'type': 'table',
            'database':database,
            'a_attr': {'class': 'disabled'},
            'li_attr': {'class': 'disabled'},
            'icon': '/static/images/table.png'
        }])

@app.route('/api/get-databases', methods=['GET'])
def get_databases():
    url = f"https://{host}/api/v2/query"
    body = "buckets()"
    headers = {"Authorization":f"Token {token}", "Content-type":"application/vnd.flux"}
    response = requests.post(url=url, data=body,headers=headers)
    lines = response.text.splitlines()
    reader = csv.reader(lines)
    next(reader)
    data = list(reader)
    databases = [row[3] for row in data if len(row) > 3]
    return jsonify([{'text': database,
                    'id': database,
                    'icon': '/static/images/db.png',
                    'opened': False,
                    'type':'database'
                     } for database in databases])

def get_column_icon(type_str):
    if type_str == "Utf8":
        return "string.png"
    elif type_str.starts_with("Date") or type_str.starts_with("Time") or type_str.starts_with("Interval"):
        return "time.png"
    elif type_str.starts_with("Int") or type_str.starts_with("UInt"):
        return "int.png"
    elif type_str.starts_with("Float") or type_str.starts_with("Decimal"):
        return "float.png"
    elif type_str == "Boolean":
        return "boolean.png"
    elif type_str == "Binary":
        return "binary.png"
    else:
        return "default.png"
    


if __name__ == "__main__":
    app.run(debug=True, port=5001)
