SerenitySync: Meditation Timer & Sound Search

Overview:
SerenitySync is a web application designed to enhance meditation sessions. It allows users to set a meditation timer and search for relaxing sounds from Freesound, ensuring a personalized and calming experience. Users can register, log in, and use the app to create a peaceful meditation environment.

Features:

Timer: Set a meditation duration (in minutes) and track the session countdown.

Sound Search: Search for meditation sounds by keywords, select from a list, and play the sound during the session.

User Registration/Login: Users can register, log in, and have a personalized greeting during their session.

Responsive Design: The app is mobile-friendly and adapts to various screen sizes.

Getting Started:

Prerequisites

Python 3.x: Make sure Python is installed on your system.

Flask: The web framework used to run this app.

Freesound API Key: Register at Freesound to obtain an API key for sound searches.

Installation
Clone the repository:
git clone https://github.com/LILI2373/serenity-sync.git

Navigate to the project directory:
cd serenity-sync

Set up a virtual environment (recommended):
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

Install the dependencies:
pip install -r requirements.txt

Add the Freesound API key:
Create a .env file in the project directory.
Add your Freesound API key in the .env file like this:
makefile
FREESOUND_API_KEY=your_api_key_here

Running the App
Start the Flask app:
flask run

Open your browser and go to http://127.0.0.1:5000 to access SerenitySync.

Usage
Home Page:
Choose to register or log in to start using the app.

Register/Login:
If registering, fill in the required details (username, first name, last name, email, password).
If logging in, use your registered email and password.

Timer Page:
Set a meditation duration in minutes.
Search for meditation sounds using a keyword (e.g., "nature", "relaxation").
Select a sound from the dropdown and click "Start Timer" to begin.

Countdown:
The countdown timer will display the remaining meditation time.
The selected sound will loop during the session.

Technology Stack
Backend: Flask (Python)
Frontend: HTML, CSS, JavaScript
API: Freesound API for sound search
Database: SQLite (for user data storage)

File Structure:
serenity-sync/
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── timer.js
│
├── templates/
│   ├── index.html
│   ├── instructions.html
│   ├── login.html
│   └── register.html
│
├── .env
├── app.py
├── requirements.txt
└── README.md

Future Enhancements
Add a sound category filter to refine search results.
User preferences: Save user-selected sounds and meditation durations for future sessions.
Enhanced UI: Improve the user interface for a more immersive experience.

Contributing
Fork the repository.
Create a new branch: git checkout -b feature-branch-name.
Make changes and commit: git commit -m 'Add some feature'.
Push to the branch: git push origin feature-branch-name.
Submit a pull request.

License
This project is licensed under the MIT License.

Acknowledgements
Freesound API: For providing a wide range of sounds.
Flask: For making web development easier with Python.# Serenity-Sync
