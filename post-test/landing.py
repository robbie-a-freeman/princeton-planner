import cgi, cgitb
from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/vagrant/post-test', methods = ["POST"])
def process():
    return 'Hello, World!'

@app.route("/", methods = ["GET", "POST"])
def index():
    if request.method == 'POST':
        # Calculate what value to returned
        # (Replace this dummy code with a call to srv/query_parser.py)
        name = request.form['input']
        return "Got a post! " + str(name);
    return render_template('index.html');
    # return ("Hello!")



# form = cgi.FieldStorage()
# print "Content-type:text/html\r\n\r\n"
# print "<html>"
# print "<head>"
# print "<title>Hello - Second CGI Program</title>"
# print "</head>"
# print "<body>"
# print "<h2>Hello %s</h2>" % form.getvalue("input")
# print "</body>"
# print "</html>"
