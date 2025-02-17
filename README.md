# Free4Talk Bot

## Overview
The **Free4Talk Bot** is an AI-powered virtual assistant designed for the Free4Talk platform. It automatically welcomes new users when they join a virtual room and interacts with them by responding to their messages using AI-generated replies.

## Features
- **Automated Welcome Messages**: Greets users when they join a room.
- **AI-Powered Chat Responses**: Uses Puppeteer to scrape and fetch AI-generated responses from ChatGPT.
- **Real-Time Interaction**: Engages users dynamically based on their input.
- **Web Scraping**: Utilizes Puppeteer for automating browser interactions.

## Technologies Used
- **Node.js** – JavaScript runtime environment
- **Puppeteer** – Headless browser automation
- **ChatGPT API** – AI-generated responses (via web scraping or API calls)
- **Express.js** – Backend framework (if applicable)

## Installation
```bash
# Clone the repository
git clone https://github.com/CodeWithJagdeep/FFTBot.git

# Navigate to the project directory
cd FFTBot

# Install dependencies
npm install
```

## Usage
```bash
# Start the bot
npm start
```
Ensure you have Puppeteer set up correctly and the required dependencies installed.

## Configuration
Create a `.env` file to store your environment variables:
```
email =<Email Address>
password = <Password>
owner=<username>
room_link=<Free4Talk Room URL>
```

## Future Improvements
- Enhance conversation flow with AI fine-tuning
- Implement support for multiple rooms
- Add logging and analytics for chat interactions

## Contributing
Feel free to contribute by submitting pull requests or reporting issues.

## License
This project is licensed under the MIT License.

---

### Author
Developed by **Jagdeep Singh** 🚀  
GitHub: [WorkwithJagdeep](https://github.com/codewithJagdeep)
