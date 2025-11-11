import { supabase } from './supabase';

export async function notifySubscribers(subject: string, message: string, type: 'new_book' | 'price_drop' | 'announcement') {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`;

    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subject, message, type })
    });

    const result = await response.json();
    console.log('Newsletter notification result:', result);
    return result;
  } catch (error) {
    console.error('Error sending newsletter:', error);
    throw error;
  }
}
