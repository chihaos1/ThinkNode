import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://pyttsgyipqucjfplsdhf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dHRzZ3lpcHF1Y2pmcGxzZGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5OTIxMDcsImV4cCI6MjA4MDU2ODEwN30.5dixGrvbeJ8wJXEunrMsBjS0KcnP5UHYQYFjtPw2VO8"

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
)

