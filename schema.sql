-- 1. Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,        
    username VARCHAR(50) UNIQUE NOT NULL,          
    email VARCHAR(100) UNIQUE NOT NULL,            
    password_hash VARCHAR(255) NOT NULL,           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- 2. Sounds Table
CREATE TABLE Sounds (
    sound_id INT PRIMARY KEY AUTO_INCREMENT,       
    sound_name VARCHAR(100) NOT NULL,              
    preview_url VARCHAR(255) NOT NULL,             
    duration INT NOT NULL,                         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- 3. Meditation Sessions Table
CREATE TABLE Meditation_Sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,     
    user_id INT,                                   
    sound_id INT,                                  
    duration INT NOT NULL,                         
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,                            
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE, 
    FOREIGN KEY (sound_id) REFERENCES Sounds(sound_id) ON DELETE SET NULL
);

-- 4. User Favorites Table (Many-to-Many relationship between Users and Sounds)
CREATE TABLE User_Favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,   
    user_id INT,                                   
    sound_id INT,                                 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE, 
    FOREIGN KEY (sound_id) REFERENCES Sounds(sound_id) ON DELETE CASCADE 
);

-- 5. Settings Table (User Preferences)
CREATE TABLE Settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,     
    user_id INT,                                   
    default_duration INT NOT NULL,                
    notification_enabled BOOLEAN DEFAULT TRUE,     
    theme_preference VARCHAR(20) DEFAULT 'light',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE 
);
