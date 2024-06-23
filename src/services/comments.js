import { collection, addDoc, Timestamp, doc,query , where, getDocs} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Crea un nuevo comentario en Firestore.
 *
 * @param {string} userId - El ID del usuario que crea el comentario.
 * @param authorName
 * @param {string} postId - El ID del post al que pertenece el comentario.
 * @param {string} content - El contenido del comentario.
 * @returns {Promise<void>}
 */
export async function createComment(userId, authorName ,postId, content) {
  try {
    await addDoc(collection(db, "comments"), {
      userId: userId,
      postId: doc(db, "posts", postId),
      authorName: authorName,
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
export async function getCommentsByPostId(postRef) {
  const commentsCollection = collection(db, "comments");
  const q = query(commentsCollection, where("postId", "==", postRef)); // Compara con la referencia de documento
  const querySnapshot = await getDocs(q);
  const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(comments);
  return comments;
}
