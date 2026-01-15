import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: paragraphs, error } = await supabase
      .from('paragraphs')
      .select('*')
      .order('sequence', { ascending: true })

    if (error) {
      console.error('Error fetching paragraphs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch story' },
        { status: 500 }
      )
    }

    return NextResponse.json(paragraphs || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
