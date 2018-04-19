from . import db
from datetime import datetime


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True,
                         unique=True)
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'),
                        nullable=False)
    club = db.relationship('Club')

    def __repr__(self) -> str:
        return '<User {}>'.format(self.username)


class Club(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True,
                     unique=True)

    def __repr__(self) -> str:
        return '<Club {}>'.format(self.name)


class MealExchange(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)
    start_host_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                              nullable=False)
    start_host = db.relationship('User', foreign_keys=[start_host_id])
    start_guest_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                               nullable=False)
    start_guest = db.relationship('User', foreign_keys=[start_guest_id])
    meal = db.Column(db.String(64), index=True, unique=True)

    def __repr__(self):
        return '<MealExchange {} between {} and {}>'.format(
            self.id, self.start_host.username, self.start_guest.username)
