from flask import render_template
from app import app

@app.errorhandler(500)
def internal_server_error(error):
    return render_template('500.html'), 500

@app.errorhandler(410)
def gone_error(error):
    return render_template('410.html'), 410

@app.errorhandler(405)
def method_not_allowed_error(error):
    return render_template('405.html'), 405

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(403)
def forbidden_error(error):
    return render_template('403.html'), 403

@app.errorhandler(400)
def bad_request_error(error):
    return render_template('400.html'), 400

#@app.errorhandler(500)
#def internal_error(error):
#    db.session.rollback()
#    return render_template('500.html'), 500