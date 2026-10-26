import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../services/firebase";
import { logInWithEmail, logOutUser, signUpWithEmail } from "../services/auth";
import { AuthContext } from "./AuthContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Signing in with a credential can briefly leave no current user. Without this
  // flag the anonymous fallback below would race the credential we're already
  // waiting on, and could win.
  const signingInRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      if (signingInRef.current) return;

      // Visitors without an account still get a session so they can look words
      // up; saving is gated on `isAnonymous` at the call sites.
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
        setUser(null);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  const signInWith = useCallback(async (signIn, email, password) => {
    signingInRef.current = true;
    try {
      await signIn(email, password);
    } finally {
      signingInRef.current = false;
    }
  }, []);

  const signUp = useCallback(
    (email, password) => signInWith(signUpWithEmail, email, password),
    [signInWith],
  );

  const logIn = useCallback(
    (email, password) => signInWith(logInWithEmail, email, password),
    [signInWith],
  );

  // Deliberately not guarded by `signingInRef`: logging out should fall through
  // to the anonymous session so the app stays usable read-only.
  const logOut = useCallback(() => logOutUser(), []);

  const value = useMemo(
    () => ({ user, loading, signUp, logIn, logOut }),
    [user, loading, signUp, logIn, logOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
