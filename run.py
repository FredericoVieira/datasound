#!flask/bin/python
from gevent.wsgi import WSGIServer
from app import app

app.debug = True

http_server = WSGIServer(('', 5000), app)
http_server.serve_forever()
