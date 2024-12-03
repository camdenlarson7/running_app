export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Run Tracker</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
