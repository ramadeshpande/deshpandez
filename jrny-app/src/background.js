console.log("Background script loaded.");
const apiKey = "AIzaSyDR5V2AJ7ebK_cF-dWhlVWI2tNsludjOYQ";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`

const form = document.getElementById('chat-form');
const input = document.getElementById('todoInput');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');

let inputArea = '';
let db;

window.onload = function() {
    let request = indexedDB.open('JournalDB', 1);

    request.onerror = function(event) {
        console.log('Error opening IndexedDB:', event);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('IndexedDB opened:', db);
        loadJournalEntries(); // Load existing entries when DB is ready
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        let objectStore = db.createObjectStore('journalEntries', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('content', 'content', { unique: false });
        console.log('IndexedDB setup complete');
    };
};

if (form) {
    form.addEventListener('submit', submitChat); 
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitChat(event);
        }
    });
} else {
    console.log("Form not found.");
}




//I have to finish my report for history, and file taxes. Another thing is I have to feed the dog. One thing is I'm nervous to finish in time. I also have to vaccuum the upstairs family room.
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    // Check if display name exists
    const displayName = localStorage.getItem("displayName");
  
    if (displayName) {
      updateGreeting(displayName);
    } else {
      setDisplayName("friend");
    }
  
    const topSection = document.querySelector(".top-section");

    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    var gptResponse = document.getElementById('gptResponse');
    // Check localStorage for the color scheme preference
    if (localStorage.getItem('invertedColors') === 'true') {
        document.body.classList.add('inverted-colors');
        darkModeToggle.checked = true;
    }
    const journalArea = document.getElementById('journal-area');
    var bottomSection = document.querySelector(".bottom-section");
    var otherElements = bottomSection.querySelectorAll("h2, small, form");
    var chatForm = document.getElementById('chat-form');
    settingsIcon.addEventListener('click', function() {
        if (settingsMenu.style.display === "none" || settingsMenu.style.display === "") {
            settingsMenu.style.display = "block";
            gptResponse.textContent = "settings"
            otherElements.forEach(function(element) {
              element.classList.add("hidden");
            });
            journalArea.style.display = "none";
            chatForm.style.display = "none"
        } else {
            settingsMenu.style.display = "none";
            otherElements.forEach(function(element) {
                element.classList.remove("hidden");
            });
            chatForm.style.display = "block"
        }
    });

    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add("inverted-colors");
            localStorage.setItem('invertedColors', 'true');
        } else {
            document.body.classList.remove("inverted-colors");
            localStorage.setItem('invertedColors', 'false');
        }
    });
    var home = document.getElementById('logo');
    home.addEventListener('click', function() {
        // Check localStorage for the color scheme preference
        if (localStorage.getItem('invertedColors') === 'true') {
            document.body.classList.add('inverted-colors');
            darkModeToggle.checked = true;
        }
        settingsMenu.style.display = "none";
        journalArea.style.display = "none";
        otherElements.forEach(function(element) {
            element.classList.remove("hidden");
        });
        gptResponse.textContent = "";
        document.getElementById('up-next-head').textContent = "up next";
        document.getElementById('gptTaskContent').style.display = "block";
        document.getElementById('journal-content').style.display = "none";
        window.location.reload();
    });
    var speechButton = document.getElementById('start-recog-button');
    speechButton.addEventListener('click', () => {
        startSpeechRecognition('todoInput');
    });
    var journalSpeechButton = document.getElementById('start-journal-speech-button');
    journalSpeechButton.addEventListener('click', () => {
        startSpeechRecognition('journal-input');
    });
});
/*
const timerCard = document.getElementById('timer-card');
timerCard.addEventListener("click", () => {
    const timerMins = prompt("Enter the new number of minutes to update the timer:");
    if (timerMins) {
        setTimer(parseInt(timerMins));
    }
});
*/

function submitChat(event) {
    event.preventDefault();
    inputArea = document.getElementById('todoInput').value;
    console.log(inputArea);
    classifyInput();
}
async function fetchGem(prompt) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: '' + prompt + inputArea
                    }]
                }]
            })
        });
        const data = await response.json();
        console.log(data);
        const ans = data["candidates"][0]["content"]["parts"][0]["text"];
        return String(ans);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; 
    }
}
async function rawGem(prompt) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: '' + prompt + inputArea
                    }]
                }]
            }),
        });
        const data = await response.json();
        console.log(data);
        const ans = data["candidates"][0]["content"]["parts"][0]["text"];
        return String(ans);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; 
    }
}

// Function to set the display name
function setDisplayName(name) {
    localStorage.setItem("displayName", name.toLowerCase());
    updateGreeting(name);
}

// Function to update the greeting text
function updateGreeting(name) {
    const textElement1 = document.getElementById("greetingText1");
    const textElement2 = document.getElementById("greetingText2");
    let index1 = 0;
    let index2 = 0;
    let text1 = `hello, ${name}!`;
    text1 = text1.toLowerCase();
    let text2 = " it's good to see you again.";

    function typeText1(callback) {
        if (index1 < text1.length) {
            textElement1.textContent += text1.charAt(index1);
            index1++;
            setTimeout(() => typeText1(callback), 100);
        } else if (callback) {
            setTimeout(callback, 500);
        }
    }

    function typeText2() {
        if (index2 < text2.length) {
            textElement2.textContent += text2.charAt(index2);
            index2++;
            setTimeout(typeText2, 100);
        }
    }

    textElement1.textContent = "";
    textElement2.textContent = "";
    typeText1(typeText2);
}

// Ensure `findNewName` function is defined outside the DOMContentLoaded block
async function findNewName() {
    let ans = await fetchGem(`What name does the user want to be called based on the following input? Return only the most important keyword(s), comma separated. `);
    console.log(ans);
    setDisplayName(ans);
}

async function findTask() {
    let ans = await fetchGem(`What keyword(s) does the user want to edit task related to from the following input? Return only the most important keyword(s), comma separated. `);
    console.log(ans);
    if (typeof ans === 'string') {
        ans = ans.split(',').map(keyword => keyword.trim().toLowerCase());
        if (gptResponse.textContent == "remove task") {
            removeTasksByCriteria(ans);
        } else if (gptResponse.textContent == "done with") {
            markTasksAsDone(ans);
        }
    }
}


// Function to remove tasks from the array based on user input criteria
function removeTasksByCriteria(criteria) {
    chrome.storage.local.get('gptTaskArray', (result) => {
        let gptTaskArray = result.gptTaskArray || [];
        
        // Filter tasks to remove based on criteria
        const tasksToRemove = gptTaskArray.filter(task => {
            // Check if the task contains any of the criteria keywords
            return criteria.some(keyword => task.task.toLowerCase().includes(keyword.toLowerCase()));
        });
        
        // Remove tasks from array
        const originalLength = gptTaskArray.length;
        gptTaskArray = gptTaskArray.filter(task => !tasksToRemove.some(removeTask => removeTask.task === task.task));
        const newLength = gptTaskArray.length;

        // Update storage with modified task array
        chrome.storage.local.set({ gptTaskArray }, () => {
            if (originalLength !== newLength) {
                console.log('Tasks removed from storage:', tasksToRemove);
                // Add any additional logic here for when tasks are removed
            } else {
                console.log('No tasks were removed.');
                classifyInput();
                // Add any additional logic here for when no tasks are removed
            }
            loadTasks(); // Reload tasks after removal
        });
    });
}

async function classifyInput() {
    const contentDiv = document.getElementById('gptResponse');
    let ans = await fetchGem(`Categorize the following input based on keywords into one of the given groups: set timer, add task, remove task, done with, dark mode, light mode, journal, change name, or weather. Choose one of those groups, do not create a new one. If you can't categorize it, please say 'not possible'.`);
    ans = ans.toLowerCase();
    let i;
    if (ans == 'not possible') {
        gptResponse.textContent = "loading...";
        for (i = 0; i < 3; i++) {
            if (ans == 'not possible') {
                let ans = await fetchGem(`Categorize the following input based on keywords into one of the given groups: set timer, add task, remove task, done with, dark mode, light mode, journal, change name, or weather. Choose one of those groups, do not create a new one. If you can't categorize it, please say 'not possible'.`);
                ans = ans.toLowerCase();
                console.log("round 1");
            }
            if (i == 2) {
                ans = "request unknown";
                gptResponse.style.fontSize = "18px";
            }
        }
    }
    contentDiv.innerHTML = ans;
    if (ans == 'add task') {
        gptAddTask();
        gptResponse.textContent = "task(s) added";
    } else if (ans == 'set timer') {
        detectNumber();
    } else if (ans == 'dark mode' || ans == 'light mode') {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        darkModeToggle.checked = ans == 'dark mode';
        darkModeToggle.dispatchEvent(new Event('change'));
        localStorage.setItem('invertedColors', darkModeToggle.checked);
    } else if (ans == 'journal') {
        generateJournal();
    } else if (ans == 'remove task' || ans == 'done with') {
        findTask();
    } else if (ans == 'change name') {
        findNewName();
    } 
}

