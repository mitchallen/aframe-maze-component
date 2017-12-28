#!/bin/bash

# chmod +x (this script)

DEMO_PORT=8009

# Launch browser first, since server will get in the way
open http://localhost:$DEMO_PORT/

python -m SimpleHTTPServer $DEMO_PORT
