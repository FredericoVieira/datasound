from os import getenv


class Config(object):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SPOTIFY_APP_ID = getenv("DATASOUND_SPOTIFY_APP_ID")
    SPOTIFY_APP_SECRET = getenv("DATASOUND_SPOTIFY_APP_SECRET")
    SECRET_KEY = getenv("DATASOUND_SECRET_KEY")
    PORT = getenv("PORT", 5000)


class Production(Config):
    pass


class Development(Config):
    DEBUG = True
    #SQLALCHEMY_DATABASE_URI = 'postgresql:///us_elections'


class Testing(Config):
    DEBUG = True
    TESTING = True
    #SQLALCHEMY_DATABASE_URI = 'sqlite://'
