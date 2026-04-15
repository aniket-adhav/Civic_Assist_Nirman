import "../src/index.css";

export const metadata = {
  title: "CivicAssist - Community Issue Reporting",
  description: "Report, track, and discuss local civic issues with CivicAssist.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}