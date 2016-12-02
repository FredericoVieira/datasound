from app import flask
from flask.ext.testing import TestCase


class BaseTestCase(TestCase):

    def create_app(self):
        flask.config.from_object('config.Testing')
        return flask
