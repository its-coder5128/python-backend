from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:DL9SAY5128@localhost:5432/baby_tracker'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Event(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    description = db.Column(db.String(100), nullable = False)
    Created_at = db.Column(db.DateTime(timezone=True), nullable = False, default = func.now())

    def __repr__(self):
        return f"Event : {self.description}"
    
    def __init__(self, description):
        self.description = description

def format_event(event):
    return {
        "description" : event.description,
        "id" : event.id,
        "Created_at" : event.Created_at
    }

@app.route('/')
def hello():
    return 'HELLO'

@app.route('/event', methods = ['POST'])
def create_event():
    description = request.json['description']
    event = Event(description)
    db.session.add(event)
    db.session.commit()
    return format_event(event)

if __name__ == '__main__':
    app.run()
    