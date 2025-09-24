const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

// Cliente com service key para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente com anon key para operações normais
const supabase = createClient(supabaseUrl, env.SUPABASE_ANON_KEY);

module.exports = {
  supabase,
  supabaseAdmin
};