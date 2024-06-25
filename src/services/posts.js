import {collection, addDoc, Timestamp, query, where, getDocs, getDoc, doc, updateDoc} from "firebase/firestore";
import { db } from "./firebase";
import {getUserProfileById} from "./user-profile.js";

/**
 * Crea una nueva publicación en Firestore.
 *
 * @param {string} userId - El ID del usuario que crea la publicación.
 * @param {string} title - El título de la publicación.
 * @param {string} content - El contenido de la publicación.
 * @param sourcecode
 * @param authorName
 * @returns {Promise<void>}
 */
export async function createPost(userId, content,title, sourcecode, authorName) {
  try {
    const userProfile = await getUserProfileById(userId);
    let authorImage = userProfile ? userProfile.photoURL : null;
    if (!authorImage) {
      authorImage = '/images/default.jpg'; // Valor por defecto
    }
    await addDoc(collection(db, "posts"), {
      userId: userId,
      title: title,
      content: content,
      authorName: authorName,
      authorImage: authorImage,
      sourcecode: sourcecode,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likesCount: 0,
      commentsCount: 0,
    });
    console.log("Publicación creada exitosamente.");
  } catch (error) {
    console.error("Error al crear la publicación: ", error);
    throw error;
  }
}
export async function getPostsByUser(userId) {
  const postsCollection = collection(db, "posts");
  const q = query(postsCollection, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return posts;
}
export async function getPostById(postId) {
  const postDoc = doc(db, "posts", postId);
  const postSnapshot = await getDoc(postDoc);
  if (postSnapshot.exists()) {
    return { id: postSnapshot.id, ...postSnapshot.data() };
  } else {
    console.log("No se encuentra la publicacion!");
    return null;
  }
}


/**
 * Actualiza una publicación existente en Firestore.
 *
 * @param {string} postId - El ID de la publicación a actualizar.
 * @param {Object} postData - Los nuevos datos de la publicación.
 * @returns {Promise<void>}
 */
export async function updatePost(postId, postData) {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, postData);
    console.log("Publicación actualizada exitosamente.");
  } catch (error) {
    console.error("Error al actualizar la publicación: ", error);
    throw error;
  }
}
