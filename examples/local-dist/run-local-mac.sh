#!/bin/bash

# chmod +x (this script)

DEMO_PORT=8008

# Launch browser first, since server will get in the way
open http://localhost:$DEMO_PORT/examples/local-dist/

# Because the HTML references ../../dist
# have to start from higher folder

cd ../../

python -m SimpleHTTPServer $DEMO_PORT

