import Head from "next/head";
import Navbar from "./Navbar";

export default function Layout({ children, darkMode, toggleDarkMode, title }) {
  const pageTitle = title
    ? `${title} - BlockGuardian`
    : "BlockGuardian - Blockchain Security & Monitoring Platform";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="BlockGuardian - Comprehensive blockchain security and monitoring platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="py-10 px-4 sm:px-6 lg:px-8">{children}</main>
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
                  © {new Date().getFullYear()} BlockGuardian. All rights
                  reserved.
                </div>
                <div className="flex space-x-6">
                  <a
                    href="/about"
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="/privacy"
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="/terms"
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                  >
                    Terms
                  </a>
                  <a
                    href="/contact"
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
