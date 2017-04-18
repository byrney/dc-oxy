#!/usr/bin/env python

import os
import sys
import inspect
import click
import logging
import flask
import database
import api

# establish static folder relative to this file
static = os.path.join(os.path.dirname(inspect.getsourcefile(lambda: 0)), '../dist')

# create the app
app = flask.Flask(__name__, static_folder=static, static_url_path='')

# unknown routes will fallback to static but '/' will not
# so needs to be done explicitly
@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == "__main__":
    api.init()
    app.register_blueprint(api.api, url_prefix='/api')
    app.run(debug = True)
