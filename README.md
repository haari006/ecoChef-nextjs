### EcoChef 🌿

Hello there\! Welcome to EcoChef, an app that helps you discover amazing recipes using the ingredients you already have at home. This project is a great way to learn about building a modern web application from scratch.

### What's Inside? (Our Tech Stack) 🥞

This project uses a modern stack:

  * **Next.js:** The main framework for building the app, based on React.
  * **React:** For building interactive UI components.
  * **Fine-tuned Gemini Model (with a text classification dataset):** Our "AI Chef" for generating recipes and summaries.
  * **Firebase Authentication:** Handles user sign-ups and logins securely.
  * **MongoDB:** Stores recipes and user feedback.
  * **Tailwind CSS & ShadCN UI:** For fast, beautiful styling and pre-made UI components.

### Getting Started (Let's Get Cooking\!) 🚀

Want to run the app locally? Follow these steps:

#### 1\. Set Up Environment Variables

1.  Find the `.env` file in the main folder.
2.  You'll see placeholders like `NEXT_PUBLIC_FIREBASE_API_KEY=""`.
3.  You will need to get a new API key for your fine-tuned Gemini model. This process involves using a service like Google Cloud Vertex AI to train a new model.
4.  Get your keys from your Firebase and MongoDB accounts (see comments in `.env` for details).
5.  Paste your keys inside the quotes, with no extra spaces.

#### 2\. Install Dependencies

Open your terminal and run:

```bash
npm install
```

#### 3\. Start the Development Server

Run:

```bash
npm run dev
```

The app will start, usually at `http://localhost:9002`. Open that link in your browser to see EcoChef\!

You can also try the hosted version of EcoChef on Vercel: [https://eco-chef-nextjs.vercel.app](https://eco-chef-nextjs.vercel.app)

And that's it\! You're ready to explore the code and make it your own. ❤️
