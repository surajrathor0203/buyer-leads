import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';
import { updateBuyerSchema } from '@/lib/validation';
import { limitRequests } from '@/lib/rateLimit';
import { z } from 'zod';

// Parameter validation schema
const paramsSchema = z.object({
  id: z.string().uuid('Invalid buyer ID format')
});

// Helper function to check ownership
async function checkBuyerOwnership(buyerId: string) {
  try {
    const supabase = getServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { authorized: false, error: 'Not authenticated', status: 401 };
    }
    
    const userId = session.user.id;
    const { data: buyer } = await supabase
      .from('buyers')
      .select('user_id')
      .eq('id', buyerId)
      .single();
      
    if (!buyer) {
      return { authorized: false, error: 'Buyer not found', status: 404 };
    }
    
    if (buyer.user_id !== userId) {
      return { authorized: false, error: 'Not authorized to access this buyer', status: 403 };
    }
    
    return { authorized: true, userId };
  } catch (error: any) {
    return { authorized: false, error: error.message, status: 500 };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await limitRequests(request, 20);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    // Validate ID parameter
    const paramResult = paramsSchema.safeParse(params);
    if (!paramResult.success) {
      return NextResponse.json({ 
        error: 'Invalid buyer ID',
        details: paramResult.error.format()
      }, { status: 400 });
    }
    
    // Check ownership
    const ownershipCheck = await checkBuyerOwnership(params.id);
    if (!ownershipCheck.authorized) {
      return NextResponse.json({ error: ownershipCheck.error }, { status: ownershipCheck.status });
    }
    
    // Get the buyer data
    const supabase = getServerSupabaseClient();
    const { data: buyer, error } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    return NextResponse.json(buyer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await limitRequests(request, 10);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    // Validate ID parameter
    const paramResult = paramsSchema.safeParse(params);
    if (!paramResult.success) {
      return NextResponse.json({ 
        error: 'Invalid buyer ID',
        details: paramResult.error.format()
      }, { status: 400 });
    }
    
    // Check ownership
    const ownershipCheck = await checkBuyerOwnership(params.id);
    if (!ownershipCheck.authorized) {
      return NextResponse.json({ error: ownershipCheck.error }, { status: ownershipCheck.status });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const validationResult = updateBuyerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid buyer data',
        details: validationResult.error.format()
      }, { status: 400 });
    }
    
    // Use the validated data and add updated_at timestamp
    const validatedData = {
      ...validationResult.data,
      updated_at: new Date().toISOString()
    };
    
    // Update the buyer
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from('buyers')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await limitRequests(request, 5);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    // Validate ID parameter
    const paramResult = paramsSchema.safeParse(params);
    if (!paramResult.success) {
      return NextResponse.json({ 
        error: 'Invalid buyer ID',
        details: paramResult.error.format()
      }, { status: 400 });
    }
    
    // Check ownership
    const ownershipCheck = await checkBuyerOwnership(params.id);
    if (!ownershipCheck.authorized) {
      return NextResponse.json({ error: ownershipCheck.error }, { status: ownershipCheck.status });
    }
    
    // Delete the buyer
    const supabase = getServerSupabaseClient();
    const { error } = await supabase
      .from('buyers')
      .delete()
      .eq('id', params.id);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}