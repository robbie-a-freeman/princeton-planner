from . import app, cas
from flask import render_template, redirect, request
from flask_cas import login_required
from . import course_search, program_search, user_info


@app.route("/")
def main():
    return render_template('index.html')

@app.route('/plan', methods = ["GET", "POST"])
@login_required
def plan():
    user = {'netid': cas.username}

    ## Handle POST forms (ie from search boxes)
    if request.method == 'POST':
        # Figure out which form submitted the request.
        # TODO this is a potential security risk; user can spoof any form they want.
        form_name = request.form['form_name']

        # Handle searches for courses
        if form_name == 'COURSE_QUERY':
            query = request.form['course_query']
            return str(course_search.course_db_query(query))

        # Handle searches for majors/certificates
        elif form_name == 'PROGRAM_QUERY':
            query = request.form['program_query']
            return str(program_search.program_db_query(query))


        # NOTE the strings 'PROGRAM_QUERY' vs 'program_query'
        # are arbitrary and we can't depend on the fact that they are upper/lowercase
        # versions of one another.

    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html', user=user)

@app.route('/index.html')
def index():
    return redirect('/')

@app.route('/index')
def index1():
    return redirect('/')

@app.route('/login')
@login_required
def login():
    return redirect('/plan')

@app.route('/userdata', methods=["GET", "POST"])
@login_required
def userdata():
    user = {'netid': cas.username}

    # Get current user's data.
    if request.method == "GET":
        return str(user_info.user_query(user))
    else:

        if form_name == 'COURSE_ADD':
            query = request.form['course_add']
            user_info.add_course(user, "program", query)

        elif form_name == 'PROGRAM_ADD':
            query = request.form['program_add']
            user_info.add_program(user, query)

        elif form_name == 'COURSE_REMOVE':
            query = request.form['course_remove']
            user_info.remove_course(user, "program", query)

        elif form_name == 'PROGRAM_REMOVE':
            query = request.form['program_remove']
            user_info.remove_program(user, query)

        elif form_name == 'ENROLLED_COURSE_REMOVE':
            query = request.form['enrolled_course_remove']
            user_info.remove_enrolled_course(user, query)
