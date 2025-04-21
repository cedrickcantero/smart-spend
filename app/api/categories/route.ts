import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { CategoriesService } from "@/lib/services/categories-service";

// Add Cache-Control header with a reasonable TTL
const CACHE_MAX_AGE = 60; // 1 minute in seconds

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const categories = await CategoriesService.getCategories(userId, supabase);
        
        // Add error check for the categories result
        if ('error' in categories) {
            console.error('Error in categories service:', categories.error);
            return NextResponse.json({ error: categories.error }, { status: 500 });
        }

        // Return data with cache headers
        return NextResponse.json(categories, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`,
                'Vary': 'Authorization'
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const body = await request.json();
        
        // Basic validation
        if (!body.name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }
        
        const categoryData = {
            ...body,
            user_id: userId
        };
        
        const category = await CategoriesService.createCategory(categoryData, supabase);
        
        // Check for errors in the result
        if ('error' in category) {
            return NextResponse.json({ error: category.error }, { status: 500 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ 
            error: 'Failed to create category',
            details: error instanceof Error ? error.message : undefined
        }, { status: 500 });
    }
}
