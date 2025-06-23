import admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;
    
    // We only attempt to initialize if the config is present and not a placeholder.
    if (serviceAccountString && serviceAccountString.trim() !== '') {
        try {
            const serviceAccount = JSON.parse(serviceAccountString);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (e) {
            // Log the error but don't throw, to prevent a server crash on startup.
            // The check in getAdminAuth will handle the uninitialized state.
            console.error("Failed to parse or initialize FIREBASE_ADMIN_CONFIG:", e);
        }
    } else {
        // Log a warning if the config is missing, so it's visible in server logs on startup.
        if (process.env.NODE_ENV === 'development') {
            console.warn('FIREBASE_ADMIN_CONFIG is not set in .env file. Server-side authentication will not work.');
        }
    }
}

/**
 * Returns the Firebase Admin Auth instance.
 * Throws an error if the Admin SDK is not initialized, guiding the developer to configure .env.
 */
function getAdminAuth() {
    if (!admin.apps.length) {
        throw new Error('Firebase Admin SDK is not initialized. Please add your FIREBASE_ADMIN_CONFIG to your .env file. You can generate this from your Firebase project settings under "Service accounts".');
    }
    return admin.auth();
}

export { getAdminAuth };
