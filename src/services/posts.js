import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Crea una nueva publicación en Firestore.
 *
 * @param {string} userId - El ID del usuario que crea la publicación.
 * @param {string} title - El titulo de la publicación.
 * @param {string} content - El contenido de la publicación.
 * @param sourcecode
 * @param authorName
 * @returns {Promise<void>}
 */
export async function createPost(userId, content,title, sourcecode, authorName) {
  try {
    await addDoc(collection(db, "posts"), {
      userId: `users/${userId}`,
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
export const updatePost = async (postId, uid, content, title, sourcecode, displayName) => {
  // Aquí va tu lógica para actualizar la publicación en la base de datos
  // Puedes usar postId para identificar la publicación a actualizar
  // y los otros parámetros para los nuevos valores de la publicación
};
