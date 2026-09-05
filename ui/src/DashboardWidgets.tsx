import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useCurrency } from './context/CurrencyContext';
import { convertArsToUsd } from '@entity-builders/logic';

const StyledView = styled(View);
const StyledText = styled(Text);

export const LaPostaWidget = ({ liquidity }: { liquidity: number }) => {
  const { currency } = useCurrency();
  const isUsd = currency === 'USD';
  const DOLAR_MEP = 1150; // Should be consistent

  const displayValue = isUsd
    ? convertArsToUsd(liquidity, DOLAR_MEP)
    : liquidity;

  return (
    <StyledView className='bg-slate-800 p-6 rounded-2xl shadow-lg mb-4 border border-slate-700'>
      <StyledText className='text-slate-400 text-sm font-medium uppercase tracking-wider mb-2'>
        La Posta (Real Liquidity)
      </StyledText>
      <StyledText className='text-4xl font-bold text-emerald-400'>
        {isUsd ? 'US$ ' : '$ '}
        {displayValue.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </StyledText>
      <StyledText className='text-slate-500 text-xs mt-2'>
        Current Balance - Expenses - Taxes
      </StyledText>
    </StyledView>
  );
};

export const ProjectionCard = ({
  hours,
  total,
  isDanger,
}: {
  hours: number;
  total: number;
  isDanger: boolean;
}) => {
  const { currency } = useCurrency();
  const isUsd = currency === 'USD';
  const DOLAR_MEP = 1150;

  const displayTotal = isUsd ? convertArsToUsd(total, DOLAR_MEP) : total;

  return (
    <StyledView
      className={`p-6 rounded-2xl shadow-lg mb-4 border ${isDanger ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}
    >
      <StyledText className='text-slate-400 text-sm font-medium uppercase tracking-wider mb-2'>
        Monthly Projection
      </StyledText>
      <StyledText className='text-2xl font-bold text-white mb-1'>
        {isUsd ? 'US$ ' : '$ '}
        {displayTotal.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </StyledText>
      <StyledText
        className={isDanger ? 'text-red-400 text-sm' : 'text-slate-400 text-sm'}
      >
        Working {hours}hs/day
      </StyledText>
    </StyledView>
  );
};
