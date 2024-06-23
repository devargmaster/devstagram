import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserById(userId) {
  if (typeof userId !== 'string') {
    console.error('getUserById error: userId debe ser una cadena de texto, se obtuvo:', userId);
    return null;
  }

  const userDoc = doc(db, "users", userId);
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
    return { id: userSnapshot.id, ...userSnapshot.data() };
  } else {
    console.log("No such user!");
    return null;
  }
}


/**
 * Traemos los datos del usuario con él, id provisto.
 *
 * @param {string} userId
 * @returns {Promise}
 */
export async function getUserProfileById(userId) {
  try {
    const refUser = doc(db, `users/${userId}`);
    const userDoc = await getDoc(refUser);
    console.log("[user-profile.js getUserProfileById] userDoc: ", userDoc.data());
    return {
      id: userDoc.id,
      email: userDoc.data().email,
      displayName: userDoc.data().displayName,
      bio: userDoc.data().bio,
      career: userDoc.data().career,
      photoURL: userDoc.data().photoURL,
    }
  } catch (error) {
    console.error("[user-profile.js getUserProfileById] Error: ", error);
    throw error;
  }
}

/**
 *
 * @param {string} id
 * @param {{email: string}} data
 * @returns {Promise<void>}
 */
export async function createUserProfile(id, data) {
  const refUser = doc(db, `users/${id}`);

  await setDoc(refUser, data);
}

/**
 *
 * @param {string} id
 * @param {{displayName: string|null, photoURL: string|null}} data
 * @returns {Promise<void>}
 */
export async function updateUserProfile(id, data) {
  const refUser = doc(db, `users/${id}`);

  await updateDoc(refUser, data);
}
