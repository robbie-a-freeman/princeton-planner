from . import app, cas
from flask import render_template, redirect, request, url_for, flash
from flask_cas import login_required
from . import course_search, program_search, user_info
from planner.forms import ContactForm, FeedbackForm
from planner.email import send_email

@app.route("/", methods = ["GET", "POST"])
def main():
    #form = ContactForm()
    # <!--{{ form.hidden_tag() }}
    # {{ wtf.form_errors(form, hiddens="only") }}-->
    if request.method == 'POST' and request.cache_control:
        name = request.form['name']
        emailAddress = request.form['email']
        subject = request.form['subject']
        bodyMessage = request.form['message']
        contact = {'name': name, 'emailAddress': emailAddress, 'bodyMessage': bodyMessage}
        send_email(subject,
                    sender=app.config['ADMINS'][0],
                    recipients=[app.config['ADMINS'][0]],
                    text_body=render_template('email/contact.txt', contact=contact),
                    html_body=render_template('email/contact.html', contact=contact)
                    )
        return render_template('contactthankyou.html', contact=contact)
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

        # delete user from database (and then promptly add back to database)
        elif form_name == 'DELETE_USER':
            user_info.delete_user(user['netid'])
            user_info.user_query(user['netid'])


        # NOTE the strings 'PROGRAM_QUERY' vs 'program_query'
        # are arbitrary and we can't depend on the fact that they are upper/lowercase
        # versions of one another.

    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html', user=user, guest="false")

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
        bodyMessage = form.feedback.data
        feedback = {'bodyMessage': bodyMessage}
        send_email('Feedback for Princeton Planner',
                    sender=app.config['ADMINS'][0],
                    recipients=[app.config['ADMINS'][0]],
                    text_body=render_template('email/feedback.txt', feedback=feedback),
                    html_body=render_template('email/feedback.html', feedback=feedback)
                    )
        return render_template('feedbackthankyou.html')
    return render_template('feedback.html', title='Feedback', form=form)

@app.route('/userdata', methods=["GET"])
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
        #user_info.delete_user(user['netid'])
        return str(user_info.user_query(user['netid']))
        #return str(user_info.user_query('test'))

# Login for non-CAS guests (mainly for testing, not production)
@app.route('/guest_plan', methods = ["GET", "POST"])
def guest_plan():
    user = {'netid': "guest"}

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

        # delete user from database (and then promptly add back to database)
        elif form_name == 'DELETE_USER':
            user_info.delete_user(user['netid'])
            user_info.user_query(user['netid'])


        # NOTE the strings 'PROGRAM_QUERY' vs 'program_query'
        # are arbitrary and we can't depend on the fact that they are upper/lowercase
        # versions of one another.

    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html', user=user, guest="true")


################### DEMO INFO ####################
@app.route('/guest1', methods = ["GET", "POST"])
def guest1():
    user = {'netid': "guest1"}

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
            returnObj = {"results": results, "time": time}
            return str(returnObj)

        # Handle searches for majors/certificates
        elif form_name == 'PROGRAM_QUERY':
            time = request.form['timestamp']
            query = request.form['program_query']
            results = program_search.program_db_query(query)
            returnObj = {"results": results, "time": time}
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

        # delete user from database (and then promptly add back to database)
        elif form_name == 'DELETE_USER':
            user_info.delete_user(user['netid'])
            user_info.user_query(user['netid'])


        # NOTE the strings 'PROGRAM_QUERY' vs 'program_query'
        # are arbitrary and we can't depend on the fact that they are upper/lowercase
        # versions of one another.

    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html', user=user, guest="guest1")


@app.route('/guest2', methods = ["GET", "POST"])
def guest2():
    user = {'netid': "guest2"}

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

        elif form_name == 'DELETE_USER':
            user_info.delete_user(user['netid'])
            user_info.user_query(user['netid'])


        # NOTE the strings 'PROGRAM_QUERY' vs 'program_query'
        # are arbitrary and we can't depend on the fact that they are upper/lowercase
        # versions of one another.

    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html', user=user, guest="guest2")


@app.route('/guest3', methods = ["GET", "POST"])
def guest3():
    user = {'netid': "guest3"}

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

        # delete user from database (and then promptly add back to database)
        elif form_name == 'DELETE_USER':
            user_info.delete_user(user['netid'])
            user_info.user_query(user['netid'])


        # NOTE the strings 'PROGRAM_QUERY' vs 'program_query'
        # are arbitrary and we can't depend on the fact that they are upper/lowercase
        # versions of one another.

    # Normal GET: Return our beautiful planning page.
    return render_template('plan.html', user=user, guest="guest3")


@app.route('/data1', methods=["GET"])
def userdata1():
    user = {'netid': "guest1"}
    if request.method == "GET":
        return str(user_info.user_query(user['netid']))

@app.route('/data2', methods=["GET"])
def userdata2():
    user = {'netid': "guest2"}
    if request.method == "GET":
        return str(user_info.user_query(user['netid']))

@app.route('/data3', methods=["GET"])
def userdata3():
    user = {'netid': "guest3"}
    if request.method == "GET":
        return str(user_info.user_query(user['netid']))
