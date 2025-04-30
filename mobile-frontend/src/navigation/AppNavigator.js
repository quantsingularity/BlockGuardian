import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import MarketAnalysisScreen from '../screens/MarketAnalysisScreen';
import BlockchainExplorerScreen from '../screens/BlockchainExplorerScreen';
import AIRecommendationsScreen from '../screens/AIRecommendationsScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e', // Example header color
          },
          headerTintColor: '#fff', // Example header text color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Portfolio" component={PortfolioScreen} />
        <Stack.Screen name="MarketAnalysis" component={MarketAnalysisScreen} options={{ title: 'Market Analysis' }}/>
        <Stack.Screen name="BlockchainExplorer" component={BlockchainExplorerScreen} options={{ title: 'Blockchain Explorer' }}/>
        <Stack.Screen name="AIRecommendations" component={AIRecommendationsScreen} options={{ title: 'AI Recommendations' }}/>
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Panel' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

