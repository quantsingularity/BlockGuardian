import React from 'react';
import { View, Text, Button } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(Button); // Limited styling

const DashboardScreen = ({ navigation }) => {
  return (
    <StyledView className="flex-1 items-center p-5 bg-gray-900">
      <StyledText className="text-3xl font-bold mb-8 text-white">Dashboard</StyledText>
      {/* Add dashboard widgets/components here using NativeWind */}
      <StyledView className="w-full mb-4 bg-blue-600 rounded-lg overflow-hidden">
        <StyledButton title="Go to Portfolio" onPress={() => navigation.navigate('Portfolio')} color="#ffffff" />
      </StyledView>
      <StyledView className="w-full mb-4 bg-blue-600 rounded-lg overflow-hidden">
        <StyledButton title="Go to Market Analysis" onPress={() => navigation.navigate('MarketAnalysis')} color="#ffffff" />
      </StyledView>
      <StyledView className="w-full mb-4 bg-blue-600 rounded-lg overflow-hidden">
        <StyledButton title="Go to Blockchain Explorer" onPress={() => navigation.navigate('BlockchainExplorer')} color="#ffffff" />
      </StyledView>
      <StyledView className="w-full mb-4 bg-blue-600 rounded-lg overflow-hidden">
        <StyledButton title="Go to AI Recommendations" onPress={() => navigation.navigate('AIRecommendations')} color="#ffffff" />
      </StyledView>
      {/* Add other navigation buttons as needed */}
    </StyledView>
  );
};

export default DashboardScreen;

