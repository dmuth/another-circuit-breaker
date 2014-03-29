#!/bin/bash
#
# Wrapper for running our good server
#

set -e # Errors are fatal

if test "$UID" != 0
then
	echo "$0: You must run me as root so I can run ulimit, sorry!"
	exit 1
fi

ulimit -n 1024
echo "Max number of file descriptors: `ulimit -n`"

DIR=`dirname $0`

URL="http://10.0.50.10:3001/"

node ${DIR}/../server.js --url ${URL} $@


