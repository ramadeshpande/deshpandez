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
  gptResponse = ''; // Store API response
  todoInput = ''; // Store user input
  inputArea = ''; // Store user input
  tasks: any[] = []; // In-memory task storage
  isDarkMode: boolean = false; // Default value for dark mode
  apiKey = "AIzaSyBDqNepYPVmQiuPVXRbQxz3rwF6C0z_rF8"; // Replace with your actual API key
  apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`;
  target: any;
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
    this.initializeTypewriter();
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
    this.gptResponse = "Processing...";

    if (inputArea.includes("task")) {
      // Example: handle tasks
    } else if (inputArea.includes("dark mode")) {
      this.toggleDarkMode();
      this.gptResponse = "Dark mode activated";
    } else if (inputArea.includes("light mode")) {
      this.toggleDarkMode();
      this.gptResponse = "Light mode activated";
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', String(this.isDarkMode));
    this.initializeTypewriter(); // Reinitialize typewriter with new color
    // Apply or remove dark mode class dynamically
    if (this.isDarkMode) {
      document.body.classList.add("inverted-colors");
    } else {
      document.body.classList.remove("inverted-colors");
    }
  }

  initializeTypewriter() {
    // If the target exists, clear it before initializing the new Typewriter instance
    if (this.target) {
      // Clear the target element content
      this.target.innerHTML = '';

      // Create a new Typewriter instance with the appropriate options based on dark mode
      this.writer = new Typewriter(this.target, this.isDarkMode ? this.darkoptions : this.options);

      // Start the Typewriter with the updated configuration
      this.writer.type('hello, there')
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
    }
  }
}
