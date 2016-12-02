from flask import Blueprint, render_template
from flask import request


blueprint = Blueprint('home_controller', __name__, url_prefix='/')


@blueprint.route('/')
def index():
    return render_template('home/index.html')


@blueprint.route('score')
def score():
    return render_template('home/score.html', user_id=request.args['user_id'], oauth_token=request.args['oauth_token'])


@blueprint.route('about')
def about():
    return render_template('home/about.html')
