This is a side/skundworks project focused on data exploration for IOx-based InfluxDB products, currently:
 * InfluxDB Cloud Serverles
 * InfluxDB Cloud Dedicated

It current allows you to pass in a list of databases, and then shows the data in a treeview. There is sql editor in the UI, but it isn't hooked up to anything yet.

# Development Principles
My goal for this project is that any developer can work on it. As such, I keep it simple:
 1. The backend is a Flask (i.e. Python server).
 2. The front end uses JQuery and web controls built on JQuery, but no complicated frameworks, and especially no "toolchains", etc... 
 3. The server is stateless (with the obvious exception of start up settings). That means any state for the convenience of the user should reside in the client code, and that should be optional. This means that the server knows how to query the database, it doesn't know about users, user management, or anything similar. The only page it knows how to render is ```index.html```. 

My goal is that anyone can read through the code, and be able to easily fix it or change it to suit their needs. 

# Running the app
Rick's Explorer uses environment variables to configure itself at startup.

## Port
The app runs on port 5002.

## Required envars
 * INFLUXDB_DATABASES - a list of databases to display, comma separated
 * INFLUXDB_HOST - the host of the influxDB instance. should be like ```us-east-1-2.aws.cloud2.influxdata.com``` (no https://)
 * INFLUXDB_TOKEN - A token that can read the databases supplied in the list

Here is an example of running the python server directly with just the required envars:
```
$ INFLUXDB_DATABASES="database1,database2" \
INFLUXDB_HOST="host_name" \
INFLUXDB_TOKEN="token_that_can_read_the_databases" \
python3 app.py
```
## Optional envars
 * APP_TITLE: Sets the text at the top of the page and the browser tab title
 * TAG_VALUE_RANGE_START: When expanding the treeview, this determines how far back in time to check for data for the tag values. If you are writing a lot of data, retrieving tag values can take a long time because by default InfluxDB may scan a lot of rows. Alternatively, if you are writing a small amount of data and haven't written in a long time, the app might not find any tag values. Send in a time value that InfluxQL understands, for example "10m".

 Here is an example of running the python server with the optional envars:
```
$ INFLUXDB_DATABASES="database1,database2" \
INFLUXDB_HOST="host_name" \
INFLUXDB_TOKEN="token_that_can_read_the_databases" \
APP_TITLE="My Custom Title" \
TAG_VALUE_RANGE_START="10m" \
python3 app.py
```
# Use Docker
## Build and run the container
### Build
```
$ docker build -t ricks-explorer .
```
### Run
```
$ docker run -p 5002:5002 -e INFLUXDB_DATABASES="database1,database2" \
-e INFLUXDB_HOST="xxxxx.a.influxdb.io" \
-e INFLUXDB_TOKEN="token_that_can_read_the_databases" \
-d ricks-explorer
```

## Run from Docker Hub
See the [Docker registry](https://hub.docker.com/repository/docker/rickspencer3/ricks-explorer/general)
```
$ docker run -p 5002:5002 -e INFLUXDB_DATABASES="database1,database2" \
-e INFLUXDB_HOST="xxxxx.a.influxdb.io" \
-e INFLUXDB_TOKEN="token_that_can_read_the_databases" \
-d rickspencer3/ricks-explorer
```