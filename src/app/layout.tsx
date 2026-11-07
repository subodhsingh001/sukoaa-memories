import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'SUKOAA Memories — Your private memory space',description:'A private, local-first photo playground. No uploads. Just memories.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