// Function to mark tasks as done based on user input criteria
function markTasksAsDone(criteria) {
    if ( gptResponse.textContent == 'done with') {
        gptResponse.textContent = "task(s) done";
    }
    chrome.storage.local.get('gptTaskArray', (result) => {
        let gptTaskArray = result.gptTaskArray || [];

        // Modify tasks to mark as done based on criteria
        gptTaskArray.forEach(task => {
            if (criteria.some(keyword => task.task.toLowerCase().includes(keyword))) {
                task.checked = true; // Assuming 'done' is a property of the task
            }
        });

        // Update storage with modified task array
        chrome.storage.local.set({ gptTaskArray }, () => {
            console.log('Tasks marked as done in storage:', criteria);
            loadTasks(); // Reload tasks after marking as done
        });
    });
}

async function gptAddTask() {
    let ans = await fetchGem(`Can you summarize my to-do list as a single task if I mention only one, or short tasks if I explicitly mention multiple? Please separate them with commas, and don't use bullet points, dashes, or numbers.`);
    ans = ans.toLowerCase();
    const newTasks = ans.split(',').map(item => ({ task: item.trim(), checked: false }));
    chrome.storage.local.get('gptTaskArray', (result) => {
        let gptTaskArray = result.gptTaskArray || [];

        // Combine existing tasks with new tasks
        gptTaskArray = gptTaskArray.concat(newTasks);
        renderTasks(gptTaskArray);
        
        // Save the updated task array to Chrome storage
        saveTasks(gptTaskArray);
    });
}

