import { NextResponse } from 'next/server';
import { client } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { automationId, template } = await req.json();
    const user = await client.user.findFirst();
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const savedTemplate = await client.template.upsert({
      where: { id: automationId },
      update: {
        ...template,
        buttons: JSON.stringify(template.buttons),
        userId: user.id,
        automationId: automationId
      },
      create: {
        id: automationId,
        ...template,
        buttons: JSON.stringify(template.buttons),
        userId: user.id,
        automationId: automationId
      }
    });

    return NextResponse.json(savedTemplate);
  } catch (error) {
    console.error('Template save error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const automationId = searchParams.get('automationId');

    const template = await client.template.findUnique({
      where: { id: automationId! }
    });

    if (!template) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      ...template,
      buttons: template.buttons ? JSON.parse(template.buttons as string) : []
    });
  } catch (error) {
    console.error('Template fetch error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}