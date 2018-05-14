from flask import Flask
from config import Config
from flask_cas import CAS
from flask_wtf.csrf import CSRFProtect
from flask_bootstrap import Bootstrap
from flask_mail import Mail
import os
# Email error logs
import logging
from logging.handlers import SMTPHandler

app = Flask(__name__)
app.config.from_object(Config)

csrf = CSRFProtect(app)

cas = CAS(app)

bootstrap = Bootstrap(app)

mail = Mail(app)

# Application errors (in production)
if not app.debug:
    if app.config['MAIL_SERVER']:
        auth = None
        if app.config['MAIL_USERNAME'] or app.config['MAIL_PASSWORD']:
            auth = (app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        secure = None
        if app.config['MAIL_USE_TLS']:
            secure = ()
        mail_handler = SMTPHandler(
            mailhost=(app.config['MAIL_SERVER'], app.config['MAIL_PORT']),
            fromaddr='no-reply@' + app.config['MAIL_SERVER'],
            toaddrs=[app.config['ADMINS'][0]], subject='Princeton Planner Failure',
            credentials=auth, secure=secure)
        mail_handler.setLevel(logging.ERROR)
        app.logger.addHandler(mail_handler)

from . import routes, models, errors
