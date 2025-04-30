import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const AIRecommendationsScreen = ({ navigation }) => {
  return (
    <StyledView className="flex-1 items-center p-5 bg-gray-900">
      <StyledText className="text-3xl font-bold mb-8 text-white">AI Recommendations</StyledText>
      {/* Add AI recommendation components here using NativeWind */}
      <StyledView className="w-full p-4 bg-gray-800 rounded-lg mb-4">
        <StyledText className="text-xl font-semibold text-white mb-2">Investment Suggestions</StyledText>
        <StyledText className="text-gray-400">AI-driven investment suggestions will appear here.</StyledText>
      </StyledView>
      <StyledView className="w-full p-4 bg-gray-800 rounded-lg">
        <StyledText className="text-xl font-semibold text-white mb-2">Risk Assessment</StyledText>
        <StyledText className="text-gray-400">AI-powered risk assessment details will be shown here.</StyledText>
      </StyledView>
    </StyledView>
  );
};

export default AIRecommendationsScreen;

