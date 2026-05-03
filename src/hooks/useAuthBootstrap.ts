import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

/**
 * Sets up the global auth listener. Call once in App.
 * Also fetches the user's role from the user_roles table to determine admin status.
 */
export function useAuthBootstrap() {
  const { setUser, setSession, setIsAdmin } = useAuthStore();

  useEffect(() => {
    const fetchRole = async (userId: string | undefined) => {
      if (!userId) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Defer to avoid deadlocks inside the callback
      setTimeout(() => fetchRole(session?.user?.id), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setIsAdmin]);
}
