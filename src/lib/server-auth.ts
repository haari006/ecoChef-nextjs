'use server';

import { getAdminAuth } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export async function verifySession(idToken: string | null): Promise<DecodedIdToken> {
    if (!idToken) {
        throw new Error('Authentication token is missing. Please log in.');
    }
    
    const adminAuth = getAdminAuth();

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        throw new Error('Your session is invalid or has expired. Please log out and log back in.');
    }
}
