import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import Svg, { Circle, G } from 'react-native-svg';

import { useCurrency } from '../context/CurrencyContext';
import { convertArsToUsd } from '@eb-packages/logic';

const StyledView = styled(View);
const StyledText = styled(Text);

// Simple Donut implementation for now
// In real app, might want a robust library or more complex svg logic
const SimpleDonut = ({
  data,
}: {
  data: { value: number; color: string }[];
}) => {
  const radius = 40;
  const strokeWidth = 25;
  const circumference = 2 * Math.PI * radius;

  let startAngle = 0;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Svg width='100' height='100' viewBox='0 0 100 100'>
      <G rotation='-90' origin='50, 50'>
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const currentStartAngle = startAngle;
          startAngle += percentage * 360;

          return (
            <Circle
              key={index}
              cx='50'
              cy='50'
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill='transparent'
              strokeDasharray={strokeDasharray}
              strokeDashoffset={-1 * (currentStartAngle / 360) * circumference}
            />
          );
        })}
      </G>
    </Svg>
  );
};

export interface FinancialOverviewProps {
  liquidity: number;
  grossIncome: number;
  expenses: { label: string; value: number; color: string }[];
}

export const FinancialOverviewCard = ({
  liquidity,
  grossIncome,
  expenses,
}: FinancialOverviewProps) => {
  // Calculate breakdown based on expenses + liquidity + tax(implicit)
  // For the POC visual, we use the passed expenses data for the chart

  const { currency } = useCurrency();
  const isUsd = currency === 'USD';
  // Hardcoded MEP for POC, ideally comes from props or context
  const DOLAR_MEP = 1150;

  const displayLiquidity = isUsd
    ? convertArsToUsd(liquidity, DOLAR_MEP)
    : liquidity;
  const displayGrossIncome = isUsd
    ? convertArsToUsd(grossIncome, DOLAR_MEP)
    : grossIncome;

  return (
    <StyledView className='bg-[#222332] p-5 rounded-[24px] shadow-sm mb-4 border border-slate-800 flex-row'>
      {/* Left: Liquidity */}
      <StyledView className='flex-1 mr-2 justify-center'>
        <StyledView className='flex-row items-center mb-1'>
          <StyledText className='text-white font-bold text-base mr-2'>
            Liquidez Ya
          </StyledText>
          {/* Check icon placeholder */}
          <StyledText className='text-slate-400 text-xs'>✔</StyledText>
        </StyledView>

        <StyledText className='text-2xl font-bold text-[#22C55E] mb-1 tracking-tight'>
          {isUsd ? 'US$ ' : '$ '}
          {displayLiquidity.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </StyledText>
        <StyledText className='text-slate-500 text-[10px] mb-3 leading-3 font-medium'>
          Guita Real en Mano{'\n'}Después de Gastos Fijos + Impuestos
        </StyledText>

        <StyledView className='mt-1'>
          <StyledText className='text-white font-bold text-base'>
            {isUsd ? 'US$ ' : '$ '}
            {displayGrossIncome.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
              maximumFractionDigits: 0,
            })}{' '}
            {currency}
          </StyledText>
          <StyledText className='text-slate-500 text-[10px] font-medium'>
            {isUsd
              ? `≈ $ ${grossIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })} ARS`
              : `≥ $ ${(grossIncome / 1150).toFixed(0)} USD`}
          </StyledText>
        </StyledView>
      </StyledView>

      {/* Right: Chart & Legend */}
      <StyledView className='items-center justify-center w-[40%]'>
        <StyledText className='text-white font-medium mb-3 text-xs self-center'>
          Tus Gastos
        </StyledText>
        {/* @ts-ignore - NativeWind typing issue */}
        <View className='items-center justify-center'>
          <SimpleDonut
            data={expenses.map((e) => ({ value: e.value, color: e.color }))}
          />
        </View>

        {/* Mini Legend */}
        <StyledView className='mt-3 flex-wrap flex-row justify-center'>
          <StyledText className='text-[9px] text-slate-500 text-center leading-3'>
            {expenses[0].label.split(' ')[0]} ({expenses[0].value}%)
            {'\n'}
            {expenses[1].label.split(' ')[0]} ({expenses[1].value}%)
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};
