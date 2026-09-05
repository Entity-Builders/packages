import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styled } from 'nativewind';
import { convertArsToUsd } from '@entity-builders/logic';
import { useCurrency } from './context/CurrencyContext';

const StyledView = styled(View);
const StyledText = styled(Text);

interface Expense {
  id: string;
  name: string;
  amountARS: number;
}

export const ExpenseList = ({
  expenses,
  dolarMep,
}: {
  expenses: Expense[];
  dolarMep: number;
}) => {
  const { currency } = useCurrency();
  const renderItem = ({ item }: { item: Expense }) => {
    const usdAmount = convertArsToUsd(item.amountARS, dolarMep);
    const isUsd = currency === 'USD';

    const primaryAmount = isUsd ? usdAmount : item.amountARS;
    const secondaryAmount = isUsd ? item.amountARS : usdAmount;

    return (
      <StyledView className='flex-row justify-between items-center py-4 border-b border-slate-700'>
        <StyledText className='text-white font-medium'>{item.name}</StyledText>
        <StyledView className='items-end'>
          <StyledText className='text-white font-bold'>
            {isUsd ? 'US$ ' : '$ '}
            {primaryAmount.toLocaleString(isUsd ? 'en-US' : 'es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </StyledText>
          <StyledView className='bg-slate-700 px-2 py-0.5 rounded mt-1'>
            <StyledText className='text-emerald-400 text-xs font-bold'>
              {isUsd ? '$ ' : 'US$ '}
              {secondaryAmount.toLocaleString(isUsd ? 'es-AR' : 'en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    );
  };

  return (
    <StyledView className='bg-[#222332] rounded-[24px] p-5 border border-slate-800 shadow-sm'>
      <StyledText className='text-slate-400 text-xs font-bold uppercase tracking-wider mb-4'>
        Recent Expenses
      </StyledText>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </StyledView>
  );
};
