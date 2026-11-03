// Edge Function `delete-account`: Verdrahtung mit Supabase (service_role). Logik und Tests: handler.ts / handler.test.ts.
// Deploy: npx supabase functions deploy delete-account
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { createDeleteAccountHandler } from './handler.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const bucket = admin.storage.from('submissions');
const PAGE = 1000;

Deno.serve(
  createDeleteAccountHandler({
    async resolveUser(token) {
      const { data, error } = await admin.auth.getUser(token);
      return error ? null : (data.user?.id ?? null);
    },
    async listImages(userId) {
      const paths: string[] = [];
      for (let offset = 0; ; offset += PAGE) {
        const { data, error } = await bucket.list(userId, { limit: PAGE, offset });
        if (error) throw new Error(error.message);
        paths.push(...data.map((f) => `${userId}/${f.name}`));
        if (data.length < PAGE) return paths;
      }
    },
    async removeImages(paths) {
      const { error } = await bucket.remove(paths);
      if (error) throw new Error(error.message);
    },
    async deleteUser(userId) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);
    },
  }),
);
