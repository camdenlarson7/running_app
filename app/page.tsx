"use client";

import { useState } from "react";
import { supabase } from "./supabase";
import './globals.css';


export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false); 
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Added username field
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setError("");
    setMessage("");
  
    if (isSignUp) {
      // Sign-Up Logic
      const { data: user, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        setError(error.message);
      } else if (user) {
        setMessage("Sign-up successful! Please log in.");
        setIsSignUp(false);
      }
    } else {
      // Login Logic
      const { data: signInData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (loginError) {
        setError(loginError.message);
      } else {
        const { data: userResponse, error: userError } = await supabase.auth.getUser();
  
        if (userError) {
          setError(userError.message);
        } else if (userResponse?.user) {
          const userEmail = userResponse.user.email;
  
          if (!userEmail) {
            setError("Email not found.");
            return;
          }
  
          // Create a unique runs table for the user
          const { error: tableError } = await supabase.rpc("create_runs_table", {
            email: userEmail,
          });
  
          if (tableError) {
            setError(`Login successful, but there was an error creating the runs table: ${tableError.message}`);
          } else {
            window.location.href = "/runs"; // Redirect to user's page
          }
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? "Sign Up" : "Log In"}
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
        >
          {isSignUp && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-500 underline"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}







