from flask_wtf import FlaskForm
from wtforms import StringField, TextField, SelectField, SubmitField
from wtforms.validators import DataRequired

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    subject = TextField('Subject', validators=[DataRequired()])
    message = TextField('Message', validators=[DataRequired()])

class Feedback(FlaskForm):
    feedback = TextField('Name', validators=[DataRequired()])


class StartMealExchangeForm(FlaskForm):
    guest = TextField('guest', validators=[DataRequired()])
    date = DateField(validators=[DataRequired()])
    meal = SelectField(u'Meal', choices=[(
        'breakfast', 'Breakfast'), ('lunch', 'Lunch'), ('dinner', 'Dinner')])


class EndMealExchangeForm(FlaskForm):
    # We don't need this right now but we might want it later.
    date = DateField(validators=[DataRequired()])
