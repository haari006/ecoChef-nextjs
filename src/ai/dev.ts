import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-recipe-for-quick-view.ts';
import '@/ai/flows/generate-recipe-from-ingredients.ts';
import '@/ai/flows/filter-recipes-by-dietary-needs.ts';
import '@/ai/flows/validate-ingredients-with-dietary-needs.ts';
