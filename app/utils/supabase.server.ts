// app/utils/supabase.server.ts
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

// Remixのサーバー側でSupabaseクライアントを作成し、セッション（ログイン中のユーザー）を取得する関数
export async function getSupabaseUserSession(request: Request) {
  const headers = new Headers();

  // Supabaseと連携するための環境変数を取得（Cloudflareの環境変数またはprocess.envに対応）
  // ※Cloudflare Pagesの場合はコンテキスト経由等で渡す場合がありますが、
  //   @supabase/ssr を使う場合の一般的なサーバーサイド初期化の枠組みです。
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          headers.append("Set-Cookie", serializeCookieHeader(name, value, options));
        });
      },
    },
  });

  // 現在ログインしているユーザー情報を取得
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null; // ログインしていない場合
  }

  return {
    user: {
      email: user.email, // ここでメールアドレスを取得
      id: user.id,
    },
    headers,
  };
}