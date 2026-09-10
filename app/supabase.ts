// app/supabase.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ybquwzoreecxxbewjpdn.supabase.co";

// 修正済み anon キー（"in" の文字エラーを修正）
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicXV3em9yZWVjeHhiZXdqcGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTA5NDksImV4cCI6MjEwMjI2Njk0OX0.OHz5CEV9CLO02vzP4FOBCwPSs-aHuDOZtgobfiO5VM0";

// アプリ内で唯一のインスタンスとしてエクスポート
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { experimental: { passkey: true } },
});