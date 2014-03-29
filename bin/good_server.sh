#!/bin/bash
#
# Wrapper for running our good server
#

set -e # Errors are fatal

DIR=`dirname $0`

URL="http://10.0.50.10:3001/"

node ${DIR}/../server.js --url ${URL} $@


