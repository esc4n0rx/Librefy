const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const supabase = createClient(supabaseUrl, env.SUPABASE_ANON_KEY);

module.exports = {
  supabase,
  supabaseAdmin
};