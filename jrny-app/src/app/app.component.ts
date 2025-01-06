import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location, CommonModule, NgIf } from '@angular/common';

// @ts-ignore
import Typewriter from 't-writer.js';
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
  isDarkMode: boolean = false; // Default value for dark mode
  apiKey = "AIzaSyBDqNepYPVmQiuPVXRbQxz3rwF6C0z_rF8"; // Replace with your actual API key
  apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`;
  target: any;
  typewriteChangeResponseBox: any;
  writer: any;
  form_on: boolean = true;


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
  promptDiv: HTMLElement | null = null;

  ngOnInit(): void {
    this.topSection = document.querySelector(".top-section");
    this.settingsIcon = document.getElementById('settings-icon');
    this.settingsMenu = document.getElementById('settings-menu');
    this.darkModeToggle = document.getElementById('dark-mode-toggle');
    this.journalArea = document.getElementById('journal-area');
    this.bottomSection = document.querySelector(".bottom-section");
    this.otherElementsBottom = this.bottomSection!.querySelectorAll("h3, small, br, form");
    this.journalContent = document.getElementById('journal-content');
    this.promptDiv = document.getElementById('prompt');
    // Retrieve and apply dark mode state from localStorage
    const darkModeState = localStorage.getItem('isDarkMode');
    this.isDarkMode = darkModeState === 'true';

    // Apply dark mode styles if needed
    if (this.isDarkMode) {
      document.body.classList.add("inverted-colors");
    } else {
      document.body.classList.remove("inverted-colors");
    }

    // Initialize Typewriter with appropriate settings based on dark mode
    this.target = document.querySelector('.tw');
    this.initializeTypewriter(this.target, this.writer, "hello");
  }
  goHome() {
    this.ngOnInit();
    this.settingsMenu!.style.display = "none";
    this.journalArea!.style.display = "none";
    this.otherElementsBottom!.forEach(function(element) {
        element.classList.remove("hidden");
    });

    document.getElementById('up-next-head')!.textContent = "up next";
    document.getElementById('gptTaskContent')!.style.display = "block";
    document.getElementById('journal-content')!.style.display = "none";
    this.form_on = true;
    document.getElementById('changeResponse')!.textContent = "";
    this.inputArea = "";
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

  // Handle Tab key to accept the suggestion
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && this.suggestion) {
      event.preventDefault(); // Prevent default Tab behavior
      this.inputArea += this.suggestion; // Append the suggestion to the input
      console.log("Suggestion accepted:", this.inputArea);
      this.suggestion = ''; // Clear the suggestion after accepting it
    }
  }
  // Function to handle chat submission
  async submitChat(event: Event) {
    event.preventDefault();
    console.log("Submit button clicked");
    console.log("User Input:", this.inputArea);

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
      this.displayJournals(await this.retrieveJournals("rama"));
      this.changeResponse = "journal prompt";
    }
    if (this.changeResponse == "Processing...") {
      this.changeResponse = "action not recognized";
    }
    this.typewriteChangeResponseBox = document.querySelector('#changeResponse');
    this.initializeTypewriter(this.typewriteChangeResponseBox, this.writer, "change");
    
  }

  async saveJournal() {
    let username = "rama"; // Replace with dynamic username if needed
    let thePrompt = this.promptDiv?.textContent; // Replace with dynamic prompt if needed

    const azureFunctionUrl = "https://jrny-googlecal.azurewebsites.net/api/one_post";

    try {
        // Prepare the data payload
        let payload: any = {
            username: username,
            prompt: thePrompt,
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
        this.displayJournals(await this.retrieveJournals(username));
        console.log('Successfully inserted data:', responseBody);
    } catch (error) {
        console.error('Error calling Azure function:', error);
    }
  }
  async retrieveJournals(username: string) {
    const azureFunctionUrl = `https://jrny-googlecal.azurewebsites.net/api/get_journals?username=${encodeURIComponent(username)}`;

    try {
        // Make the GET request to the Azure Function
        const response = await fetch(azureFunctionUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Handle the response
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to retrieve journals: ${errorMessage}`);
        }

        // Parse the JSON response body
        const journals = await response.json();
        console.log('Retrieved journals:', journals);

        // Return the journals for further processing
        return journals;

    } catch (error) {
        // Handle and log any errors
        console.error('Error retrieving journals:', error);
        return null; // Return null to indicate failure
    }
  }

  displayJournals(entries : any[]) {
    const journalContent = document.getElementById('journal-content');

    // Clear previous entries
    journalContent!.innerHTML = '';

    // Process each journal entry
    entries.reverse().forEach(entry => {
        let entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        entryDiv.innerHTML = `
            <h3>${entry.prompt}</h3>
            <small>${new Date(entry.timestamp).toLocaleString()}</small>
            <small>click to read more</small>
            <p>${entry.response || entry.body}</p>
        `;
        journalContent!.appendChild(entryDiv);

        entryDiv.addEventListener('click', () => {
            entryDiv.classList.toggle('expanded');
        });
    });

  }
  async generateJournal() {
    let ans = await this.fetchGem(`Can you generate one short journal question for me about self reflection, goal setting, or self improvement? No heading or extra characters.`);
    ans = ans.toLowerCase();
  
    if (this.journalArea!.style.display === "none" || this.journalArea!.style.display === "") {
        this.journalArea!.style.display = "block";
        this.journalContent!.style.display = "block";
        this.otherElementsBottom.forEach(function(element) {
            element.classList.add("hidden");
        });
        this.form_on = false;
        this.promptDiv!.textContent = ans;
        document.getElementById('up-next-head')!.textContent = "past journals";
        document.getElementById('gptTaskContent')!.style.display = "none";

    } else {
        this.form_on = true;
        this.journalArea!.style.display = "none";
        this.otherElementsBottom.forEach(function(element) {
            element.classList.remove("hidden");
        });
        document.getElementById('up-next-head')!.textContent = "up next";
        document.getElementById('gptTaskContent')!.style.display = "block";
    }

    const journalInput = document.getElementById('journal-input');
    const saveJournalButton = document.getElementById('saveJournalButton');
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


