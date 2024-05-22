import { collection, addDoc, Timestamp, doc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Crea un nuevo comentario en Firestore.
 *
 * @param {string} userId - El ID del usuario que crea el comentario.
 * @param {string} postId - El ID del post al que pertenece el comentario.
 * @param {string} content - El contenido del comentario.
 * @returns {Promise<void>}
 */
export async function createComment(userId, postId, content) {
  try {
    await addDoc(collection(db, "comments"), {
      userId: doc(db, "users", userId),
      postId: doc(db, "posts", postId),
      content: content,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("Comentario creado exitosamente.");
  } catch (error) {
    console.error("Error al crear el comentario: ", error);
    throw error;
  }
}
