#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd $BASEDIR
rm database.db
gunicorn -w 8 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8383 main:app
