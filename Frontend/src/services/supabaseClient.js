// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pttlinripubqerfiulfl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dGxpbnJpcHVicWVyZml1bGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5ODg5NzIsImV4cCI6MjA2MDU2NDk3Mn0.csbsnYQ6io34VOn9QCVy8BHRfk-9YErAG6NzQ9Eu5eM';
export const supabase = createClient(supabaseUrl, supabaseKey);
