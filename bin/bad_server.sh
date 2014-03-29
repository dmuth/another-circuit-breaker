#!/bin/bash
#
# Wrapper for running our bad server
#

set -e # Errors are fatal

DIR=`dirname $0`

node ${DIR}/../bad-server.js

