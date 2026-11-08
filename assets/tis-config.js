/* ============================================================================
 * Techinverse Solutions — backend configuration
 * ----------------------------------------------------------------------------
 * THIS IS THE ONLY FILE YOU NEED TO EDIT TO CONNECT THE SHARED BACKEND.
 *
 * Fill in the two values below from your Supabase project:
 *   Supabase dashboard -> Project Settings -> API
 *     - "Project URL"      -> SUPABASE_URL
 *     - "anon public" key  -> SUPABASE_ANON_KEY
 *
 * Until both are filled in, the site keeps working exactly as before
 * (products are read from the built-in catalog and admin edits are saved
 * only in the browser that made them). Once filled in, every admin edit is
 * saved to the shared database and appears on the live site for everyone.
 *
 * The anon key is designed to be public — it is safe to commit. It only
 * grants what your Row Level Security policies allow (see supabase/schema.sql).
 * ========================================================================== */
window.TIS_CONFIG = {
    /* e.g. 'https://abcdefghijklmnop.supabase.co'  (no trailing slash) */
    SUPABASE_URL: '',

    /* e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....' */
    SUPABASE_ANON_KEY: '',

    /* Storage bucket for product images (create it as a PUBLIC bucket). */
    STORAGE_BUCKET: 'product-images',

    /* ---------------------------------------------------------------------
     * Admin password — used ONLY when Supabase is not configured, or when
     * you choose "password mode" below. Change it here.
     * ------------------------------------------------------------------- */
    ADMIN_PASSWORD: 'admin123',

    /* 'supabase' = log in with the email + password of a Supabase Auth user
     *              (recommended once Supabase is connected — real security)
     * 'password' = simple shared password from ADMIN_PASSWORD above
     *              (works with no backend, but it is a client-side gate only)
     */
    ADMIN_AUTH_MODE: 'supabase'
};
