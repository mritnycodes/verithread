import './globals.css';

export const metadata = {
  title: 'VeriThread',
  description: 'Verifiable social feed on Algorand',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}