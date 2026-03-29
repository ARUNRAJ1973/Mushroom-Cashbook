import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://iqrxydxqzftcoedgpnfj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxcnh5ZHhxemZ0Y29lZGdwbmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjQzMTUsImV4cCI6MjA4OTg0MDMxNX0.Sdjw_Ua26Bh7iixvRKzKFjBSYkj9fiJi_EM8lthfUVY"
)