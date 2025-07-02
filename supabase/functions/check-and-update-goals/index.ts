// services/check-and-update-goals/index.ts (in your Supabase Edge Functions folder)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''; // Use service role key!

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // create a Supabase client with the service role key
  // this client has elevated privileges and can bypass RLS,
  // which is necessary to call the SECURITY DEFINER function.
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {

    // call the PostgreSQL function
    const { error } = await supabaseAdmin.rpc('update_expired_goals');

    if (error) {
      console.error('Error calling update_expired_goals function:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log('Successfully ran update_expired_goals function.');
    return new Response(
      JSON.stringify({ message: 'Expired goals checked and updated successfully.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Unhandled error in check-and-update-goals Edge Function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});