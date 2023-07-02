This is a side/skundworks project focused on data exploration for IOx-based InfluxDB products, currently:
 * InfluxDB Cloud Serverles
 * InfluxDB Cloud Dedicated

It current allows you to pass in a list of databases, and then shows the data in a treeview. There is sql editor in the UI, but it isn't hooked up to anything yet.

# Development Principles
My goal for this project is that any developer can work on it. As such, I keep it simple:
 1. The backend is a Flask (i.e. Python server).
 2. The front end uses JQuery and web controls built on JQuery, but no complicated frameworks, and especially no "toolchains", etc... 

My goal is that anyone can read through the code, and be able to easily fix it or change it to suit their needs. 

# Run the app directly
cd into the app directory, and then run it with the required envars

```
$ INFLUXDB_DATABASES="database1,database2" INFLUXDB_HOST="host_name" INFLUXDB_TOKEN="token_that_can_read_the_databases" python3 app.py
```

```INFLUXDB_HOST``` should be like ```us-east-1-2.aws.cloud2.influxdata.com``` (no https://)

# Use Docker
## Build the container
```
$ docker build -t ricks-explorer .
```

## Run the container
```
$ docker run -p 5002:5002 -e INFLUXDB_DATABASES="database1,database2" \
-e INFLUXDB_HOST="xxxxx.a.influxdb.io" \
-e INFLUXDB_TOKEN="token_that_can_read_the_databases" \
-d ricks-explorer
```