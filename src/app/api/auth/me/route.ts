import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = getServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      user: session.user,
      // Don't return the access token to the client
      session: {
        expires_at: session.expires_at,
        expires_in: session.expires_in
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}