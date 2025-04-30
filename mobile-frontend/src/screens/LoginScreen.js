import React from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(Button); // Note: Button styling is limited in RN
const StyledTextInput = styled(TextInput);

const LoginScreen = ({ navigation }) => {
  // Placeholder login logic
  const handleLogin = () => {
    // Navigate to Dashboard after successful login (replace with actual logic)
    navigation.navigate('Dashboard'); // Navigate for now to test flow
    console.log('Login button pressed');
  };

  return (
    <StyledView className="flex-1 justify-center items-center p-5 bg-gray-900">
      <StyledText className="text-3xl font-bold mb-8 text-white">BlockGuardian Login</StyledText>
      <StyledTextInput
        className="w-full h-12 border border-gray-600 rounded-lg px-4 mb-4 text-white bg-gray-800"
        placeholder="Username or Email"
        placeholderTextColor="#9ca3af" // gray-400
        // Add value and onChangeText props for state management
      />
      <StyledTextInput
        className="w-full h-12 border border-gray-600 rounded-lg px-4 mb-6 text-white bg-gray-800"
        placeholder="Password"
        placeholderTextColor="#9ca3af" // gray-400
        secureTextEntry
        // Add value and onChangeText props for state management
      />
      {/* Using a View for Button styling as direct Button styling is limited */}
      <StyledView className="w-full bg-blue-600 rounded-lg overflow-hidden">
        <StyledButton title="Login" onPress={handleLogin} color="#ffffff" />
      </StyledView>
      {/* Add registration/forgot password links if needed */}
      <StyledText className="text-blue-400 mt-4">Forgot Password?</StyledText>
      <StyledText className="text-blue-400 mt-2">Register</StyledText>
    </StyledView>
  );
};

export default LoginScreen;

