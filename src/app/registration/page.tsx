"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { loginWithGoogle, loginWithGithub } from "../../lib/auth";
import { onAuthStateChanged } from "firebase/auth";

export default function RegistrationPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation for password match
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerForm.email,
        registerForm.password
      );
      await updateProfile(userCredential.user, { displayName: registerForm.name });
      alert(`Welcome ${registerForm.name}, registration successful!`);
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
      router.push("/login");
    } catch (error : any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, redirect to home
        router.replace("/"); 
      } else {
        setLoading(false); // show login page
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }


  return (
    <main className={`min-h-screen ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-3 rounded-full ${
          theme === 'light' ? 'bg-white text-gray-800 shadow-lg' : 'bg-gray-800 text-white'
        } hover:opacity-80 transition-opacity z-10`}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className={`flex justify-center`}>
              <div
                className={`w-16 h-16 rounded-full ${
                  theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'
                } flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-white">J</span>
              </div>
            </div>
            <h2 className={`mt-2 text-center text-3xl font-extrabold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              Create your account
            </h2>
            <p className={`mt-2 text-center text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Join Jini AI and start chatting today
            </p>
          </div>

          <form className="mt-5 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className={`mt-1 appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Enter your full name"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className={`mt-1 appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Enter your email"
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className={`mt-1 appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Create a password"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                className={`mt-1 appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleLogin}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign in
              </button>
            </span>
            <div className="mt-2 mb-5 flex justify-center items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-md hover:bg-gray-100"
              onClick={() => loginWithGithub(router)}>
                <FaGithub size={24} className={`${theme === 'light' ? 'text-black' : 'text-white'}`} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-md hover:bg-gray-100"
              onClick={() => loginWithGoogle(router)}>
                <FcGoogle size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
