import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const errorMessages = {
  "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/weak-password": "Passwords need to be at least 6 characters.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "That email and password don't match.",
  // Newer Firebase versions collapse wrong-password and user-not-found into this
  // single code so that failures don't reveal which emails are registered.
  "auth/invalid-credential": "That email and password don't match.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Email and password sign-in isn't enabled for this project yet.",
};

export function authErrorMessage(error) {
  return errorMessages[error?.code] ?? "Something went wrong. Please try again.";
}

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOutUser() {
  return signOut(auth);
}
