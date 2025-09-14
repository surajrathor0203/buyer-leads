import { getServerSupabaseClient, supabaseAdmin } from './supabase-server';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// Fetch the current session server-side
export async function getSession() {
  const supabase = getServerSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Fetch the current user server-side
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

// Check if user is authenticated server-side
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

// Create a new magic link
export async function createMagicLink(email: string, redirectTo: string = '/') {
  const supabase = getServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo}`,
    },
  });
  
  return { error };
}

// Sign out user
export async function signOut() {
  const supabase = getServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// Check if user owns a resource
export async function checkOwnership(userId: string, resourceId: string, resourceType: string) {
  try {
    // Add logic to check if the user owns the resource
    // Example: Query the database to check if the user ID matches the owner ID of the resource
    // This is a stub implementation
    const { data, error } = await supabaseAdmin
      .from(resourceType)
      .select('user_id')
      .eq('id', resourceId)
      .single();
    
    if (error) throw error;
    
    return data.user_id === userId;
  } catch (error) {
    console.error('Error checking ownership:', error);
    return false;
  }
}