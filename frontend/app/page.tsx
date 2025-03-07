import Image from "next/image";
import TokenFeed from "@/components/TokenFeed";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header/Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Voysa
              </h1>
              <p className="mt-3 text-lg">
                Real-Time Sui Blockchain Monitor
              </p>
              <p className="mt-2 max-w-xl text-sm text-blue-100">
                Track new token launches, protocol deployments, and blockchain activity on Sui
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Connect Wallet
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">Latest Token Launches</h2>
          <TokenFeed />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Voysa. All rights reserved.
              </p>
            </div>
            <div className="mt-4 flex justify-center md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500 mx-2">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 mx-2">
                Discord
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 mx-2">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}