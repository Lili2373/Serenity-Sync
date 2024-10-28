from flask import Flask, render_template, jsonify, request, redirect, url_for, flash, session
import requests
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)

# Set a secret key for session management and security
app.config['SECRET_KEY'] = os.urandom(24)

# Database configuration (use SQLite for local development)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)


class MeditationSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    sound_id = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    time_left = db.Column(db.Integer, nullable=True)  # Time left on the timer (in seconds)
    action = db.Column(db.String(50), nullable=False)  # start, pause, resume
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Home and instructions routes
@app.route('/')
def instructions():
    first_name = session.get('first_name', None)
    return render_template('instructions.html', first_name=first_name)

@app.route('/timer')
def home():
    first_name = session.get('first_name', None)
    return render_template('index.html', first_name=first_name)

# Save meditation session
@app.route('/save_session', methods=['POST'])
def save_session():
    data = request.get_json()
    user_id = data.get('user_id')
    sound_id = data.get('sound_id')
    duration = data.get('duration')
    action = data.get('action')
    time_left = data.get('time_left')

    session = MeditationSession(
        user_id=user_id,
        sound_id=sound_id,
        duration=duration,
        action=action,
        time_left=time_left
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({"message": "Session saved successfully"}), 200

# Freesound API search
@app.route('/search_sounds')
def search_sounds():
    query = request.args.get('query', 'meditation')
    duration = request.args.get('duration', None)

    if duration:
        min_duration = int(duration) * 60
        max_duration = min_duration + 60
        duration_filter = f'&filter=duration:[{min_duration} TO {max_duration}]'
    else:
        duration_filter = ''

    url = f"https://freesound.org/apiv2/search/text/?query={query}&token=fhKyhSVckmzXkoQ6zGRHkGycb6Go2BwMqAbzFOu7&format=json&fields=name,previews,duration{duration_filter}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        sounds = response.json()
        return jsonify(sounds)
    else:
        return jsonify({"error": f"Failed to fetch sounds: {response.status_code}"}), response.status_code

# Register route
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        # Hash the password
        password_hash = generate_password_hash(password, method='pbkdf2:sha256')

        new_user = User(first_name=first_name, last_name=last_name, username=username, email=email, password_hash=password_hash)
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('User created successfully!', 'success')
            return redirect(url_for('login'))
        except:
            flash('Error: User with this email already exists.', 'danger')
            return redirect(url_for('register'))
    
    return render_template('register.html')

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password_hash, password):
            flash('Logged in successfully!', 'success')
            # Store the user's first name in the session
            session['first_name'] = user.first_name
            return redirect(url_for('home'))
        else:
            flash('Login Unsuccessful. Please check your credentials', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

# Ensure the first name is available in templates
@app.context_processor
def inject_user():
    return {'first_name': session.get('first_name')}

# Logout route
@app.route('/logout')
def logout():
    session.pop('first_name', None)  # Remove the first name from the session
    flash('Logged out successfully.', 'success')
    return redirect(url_for('login'))

if __name__ == '__main__':
    # Ensure tables are created before starting the app
    with app.app_context():
        db.create_all()
    app.run(debug=True)
