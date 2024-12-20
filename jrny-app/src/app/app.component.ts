import { Component, OnInit, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
// @ts-ignore
import Typewriter from 't-writer.js';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FormsModule],
})
export class AppComponent implements OnInit {
  constructor(private er: ElementRef, private location: Location) {}

  title = 'jrny-app';
  suggestion: string = ''; // Current autocomplete suggestion
  suggestionsList: string[] = ['set a timer', 'give me a journal prompt', 'add tasks', 'remove tasks', 'switch to dark mode'];
  changeResponse = ''; // Store API response
  todoInput = ''; // Store user input
  inputArea = ''; // Store user input
  tasks: any[] = []; // In-memory task storage
  isDarkMode: boolean = false; // Default value for dark mode
  apiKey = "AIzaSyBDqNepYPVmQiuPVXRbQxz3rwF6C0z_rF8"; // Replace with your actual API key
  apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`;
  target: any;
  typewriteChangeResponseBox: any;
  writer: any;

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

  ngOnInit(): void {
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

  classifyInput(inputArea: string) {
    this.changeResponse = "Processing...";

    if (inputArea.includes("add task")) {
      this.changeResponse = "task added"
    } else if (inputArea.includes("dark")) {
      this.toggleDarkMode(true);
      this.changeResponse = "dark mode"
    } else if (inputArea.includes("light mode")) {
      this.toggleDarkMode(false);
      this.changeResponse = "light mode";
    }

    if (this.changeResponse == "Processing...") {
      this.changeResponse = "action not recognized";
    }
    this.typewriteChangeResponseBox = document.querySelector('#changeResponse');
    this.initializeTypewriter(this.typewriteChangeResponseBox, this.writer, "change");
    
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
