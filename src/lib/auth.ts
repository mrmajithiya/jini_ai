// auth.ts
import { auth, googleProvider, githubProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

// Google login function
export const loginWithGoogle = async (router: any) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google User:", user);

    // Redirect after login
    router.push("/"); // or "/dashboard" if you prefer

    return user;
  } catch (err) {
    console.error("Google login error:", err);
  }
};

// GitHub login function
export const loginWithGithub = async (router: any) => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    console.log("GitHub User:", user);

    // Redirect after login
    router.push("/"); // or "/dashboard"

    return user;
  } catch (err) {
    console.error("GitHub login error:", err);
  }
};
