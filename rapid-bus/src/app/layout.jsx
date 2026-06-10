import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata = {
  title: "RapidBus - Book intercity travel",
  description: "Book your high-speed intercity travel in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-mesh min-h-screen text-on-surface font-body-md pb-20">
        <LanguageProvider>
          <div className="overflow-x-hidden min-h-screen">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
