import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const PortfolioScreen = ({ navigation }) => {
  return (
    <StyledView className="flex-1 items-center p-5 bg-gray-900">
      <StyledText className="text-3xl font-bold mb-8 text-white">Portfolio</StyledText>
      {/* Add portfolio details and components here using NativeWind */}
      <StyledText className="text-gray-400">Portfolio details will be displayed here.</StyledText>
    </StyledView>
  );
};

export default PortfolioScreen;

