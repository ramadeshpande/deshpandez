import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location, CommonModule, NgIf } from '@angular/common';

// @ts-ignore
import Typewriter from 't-writer.js';
import { timeStamp } from 'console';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FormsModule, CommonModule, NgIf],
})
export class AppComponent implements OnInit {
  constructor(private er: ElementRef, private location: Location) {}
  //testing

  title = 'jrny-app';
  suggestion: string = ''; // Current autocomplete suggestion
  suggestionsList: string[] = ['set a timer', 'give me a journal prompt', 'add tasks', 'remove tasks', 'switch to dark mode'];
  changeResponse = ''; // Store API response
  inputArea = ''; // Store user input
  journalInput = ''; // Store journal input
  tasks: any[] = []; // In-memory task storage
  journalList: any[] = []; // In-memory journal storage
  isDarkMode: boolean = false; // Default value for dark mode
  apiKey = "AIzaSyBDqNepYPVmQiuPVXRbQxz3rwF6C0z_rF8"; // Replace with your actual API key
  apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`;
  target: any;
  typewriteChangeResponseBox: any;
  writer: any;
  form_on: boolean = true;
  journal_on: boolean = false;
  journalSubmit: boolean = false;
  settings_on: boolean = false;

  isSignUp = false;

  prompt = "";
  // Default options for typewriter in light mode
  options = {
    loop: true,
    typeSpeed: "random",
    typeSpeedMin: 150,
    typeSpeedMax: 90,
    deleteSpeed: 90,
    showcursor: true, // Show cursor
    cursorColor: 'black',
    typeColor: 'black',
  };
  // Options for typewriter in dark mode
  darkoptions = {
    loop: true,
    typeSpeed: "random",
    typeSpeedMin: 150,
    typeSpeedMax: 90,
    deleteSpeed: 90,
    showcursor: true, // Show cursor
    cursorColor: 'white',
    typeColor: 'white',
  };
  dark_noloop_options = {
    loop: false,
    typeSpeed: "random",
    typeSpeedMin: 150,
    typeSpeedMax: 90,
    deleteSpeed: 90,
    showcursor: true, // Show cursor
    cursorColor: 'white',
    typeColor: 'white',
  };
  topSection: HTMLElement | null = null;
  settingsIcon: HTMLElement | null = null;
  settingsMenu: HTMLElement | null = null;
  darkModeToggle: HTMLElement | null = null;
  journalArea: HTMLElement | null = null;
  bottomSection: HTMLElement | null = null;
  otherElementsBottom: NodeListOf<Element> = [] as unknown as NodeListOf<Element>;
  journalContent: HTMLElement | null = null;

  isLoggedIn = false; // Track login status
  username = ''; // Store username
  password = ''; // Store password
  errorMessage = ''; // Display error messages if login fails


  async ngOnInit(): Promise<void> {
    this.topSection = document.querySelector(".top-section");
    this.settingsIcon = document.getElementById('settings-icon');
    this.settingsMenu = document.getElementById('settings-menu');
    this.darkModeToggle = document.getElementById('dark-mode-toggle');
    this.journalArea = document.getElementById('journal-area');
    this.bottomSection = document.querySelector(".bottom-section");
    this.otherElementsBottom = this.bottomSection!.querySelectorAll("h3, small, br, form");
    this.journalContent = document.getElementById('journal-content');
    // Retrieve and apply dark mode state from localStorage
    const darkModeState = localStorage.getItem('isDarkMode');
    this.isDarkMode = darkModeState === 'true';

    // Apply dark mode styles if needed
    if (this.isDarkMode) {
      document.body.classList.add("inverted-colors");
    } else {
      document.body.classList.remove("inverted-colors");
    }

    const token = localStorage.getItem('jwtToken');
    //localStorage.removeItem('jwtToken'); // Clear JWT token for testing
    
    if (token) {
      this.isLoggedIn = true;
      this.otherElementsBottom!.forEach(function(element) {
        element.classList.remove("hidden");
      });
      this.form_on = true;
      try {
        const journals = await this.retrieveJournals(localStorage.getItem('username') || "");
        this.journalList = journals ? journals.reverse() : []; // Default to empty array
      } catch (error) {
        console.error('Failed to retrieve journals:', error);
        this.journalList = []; // Handle failure gracefully
      }
    } else {
      this.isLoggedIn = false;
      this.otherElementsBottom!.forEach(function(element) {
        element.classList.add("hidden");
      });
      this.form_on = false;
      this.journalList = []; 
    }

    // Initialize Typewriter with appropriate settings based on dark mode
    this.target = document.querySelector('.tw');
    this.initializeTypewriter(this.target, this.writer, "hello");
  }

  toggleSignUp() {
    this.isSignUp = !this.isSignUp;
  } 

  async login() {
    try {
      const response = await fetch("https://jrny-googlecal.azurewebsites.net/api/authenticate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password.');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('jwtToken', data.token); // Store JWT token in localStorage
        this.isLoggedIn = true;
        localStorage.setItem('username', this.username);
        this.goHome(); // Clear the screen and proceed to the app
        this.journalList = await this.retrieveJournals(localStorage.getItem('username') || "");
        this.journalList.reverse();
      }
    } catch (error) {
      this.errorMessage = 'invalid username or password. please try again.';
    }
  }

  async signUp() {
    try {
      const response = await fetch("https://jrny-googlecal.azurewebsites.net/api/create_user", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      });
      if (response.status == 409) {
        this.errorMessage = 'username is taken. please sign up with a different username.';
      }
      if (response.ok) {
        this.toggleSignUp();
        this.username = '';
        this.password = '';
        this.errorMessage = 'account created! please type in your credentials again to log in :)';
      } 
      
    } catch (error) {
      this.errorMessage = "" + error;
    }
  }

  logout(): void {
    // Clear JWT token and reset login status
    localStorage.removeItem('jwtToken');
    this.isLoggedIn = false;
    this.username = '';
    localStorage.removeItem('username');
    this.password = '';
    this.errorMessage = '';
  }


  goHome() {
    if (this.isLoggedIn) {
      this.ngOnInit();
      this.otherElementsBottom!.forEach(function(element) {
          element.classList.remove("hidden");
      });

      document.getElementById('up-next-head')!.textContent = "up next";
      document.getElementById('gptTaskContent')!.style.display = "block";
      document.getElementById('journal-content')!.style.display = "none";
      this.form_on = true;
      this.settings_on = false;
      this.journal_on = false;
      this.journalSubmit = false;
      document.getElementById('changeResponse')!.textContent = "";
      this.inputArea = "";
    } 
    
  }

  showSettings() {
    if (this.isLoggedIn) {
      this.settings_on = !this.settings_on;
      if (this.settings_on) {
        this.form_on = false;
        this.journal_on = false;
        this.otherElementsBottom.forEach(function(element) {
          element.classList.add("hidden");
        });
      } else {
        this.goHome();
      }
    }
  }

  onInputChange() {
    if (this.inputArea.trim() === '') {
      this.suggestion = ''; // Clear suggestion if input is empty
      return;
    }

    // Find the first suggestion that starts with the current input
    const match = this.suggestionsList.find((s) =>
      s.toLowerCase().startsWith(this.inputArea.toLowerCase())
    );

    // Set the remaining part of the matched suggestion as `suggestion`
    this.suggestion = match ? match.slice(this.inputArea.length) : '';
    console.log("Suggestion:", this.suggestion);
  }


  onKeyDown(event: KeyboardEvent) {
    // Handle Tab key for suggestions
    if (event.key === 'Tab' && this.suggestion) {
      event.preventDefault(); // Prevent default Tab behavior
      this.inputArea += this.suggestion; // Append the suggestion to the input
      this.suggestion = ''; // Clear the suggestion after accepting it
      return;
    }
    //new comment
  
    // Handle Enter key for form submission
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline in textarea
      this.submitChat(event); // Call submitChat function
    }
  }

  // Function to handle chat submission
  async submitChat(event: Event) {
    event.preventDefault();
    // Optionally classify or process input here
    this.classifyInput(this.inputArea);
  }

  async fetchGem(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: '' + prompt + this.inputArea // Concatenate prompt with inputArea
            }]
          }]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      // Extract the response text from the API response
      const ans = data["candidates"][0]["content"]["parts"][0]["text"];
      console.log(ans);
      return String(ans);

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async classifyInput(inputArea: string) {
    this.changeResponse = "Processing...";

    if (inputArea.includes("add task")) {
      this.changeResponse = "task added"
    } else if (inputArea.includes("dark mode")) {
      this.toggleDarkMode(true);
      this.changeResponse = "dark mode"
    } else if (inputArea.includes("light mode")) {
      this.toggleDarkMode(false);
      this.changeResponse = "light mode";
    } else if (inputArea.includes("journal prompt")) {
      this.generateJournal();
      this.changeResponse = "journal prompt";
    }
    if (this.changeResponse == "Processing...") {
      this.changeResponse = "action not recognized";
    }
    this.typewriteChangeResponseBox = document.querySelector('#changeResponse');
    this.inputArea = ""; // Clear input area after processing
    this.initializeTypewriter(this.typewriteChangeResponseBox, this.writer, "change");
    
  }

  async saveJournal() {
    const azureFunctionUrl = "https://jrny-googlecal.azurewebsites.net/api/one_post";
    this.username = localStorage.getItem('username') || "";
    try {
        // Prepare the data payload
        let payload: any = {
            username: this.username,
            prompt: this.prompt,
            response: this.journalInput
        };

        // Make the POST request to the Azure Function
        const response = await fetch(azureFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload), // Convert payload to JSON
        });

        // Handle the response
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to insert data: ${errorMessage}`);
        }

        const responseBody = await response.text();
        await this.retrieveJournals(this.username);
        console.log('Successfully inserted data:', responseBody);
        this.journalList.unshift(payload); // Add to the beginning of the list

        this.journalInput = ""; // Clear the journal input after saving
        this.journalSubmit = true;
    } catch (error) {
        this.journalSubmit = false;
        console.error('Error calling Azure function:', error);
    }
  }
  async retrieveJournals(username: string): Promise<any[]> {
    const azureFunctionUrl = `https://jrny-googlecal.azurewebsites.net/api/get_journals?username=${username}`;
    try {
      const response = await fetch(azureFunctionUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to retrieve journals: ${errorMessage}`);
      }
      const journals = await response.json();
      return journals || []; // Return empty array if response is null
    } catch (error) {
      console.error('Error retrieving journals:', error);
      return []; // Return empty array on error
    }
  }

  toggleEntry(entry: any): void {
    entry.expanded = !entry.expanded;
  }

  grabUsername() {
    this.form_on = false;
    this.journalArea!.style.display = "none";
        this.otherElementsBottom.forEach(function(element) {
            element.classList.add("hidden");
        });
      document.getElementById('up-next-head')!.textContent = "up next";
      document.getElementById('gptTaskContent')!.style.display = "none";
      document.getElementById('journal-content')!.style.display = "none";

  }
  async generateJournal() {
    let ans = await this.fetchGem(`Can you generate one short journal question for me about self reflection, goal setting, or self improvement? No heading or extra characters.`);
    ans = ans.toLowerCase();
    this.otherElementsBottom.forEach(function(element) {
        element.classList.add("hidden");
    });
    this.form_on = false;
    this.journal_on = true;
    this.prompt = ans;
    
    document.getElementById('up-next-head')!.textContent = "past journals";
    document.getElementById('gptTaskContent')!.style.display = "none";
  }

  toggleDarkMode(b: boolean) {
    this.isDarkMode = b;
    localStorage.setItem('isDarkMode', String(this.isDarkMode));
    this.initializeTypewriter(this.target, this.writer, "hello"); // Reinitialize typewriter with new color
    if (this.isDarkMode) {
      document.body.classList.add("inverted-colors");
    } else {
      document.body.classList.remove("inverted-colors");
    }
  }

  initializeTypewriter(location: any, typer: any, what: string) {
    // If the target exists, clear it before initializing the new Typewriter instance
    if (location) {
      // Clear the target element content
      location.innerHTML = '';

      // Start the Typewriter with the updated configuration
      if (what == "hello") {
        typer= new Typewriter(location, this.isDarkMode ? this.darkoptions : this.options);
        typer.type('hello, there')
          .rest(500)
          .remove(5)
          .type('friend')
          .rest(900)
          .clear()
          .rest(500)
          .clear()
          .type('hope you are well')
          .rest(500)
          .remove(4)
          .rest(500)
          .type('absolutely fantastic.')
          .removeCursor()
          .rest(5000)
          .clear()
          .start();
      } else if (what == "change") {
        typer = new Typewriter(location, this.dark_noloop_options);
        typer.type(this.changeResponse)
          .removeCursor()
          .rest(10000)
          .clear()
          .start();  
      }
    }
  }
}


