// auth.ts
import { auth, googleProvider, githubProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

const router = useRouter();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google User:", user);
    router.push("/");
    return user;
  } catch (err) {
    console.error("Google login error:", err);
  }
};

export const loginWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    console.log("GitHub User:", user);
    router.push("/");
    return user;
  } catch (err) {
    console.error("GitHub login error:", err);
  }
};
