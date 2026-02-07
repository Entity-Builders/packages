import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import Svg, { Circle, G } from 'react-native-svg';

const StyledView = styled(View);
const StyledText = styled(Text);

export interface MonotributoProps {
  percentage: number; // 0-100
  limit: number;
  currentConsumption: number;
  category: string;
}

export const MonotributoCard = ({
  percentage,
  limit,
  currentConsumption,
  category,
}: MonotributoProps) => {
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color logic based on risk
  let strokeColor = '#10B981'; // emerald-500
  if (percentage > 70) strokeColor = '#F59E0B'; // amber-500
  if (percentage > 90) strokeColor = '#EF4444'; // red-500

  return (
    <StyledView className='bg-[#222332] p-5 rounded-[24px] shadow-sm mb-4 border border-slate-800 flex-row items-center'>
      {/* Circular Progress */}
      <View className='mr-6'>
        <Svg
          width={radius * 2 + 20}
          height={radius * 2 + 20}
          viewBox={`0 0 ${radius * 2 + 20} ${radius * 2 + 20}`}
        >
          <G rotation='-90' originX={radius + 10} originY={radius + 10}>
            <Circle
              cx={radius + 10}
              cy={radius + 10}
              r={radius}
              stroke='#2D2E3F'
              strokeWidth={strokeWidth}
              fill='transparent'
            />
            <Circle
              cx={radius + 10}
              cy={radius + 10}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill='transparent'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='round'
            />
          </G>
        </Svg>
        <View className='absolute inset-0 items-center justify-center'>
          <StyledText className='text-[#FACC15] font-bold text-xl'>
            {percentage.toFixed(1)}%
          </StyledText>
        </View>
      </View>

      {/* Info */}
      <StyledView className='flex-1 justify-center'>
        <StyledText className='text-white font-bold text-base mb-1'>
          Termómetro{'\n'}Monotributo
        </StyledText>
        <StyledText
          className={`font-semibold mb-2 text-xs ${percentage > 70 ? 'text-[#FACC15]' : 'text-slate-400'}`}
        >
          {percentage > 90
            ? 'Riesgo Crítico'
            : percentage > 70
              ? 'Riesgo Recategorización'
              : 'Sin Riesgo Inmediato'}
        </StyledText>

        <StyledText className='text-slate-500 text-[10px] mb-2 font-medium'>
          LT2M: ${' '}
          {currentConsumption.toLocaleString('es-AR', {
            maximumFractionDigits: 0,
          })}{' '}
          / $ {limit.toLocaleString('es-AR', { maximumFractionDigits: 0 })} (Cat{' '}
          {category})
        </StyledText>

        {percentage > 85 && (
          <StyledText className='text-[#FACC15] text-[10px] font-bold'>
            ¡Atención! Cerca del límite.
          </StyledText>
        )}
      </StyledView>
    </StyledView>
  );
};
