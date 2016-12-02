from flask import Blueprint
from flask import redirect, url_for, session, request
from flask_oauthlib.client import OAuth, OAuthException
from config import Config


blueprint = Blueprint('spotify_controller', __name__, url_prefix='/')

oauth = OAuth(blueprint)

spotify = oauth.remote_app(
    'spotify',
    consumer_key=Config.SPOTIFY_APP_ID,
    consumer_secret=Config.SPOTIFY_APP_SECRET,
    request_token_params={'scope': 'user-read-email'},
    base_url='https://accounts.spotify.com',
    request_token_url=None,
    access_token_url='/api/token',
    authorize_url='https://accounts.spotify.com/authorize'
)


@blueprint.route('login')
def login():
    callback = url_for(
        'spotify_controller.spotify_authorized',
        next=request.args.get('next') or request.referrer or None,
        _external=True
    )
    return spotify.authorize(callback=callback)


@blueprint.route('login/authorized')
def spotify_authorized():
    resp = spotify.authorized_response()
    if resp is None:
        return 'Access denied: reason={0} error={1}'.format(
            request.args['error_reason'],
            request.args['error_description']
        )
    if isinstance(resp, OAuthException):
        return 'Access denied: {0}'.format(resp.message)

    session['oauth_token'] = (resp['access_token'], '')
    me = spotify.get('https://api.spotify.com/v1/me')

    return redirect(url_for('home_controller.score', user_id=me.data['id'], oauth_token=resp['access_token']))


@blueprint.route('logout')
def logout():
    session.pop('oauth_token', None)
    return redirect(url_for('home_controller.index'))


@spotify.tokengetter
def get_spotify_oauth_token():
    return session.get('oauth_token')
