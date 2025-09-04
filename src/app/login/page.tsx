"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../../lib/firebase"; // import your firebase.ts
import { signInWithEmailAndPassword } from "firebase/auth";
import { loginWithGoogle, loginWithGithub } from "../../lib/auth";

export default function LoginPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleRegistration = () => {
    router.push("/registration");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      );

      const user = userCredential.user;
      alert(`Welcome back, ${user.displayName || "User"}!`);

      // redirect to dashboard or home
      router.push("/"); // change to your desired page
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-100">
      <div
        className={`min-h-screen flex ${
          theme === "light" ? "bg-gray-50" : "bg-gray-900"
        }`}
      >
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`fixed top-4 right-4 p-3 rounded-full ${
            theme === "light"
              ? "bg-white text-gray-800 shadow-lg"
              : "bg-gray-800 text-white"
          } hover:opacity-80 transition-opacity z-10`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 rounded-full ${
                    theme === "light" ? "bg-blue-500" : "bg-blue-600"
                  } flex items-center justify-center`}
                >
                  <span className="text-2xl font-bold text-white">J</span>
                </div>
              </div>
              <h2
                className={`mt-6 text-center text-3xl font-extrabold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Sign in to Jini AI
              </h2>
              <p
                className={`mt-2 text-center text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Welcome back! Please enter your details
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-700 text-white"
                    } placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-700 text-white"
                    } placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>

              <div className="text-center">
                <span
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={handleRegistration}
                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Sign up
                  </button>
                </span>
                <div className=" mt-2 mb-5 flex justify-center items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-md hover:bg-gray-100"
                    onClick={loginWithGithub}
                  >
                    <FaGithub
                      size={24}
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-md hover:bg-gray-100"
                    onClick={loginWithGoogle}
                  >
                    <FcGoogle size={24} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