function saveTasks(tasks) {
    chrome.storage.local.set({ gptTaskArray: tasks }, () => {
        console.log('Tasks saved to storage');
    });
}

function loadTasks() {
    chrome.storage.local.get('gptTaskArray', (result) => {
        if (result.gptTaskArray) {
            renderTasks(result.gptTaskArray);
        } else {
            console.log('No tasks found in storage');
        }
    });
}

function renderTasks(gptTaskArray) {
    const contentDiv = document.getElementById('gptTaskContent');
    // Clear the previous content
    contentDiv.innerHTML = '';
    gptTaskArray.slice().reverse().forEach(item => {
        // Create a container div for each item
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('task-card'); // Apply the task card class
        
        // Create and append the checkbox element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.checked = item.checked;
        checkbox.addEventListener('change', () => {
            item.checked = checkbox.checked;
            saveTasks(gptTaskArray);
        });
        itemDiv.appendChild(checkbox);
        
        // Create and append the title element
        const title = document.createElement('p');
        title.textContent = item.task;
        title.classList.add('task-title');
        itemDiv.appendChild(title);
        
        // Append the item div to the content div
        contentDiv.appendChild(itemDiv);
    });
}


async function detectNumber() {
    let ans = await fetchGem(`Can you detect a number in the following input? If so, please provide only the number and no additional words.`);
    const contentDiv = document.getElementById('gptResponse');
    contentDiv.innerHTML = ans;
    let timerMins = parseInt(ans);
    setTimer(timerMins);
}
let countdownInterval = null; // Define a global variable to hold the interval reference
let timerRunning = false; // Variable to track if a timer is currently running

