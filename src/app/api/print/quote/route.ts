import {NextResponse} from 'next/server';
/** No fabricated prices: the route stays unavailable until a printer is configured. */
export async function POST(){return NextResponse.json({error:'Live print quotes are not configured. Printer product catalog, shipping destination, taxes and provider credentials are required. No payment has been taken.'},{status:503,headers:{'Cache-Control':'no-store'}})}
