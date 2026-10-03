
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wdgcinzryjetigjjxdua.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_h3i_YlWHwy4nKgB0Gm-4dw_4EfPCIlk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)