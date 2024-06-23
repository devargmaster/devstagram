import { collection, addDoc, Timestamp, doc,query , where, getDocs,orderBy} from "firebase/firestore";
import { db } from "./firebase";
import {getUserProfileById} from "./user-profile.js";

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
    const userProfile = await getUserProfileById(userId);
    const authorImage = userProfile ? userProfile.photoURL : null;
    const newComment = {
      userId: userId,
      postId: doc(db, "posts", postId),
      authorName: authorName,
      content: content,
      authorImage: authorImage,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "comments"), newComment);
    console.log("Comentario creado exitosamente.");
    return { id: docRef.id, ...newComment };
  } catch (error) {
    console.error("Error al crear el comentario: ", error);
    throw error;
  }
}
export async function getCommentsByPostId(postRef) {
  const commentsCollection = collection(db, "comments");
  const q = query(commentsCollection, where("postId", "==", postRef), orderBy("createdAt", "desc")); // Ordena los comentarios por fecha de creación en orden descendente
  const querySnapshot = await getDocs(q);
  const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(comments);
  return comments;
}
