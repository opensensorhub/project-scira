#!/bin/bash
set -f
JAVA_ARGS="-Xmx2G -XX:+HeapDumpOnOutOfMemoryError -cp lib/* -Djava.system.class.loader=org.sensorhub.utils.NativeClassLoader -Dlogback.configurationFile=./logback.xml org.sensorhub.impl.SensorHub config.json db"
exec java $JAVA_ARGS
