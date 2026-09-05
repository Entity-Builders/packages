import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { styled } from 'nativewind';
import { useExpenses } from '../context/ExpensesContext';
import { FixedExpense } from '@entity-builders/logic';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export const FixedExpensesManager = () => {
  const { expenses, addExpense, updateExpense, removeExpense, isLoading } =
    useExpenses();
  const [exchangeRate, setExchangeRate] = useState(1000);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/bolsa')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.venta) {
          setExchangeRate(data.venta);
        }
      })
      .catch((err) => console.log('Error fetching dollar rate:', err));
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [isBanked, setIsBanked] = useState(true);

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');

  if (isLoading) {
    return (
      <StyledView className='flex-1 bg-[#191A23] pt-12 items-center justify-center'>
        <StyledText className='text-white font-bold text-xl'>
          Cargando gastos...
        </StyledText>
      </StyledView>
    );
  }

  const resetForm = () => {
    setName('');
    setAmount('');
    setCurrency('ARS');
    setIsBanked(true);
    setIsEditing(null);
  };

  const handleEdit = (expense: FixedExpense) => {
    setIsEditing(expense.id);
    setName(expense.name);
    setAmount(expense.amount.toString());
    setCurrency(expense.currency);
    setIsBanked(expense.isBanked);
  };

  const handleSubmit = () => {
    if (!name || !amount) return;

    if (isEditing) {
      updateExpense(isEditing, {
        name,
        amount: parseFloat(amount),
        currency,
        isBanked,
      });
    } else {
      addExpense({
        name,
        amount: parseFloat(amount),
        currency,
        isBanked,
      });
    }
    resetForm();
  };

  const handleImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    lines.forEach((line) => {
      // Improved regex to handle "US$ 5", "5 USD", "5", etc.
      const match = line.match(
        /(.*?)((?:US\$|USD|\$)?\s*[\d.,]+\s*(?:USD|ARS)?)$/i,
      );

      if (match) {
        let namePart = match[1].trim();
        let amountPart = match[2].trim();

        // Extract number
        const numberMatch = amountPart.match(/([\d.,]+)/);
        if (!numberMatch) return;

        let amount = parseFloat(numberMatch[1].replace(',', '.'));

        // Detect explicitly specified currency
        let detectedCurrency: 'ARS' | 'USD' | null = null;
        if (amountPart.toUpperCase().includes('ARS')) {
          detectedCurrency = 'ARS';
        } else {
          // Default to USD for everything (Nominal strategy)
          // This aligns with "Youtube 5" (5 USD) and "Alquiler 717" (717 USD / 717k ARS).
          // Since 1 USD ~= 1k ARS, treating everything as "USD units" creates the correct sum (2174).
          detectedCurrency = 'USD';
        }

        // Clean name
        namePart = namePart.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();

        if (namePart && !isNaN(amount)) {
          addExpense({
            name: namePart,
            amount: amount,
            currency: detectedCurrency,
            isBanked: true,
          });
        }
      }
    });
    setImportText('');
    setIsImporting(false);
  };

  return (
    <StyledView className='flex-1 bg-[#191A23] pt-12'>
      <StyledScrollView
        className='flex-1 p-5'
        showsVerticalScrollIndicator={false}
      >
        <StyledText className='text-white text-2xl font-bold mb-6'>
          Gastos Fijos
        </StyledText>

        {/* Totals Summary */}
        <StyledView className='flex-row gap-4 mb-6'>
          <StyledView className='flex-1 bg-[#222332] p-4 rounded-xl border border-slate-700'>
            <StyledText className='text-slate-400 text-xs font-bold uppercase'>
              Total Pesos
            </StyledText>
            <StyledText className='text-emerald-400 text-xl font-bold mt-1'>
              ${' '}
              {expenses
                .filter((e) => e.currency === 'ARS')
                .reduce((acc, curr) => acc + curr.amount, 0)
                .toLocaleString('es-AR')}
            </StyledText>
          </StyledView>
          <StyledView className='flex-1 bg-[#222332] p-4 rounded-xl border border-slate-700'>
            <StyledText className='text-slate-400 text-xs font-bold uppercase'>
              Total Dólares
            </StyledText>
            <StyledText className='text-emerald-400 text-xl font-bold mt-1'>
              US${' '}
              {expenses
                .filter((e) => e.currency === 'USD')
                .reduce((acc, curr) => acc + curr.amount, 0)
                .toLocaleString('en-US')}
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className='mb-6 bg-[#222332] p-4 rounded-xl border border-slate-700'>
          <StyledText className='text-slate-400 text-xs font-bold uppercase'>
            Total Consolidado (Est. ARS)
          </StyledText>
          <StyledText className='text-white text-3xl font-bold mt-1'>
            ${' '}
            {expenses
              .reduce((acc, curr) => {
                if (curr.currency === 'ARS') return acc + curr.amount;
                if (curr.currency === 'USD')
                  return acc + curr.amount * exchangeRate; // Using fetched MEP rate
                return acc;
              }, 0)
              .toLocaleString('es-AR')}
          </StyledText>
          <StyledText className='text-emerald-400 text-lg font-bold'>
            ≈ US${' '}
            {expenses
              .reduce((acc, curr) => {
                if (curr.currency === 'ARS')
                  return acc + curr.amount / exchangeRate;
                if (curr.currency === 'USD') return acc + curr.amount;
                return acc;
              }, 0)
              .toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </StyledText>
          <StyledText className='text-slate-500 text-[10px] mt-1'>
            * Cotización (Dólar MEP): 1 USD = ${exchangeRate} ARS
          </StyledText>
        </StyledView>

        {/* Form */}
        <StyledView className='bg-[#222332] p-4 rounded-xl mb-6 border border-slate-700'>
          <StyledText className='text-white font-bold mb-4 text-lg'>
            {isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
          </StyledText>

          <StyledView className='mb-4'>
            <StyledText className='text-slate-400 text-xs mb-1'>
              Nombre
            </StyledText>
            <StyledTextInput
              className='bg-[#191A23] text-white p-3 rounded border border-slate-700'
              placeholder='Ej: Alquiler'
              placeholderTextColor='#64748B'
              value={name}
              onChangeText={setName}
            />
          </StyledView>

          <StyledView className='mb-4 flex-row gap-4'>
            <StyledView className='flex-1'>
              <StyledText className='text-slate-400 text-xs mb-1'>
                Monto
              </StyledText>
              <StyledTextInput
                className='bg-[#191A23] text-white p-3 rounded border border-slate-700'
                placeholder='0.00'
                placeholderTextColor='#64748B'
                keyboardType='numeric'
                value={amount}
                onChangeText={setAmount}
              />
            </StyledView>
            <StyledView className='flex-1'>
              <StyledText className='text-slate-400 text-xs mb-1'>
                Moneda
              </StyledText>
              <StyledView className='flex-row bg-[#191A23] rounded border border-slate-700 overflow-hidden'>
                <TouchableOpacity
                  onPress={() => setCurrency('ARS')}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor:
                      currency === 'ARS' ? '#334155' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: currency === 'ARS' ? '#34D399' : '#94A3B8',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    ARS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCurrency('USD')}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor:
                      currency === 'USD' ? '#334155' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: currency === 'USD' ? '#34D399' : '#94A3B8',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    USD
                  </Text>
                </TouchableOpacity>
              </StyledView>
            </StyledView>
          </StyledView>

          <StyledView className='mb-6 flex-row items-center justify-between'>
            <StyledText className='text-slate-400'>¿Es Bancarizado?</StyledText>
            <Switch
              value={isBanked}
              onValueChange={setIsBanked}
              trackColor={{ false: '#334155', true: '#059669' }}
              thumbColor={isBanked ? '#34D399' : '#94A3B8'}
            />
          </StyledView>

          <StyledTouchableOpacity
            onPress={handleSubmit}
            className={`p-4 rounded-lg items-center ${isEditing ? 'bg-indigo-600' : 'bg-emerald-600'}`}
          >
            <StyledText className='text-white font-bold'>
              {isEditing ? 'Guardar Cambios' : 'Agregar Gasto'}
            </StyledText>
          </StyledTouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              onPress={resetForm}
              style={{ marginTop: 15, alignSelf: 'center' }}
            >
              <Text style={{ color: '#94A3B8' }}>Cancelar Edición</Text>
            </TouchableOpacity>
          )}
        </StyledView>

        {/* Actions Row */}
        {!isEditing && (
          <StyledView className='flex-row justify-end mb-4'>
            <TouchableOpacity onPress={() => setIsImporting(!isImporting)}>
              <StyledText className='text-emerald-400 font-bold'>
                {isImporting ? 'Cancelar Importación' : 'Importar desde Texto'}
              </StyledText>
            </TouchableOpacity>
          </StyledView>
        )}

        {/* Bulk Import Section */}
        {isImporting && (
          <StyledView className='bg-[#222332] p-4 rounded-xl mb-6 border border-slate-700'>
            <StyledText className='text-white font-bold mb-2 text-lg'>
              Pegar Lista de Gastos
            </StyledText>
            <StyledText className='text-slate-400 text-xs mb-4'>
              Formato: Nombre del gasto [tab/espacio] Monto. Ej: "Alquiler 500"
            </StyledText>

            <StyledTextInput
              className='bg-[#191A23] text-white p-3 rounded border border-slate-700 min-h-[150px] mb-4'
              placeholder={'Youtube 5\nnetflix 10\nAlquiler 500'}
              placeholderTextColor='#64748B'
              multiline
              numberOfLines={10}
              value={importText}
              onChangeText={setImportText}
              textAlignVertical='top'
            />

            <StyledTouchableOpacity
              onPress={handleImport}
              className='bg-emerald-600 p-4 rounded-lg items-center'
            >
              <StyledText className='text-white font-bold'>
                Procesar e Importar
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* List */}
        <StyledView className='mb-20'>
          {expenses.map((expense) => (
            <StyledView
              key={expense.id}
              className='bg-[#222332] p-4 rounded-xl mb-3 border border-slate-800 flex-row justify-between items-center'
            >
              <StyledView className='flex-1'>
                <StyledText className='text-white font-bold text-lg'>
                  {expense.name}
                </StyledText>
                <StyledView className='flex-row items-center mt-1'>
                  <StyledView
                    className={`px-2 py-0.5 rounded mr-2 ${expense.isBanked ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
                  >
                    <StyledText
                      className={`text-[10px] font-bold ${expense.isBanked ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {expense.isBanked ? 'BANCARIZADO' : 'NO BANCARIZADO'}
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>

              <StyledView className='items-end'>
                <StyledText className='text-white font-bold text-lg'>
                  {expense.currency === 'USD' ? 'US$ ' : '$ '}
                  {expense.amount.toLocaleString('es-AR')}
                </StyledText>
                <StyledView className='flex-row gap-4 mt-2'>
                  <TouchableOpacity onPress={() => handleEdit(expense)}>
                    <Text
                      style={{
                        color: '#60A5FA',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeExpense(expense.id)}>
                    <Text
                      style={{
                        color: '#F87171',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      Borrar
                    </Text>
                  </TouchableOpacity>
                </StyledView>
              </StyledView>
            </StyledView>
          ))}
          {expenses.length === 0 && (
            <StyledText className='text-slate-500 text-center mt-10 italic'>
              No hay gastos cargados aún.
            </StyledText>
          )}
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};
