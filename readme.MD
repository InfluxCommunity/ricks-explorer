This is a side/skundworks project focused on data exploration for IOx-based InfluxDB products, currently:
 * InfluxDB Cloud Serverles
 * InfluxDB Cloud Dedicated

It current allows you to pass in a list of databases, and then shows the data in a treeview. There is sql editor in the UI, but it isn't hooked up to anything yet.

To run ...

```
INFLUXDB_DATABASES="database1,database2" INFLUXDB_HOST="host_name" INFLUXDB_TOKEN="token_that_can_read_the_databases" python3 app.py
```

```INFLUXDB_HOST``` should be like ```us-east-1-2.aws.cloud2.influxdata.com``` (no https://)