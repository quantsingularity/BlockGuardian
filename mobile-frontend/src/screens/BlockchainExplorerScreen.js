import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const BlockchainExplorerScreen = ({ navigation }) => {
  return (
    <StyledView className="flex-1 items-center p-5 bg-gray-900">
      <StyledText className="text-3xl font-bold mb-8 text-white">Blockchain Explorer</StyledText>
      {/* Add blockchain explorer components here using NativeWind */}
      <StyledView className="w-full p-4 bg-gray-800 rounded-lg mb-4">
        <StyledText className="text-xl font-semibold text-white mb-2">Transaction Search</StyledText>
        <StyledText className="text-gray-400">Search functionality will be here.</StyledText>
      </StyledView>
      <StyledView className="w-full p-4 bg-gray-800 rounded-lg">
        <StyledText className="text-xl font-semibold text-white mb-2">Latest Blocks</StyledText>
        <StyledText className="text-gray-400">Latest block information will be displayed here.</StyledText>
      </StyledView>
    </StyledView>
  );
};

export default BlockchainExplorerScreen;

