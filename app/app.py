from flask import Flask, request, jsonify, render_template
from pyarrow.flight import FlightClient, Ticket, FlightCallOptions
import json
import os
import logging
import sys

app = Flask(__name__)

host = os.getenv('INFLUXDB_HOST')
token = os.getenv('INFLUXDB_TOKEN')
options = FlightCallOptions(headers=[(b"authorization",f"Bearer {token}".encode('utf-8'))])
client = FlightClient(f"grpc+tls://{host}:443")

logger = logging.getLogger('ricks-explorer')
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger.addHandler(handler)

@app.route('/')
def home():
    app_title = os.environ.get("APP_TITLE", "Rick's Explorer")
    return render_template('index.html', title=app_title)

@app.route('/api/get-tag-values/<database>/<table>/<key>', methods=['GET'])
def get_tag_values(database, table, key):
    ticket_data = {
    "database": database,
    "sql_query": f"""show tag values from "{table}" with key = "{key}" where time > now() - 10m""",
    "query_type": "influxql"}
    df = punch_ticket(ticket_data)
 
    data = df.to_dict(orient='records')
    tag_values = []
    if len(data) == 0:
        tag_values = [{
            'text':'Empty',
            'disabled':'true',
            'type': 'tag_value',
            'database':database,
            'a_attr': {'class': 'disabled'},
            'li_attr': {'class': 'disabled'}
        }]
    else:
        tag_values = [{
            'text':d['value'],
            'type':'tag_value',
            'database':database,
            'table':table,
            'icon': '/static/images/string.png',
            'key': key}for d in data]
    return jsonify(tag_values)

@app.route('/api/get-columns/<database>/<table>', methods=['GET'])
def get_columns(database, table):
    ticket_data = {
    "database": database,
    "sql_query": f'show tag keys from "{table}" ',
    "query_type": "influxql"}

    df = punch_ticket(ticket_data)

    data = df.to_dict(orient='records')
    tags = [{
        'text':d['tagKey'],
        'type':'tag_key',
        'database':database,
        'icon': '/static/images/key.png',
        'table':table} for d in data]
    
    ticket_data = {
    "database": database,
    "sql_query": f'show field keys from "{table}" ',
    "query_type": "influxql"}
    df = punch_ticket(ticket_data)

    data = df.to_dict(orient='records')
    print(data)
    fields = [{'text':d['fieldKey'],
                'type':'field',
                'database':database,
                'table':table,
                'valueType':d['fieldType'],
                'icon': '/static/images/fields.png',
                'table':table} for d in data]

    data = {'tags': tags, 'fields':fields, 'table':table}
    return jsonify(data)

def punch_ticket(ticket_data):
    ticket_bytes = json.dumps(ticket_data)
    ticket = Ticket(ticket_bytes)
    flight_reader = client.do_get(ticket, options)
    df = flight_reader.read_all().to_pandas()
    return df

@app.route('/api/get-tables/<database>', methods=['GET'])
def get_tables(database):
    ticket_data = {
    "database": database,
    "sql_query": "show measurements",
    "query_type": "influxql"}
    
    ticket_bytes = json.dumps(ticket_data)
    ticket = Ticket(ticket_bytes)
    # execute the query and return all the data
    try:
        flight_reader = client.do_get(ticket, options)
        df = flight_reader.read_all().to_pandas()
        
        data = df.to_dict(orient='records')
        if len(data) == 0:
            return _empty_database_nodes(database, "Empty")
        formatted_data = [{'text': d['name'], 
                           'id': f"{database}_{d['name']}",
                           'type': 'table',
                           'table': d['name'],
                           'database':database,
                           'icon': '/static/images/table.png'} for d in data]
        return jsonify(formatted_data)
    
    except Exception as e:
        logging.error(f"error getting tables: {e}")
        return _empty_database_nodes(database, str(e))

def _empty_database_nodes(database, text):
    return jsonify([{
            'text':text,
            'disabled':'true',
            'type': 'table',
            'database':database,
            'a_attr': {'class': 'disabled'},
            'li_attr': {'class': 'disabled'},
            'icon': '/static/images/table.png'
        }])

@app.route('/api/get-databases', methods=['GET'])
def get_databases():
    databases = os.getenv("INFLUXDB_DATABASES").split(",")
    logging.info(f"Found databases: {databases}")
    return jsonify([{'text': database,
                    'id': database,
                    'icon': '/static/images/db.png',
                    'opened': False,
                    'type':'database'
                     } for database in databases])

@app.route('/api/query', methods=['POST'])
def query():
    data = request.get_json()
    if 'query' not in data or 'language' not in data or 'database' not in data:
        return jsonify({'message': 'Bad Request', 'error': 'query, database, and/or language not found in the request'}), 400
    query = data['query']
    language = data['language']
    database = data['database']

    ticket_data = {
    "database": database,
    "sql_query": query,
    "query_type": language}

    ticket_bytes = json.dumps(ticket_data)
    ticket = Ticket(ticket_bytes)
    
    try:
        flight_reader = client.do_get(ticket, options)
        df = flight_reader.read_all().to_pandas()
        if len(df) > 100000:
            return f"Query returns {len(df)} records, but the UI can only render up to 100,000. Consider using more aggregation or including a LIMIT.", 400
        json_str = df.to_json(orient='records')
        return json_str, 200
    except Exception as e:
        return str(e), 500
    
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5002)
