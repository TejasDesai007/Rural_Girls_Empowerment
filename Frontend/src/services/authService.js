import { supabase } from "./supabaseClient";

// Inside your component
const handleSignIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast.error(error.message);
    return false;
  }
  
  return true; // Success
};

const handleSignUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    toast.error(error.message);
    return false;
  }
  
  return true; // Success
};