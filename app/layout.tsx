import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
const sans=Manrope({variable:"--font-sans",subsets:["cyrillic","latin"]});
const serif=Cormorant_Garamond({variable:"--font-serif",subsets:["cyrillic","latin"],weight:["500","600"],style:["italic","normal"]});
export async function generateMetadata():Promise<Metadata>{const h=await headers();const host=h.get("x-forwarded-host")||h.get("host")||"localhost:3000";const protocol=h.get("x-forwarded-proto")||"http";return {metadataBase:new URL(`${protocol}://${host}`),title:"DentaFlow — стоматология нового поколения",description:"Точная стоматология с человеческим отношением во Владивостоке.",icons:{icon:"/favicon.svg"},openGraph:{title:"DentaFlow",description:"Улыбка, в которой вы.",images:[{url:"/og.png",width:1200,height:630}]},twitter:{card:"summary_large_image",title:"DentaFlow",description:"Улыбка, в которой вы.",images:["/og.png"]}}}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>}
