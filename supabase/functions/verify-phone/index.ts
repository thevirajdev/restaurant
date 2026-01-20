import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_json_url, redirect_to } = await req.json();
    
    if (!user_json_url) {
      return new Response(
        JSON.stringify({ error: 'user_json_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching phone verification data from:', user_json_url);

    const response = await fetch(user_json_url);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await response.json();
    console.log('Phone verification data received:', JSON.stringify(userData));

    const countryCode = (userData.user_country_code || '').replace('+', '').trim();
    const phoneNumber = (userData.user_phone_number || '').trim();
    const firstName = (userData.user_first_name || '').trim();
    const lastName = (userData.user_last_name || '').trim();

    const rawPhone = `${countryCode}${phoneNumber}`;
    const fullPhone = `+${rawPhone}`;
    const generatedEmail = `phone_${rawPhone}@aurelia.app`;

    console.log('Verified phone:', fullPhone, 'Email:', generatedEmail);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const normalizePhone = (value: string | null | undefined) => {
      const v = (value || '').trim();
      if (!v) return '';
      return v.startsWith('+') ? v : `+${v.replace(/^\+/, '')}`;
    };

    const stripPlus = (value: string | null | undefined) => (value || '').replace(/^\+/, '').trim();

    const findExistingUser = async (email: string, fullPhone: string, rawPhone: string) => {
      // Supabase Admin API doesn't support direct lookup by email/phone in this runtime,
      // so we paginate through users and match.
      const perPage = 200;
      const maxPages = 20;

      for (let page = 1; page <= maxPages; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) {
          console.error('Error listing users:', error);
          break;
        }

        const match = data.users.find((u) => {
          if ((u.email || '').toLowerCase() === email.toLowerCase()) return true;
          const uPhone = normalizePhone(u.phone);
          return uPhone === fullPhone || stripPlus(u.phone) === rawPhone;
        });

        if (match) return match;

        if (data.users.length < perPage) break; // no more pages
      }

      return null;
    };


    // Find existing user
    let existingUser = await findExistingUser(generatedEmail, fullPhone, rawPhone);

    let userId: string;
    let isNewUser = false;
    const fullName = `${firstName} ${lastName}`.trim();

    // IMPORTANT: the email used to generate the magic link MUST match the user we found/created.
    let loginEmail = generatedEmail;

    if (existingUser) {
      userId = existingUser.id;
      loginEmail = existingUser.email || generatedEmail;
      console.log('Found existing user:', userId, 'email:', loginEmail);

      // Ensure phone is set/normalized
      const existingPhoneNormalized = normalizePhone(existingUser.phone);
      if (!existingPhoneNormalized || existingPhoneNormalized !== fullPhone) {
        await supabase.auth.admin.updateUserById(userId, {
          phone: fullPhone,
          phone_confirm: true,
        });
      }

      // If user has no email (rare), set our generated one so magic link works reliably
      if (!existingUser.email) {
        await supabase.auth.admin.updateUserById(userId, {
          email: generatedEmail,
          email_confirm: true,
        });
        loginEmail = generatedEmail;
      }
    } else {
      console.log('Creating new user with phone:', fullPhone);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: generatedEmail,
        email_confirm: true,
        phone: fullPhone,
        phone_confirm: true,
        user_metadata: {
          phone: fullPhone,
          full_name: fullName,
        },
      });

      if (authError) {
        // If phone already exists, recover by locating that user and proceeding.
        if ((authError as any)?.code === 'phone_exists') {
          console.warn('Phone already exists; attempting to find existing user by phone...');
          existingUser = await findExistingUser(generatedEmail, fullPhone, rawPhone);

          if (existingUser) {
            userId = existingUser.id;
            loginEmail = existingUser.email || generatedEmail;
            console.log('Recovered existing user:', userId, 'email:', loginEmail);
          } else {
            console.error('phone_exists but could not locate user via listUsers');
            return new Response(
              JSON.stringify({
                error: 'Login failed',
                details: 'Phone is already registered. Please contact support.',
              }),
              { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          console.error('Error creating user:', authError);
          return new Response(
            JSON.stringify({ error: 'Failed to create user account', details: authError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        userId = authData.user.id;
        isNewUser = true;
        console.log('New user created:', userId);
      }
    }

    // Update profile (best-effort)
    await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        phone: fullPhone,
        email: loginEmail,
      })
      .eq('user_id', userId);

    // Generate magic link for sign-in
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: loginEmail,
      options: redirect_to ? { redirectTo: redirect_to } : undefined,
    });

    if (linkError) {
      console.error('Error generating magic link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate login link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenHash = linkData.properties?.hashed_token || '';
    const actionLink = (linkData.properties as any)?.action_link || '';

    console.log('Generated magic link for user:', userId, 'email:', loginEmail);

    return new Response(
      JSON.stringify({
        success: true,
        phone: fullPhone,
        user_id: userId,
        is_new_user: isNewUser,
        first_name: firstName,
        last_name: lastName,
        token_hash: tokenHash,
        action_link: actionLink,
        email: loginEmail,
        message: 'Phone verified successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );


  } catch (error) {
    console.error('Error in verify-phone function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
