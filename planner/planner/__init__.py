from flask import Flask
from config import Config
from flask_cas import CAS
from flask_wtf.csrf import CSRFProtect
from flask_bootstrap import Bootstrap
import os

app = Flask(__name__)
app.config.from_object(Config)

#csrf = CSRFProtect(app)

cas = CAS(app)

bootstrap = Bootstrap(app)

#app.secret_key = '\xe6\xde\xa5\xccUb\xc3\nv\xf7\x89\xc4\xec\x98\xe1\x14\xf1\x06\xcam\xa27t\x9b'

from . import routes, models, errors
