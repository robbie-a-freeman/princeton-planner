from . import app, cas
from flask import render_template, redirect, request, url_for, flash
from flask_cas import login_required
from . import course_search, program_search, user_info
from planner.forms import ContactForm, FeedbackForm

@app.route("/")
def main():
    form = ContactForm()
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
        #print("request received for ", form_name)

        # Handle searches for courses
        if form_name == 'COURSE_QUERY':
            time = request.form['timestamp']
            query = request.form['course_query']
            semester = request.form['semester']
            results = course_search.course_db_query(query, semester)
            returnObj = {"results": results, "time":time}
            return str(returnObj)

        # Handle searches for majors/certificates
        elif form_name == 'PROGRAM_QUERY':
            time = request.form['timestamp']
            query = request.form['program_query']
            results = program_search.program_db_query(query)
            returnObj = {"results": results, "time":time}
            return str(returnObj)


        elif form_name == 'COURSE_ADD':
            course = request.form['course_add']
            semester = request.form['semester']
            user_info.add_course(user['netid'], semester, course)

        elif form_name == 'PROGRAM_ADD':
            query = request.form['program_add']
            user_info.add_program(user['netid'], query)

        elif form_name == 'PROGRAM_REMOVE':
            query = request.form['program_remove']
            user_info.remove_program(user['netid'], query)

        elif form_name == 'COURSE_REMOVE':
            course = request.form['course_remove']
            semester = request.form['semester']
            user_info.remove_course(user['netid'], semester, course)

        elif form_name == 'OVERRIDE_ADD':
            course = request.form['override_add']
            program = request.form['program']
            category = request.form['category']
            semester = request.form['semester']
            user_info.add_override(user['netid'], program, category, course, semester)

        elif form_name == 'OVERRIDE_REMOVE':
            course = request.form['override_remove']
            program = request.form['program']
            category = request.form['category']
            semester = request.form['semester']
            user_info.remove_override(user['netid'], program, category, course, semester)


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

@app.route('/feedback', methods=["GET", "POST"])
def feedback():
    form = FeedbackForm()
    if form.validate_on_submit():
        #flash('Thank you for submitting feedback!')
        return render_template('feedbackthankyou.html')
    return render_template('feedback.html', title='Feedback', form=form)

#@app.route('/login')
#@login_required
#def login():
#    return redirect('/plan')

@app.route('/userdata', methods=["GET", "POST"])
@login_required
def userdata():
    user = {'netid': cas.username}
    #form_name = request.form['form_name']
    # Get current user's data.
    if request.method == "GET":
        #user_info.add_program(user['netid'], 'COS BSE')
        #user_info.remove_program(user['netid'], 'COS')
        #user_info.add_course(user['netid'], 'COS BSE', 'Prerequisites', 'MUS 213')
        #user_info.add_enrolled_course(user['netid'], 'fall18', 'COS 333')
        #user_info.remove_enrolled_course(user['netid'], 'fall18', 'COS 340')
        #user_info.add_semester(user['netid'], 'fall17')
        #user_info.add_override(user['netid'], 'Mathematics', 'Applications', 'COS 429', 'F18')
        #user_info.remove_override(user['netid'], 'Computer Science', 'Departmentals', 'COS445', 'S18')
        return str(user_info.user_query(user['netid']))
        #return str(user_info.user_query('test'))
    else:
        #if form_name == 'COURSE_ADD':
        #    query = request.form['course_add']
        #    user_info.add_course(user, 'semester', 'category', query)
        if form_name == 'COURSE_ADD':
            query = request.form['course_add']
            query = request.form['semester']
            user_info.add_course(user, 'semester', query)

        elif form_name == 'PROGRAM_ADD':
            query = request.form['program_add']
            user_info.add_program(user, query)

        #elif form_name == 'COURSE_REMOVE':
        #    query = request.form['course_remove']
        #    user_info.remove_course(user, "program", query)

        elif form_name == 'PROGRAM_REMOVE':
            query = request.form['program_remove']
            user_info.remove_program(user, query)

        elif form_name == 'COURSE_REMOVE':
            query = request.form['course_remove']
            query = request.form['semester']
            user_info.remove_course(user, 'semester', query)

        elif form_name == 'OVERRIDE_ADD':
            query = request.form['override_add']
            user_info.add_override(user, query, categories)

        elif form_name == 'OVERRIDE_REMOVE':
            query = request.form['override_remove']
            user_info.remove_override(user, "program", query)
