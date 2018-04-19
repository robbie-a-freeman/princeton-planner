from . import app
from flask import render_template, redirect, request
from . import course_search


@app.route("/")
def main():
    return render_template('index.html')


@app.route('/plan.html', methods = ["GET", "POST"])
def plan():
    if request.method == 'POST':
        query = request.form['course_query']
        # return db_query(request.form['search_query']) # If search_query is the name attribute of the HTML form.

        return "Got a post! " + str(query);
    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html')

@app.route('/index.html')
def index():
    return redirect('/')
