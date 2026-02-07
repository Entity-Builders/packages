import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

// Simple CSS-based ring approximation for POC
// In production, use SVG or Skia
export const SavingsRing = ({ percentage }: { percentage: number }) => {
  const isGoalMet = percentage >= 20;

  return (
    <StyledView className='items-center justify-center p-4'>
      <StyledView
        className={`w-32 h-32 rounded-full border-8 items-center justify-center ${isGoalMet ? 'border-emerald-500' : 'border-amber-500'}`}
      >
        <StyledText className='text-2xl font-bold text-white'>
          {percentage.toFixed(1)}%
        </StyledText>
        <StyledText className='text-slate-400 text-xs'>Saved</StyledText>
      </StyledView>
      <StyledText className='text-slate-400 text-sm mt-2'>
        Target: 20%
      </StyledText>
    </StyledView>
  );
};
