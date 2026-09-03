import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createClient } from "@supabase/supabase-js";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "ログイン / 新規登録 | VCE EOY Exam Writing Tutor" },
    { name: "description", content: "Passkey認証による安全なログインと新規登録ポータル" },
  ];
};

// Supabase の接続情報
const SUPABASE_URL = "https://ybquwzoreecxxbewjpdn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicXV3em9yZWVjeHhiZXdqcGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTA5NDksImV4cCI6MjEwMjI2Njk0OX0.OHz5CEV9CLO02vzP4FOBCwPSs-aHuDOZtgobfiO5VM0";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { experimental: { passkey: true } },
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [logMessage, setLogMessage] = useState<string>("Ready");
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  // すでにセッションがある場合は学習ダッシュボードへ自動遷移
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (session) {
        navigate("/dashboard");
      } else {
        setPageLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  // purchases テーブルからメールアドレスを検索
  const checkPurchase = async (targetEmail: string): Promise<boolean> => {
    if (!targetEmail) return false;

    const { data, error } = await supabaseClient
      .from("purchases")
      .select("*")
      .eq("email", targetEmail)
      .maybeSingle();

    if (error) {
      console.error("Purchase check error:", error.message);
      return false;
    }
    return !!data;
  };

  // 1. 新規登録（購入確認 ➔ アカウント作成 ➔ パスキー登録 ➔ ダッシュボードへ）
  const handleSignUpAndRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setLoading(true);
    setLogMessage("Checking purchase history in database... 🔍");

    try {
      // purchases テーブルのチェック
      const hasPurchased = await checkPurchase(email.trim());
      if (!hasPurchased) {
        throw new Error(
          "Your email is not registered in our purchase database. Please purchase the app first!"
        );
      }

      setLogMessage("Creating your account in progress... ⚙️");
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

      const { data: signUpData, error: signUpError } =
        await supabaseClient.auth.signUp({
          email: email.trim(),
          password: tempPassword,
        });

      if (signUpError) throw signUpError;

      if (!signUpData.session) {
        throw new Error(
          "Account created successfully, but auth session failed to initialize. Please sign in again."
        );
      }

      setLogMessage(
        "Account created! Prompting passkey registration dialog... 🔑"
      );

      // パスキーの登録
      const { data: registerData, error: registerError } =
        await supabaseClient.auth.registerPasskey();
      if (registerError) throw registerError;

      setLogMessage(
        "Passkey registration succeeded! Redirecting to your dashboard... 🎉"
      );
      alert(
        "Your Passkey has been successfully registered! Redirecting to study dashboard..."
      );
      navigate("/dashboard");
    } catch (err: any) {
      setLogMessage(`Registration Error: ${err.message}`);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. パスキーログイン（一発生体認証 ➔ 成功したら自動ダッシュボード遷移）
  const handlePasskeyLogin = async () => {
    setLoading(true);
    setLogMessage("Calling passkey biometric authentication... 📡");

    try {
      const { data, error } = await supabaseClient.auth.signInWithPasskey();
      if (error) throw error;

      setLogMessage("Passkey login succeeded! Loading dashboard... 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      setLogMessage(`Login Error: ${err.message}`);
      alert(`Login Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-700 font-sans">
        <h3 className="text-lg font-semibold animate-pulse">
          Loading JA AI Tutor portal... 🔒
        </h3>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12 font-sans">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
        📝 VCE Japanese AI Tutor
      </h2>

      {/* 新規登録カード */}
      <div className="bg-white border border-slate-200 p-6 mb-6 rounded-2xl shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mt-0 mb-2">
          Sign Up (First-time Users)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Enter the email address you used during purchase. The system will
          verify your registration, create an account, and guide you to secure
          biometric Passkey setup.
        </p>
        <form onSubmit={handleSignUpAndRegisterPasskey}>
          <input
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full px-3.5 py-2.5 mb-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 box-border"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all border ${
              loading
                ? "bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed"
                : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
            }`}
          >
            {loading ? "Processing..." : "Create Account & Register Passkey"}
          </button>
        </form>
      </div>

      {/* ログインカード */}
      <div className="bg-white border border-slate-200 p-6 mb-6 rounded-2xl shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mt-0 mb-2">
          Passkey Login (Registered Users)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          If you have already registered a biometric passkey on this device,
          click the button below to sign in instantly without any password or
          verification codes.
        </p>
        <button
          onClick={handlePasskeyLogin}
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "Processing..." : "🔑 Sign In with Passkey"}
        </button>
      </div>

      {/* システムログ */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-slate-500 mb-2">
          System Portal Log
        </h4>
        <pre className="bg-slate-900 text-sky-400 p-3.5 rounded-lg text-xs overflow-x-auto m-0 border border-slate-800 font-mono">
          {logMessage}
        </pre>
      </div>
    </main>
  );
}