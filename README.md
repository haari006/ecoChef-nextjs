# EcoChef 🌿

Hello there! Welcome to EcoChef, a cool app that helps you find amazing recipes using the ingredients you already have at home. This project is a great way to learn about building a modern web application from scratch.

## What's Inside? (Our Tech Stack) 🥞

This project is built with some really popular and fun technologies. Don't worry if you haven't heard of them all, this is a great chance to learn!

*   **Next.js:** This is our main framework for building the app. It's based on React, which is a super popular library for making user interfaces.
*   **React:** Used for building all the interactive parts of our website, like forms and buttons.
*   **Genkit (with Google Gemini):** This is our "AI Chef"! We use it to generate recipes and summaries. It's a powerful tool for adding artificial intelligence to our app.
*   **Firebase Authentication:** This is how we handle user sign-ups and logins. It's a secure and easy way to manage user accounts.
*   **MongoDB:** This is our database. It's where we store all our important information, like the recipes and user feedback.
*   **Tailwind CSS & ShadCN UI:** This is what makes our app look so good! Tailwind is a CSS framework that lets us style things quickly, and ShadCN gives us a bunch of pre-made components (like buttons and cards) to use.

## Getting Started (Let's Get Cooking!) 🚀

Ready to run the app on your own computer? Here are the steps:

### 1. Set Up Your Secrets (Environment Variables)

Your app needs some secret keys to connect to services like Firebase and MongoDB.

1.  Find the `.env` file in the main folder. This file is where you'll put your secret keys.
2.  You'll see some placeholders like `NEXT_PUBLIC_FIREBASE_API_KEY=""`.
3.  You need to get these keys from your own Firebase and MongoDB accounts. Follow the instructions in the comments inside the `.env` file to find where to get each key.
4.  Copy and paste your keys inside the quotes. Make sure there are no extra spaces!

### 2. Install the Ingredients (Dependencies)

Just like a recipe, our app has a list of "ingredients" it needs to run. These are called dependencies. Open your terminal and run this command:

```bash
npm install
```

This will download and install everything our project needs.

### 3. Start the Oven (Run the App)

Now for the fun part! Run this command in your terminal:

```bash
npm run dev
```

This will start the development server. You should see a message telling you that the app is running, usually at `http://localhost:9002`. Open that link in your web browser, and you should see EcoChef!

You can also check out the hosted version of EcoChef at [https://studio--veggieversatile.us-central1.hosted.app/](https://studio--veggieversatile.us-central1.hosted.app/).


And that's it! You're all set up. Have fun exploring the code and making it your own! ❤️
