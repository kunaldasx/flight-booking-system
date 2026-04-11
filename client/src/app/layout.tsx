import { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold">✈️ Flight Booking System</h1>
              <nav className="flex items-center gap-2">
                <a
                  href="/flights"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors"
                >
                  Flights
                </a>

                <a
                  href="/selected-flights"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors"
                >
                  Selected Flights
                </a>

                <a
                  href="/bookings"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors"
                >
                  All Bookings
                </a>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
