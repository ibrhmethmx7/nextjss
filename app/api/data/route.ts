import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, item } = body; // type: 'memories' | 'notes' | 'calendarEvents'

        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);

        if (!data[type]) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        // Add ID if missing
        if (!item.id && type !== 'calendarEvents') {
            item.id = Date.now();
        }

        data[type].push(item);

        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true, data: data[type] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
