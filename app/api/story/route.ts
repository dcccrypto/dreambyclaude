import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch paragraphs
    const { data: paragraphs, error: paragraphsError } = await supabase
      .from('paragraphs')
      .select('*')
      .order('sequence', { ascending: true })

    if (paragraphsError) {
      console.error('Error fetching paragraphs:', paragraphsError)
      return NextResponse.json(
        { error: 'Failed to fetch story' },
        { status: 500 }
      )
    }

    // Fetch story state for drift level and last update
    const { data: storyState, error: stateError } = await supabase
      .from('story_state')
      .select('current_drift, last_update')
      .single()

    if (stateError && stateError.code !== 'PGRST116') {
      console.error('Error fetching story state:', stateError)
    }

    return NextResponse.json({
      paragraphs: paragraphs || [],
      driftLevel: storyState?.current_drift ?? 0,
      lastUpdate: storyState?.last_update ?? null
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
