'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { FirebaseError } from 'firebase/app';

const signupSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
  });

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignupState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
};

type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });

    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    await db.collection('users').insertOne({
      uid: user.uid,
      name,
      email,
      createdAt: new Date(),
    });

  } catch (e) {
    if (e instanceof FirebaseError) {
      if (e.code === 'auth/email-already-in-use') {
        return { errors: { email: ['Email already in use.'] } };
      }
      return {
        errors: { _form: [e.message] },
        message: 'Signup failed. Please try again.',
      };
    }
    return {
      errors: { _form: ['An unknown error occurred.'] },
      message: 'Signup failed. Please try again.',
    }
  }

  redirect('/login');
}

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse(
        Object.fromEntries(formData.entries())
      );
    
      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
        };
      }
    
      const { email, password } = validatedFields.data;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    if (e instanceof FirebaseError) {
        return {
          errors: { _form: ['Invalid email or password.'] },
          message: 'Login failed. Please check your credentials.',
        };
      }
      return {
        errors: { _form: ['An unknown error occurred.'] },
        message: 'Login failed. Please try again.',
      }
  }

  redirect('/');
}

export async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
    redirect('/login');
}