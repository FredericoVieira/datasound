import os

def get_env_variable(var_name, default=-1):
    try:
        return os.environ[var_name]
    except KeyError:
        if default != -1:
            return default
        error_msg = "Set the %s os.environment variable" % var_name
        raise Exception(error_msg)
        
SPOTIFY_APP_ID = get_env_variable("DATASOUND_SPOTIFY_APP_ID")
SPOTIFY_APP_SECRET = get_env_variable("DATASOUND_SPOTIFY_APP_SECRET")
SECRET_KEY = get_env_variable("DATASOUND_SECRET_KEY")