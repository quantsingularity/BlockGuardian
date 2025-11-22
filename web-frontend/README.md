# Web Frontend Directory

This directory contains the web-based user interface for the BlockGuardian platform, built using Next.js and React. The web frontend provides the primary interface for users to interact with the BlockGuardian security features, blockchain explorer, and account management functionality.

## Structure

The web-frontend directory follows a standard Next.js project structure:

- **components/**: Reusable React components
  - **BlockchainExplorer.js**: Component for exploring and visualizing blockchain data
  - **Navbar.js**: Navigation component for the application
  - **WalletConnection.js**: UI component for connecting to blockchain wallets
  - **WalletProvider.js**: Context provider for wallet integration

- **pages/**: Next.js page components that define application routes
- **styles/**: CSS and styling files, including Tailwind CSS configurations
- \***\*tests**/\*\*: Test files for components and pages
- \***\*mocks**/\*\*: Mock data and functions for testing

- **Dockerfile**: Container definition for deploying the frontend
- **next.config.js**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **jest.config.js**: Jest testing framework configuration
- **package.json**: Dependencies and scripts definition

## Purpose

The web frontend serves as the main user interface for the BlockGuardian platform, allowing users to:

1. **Monitor Security**: View and manage blockchain security features and alerts
2. **Explore Blockchain**: Visualize and analyze blockchain transactions and smart contracts
3. **Manage Accounts**: Handle user authentication, profiles, and settings
4. **Connect Wallets**: Integrate with various blockchain wallets for transaction signing
5. **View Analytics**: Access security analytics and reporting dashboards

The application is built with modern web technologies to ensure a responsive, accessible, and secure user experience across different devices and browsers.

## Development Workflow

The web frontend development follows these practices:

1. **Component-Based Architecture**: UI elements are built as reusable React components
2. **Server-Side Rendering**: Utilizes Next.js for improved performance and SEO
3. **Responsive Design**: Uses Tailwind CSS for adaptive layouts across devices
4. **Testing**: Components and pages are tested with Jest and React Testing Library
5. **Docker Integration**: Containerized for consistent deployment across environments

## Dependencies

The web application relies on several key technologies:

- Next.js for server-side rendering and routing
- React for component-based UI development
- Tailwind CSS for styling
- ethers.js for blockchain interactions
- Jest for testing

## Getting Started

To run the web application locally:

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`
4. Run production build: `npm start`
