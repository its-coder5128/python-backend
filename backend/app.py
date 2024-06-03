from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.orm.exc import NoResultFound
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access the DATABASE_URL environment variable
database_url = os.getenv("DATABASE_URL")
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

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

@app.route('/createDB')
def hello():
    db.create_all()
    return 'HELLO'

# create an event
@app.route('/event', methods = ['POST'])
def create_event():
    description = request.json['description']
    event = Event(description)
    db.session.add(event)
    db.session.commit()
    return format_event(event)

# get all events
@app.route('/events', methods = ['GET'])
def get_events():
    events = Event.query.order_by(Event.Created_at.desc()).all()
    event_list = []
    for event in events:
        event_list.append(format_event(event))

    return { 'events' : event_list}

# get single Event
@app.route('/event/<id>', methods = ['GET'])
def get_event(id):
    try:
        event = Event.query.filter_by(id=id).one()
        formatted_event = format_event(event)
        return {'event': formatted_event}
    except NoResultFound:
        return {'error': 'Event not found'}
    except Exception as e:
        return {'error': str(e)}

# delete an Event
@app.route('/event/<id>', methods = ['DELETE'])
def delete_event(id):
    try:
        event = Event.query.filter_by(id = id).one()
        db.session.delete(event)
        db.session.commit()
        return f'Event (id : {id}) deleted'
    except NoResultFound:
        return {'error': 'Event not found'}
    except Exception as e:
        return {'error': str(e)}

# edit ans Event
@app.route('/event/<id>', methods = ['PUT'])
def update_event(id):
    try:
        event = Event.query.filter_by(id = id)
        description = request.json['description']
        event.update(dict(description = description, Created_at = func.now()))
        db.session.commit()
        return {'event': format_event(event.one())}
    except NoResultFound:
        return {'error': 'Event not found'}
    except Exception as e:
        return {'error': str(e)}



if __name__ == '__main__':
    app.run()
    