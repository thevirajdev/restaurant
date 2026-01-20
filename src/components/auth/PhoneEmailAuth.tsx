import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    phoneEmailListener: (userObj: { user_json_url: string }) => void;
  }
}

interface PhoneEmailAuthProps {
  onSuccess?: (phone: string, userId: string, isNewUser: boolean) => void;
}

export const PhoneEmailAuth = ({ onSuccess }: PhoneEmailAuthProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePhoneVerification = useCallback(async (userObj: { user_json_url: string }) => {
    try {
      toast({
        title: "Verifying phone...",
        description: "Please wait while we verify your phone number",
      });

      const anonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
      const redirectTo = window.location.origin + '/auth';
      let { data, error } = await supabase.functions.invoke('verify-phone', {
        body: { user_json_url: userObj.user_json_url, redirect_to: redirectTo },
        headers: anonKey ? {
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        } : undefined,
      });

      // Fallback: if 401 likely due to header propagation, try direct fetch to the function URL
      if (error && (error as any)?.status === 401) {
        try {
          const fnUrl = (import.meta as any).env?.VITE_SUPABASE_URL?.replace(/\/$/, '') + '/functions/v1/verify-phone';
          const res = await fetch(fnUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(anonKey ? { 'Authorization': `Bearer ${anonKey}`, 'apikey': anonKey } : {}),
            },
            body: JSON.stringify({ user_json_url: userObj.user_json_url, redirect_to: redirectTo }),
          });
          if (res.ok) {
            data = await res.json();
            error = null as any;
          }
        } catch (e) {
          console.error('Direct function fetch failed:', e);
        }
      }

      if (error) {
        console.error('Verification error:', error);
        toast({
          title: "Verification failed",
          description: "Could not verify your phone number. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data || (data as any).error) {
        const details = (data as any)?.details || (data as any)?.error || 'Unknown error from verification service';
        console.error('Verification service returned error:', details);
        toast({
          title: "Verification failed",
          description: typeof details === 'string' ? details : 'Could not verify your phone number. Please try again.',
          variant: "destructive"
        });
        return;
      }

      // Use the token_hash to establish a session
      if (data.token_hash && data.email) {
        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink',
          email: data.email,
        });

        if (sessionError || !sessionData?.session) {
          console.error('Session error:', sessionError);
          // Fallback: open magic link directly if provided by the function
          if (data.action_link) {
            window.location.href = data.action_link as string;
            return;
          }
          toast({
            title: "Login failed",
            description: "Could not complete login. Please try again.",
            variant: "destructive"
          });
          return;
        }

        console.log('Session established:', sessionData.session?.user?.id);
      }

      if (!data.token_hash) {
        toast({
          title: "Verification incomplete",
          description: "Did not receive a login token. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Final success toasts will be handled when the auth state changes to SIGNED_IN
      if (onSuccess) {
        onSuccess(data.phone, data.user_id, data.is_new_user);
      }

    } catch (err) {
      console.error('Phone verification error:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  }, [navigate, toast, onSuccess]);

  useEffect(() => {
    window.phoneEmailListener = handlePhoneVerification;

    const existingScript = document.querySelector('script[src="https://www.phone.email/sign_in_button_v1.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.phone.email/sign_in_button_v1.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      delete window.phoneEmailListener;
    };
  }, [handlePhoneVerification]);

  // Navigate only after a real session is established
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast({
          title: "Welcome",
          description: "You are now signed in.",
        });
        navigate('/');
      }
    });
    // Also handle refresh where the session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/');
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-display text-foreground mb-2">
          Sign in with Phone
        </h2>
        <p className="text-muted-foreground">
          Verify your phone number to continue
        </p>
      </div>

      <div 
        className="pe_signin_button" 
        data-client-id="16450150466353613764"
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};
