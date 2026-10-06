import { NextRequest, NextResponse } from 'next/server';
import { consultMachineryAI } from '@/lib/services/ai';

export async function POST(req: NextRequest) {
  try {
    const { query, projectDetails, context, role } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Query prompt is required.' }, { status: 400 });
    }

    const markdownReply = await consultMachineryAI(query.trim(), {
      projectDetails,
      context,
      role,
    });

    return NextResponse.json({
      success: true,
      data: {
        replyMarkdown: markdownReply,
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('AI Consultant API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
