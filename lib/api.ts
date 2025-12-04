export async function fetchData() {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
}

export async function addItem(type: 'memories' | 'notes' | 'calendarEvents', item: any) {
    const res = await fetch('/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, item }),
    });
    if (!res.ok) throw new Error('Failed to add item');
    return res.json();
}
