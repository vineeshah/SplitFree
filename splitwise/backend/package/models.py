from datetime import datetime
from package import app, login_manager, db
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

expense_users = db.Table(
    'expense_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('expense_id', db.Integer, db.ForeignKey('expense.id'), primary_key=True)
)
friends = db.Table(
    'friends',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    image_file = db.Column(db.String(220), nullable=False, default='default.jpg')
    password = db.Column(db.String(60), nullable=False)
    expenses = db.relationship('Expense', secondary=expense_users, backref='users', lazy='dynamic')
    friends = db.relationship('User', secondary=friends, primaryjoin=(friends.c.user_id == id), secondaryjoin=(friends.c.friend_id == id), backref = 'friend_of', lazy='dynamic' )

    def get_id(self):
        return str(self.id)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def __repr__(self):
        return f"User('{self.name}', '{self.email}')"

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, default=0)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) 
    ower = db.relationship('User', backref='paid_expenses', lazy=True) 
    # user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


    def __repr__(self):
        return f"Expense('{self.expense_name}', '{self.amount}', '{self.ower.name}')"
    
class Inbox(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    recipient = db.relationship('User', foreign_keys=[user_id], backref='received_messages')
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')

    def __repr__(self):
        return f"Inbox('{self.user_id}', '{self.message}', '{self.timestamp}')"