import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { styled } from 'nativewind';
import { useCurrency } from '../context/CurrencyContext';

const StyledView = styled(View);
const StyledText = styled(Text);

export const DashboardHeader = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <StyledView className='mb-6'>
      {/* Top Row */}
      <StyledView className='flex-row justify-between w-full items-center mb-6'>
        <StyledText className='text-slate-400 text-xs font-medium'>
          Mié. 28 ENE
        </StyledText>
        <StyledText className='text-white text-xl font-bold tracking-tight'>
          GuitaControl
        </StyledText>
        <StyledView className='flex-row items-center gap-4'>
          {/* Currency Toggle */}
          <StyledView className='flex-row items-center bg-slate-800 rounded-full px-3 py-1 border border-slate-700 mx-2'>
            <StyledText
              className={`text-xs mr-2 font-bold ${currency === 'ARS' ? 'text-emerald-400' : 'text-slate-500'}`}
              onPress={toggleCurrency}
            >
              ARS
            </StyledText>

            <TouchableOpacity
              onPress={toggleCurrency}
              activeOpacity={0.8}
              style={[
                {
                  width: 44,
                  height: 24,
                  backgroundColor: '#334155',
                  borderRadius: 999,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                  marginHorizontal: 4,
                  borderWidth: 1,
                  borderColor: '#475569',
                },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
            >
              <View
                style={[
                  {
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#10B981',
                    alignSelf: currency === 'USD' ? 'flex-end' : 'flex-start',
                  },
                  Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                    },
                    android: {
                      elevation: 2,
                    },
                    web: {
                      boxShadow: '0px 1px 1.41px rgba(0, 0, 0, 0.2)',
                    },
                  }),
                ]}
              />
            </TouchableOpacity>

            <StyledText
              className={`text-xs ml-2 font-bold ${currency === 'USD' ? 'text-emerald-400' : 'text-slate-500'}`}
              onPress={toggleCurrency}
            >
              USD
            </StyledText>
          </StyledView>

          <StyledView className='w-8 h-8 rounded-full border border-slate-600 items-center justify-center'>
            {/* User Icon Placeholder */}
            <StyledText className='text-slate-300 text-xs'>👤</StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* User Info */}
      <StyledView className='items-center'>
        {/* Flag Placeholder */}
        <StyledText className='text-lg mb-1'>🇦🇷</StyledText>
        <StyledText className='text-slate-200 text-sm font-medium mb-0.5'>
          Juan Manuel Obrach
        </StyledText>
        <StyledText className='text-slate-500 text-xs tracking-wide'>
          CUIT: 20-3502422-8
        </StyledText>
      </StyledView>
    </StyledView>
  );
};
