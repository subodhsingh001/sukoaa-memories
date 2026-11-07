import {NextResponse} from 'next/server';
/** Disabled intentionally: no charge or fulfillment without payment verification and print preflight. */
export async function POST(){return NextResponse.json({error:'Print ordering is not activated. A verified payment, customer-approved proof, persistent order record and provider connection are required.'},{status:503,headers:{'Cache-Control':'no-store'}})}
