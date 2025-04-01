import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tzsmhrvusihuoqbifmpc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c21ocnZ1c2lodW9xYmlmbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDQxMDAsImV4cCI6MjA1Nzk4MDEwMH0.K6emfisOYmQfbChpheYAFQjYS01o-UY0nMYacN_H8nM';

export const supabase = createClient(supabaseUrl, supabaseKey); 