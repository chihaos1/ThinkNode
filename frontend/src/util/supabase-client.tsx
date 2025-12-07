import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
    "https://pyttsgyipqucjfplsdhf.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dHRzZ3lpcHF1Y2pmcGxzZGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5OTIxMDcsImV4cCI6MjA4MDU2ODEwN30.5dixGrvbeJ8wJXEunrMsBjS0KcnP5UHYQYFjtPw2VO8"
)