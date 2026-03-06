import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rpqhceaezxlekrnwpvwt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_d_oOZ3JAZVTHXn9KrVoTlg_ga6XC0a9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
