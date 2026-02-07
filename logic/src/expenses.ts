import { supabase } from './supabase';
import { FixedExpense } from './finance-engine';

export const getFixedExpenses = async (): Promise<FixedExpense[]> => {
  const { data, error } = await supabase.from('fixed_expenses').select('*');

  if (error) {
    console.error('Error fetching fixed expenses:', error);
    throw error;
  }

  // Map DB fields to FixedExpense interface
  // Note: DB doesn't currently store currency or isBanked, providing defaults
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    amount: Number(item.amount),
    currency: 'ARS',
    isBanked: false,
  }));
};

export const createFixedExpense = async (
  expense: Omit<FixedExpense, 'id'>,
): Promise<FixedExpense> => {
  console.log('Creating fixed expense with payload:', {
    name: expense.name,
    amount: expense.amount,
  });

  const { data, error } = await supabase
    .from('fixed_expenses')
    .insert({
      name: expense.name,
      amount: expense.amount,
      // user_id is handled by default auth.uid() in the table definition
      // TODO: Add currency and is_banked when schema supports it
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating fixed expense:', error);
    throw error;
  }

  console.log('Fixed expense created successfully:', data);

  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    currency: 'USD',
    isBanked: false,
  };
};

export const updateFixedExpense = async (
  id: string,
  updates: Partial<FixedExpense>,
): Promise<FixedExpense> => {
  console.log('Updating fixed expense:', { id, updates });

  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  // payload.currency = updates.currency; // DB missing
  // payload.is_banked = updates.isBanked; // DB missing

  console.log('Update payload:', payload);

  const { data, error } = await supabase
    .from('fixed_expenses')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating fixed expense:', error);
    throw error;
  }

  console.log('Fixed expense updated successfully:', data);

  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    currency: 'ARS',
    isBanked: false,
  };
};

export const deleteFixedExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);

  if (error) {
    console.error('Error deleting fixed expense:', error);
    throw error;
  }
};
