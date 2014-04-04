#!/bin/bash
#
# Wrapper for running our bad server
#

set -e # Errors are fatal


if test "$UID" != 0
then
	echo "$0: You must run me as root so I can run ulimit, sorry!"
	exit 1
fi

ulimit -n 10240
echo "Max number of file descriptors: `ulimit -n`"


DIR=`dirname $0`

node ${DIR}/bad-server.js

