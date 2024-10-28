// Log to ensure the script is running
console.log("JavaScript is running");

// Variables to manage the timer state
let timerInterval;
let timeLeft;  // Store remaining time when paused
let isPaused = false;
let originalTimeInSeconds;  // Store the original time

// Function to save meditation session via AJAX
function saveMeditationSession(action, timeLeftInSeconds, soundId) {
    const duration = document.getElementById("time").value;  // Get the original duration set by the user
    const userId = 1;  // Assuming we have a way to identify the logged-in user; you can replace this accordingly

    fetch('/save_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,               // Send user ID
            sound_id: soundId,             // Send the sound ID
            duration: duration,            // Original session duration in minutes
            action: action,                // Could be "start", "pause", or "resume"
            time_left: timeLeftInSeconds   // Time left on the timer when paused/resumed
        })
    }).then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error saving session:', error));
}

// Fetch sounds based on search query
function searchSounds(query) {
    const duration = document.getElementById("time").value;  // Get the duration from the timer input

    const loadingMessage = document.getElementById("loadingMessage");
    const errorMessage = document.getElementById("errorMessage");
    const soundSelect = document.getElementById("sound");
    const audioPlayer = document.getElementById("audioPlayer");

    // Show the loading message while sounds are being fetched
    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';  // Hide any previous errors
    soundSelect.innerHTML = "";  // Clear any existing options
    audioPlayer.src = "";  // Clear the audio source

    // Fetch sounds from the back-end (which uses the Freesound API)
    fetch(`/search_sounds?query=${query}&duration=${duration}`)  // Pass the duration to the backend
        .then(response => response.json())
        .then(data => {
            console.log("Full API response:", data);

            if (data.error) {
                throw new Error(data.error);
            }

            loadingMessage.style.display = 'none';

            // Populate the select dropdown with sounds
            data.results.forEach((sound, index) => {
                console.log("Sound object:", sound);

                // Check if sound has a valid 'previews' object and 'preview-lq-mp3' exists
                if (sound.previews && sound.previews['preview-lq-mp3']) {
                    const option = document.createElement("option");
                    option.value = sound.previews['preview-lq-mp3'];  // Low-quality MP3 preview URL

                    const trackName = sound.name || `Track ${index + 1}`;
                    option.textContent = `${trackName} (${Math.round(sound.duration / 60)} min)`;  // Display name and duration
                    soundSelect.appendChild(option);
                } else {
                    console.log(`Sound ${index + 1} does not have a valid preview URL.`);
                }
            });

            if (soundSelect.options.length === 0) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = "No sounds found. Try a different search.";
            }
        })
        .catch(error => {
            console.error("Error fetching sounds:", error);
            loadingMessage.style.display = 'none';
            errorMessage.textContent = "Failed to load sounds. Please try again.";
            errorMessage.style.display = 'block';
        });
}

// Attach event listener to search form
document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent form from submitting traditionally
    const query = document.getElementById('query').value;
    searchSounds(query);
});

// Timer functionality with music play
function startTimer() {
    const timeInput = document.getElementById("time").value;
    const countdownDisplay = document.getElementById("countdown");
    const audioPlayer = document.getElementById("audioPlayer");
    const soundSelect = document.getElementById("sound");
    const startBtn = document.getElementById("startTimerBtn");
    const pauseResumeBtn = document.getElementById("pauseResumeBtn");

    // Get the total time in seconds
    let timeInSeconds = parseInt(timeInput) * 60;
    originalTimeInSeconds = timeInSeconds;  // Store the original time

    if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
        alert("Please enter a valid number of minutes.");
        return;
    }

    if (!soundSelect.value) {
        alert("Please select a sound before starting the timer.");
        return;
    }

    // Start the music and timer only after "Start Timer" button is clicked
    audioPlayer.src = soundSelect.value;  // Set the selected sound as the audio source
    audioPlayer.load();  // Reload the audio player with the selected sound

    // Start the music and timer when user clicks start
    audioPlayer.play();

    // Save the session as "started"
    saveMeditationSession("start", timeInSeconds, soundSelect.value);

    // Update buttons: hide Start, show Pause/Resume
    startBtn.style.display = "none";
    pauseResumeBtn.style.display = "inline-block";

    // Timer countdown functionality
    timerInterval = setInterval(() => {
        if (!isPaused) {
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            countdownDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            if (timeInSeconds <= 0) {
                clearInterval(timerInterval);
                countdownDisplay.textContent = "Time's up!";
                audioPlayer.pause();
                startBtn.style.display = "inline-block";
                pauseResumeBtn.style.display = "none";  // Hide pause button after completion
            }

            timeInSeconds--;
            timeLeft = timeInSeconds;  // Save remaining time for pausing
        }
    }, 1000);
}

// Pause/Resume functionality
function pauseResumeTimer() {
    const audioPlayer = document.getElementById("audioPlayer");
    const pauseResumeBtn = document.getElementById("pauseResumeBtn");
    const soundSelect = document.getElementById("sound");

    if (!isPaused) {
        // Pause the timer and music
        clearInterval(timerInterval);
        audioPlayer.pause();
        pauseResumeBtn.textContent = "Resume";  // Change button text to "Resume"
        saveMeditationSession("pause", timeLeft, soundSelect.value);  // Save session as paused
        isPaused = true;
    } else {
        // Resume the timer and music
        audioPlayer.play();
        pauseResumeBtn.textContent = "Pause";  // Change button text back to "Pause"
        saveMeditationSession("resume", timeLeft, soundSelect.value);  // Save session as resumed
        isPaused = false;

        // Resume the timer
        timerInterval = setInterval(() => {
            if (!isPaused) {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                document.getElementById("countdown").textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    document.getElementById("countdown").textContent = "Time's up!";
                    audioPlayer.pause();
                    document.getElementById("startTimerBtn").style.display = "inline-block";
                    pauseResumeBtn.style.display = "none";
                }

                timeLeft--;
            }
        }, 1000);
    }
}

// Sync audio player controls with the timer
document.getElementById("audioPlayer").addEventListener("play", function () {
    if (isPaused) {
        pauseResumeTimer();  // Resume the timer if music is played
    }
});

document.getElementById("audioPlayer").addEventListener("pause", function () {
    if (!isPaused) {
        pauseResumeTimer();  // Pause the timer if music is paused
    }
});

// Reset the timer and music when selecting new music
document.getElementById("sound").addEventListener("change", function () {
    clearInterval(timerInterval);  // Stop the current timer
    document.getElementById("countdown").textContent = `${Math.floor(originalTimeInSeconds / 60)}:00`;  // Reset the timer display
    timeLeft = originalTimeInSeconds;  // Reset timeLeft to the original time
    isPaused = false;  // Reset paused state

    // Reset the button labels
    document.getElementById("startTimerBtn").style.display = "inline-block";  // Show "Start Timer" button
    document.getElementById("pauseResumeBtn").style.display = "none";  // Hide the "Pause/Resume" button

    // Stop any ongoing playback
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.pause();  // Ensure the current audio is paused before loading a new sound
    audioPlayer.currentTime = 0;  // Reset the audio playtime to the beginning

    // Load the new selected sound, but don't play it automatically
    audioPlayer.src = this.value;  // Set the new selected sound as the source
    audioPlayer.load();  // Ensure the new sound is loaded, but not played automatically
});

// Attach timer functionality to the start button
document.getElementById("startTimerBtn").addEventListener("click", startTimer);

// Attach pause/resume functionality to the pause button
document.getElementById("pauseResumeBtn").addEventListener("click", pauseResumeTimer);