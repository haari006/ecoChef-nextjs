'use server';

import {
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { FirebaseError } from 'firebase/app';

const userSchema = z.object({
  uid: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export async function createUserInDb(userData: {uid: string, name: string, email: string}) {
  try {
    const validatedData = userSchema.parse(userData);
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    await db.collection('users').insertOne({
      uid: validatedData.uid,
      name: validatedData.name,
      email: validatedData.email,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { success: false, message: e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, message: 'An unknown error occurred while saving to the database.' };
  }
}

export async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
    redirect('/');
}