function setTimer(timerMins) {
    console.log("Setting a " + timerMins + " min timer now");
    let time = timerMins * 60; // Convert minutes to seconds
    const countdownEl = document.getElementById('gptResponse');

    // Check if a countdown interval is already running
    if (timerRunning) {
        clearInterval(countdownInterval); // Clear the existing interval
    }

    // Update countdown every second
    countdownInterval = setInterval(updateCountDown, 1000);
    timerRunning = true; // Set timerRunning to true indicating a timer is running

    function updateCountDown() {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        countdownEl.innerHTML = `${minutes}:${seconds}`;

        if (time <= 0) {
            clearInterval(countdownInterval); // Stop the countdown
            countdownEl.innerHTML = "time up";
            playBeepSound(); // Call a function to play a beep sound
            timerRunning = false; // Reset timerRunning flag
        } else {
            time--; // Decrease time by 1 second
        }
    }

    function playBeepSound() {
        // For simplicity, let's use the built-in Web Audio API to play a short beep
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        oscillator.type = 'sine'; // sine wave
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // frequency in Hz
        oscillator.start();
        setTimeout(() => oscillator.stop(), 1000); // stop after 1 second
    }
}
async function generateJournal() {
    let ans = await fetchGem(`Can you generate one short journal prompt for me about self reflection/goal setting/self improvement? No heading or extra characters.`);
    ans = ans.toLowerCase();
    const journalArea = document.getElementById('journal-area');
    var bottomSection = document.querySelector(".bottom-section");
    var otherElementsBottom = bottomSection.querySelectorAll("h2, small, form");
    var journalContent = document.getElementById('journal-content');
    const promptDiv = document.getElementById('prompt');
    promptDiv.innerText = ans;
    
    // Load existing journal entries from IndexedDB
    loadJournalEntries();
  
    if (journalArea.style.display === "none" || journalArea.style.display === "") {
        journalArea.style.display = "block";
        journalContent.style.display = "block";
        otherElementsBottom.forEach(function(element) {
            element.classList.add("hidden");
        });
        document.getElementById('up-next-head').textContent = "past journals";
        document.getElementById('gptTaskContent').style.display = "none";
    } else {
        journalArea.style.display = "none";
        otherElementsBottom.forEach(function(element) {
            element.classList.remove("hidden");
        });
        document.getElementById('up-next-head').textContent = "up next";
        document.getElementById('gptTaskContent').style.display = "block";
    }
    

    const journalInput = document.getElementById('journal-input');
    const saveJournalButton = document.getElementById('saveJournalButton');
    saveJournalButton.addEventListener('click', () => {
        saveJournalEntry(journalInput.value);
    });
}
function saveJournalEntry(content) {
    let prompt = document.getElementById('prompt');
    let transaction = db.transaction(['journalEntries'], 'readwrite');
    let objectStore = transaction.objectStore('journalEntries');
    let request = objectStore.add({ prompt: prompt.innerHTML, content: content, date: new Date() });

    request.onsuccess = function(event) {
        console.log('Journal entry saved');
        loadJournalEntries(); // Reload entries after saving
    };

    request.onerror = function(event) {
        console.log('Error saving journal entry:', event);
    };
}

function loadJournalEntries() {
    let transaction = db.transaction(['journalEntries'], 'readonly');
    let objectStore = transaction.objectStore('journalEntries');
    let request = objectStore.getAll();

    request.onsuccess = function(event) {
        let journalEntries = event.target.result;
        displayJournalEntries(journalEntries);
    };

    request.onerror = function(event) {
        console.log('Error loading journal entries:', event);
    };
}
function displayJournalEntries(entries) {
    const journalContent = document.getElementById('journal-content');

    // Clear previous entries
    journalContent.innerHTML = '';

    entries.reverse().forEach(entry => {
        let entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        entryDiv.innerHTML = `
            <h3>${entry.prompt}</h3>
            <small>${new Date(entry.date).toLocaleString()}</small>
            <small>click to read more</small>
            <p>${entry.content}</p>
        `;
        journalContent.appendChild(entryDiv);

        entryDiv.addEventListener('click', () => {
            entryDiv.classList.toggle('expanded');
        });
    });
}
function startSpeechRecognition(elementID) {
    if (!('webkitSpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }
  
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  
    recognition.onstart = function() {
      console.log('Speech recognition started');
    };
  
    recognition.onerror = function(event) {
      console.error('Speech recognition error', event.error);
    };
  
    recognition.onend = function() {
        if (elementID == 'todoInput') {
            submitChat(event);
        }
        console.log('Speech recognition ended');
    };
  
    recognition.onresult = function(event) {
      if (event.results.length > 0) {
        const result = event.results[0][0].transcript;
        console.log(result);
        document.getElementById(elementID).textContent = result.toLowerCase();
      }
    };
  
    recognition.start();
  }