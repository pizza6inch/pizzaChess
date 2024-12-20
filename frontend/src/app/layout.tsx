import type { Metadata } from 'next'
// import localFont from "next/font/local";
import '@/app/global.css'
import { Abril_Fatface, Open_Sans } from 'next/font/google'

import ClientProviders from '@/contexts/ClientProviders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Header from '@/components/Header'

export const OpenSans = Open_Sans({
  weight: '400',
  subsets: ['latin'],
})

export const AbrilFatface = Abril_Fatface({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&text=menu,chess_pawn,rule,home,logout,group,account_circle,settings,close"
        />
      </head>
      <body className={OpenSans.className}>
        <ClientProviders>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
          />
          <Header />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
