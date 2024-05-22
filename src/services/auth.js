import {
  createUserWithEmailAndPassword, EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  reauthenticateWithCredential,
  signOut, updatePassword
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const EMPTY_USER_DATA = {
  id: null,
  email: null,
};

let userData = EMPTY_USER_DATA;
let observers = [];
onAuthStateChanged(auth, user => {
  if(user) {
    userData = {
      id: user.uid,
      email: user.email,
    };
  } else {
    userData = EMPTY_USER_DATA;
  }
  notifyAll();
});

/**
 * Crea una cuenta de usuario, y lo autentica.
 * También crea un documento en Firestore para el usuario.
 *
 * @param {string} email
 * @param {string} password
 * @param name
 * @returns {Promise<void>}
 */
export async function register(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date(),
      name: name,
    });

    console.log("Usuario creado. ID: ", user.uid);
    return user;
  } catch (error) {
    console.error("[auth.js register] Error al crear una cuenta: ", error.code);
    throw error;
  }
}

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario autenticado. ID: ", user.uid);
    return user;
  } catch (error) {
    console.error("[auth.js login] Error al iniciar sesión: ", error.code);
    throw error;
  }
}

/**
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth);
    console.log("Usuario desconectado.");
  } catch (error) {
    console.error("[auth.js logout] Error al cerrar sesión: ", error.code);
    throw error;
  }
}

/**
 * Suscribe un observer (el callback) para la autenticación.
 * Este callback va a ejecutarse cada vez que el estado cambie, y cuando se
 * suscribe.
 *
 * @param {() => {}} callback
 * @returns {() => void} Una función para cancelar la suscripción.
 */
export function subscribeToAuth(callback) {
  observers.push(callback);
  notify(callback);


  return () => {
    unsubscribeFromAuth(callback);
  };
}

/**
 * Cancela la suscripción de un observer.
 *
 * @param {() => {}} callback
 */
export function unsubscribeFromAuth(callback) {
  observers = observers.filter(observer => observer !== callback);
}
/**
 * Actualiza la contraseña del usuario actualmente autenticado.
 *
 * @param {string} currentPassword - La contraseña actual del usuario.
 * @param {string} newPassword - La nueva contraseña del usuario.
 * @returns {Promise<void>}
 */
export async function updateUserPassword(currentPassword, newPassword) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && currentPassword) {

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      throw new Error('La contraseña actual es incorrecta');
    }

    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      throw new Error('Error al actualizar la contraseña');
    }
  } else {
    throw new Error('No se pudo actualizar la contraseña');
  }
}
/**
 * Notifica a un observer de los datos actuales del usuario.
 *
 * @param {() => {})} observer
 */
function notify(observer) {
  observer({...userData});
}

/**
 * Notifica a todos los observers.
 *
 * Esta función debe invocarse cada vez que la variable userData cambie.
 */
function notifyAll() {
  observers.forEach(observer => notify(observer));
}
