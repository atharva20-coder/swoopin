import { NextResponse } from 'next/server';
import { client } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { automationId: string } }) {
  try {
    const { automationId } = params;

    const template = await client.template.findUnique({
      where: { id: automationId }
    });

    if (!template) {
      return NextResponse.json({ template: null });
    }

    return NextResponse.json({
      template: {
        ...template,
        buttons: template.buttons ? JSON.parse(template.buttons as string) : []
      }
    });
  } catch (error) {
    console.error('Template fetch error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}