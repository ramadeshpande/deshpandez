import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, of, concat, delay } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true, // <-- Add this line
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'jrny-app';
  greetingText1 = ''; // Holds the dynamic text for greetingText1 (h1)
  greetingText2 = ''; // Holds the dynamic text for greetingText2 (p)
  fullGreetingText1 = 'hello, rama!'; // Full text for h1
  fullGreetingText2 = "it's nice to see you again"; // Full text for p

  ngOnInit() {
    // Start typing effect for greetingText1 and then greetingText2
    this.typewriter(this.fullGreetingText1).subscribe((char) => {
      this.greetingText1 += char;
    });

    // Optional: Start typing greetingText2 after a delay
    setTimeout(() => {
      this.typewriter(this.fullGreetingText2).subscribe((char) => {
        this.greetingText2 += char;
      });
    }, this.fullGreetingText1.length * 100); // Delay based on the length of greetingText1
  }

  // Typewriter function
  typewriter(word: string): Observable<string> {
    return concat(
      ...word.split('').map((char) => of(char).pipe(delay(100))),
      of('').pipe(delay(1000)) // Optional delay after typing
    );
  }
}
