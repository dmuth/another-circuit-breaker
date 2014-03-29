#!/bin/bash
#
# Wrapper for running our client
#

set -e # Errors are fatal

DIR=`dirname $0`

node ${DIR}/../client.js --url http://10.0.50.11:3000/ $@


