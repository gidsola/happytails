
/* import React from 'react'; */ // importing full React to access React.JSX.Element type
import type { JSX } from 'react'; // importing only JSX type for better performance and to avoid importing the entire React library
import './App.css';

// export default function App(): React.JSX.Element {
  export default function App(): JSX.Element {

  // this page isn't a great example for typescript so I did this simple one.
  const title: string = "Happy Tails";

  return (
    <div className="App">
      <header className="header">
        <h1>Welcome to {title}</h1>
        <p>A unified platform for pet care and adoption</p>
      </header>

      <main className="main-content">
        <section className="hero">
          <h2>Find Your Perfect Pet</h2>
          <p>Browse adoptable pets, connect with sitters, and get AI-powered care advice—all in one place.</p>
          <button className="cta-button">Get Started</button>
        </section>

        <section className="features">
          <div className="feature-card">
            <h3>Adopt a Pet</h3>
            <p>Browse pets available for adoption and submit applications.</p>
          </div>
          <div className="feature-card">
            <h3>Find a Sitter</h3>
            <p>Book trusted pet sitters for walking, boarding, or daycare.</p>
          </div>
          <div className="feature-card">
            <h3>AI Care Assistant</h3>
            <p>Get personalized reminders and advice for your pet's health.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 {title}. All rights reserved.</p>
      </footer>
    </div>
  );
};
