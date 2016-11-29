from flask import render_template
from app import app
from flask import Flask, redirect, url_for, session, request
from flask_oauthlib.client import OAuth, OAuthException
from config import SPOTIFY_APP_ID, SPOTIFY_APP_SECRET, SECRET_KEY

app.secret_key = SECRET_KEY

oauth = OAuth(app)

@app.route('/')
def index():
    return render_template('index.html')

spotify = oauth.remote_app('spotify',
    consumer_key=SPOTIFY_APP_ID,
    consumer_secret=SPOTIFY_APP_SECRET,
    request_token_params={'scope': 'user-read-email'},
    base_url='https://accounts.spotify.com',
    request_token_url=None,
    access_token_url='/api/token',
    authorize_url='https://accounts.spotify.com/authorize'
)

@app.route('/login')
def login():
    callback = url_for(
        'spotify_authorized',
        next=request.args.get('next') or request.referrer or None,
        _external=True
    )
    return spotify.authorize(callback=callback)


@app.route('/login/authorized')
def spotify_authorized():
    resp = spotify.authorized_response();

    if resp is None:
        return 'Access denied: reason={0} error={1}'.format(
            request.args['error_reason'],
            request.args['error_description']
        )
    if isinstance(resp, OAuthException):
        return 'Access denied: {0}'.format(resp.message)

    if session.has_key('oauth_tokens'):
        del session['oauth_tokens']

    session['oauth_token'] = (resp['access_token'], '')

    return redirect (url_for('index'))

@app.route('/logout')
def logout():
    session.pop('oauth_token', None)
    logout_user()
    return redirect(url_for('index'))

@spotify.tokengetter
def get_spotify_oauth_token():
    return session.get('oauth_token')