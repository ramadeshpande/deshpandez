import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  title = 'jrny-app';
  gptResponse = ''; // Store API response
  todoInput = ''; // Store user input
  inputArea = ''; // Store user input
  tasks: any[] = []; // In-memory task storage
  isDarkMode: boolean = false;
  apiKey = "AIzaSyBDqNepYPVmQiuPVXRbQxz3rwF6C0z_rF8";; // Replace with your actual API key
  apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`;
  
  ngOnInit(): void {
    console.log('AppComponent initialized');
    const target = document.querySelector('.tw')
    const target2 = document.querySelector('.tw2')
    const options = {
      loop: true,
      typeSpeed: 90,
      deleteSpeed: 90,
      showcursor: false
    }
    const options2 = {
      loop: false,
      typeSpeed: 90,
      deleteSpeed: 90
    }
    const writer = new Typewriter(target, options)
    const writer2 = new Typewriter(target2, options2)
    writer.start();
    writer.removeCursor();
    writer.type('hello, friend :)\n');
    writer.rest(10000);
    writer.clear();
    writer2.start();
    writer2.removeCursor();
    writer2.rest(2000)
    writer2.type('how can i help you today?');
    
  }

  // Function to handle chat submission
  async submitChat(event: Event) {
    event.preventDefault();
    console.log("Submit button clicked");
    console.log("User Input:", this.inputArea);

    // Send input to the API using fetchGem()
    const responseText = await this.fetchGem("");
    console.log("API Response:", responseText);

    // Display the response in the UI
    document.getElementById('gptResponse')!.innerHTML = responseText;

    // Optionally classify or process input here
    this.classifyInput(this.inputArea);
  }

  /**
   * Function to send user input to Google Gemini API and get a response.
   * @param prompt - The user's input or prompt.
   */
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
      this.gptResponse = "dark mode";
    } else if (inputArea.includes("dark mode")) {
      this.toggleDarkMode();
      this.gptResponse = "dark mode";
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add("inverted-colors");
    } else {
      document.body.classList.remove("inverted-colors");
    }
  }

}