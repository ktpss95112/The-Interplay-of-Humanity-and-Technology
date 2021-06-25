#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd $BASEDIR
go build -o server server.go
./server -p=9393 -d="."
