# **App Name**: EcoChef

## Core Features:

- User Authentication: Secure user registration and login to personalize the recipe recommendations and store user preferences.
- Ingredient Input and Filter Selection: Users can enter their available ingredients and filter by dietary restrictions and cooking time via a text box and dropdown menus.
- Recipe Matching Process: Utilize Google Gemini API via a Next.js server action to find the highest scoring recipe. The system employs a content-based filtering tool to match ingredients and user criteria against a recipe dataset.
- Result Generation: Display the recipes returned by the Gemini API. Recipes are presented in order of relevance based on ingredients entered.
- Recipe Viewing and Feedback: Users can view complete recipes and submit ratings or feedback, saved to inform future recommendation improvements.

## Style Guidelines:

- Primary color: Earthy green (#8FBC8F) to reflect vegetables and natural ingredients.
- Background color: Light beige (#F5F5DC), desaturated and light to complement the green and create a neutral backdrop.
- Accent color: Warm yellow (#FFD700) to highlight calls to action and important elements.
- Font pairing: 'Playfair' (serif) for titles and 'PT Sans' (sans-serif) for body text, creating an inviting and accessible aesthetic.
- Use clear, modern icons for ingredients, dietary filters, and cooking times.
- A clean and organized layout with a focus on readability. Recipe data displayed through clear, easily parsed data structures
- Subtle animations for loading states and transitions, to enhance user experience without being distracting.