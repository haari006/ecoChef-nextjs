import admin from 'firebase-admin';

if (!admin.apps.length) {
  const base64Config = process.env.FIREBASE_ADMIN_CONFIG_BASE64;

  if (base64Config && base64Config.trim() !== "") {
    try {
      const jsonString = Buffer.from(base64Config, "base64").toString("utf8");
      const serviceAccount = JSON.parse(jsonString);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error(
        "Failed to decode or initialize FIREBASE_ADMIN_CONFIG_BASE64:",
        e
      );
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "FIREBASE_ADMIN_CONFIG_BASE64 is not set. Firebase Admin SDK not initialized."
      );
    }
  }
}

function getAdminAuth() {
    if (!admin.apps.length) {
        throw new Error(
          "Firebase Admin SDK is not initialized. Add FIREBASE_ADMIN_CONFIG_BASE64 to your .env.local file."
        );
    }
    return admin.auth();
}

export { getAdminAuth };
