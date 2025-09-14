import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';
import { createBuyerSchema, buyerFilterSchema } from '@/lib/validation';
import { limitRequests } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await limitRequests(request, 30);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    // Get current user session
    const supabase = getServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get query parameters
    const url = new URL(request.url);
    
    // Parse and validate query parameters
    const filterParams = {
      search: url.searchParams.get('search') || undefined,
      status: url.searchParams.get('status') || undefined,
      property_type: url.searchParams.get('property_type') || undefined,
      min_budget: url.searchParams.get('min_budget') || undefined,
      max_budget: url.searchParams.get('max_budget') || undefined,
      location: url.searchParams.get('location') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10'
    };
    
    // Validate the filter parameters
    const filterResult = buyerFilterSchema.safeParse(filterParams);
    
    if (!filterResult.success) {
      return NextResponse.json({ 
        error: 'Invalid filter parameters',
        details: filterResult.error.format()
      }, { status: 400 });
    }
    
    const { 
      search, status, property_type, min_budget, max_budget, 
      location, page, limit 
    } = filterResult.data;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('buyers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    // Apply filters if they exist
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (property_type) {
      query = query.eq('property_type', property_type);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (min_budget) {
      // Assuming budget is stored as a number
      query = query.gte('budget', min_budget);
    }
    
    if (max_budget) {
      query = query.lte('budget', max_budget);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, count, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      data, 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await limitRequests(request, 5);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    // Get current user session
    const supabase = getServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate the request body
    const validationResult = createBuyerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid buyer data',
        details: validationResult.error.format()
      }, { status: 400 });
    }
    
    // Use the validated data
    const validatedData = validationResult.data;
    
    // Add user_id to the body
    const buyerData = {
      ...validatedData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert buyer
    const { data, error } = await supabase
      .from('buyers')
      .insert(buyerData)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}