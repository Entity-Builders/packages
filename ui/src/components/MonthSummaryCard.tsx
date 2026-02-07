import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useCurrency } from '../context/CurrencyContext';
import { convertArsToUsd } from '@eb-packages/logic';

const StyledView = styled(View);
const StyledText = styled(Text);

export interface MonthSummaryProps {
  estimatedEarnings: number;
  workedHours: number;
  totalHours: number;
  missingEarnings: number;
  daysLeft: number;
  progressPercentage: number;
}

export const MonthSummaryCard = ({
  estimatedEarnings,
  workedHours,
  totalHours,
  missingEarnings,
  daysLeft,
  progressPercentage,
  dolarMep = 1150,
}: MonthSummaryProps & { dolarMep?: number }) => {
  const { currency } = useCurrency();
  const isUsd = currency === 'USD';

  const displayEarnings = isUsd
    ? convertArsToUsd(estimatedEarnings, dolarMep)
    : estimatedEarnings;
  const displayMissing = isUsd
    ? convertArsToUsd(missingEarnings, dolarMep)
    : missingEarnings;

  return (
    <StyledView className='bg-[#222332] p-5 rounded-[24px] mb-4 shadow-sm border border-slate-800'>
      <StyledText className='text-slate-400 text-sm font-medium mb-1'>
        Tu Mes en Cifras
      </StyledText>
      <StyledText className='text-3xl font-bold text-white mb-1'>
        {isUsd ? 'US$ ' : '$ '}
        {displayEarnings.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </StyledText>
      <StyledText className='text-slate-500 text-xs mb-5 font-medium'>
        Ganancia Estimada del Mes
      </StyledText>

      <StyledView className='flex-row justify-between mb-2 items-end'>
        <StyledView>
          <StyledText className='text-slate-400 text-[10px] uppercase font-bold text-xs'>
            Trabajado:{' '}
            <StyledText className='text-white'>{workedHours}hs</StyledText>{' '}
            <StyledText className='text-slate-500'>/ {totalHours}hs</StyledText>
          </StyledText>
        </StyledView>
        <StyledView>
          <StyledText className='text-slate-400 text-[10px] text-right'>
            Faltan:{' '}
            {displayMissing.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
              maximumFractionDigits: 0,
            })}{' '}
            / {daysLeft} Días
          </StyledText>
        </StyledView>
      </StyledView>

      {/* Progress Bar */}
      <StyledView className='h-2 bg-[#2D2E3F] rounded-full overflow-hidden mb-1'>
        <StyledView
          className='h-full bg-[#22C55E] rounded-full'
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </StyledView>

      <StyledText className='text-slate-500 text-[10px] text-center mt-1'>
        {progressPercentage.toFixed(0)}%
      </StyledText>
    </StyledView>
  );
};
