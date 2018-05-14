import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY')
    CAS_SERVER = os.environ.get('CAS_SERVER') or 'https://fed.princeton.edu'
    CAS_AFTER_LOGIN = os.environ.get('CAS_AFTER_LOGIN') or 'plan'
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or "smtp.googlemail.com"
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 25)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMINS = ['theprincetonplanner@gmail.com', 'htwang@princeton.edu']