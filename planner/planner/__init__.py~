from flask import Flask
from flask_cas import CAS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['CAS_SERVER'] = 'https://fed.princeton.edu'
app.config['CAS_AFTER_LOGIN'] = 'main'
#app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
#    'DATABASE_URL') or 'sqlite:////tmp/mxchange.db'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#db = SQLAlchemy(app)
cas = CAS(app)

app.secret_key = '\xe6\xde\xa5\xccUb\xc3\nv\xf7\x89\xc4\xec\x98\xe1\x14\xf1\x06\xcam\xa27t\x9b'

from . import routes, models
