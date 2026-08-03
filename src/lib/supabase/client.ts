import { createBrowserClient } from "@supabase/ssr";

// Supabase publishable credentials are intentionally safe for browser bundles.
const projectUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://buiwhojoaofwblfwvchb.supabase.co";
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_lKalMnWvnjhOYBD2BDuJMw_kl_EpC9V";

export function hasSupabaseConfig() {
  return Boolean(projectUrl && publishableKey);
}

export function createClient() {
  return createBrowserClient(projectUrl, publishableKey);
}
