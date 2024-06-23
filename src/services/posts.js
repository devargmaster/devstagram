import {collection, addDoc, Timestamp, query, where, getDocs, getDoc, doc} from "firebase/firestore";
import { db } from "./firebase";

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
    await addDoc(collection(db, "posts"), {
      userId: userId,
      title: title,
      content: content,
      authorName: authorName,
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
  const q = query(postsCollection, where("userId", "==", `users/${userId}`));
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
    console.log("No such post!");
    return null;
  }
}
export const updatePost = async (postId, uid, content, title, sourcecode, displayName) => {
  // Aquí va tu lógica para actualizar la publicación en la base de datos
  // Puedes usar postId para identificar la publicación a actualizar
  // y los otros parámetros para los nuevos valores de la publicación
};
