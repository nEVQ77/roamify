import './globals.css'

export const metadata = {
  title: 'Roamify - Weekend Getaway',
  description: 'Weekend Getaway Randomizer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}