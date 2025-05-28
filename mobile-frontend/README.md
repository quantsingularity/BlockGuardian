# Mobile Frontend Directory

This directory contains the React Native mobile application for BlockGuardian, providing a cross-platform mobile experience for users. The mobile frontend allows users to access BlockGuardian's security features and blockchain functionality on iOS and Android devices.

## Structure

The mobile-frontend directory follows a standard React Native project structure with Expo integration:

- **src/**: Core application source code
  - **components/**: Reusable UI components
  - **screens/**: Screen components for different app views
  - **navigation/**: Navigation configuration and routing
  - **hooks/**: Custom React hooks for shared logic
  - **services/**: API and service integrations

- **assets/**: Static assets like images, fonts, and icons
- **__tests__/**: Test files for components and functionality
- **.expo/**: Expo configuration files
- **App.js**: Main application entry point
- **app.json**: Expo application configuration
- **babel.config.js**: Babel transpiler configuration
- **tailwind.config.js**: TailwindCSS styling configuration
- **package.json**: Dependencies and scripts definition

## Purpose

The mobile frontend serves as the portable interface to the BlockGuardian platform, allowing users to:

1. **Access Security Features**: Monitor and manage blockchain security features on the go
2. **View Transactions**: Track and verify blockchain transactions
3. **Receive Alerts**: Get real-time security notifications and alerts
4. **Manage Accounts**: Handle user authentication and profile management
5. **Interact with Smart Contracts**: Execute blockchain operations through a mobile interface

The application is built with React Native and Expo to ensure cross-platform compatibility while maintaining a native feel on both iOS and Android devices.

## Development Workflow

The mobile application development follows these practices:

1. **Component-Based Architecture**: UI elements are built as reusable components
2. **Screen-Based Navigation**: App views are organized as separate screen components
3. **Service Abstraction**: Backend interactions are abstracted through service modules
4. **Responsive Design**: UI adapts to different screen sizes and orientations
5. **Testing**: Components and functionality are tested through Jest

## Dependencies

The mobile application relies on several key dependencies:

- React Native for cross-platform mobile development
- Expo for simplified build and deployment
- React Navigation for screen routing
- TailwindCSS for styling
- Jest for testing

## Getting Started

To run the mobile application locally:

1. Install dependencies: `yarn install` or `npm install`
2. Start the development server: `expo start` or `yarn start`
3. Use Expo Go app on a physical device or run in a simulator/emulator
