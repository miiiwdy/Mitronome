# Metronome Website

This digital metronome helps musicians maintain tempo during practice. With an intuitive interface, users can easily set their desired tempo and enjoy a YouTube video featuring music exercises. Additional features include sound options and volume control, making it a valuable tool for improving musical skills.

## Features

- Intuitive interface for easy tempo setting
- YouTube video showcasing music exercises

## How To Contribute?

1. Fork the repository
  ```bash
  Click the "Fork" button at the top right corner of the page.
  ```
2. Clone yout forked url
  ```bash
   git clone <your-fork-url>
  ```
3. Open project in VSCODE then run this command
  ```bash
  npm install
  ```
4. After finished install, run this command
  ```bash
  cp .env.example .env
  ```
5. Change NEXT_PUBLIC_YOUTUBE_API_KEY into your youtube api key
  - you can get from here https://developers.google.com/youtube/v3/getting-started
6. Run Project using
  ```bash
  npm run dev
  ```

