from flask_wtf import FlaskForm
from wtforms import StringField, TextField, TextAreaField, SelectField, SubmitField, DateField
from wtforms.validators import DataRequired, Length, Email

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[Length(min=4, max=100)])
    email = StringField('Email', validators=[Email("Please enter a valid email address.")])
    subject = TextField('Subject', validators=[Length(min=8, max=100)])
    message = TextAreaField('Message', validators=[Length(min=1, max=1000)])
    submit = SubmitField('SEND NOW')

class FeedbackForm(FlaskForm):
    feedback = TextAreaField('Feedback', validators=[Length(min=1, max=1000)])
    submit = SubmitField('Submit')