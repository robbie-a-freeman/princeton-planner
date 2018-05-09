import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or '\xa1\xcf\x84\xfcQ\xdbJ\xee&;\x04\xed\xa7\x1a.sG\xfaA\xec\x96fe\x8b'
    CAS_SERVER = os.environ.get('CAS_SERVER') or 'https://fed.princeton.edu'
    CAS_AFTER_LOGIN = os.environ.get('CAS_AFTER_LOGIN') or 'plan'
    #app.config['CAS_SERVER'] = 'https://fed.princeton.edu'
    #app.config['CAS_AFTER_LOGIN'] = 'plan'
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or "smtp.googlemail.com"
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 25) # 587
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None # 1
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or "theprincetonplanner@gmail.com"
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or "willsweeny69hasabigweeny420"
    ADMINS = ['theprincetonplanner@gmail.com', 'htwang@princeton.edu']