from . import app, db, cas
from flask import render_template, redirect
from flask_cas import login_required
from .forms import StartMealExchangeForm
from .models import User, MealExchange


@app.route("/")
@login_required
def main():
    me = User.query.filter_by(username=cas.username).first()
    hosted_mxchanges = MealExchange.query.filter_by(
        start_host=me).all()
    guested_mxchanges = MealExchange.query.filter_by(start_guest=me)
    return render_template('index.html',
                           hosted_mxchanges=hosted_mxchanges,
                           guested_mxchanges=guested_mxchanges)


@app.route('/start', methods=('GET', 'POST'))
@login_required
def start():
    form = StartMealExchangeForm()
    if form.validate_on_submit():
        guest = User.query.filter_by(username=form.guest.data).first()
        host = User.query.filter_by(username=cas.username).first()
        # We will want to actually do something here later
        if guest is not None and host is not None:
            mxchange = MealExchange(
                start_date=form.date.data, start_host=host,
                start_guest=guest, meal=form.meal.data)
            db.session.add(mxchange)
            db.session.commit()
            return redirect('/')
    return render_template('start.html', form=form)
