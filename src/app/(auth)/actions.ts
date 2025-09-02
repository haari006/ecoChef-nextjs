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
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ $or: [{ uid: validatedData.uid }, { email: validatedData.email }] });

    if (existingUser) {
        // This case should ideally be handled by Firebase Auth errors, but this is a good safeguard.
        return { success: false, message: 'User with this UID or email already exists.' };
    }

    await usersCollection.insertOne({
      uid: validatedData.uid,
      name: validatedData.name,
      email: validatedData.email,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (e) {
    console.error('Database error:', e);
    if (e instanceof z.ZodError) {
      return { success: false, message: e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, message: 'An unknown error occurred while saving user to the database.' };
  }
}

export async function logout() {
    try {
      // This is a server action, but signOut is a client-side function.
      // This setup can be tricky. The redirect should happen regardless.
      // However, for a clean logout, the client should handle signing out
      // and then call a server action to redirect or just do it client-side.
      // For now, let's ensure the redirect happens.
    } catch (error) {
      console.error('Error signing out: ', error);
    }
    redirect('/');
}
