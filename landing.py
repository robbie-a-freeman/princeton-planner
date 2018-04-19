from flask import Flask, render_template, request
from query_parser import db_query
#app = Flask(__name__)
app = Flask(__name__, template_folder="web")


# The first argument is the route offered at the end of the URL:
# e.g. localhost:8040/ ==> "/"
# e.g. localhost:8040/web ==> "/web/"

# Handle debug request
@app.route('/vagrant/srv', methods = ["POST"]) #Where 'vagrant/srv' is the local directory of the file.
def process():
    return 'Hello, World!'

# handle requests for web folder (debug)
@app.route('/web/')
def debug_path():
    return "Path is /web/"

# Handle requests for plan page (might not work)
@app.route('/plan.html')
def plan():
    return render_template('plan.html')

# try handling a fake request to see what happens
@app.route('/fakedir')
def fakedir():
    return "This dir has no associated local folder"



@app.route("/", methods = ["GET", "POST"])
def index():
    if request.method == 'POST':
        # Calculate what value to returned
        # (Replace this dummy code with a call to srv/query_parser.py)
        # name = request.form['input']
        #return db_query(request.form['search_query']) # If search_query is the name attribute of the HTML form.
        #return "Got a post! " + str(name)

        query = str(request.form['search_query'])
        return "Got a post!\n<br>\n<br>" + str(db_query(query))
    return render_template('index.html')
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
