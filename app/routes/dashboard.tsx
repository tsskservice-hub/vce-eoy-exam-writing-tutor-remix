import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { supabaseClient } from "../supabase";
import type { MetaFunction } from "react-router";
import TextTypeModal from "../components/TextTypeModal";
import questionsData from "../data/questions.json";
import textTypesData from "../data/texttypes.json";

// 🚀 TypeScriptのWindow型拡張（user_nickname を追加）
declare global {
  interface Window {
    difyChatbotConfig?: {
      token: string;
      baseUrl: string;
      inputs: {
        assigned_question: string;
        ocr_text: string;
        user_email: string;
        user_nickname?: string; // 👈 ニックネーム変数を追加
        is_returning_user?: string;
      };
      systemVariables?: {
        user_id: string;
      };
      userVariables?: {};
    };
  }
}

const questions = questionsData as any[];
const modalData: { [key: string]: any } = textTypesData;

export const meta: MetaFunction = () => {
  return [
    { title: "Learning Dashboard | VCE EOY Exam Writing Tutor" },
    { name: "description", content: "VCE Japanese writing practice, AI feedback, and task management portal" },
  ];
};

// --- VCE Kanji & Grammar Highlight Checker Component ---
function HighlightChecker() {
  const [text, setText] = useState(
    "私は日本へ行って、日本語の勉強をたくさんしなければなりません。"
  );

  const vceKanjiList = [
    "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "万", "本", "人", "回", "才", "円", "番", "春", "夏", "秋", "冬", "日", "月", "火", "水", "木", "金", "土", "曜", "年", "時", "分", "夕", "半", "午", "毎", "週", "間", "今", "先", "朝", "晩", "昼", "夜", "去", "目", "口", "耳", "手", "体", "上", "中", "下", "右", "左", "前", "後", "東", "西", "南", "北", "外", "学", "校", "英", "語", "文", "漢", "字", "勉", "強", "父", "母", "子", "家", "族", "兄", "弟", "姉", "妹", "友", "私", "男", "女", "大", "小", "好", "安", "高", "新", "古", "多", "少", "楽", "長", "近", "正", "広", "早", "明", "行", "来", "休", "出", "入", "生", "見", "思", "書", "言", "話", "読", "売", "買", "食", "飲", "知", "作", "住", "会", "使", "着", "発", "聞", "帰", "持", "待", "教", "乗", "働", "動", "歩", "終", "始", "泊", "洗", "立", "考", "習", "山", "川", "田", "花", "島", "海", "天", "雨", "雪", "牛", "魚", "馬", "犬", "京", "都", "市", "県", "州", "国", "町", "神", "寺", "駅", "店", "電", "車", "道", "旅", "赤", "青", "白", "黒", "色", "銀", "々", "何", "紙", "元", "気", "活", "社", "自", "物", "名", "方", "院", "所", "屋", "肉", "場", "飯", "洋", "和", "病", "次", "同", "仕", "事", "点"
  ];

  const vceGrammarList = [
    "なければなりませんでした", "なければなりません", "なくてはいけません", "たくなかったです", "いたいと思っています", "にいったことがあります", "ことがある", "ことが好きじゃないです", "ことができました", "ことができます", "ことがはじまります", "ほうがいいです", "てもいいですか", "ていただけませんか", "てくださいませんか", "いでください", "かもしれません", "たのしみにしています", "にきょうみがあります", "としてしられています", "でゆう名です", "のおかげで、", "のほかに、", "だけでなく", "とchigaimasu", "にとにています", "をつうじて", "たいです", "たくないです", "たがります", "たがっている", "つもりです", "が上手です", "下手です", "やすい", "づらい", "にくい", "が好きです", "大好です", "きらいです", "ほしいです", "がいります", "分かります", "はじめました", "おえました", "に来ます", "行きます", "てしまいます", "試してみます", "みたいです", "もいいです", "はいけません", "てはだめです", "なくてもいいです", "なくてもよかったです", "べきです", "べきじゃないです", "べきでした", "ましょう", "ましょうか", "ませんか", "てください", "すぎます", "という", "などの", "ために", "あいだ", "まえに", "あとで", "からです", "ですから", "そうだです", "らしいです", "ようです", "でしょう", "だろう", "のようです", "と思います", "と言います", "んです", "られます", "といえば、", "たとえば、", "だから、", "しかし、", "また、", "そして、", "一方、", "によると、", "として", "は一番", "ことは", "ながら", "なので、", "てから、", "でから、", "から、", "ので、", "たら、", "ば、", "でも", "ても、", "けれど", "けど", "のに", "し、", "くて", "より", "など", "ほか", "て、", "ています", "でいます", "でから、"
  ];

  const getHighlightedText = () => {
    let processedText = text;
    const placeholders: { [key: string]: string } = {};
    let placeholderIndex = 0;

    const foundUniqueGrammar = new Set<string>();
    vceGrammarList.forEach((grammar) => {
      if (processedText.includes(grammar)) {
        let canonicalGrammar = grammar;
        if (grammar === "でいます") {
          canonicalGrammar = "ています";
        } else if (grammar === "でから、") {
          canonicalGrammar = "てから、";
        }
        foundUniqueGrammar.add(canonicalGrammar);

        while (processedText.includes(grammar)) {
          const key = `__GRAMMAR_PLACEHOLDER_${placeholderIndex}__`;
          placeholders[key] = `<span style="background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 4px; padding: 2px 4px; margin: 0 2px; font-weight: bold; font-size: 20px;">${grammar}</span>`;

          const targetIndex = processedText.indexOf(grammar);
          if (targetIndex !== -1) {
            processedText =
              processedText.substring(0, targetIndex) +
              key +
              processedText.substring(targetIndex + grammar.length);
          } else {
            break;
          }
          placeholderIndex++;
        }
      }
    });

    const grammarCount = foundUniqueGrammar.size;
    const foundUniqueKanji = new Set<string>();

    vceKanjiList.forEach((kanji) => {
      const cleanCheck = processedText.replace(
        /__GRAMMAR_PLACEHOLDER_\d+__/g,
        ""
      );
      const realMatches = cleanCheck.match(
        new RegExp(kanji.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g")
      );

      if (realMatches) {
        foundUniqueKanji.add(kanji);
        while (processedText.includes(kanji)) {
          const key = `__KANJI_PLACEHOLDER_${placeholderIndex}__`;
          placeholders[key] = `<span style="background-color: #fef08a; color: #854d0e; border: 1px solid #fde047; border-radius: 4px; padding: 2px 4px; margin: 0 2px; font-weight: bold; font-size: 20px;">${kanji}</span>`;

          const targetIndex = processedText.indexOf(kanji);
          if (targetIndex !== -1) {
            processedText =
              processedText.substring(0, targetIndex) +
              key +
              processedText.substring(targetIndex + kanji.length);
          } else {
            break;
          }
          placeholderIndex++;
        }
      }
    });

    const kanjiCount = foundUniqueKanji.size;
    let finalHtml = processedText;
    Object.keys(placeholders).forEach((key) => {
      finalHtml = finalHtml.split(key).join(placeholders[key]);
    });

    return { html: finalHtml, kanjiCount, grammarCount };
  };

  const { html, kanjiCount, grammarCount } = getHighlightedText();

  return (
    <div className="mb-10 p-6 rounded-xl border-2 border-dashed border-slate-200 bg-white shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-0">
        ✨ VCE Kanji & Grammar Checker
      </h2>
      <p className="text-xl text-slate-600 mb-5">
        💡 Paste the text transcribed by your AI Tutor from the photo of your handwritten answer here to instantly check your unique VCE Kanji (🟡 Yellow) and
        VCE Grammar (🟢 Green)!
      </p>

      <div className="flex flex-col gap-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste Japanese text here..."
          className="w-full h-36 p-4 rounded-lg border border-slate-300 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y box-border bg-white text-slate-800"
        />

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex gap-4 mb-4 border-b border-slate-100 pb-3 flex-wrap">
            <span className="text-lg font-bold text-yellow-800 bg-yellow-100 px-3.5 py-1.5 rounded-md">
              🟡 Kanji Count (Unique): {kanjiCount}
            </span>
            <span className="text-lg font-bold text-green-800 bg-green-100 px-3.5 py-1.5 rounded-md">
              🟢 Grammar Count (Unique): {grammarCount}
            </span>
          </div>

          {text ? (
            <div
              className="text-[20px] leading-relaxed text-slate-700 mb-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="text-slate-400 italic mb-4 text-xl">
              Enter text to see the highlighted results here.
            </div>
          )}

          <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-lg text-red-900 leading-relaxed">
            <strong>⚠️ Note for Students:</strong> The counting is based on exact
            matches of grammar patterns and kanji. Because unexpected phrases or
            typos might occasionally trigger false matches, please use these
            numbers <strong>for reference only</strong> and double-check your
            work!
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTextType, setActiveTextType] = useState<string>("all");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>(""); // 👈 profiles 保存用 UUID
  const [userNickname, setUserNickname] = useState<string>(""); // 👈 ニックネーム用
  const [isSavingNickname, setIsSavingNickname] = useState<boolean>(false); // 👈 保存中フラグ
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState<boolean>(false);

  // 🚀 セッションを常に最新化するためのタイムスタンプStateを追加
  const [sessionKey, setSessionKey] = useState<number>(Date.now());

  // Difyに渡す選択された問題テキスト
  const assignedQuestionText = selectedQuestion 
    ? `Q${selectedQuestion.id}: ${selectedQuestion.english}` 
    : "";

  // 🚀 セッション取得後に、Difyのconfigを設定してスクリプトを動的にマウント・クリーンアップする Effect
  useEffect(() => {
    if (loading || !userEmail) return; // まだローディング中、またはメールがない場合は待機

    // 0. Difyのセッションキャッシュをブラウザのストレージから完全に削除し、以前の変数の残留を100%防止する
    if (typeof window !== "undefined") {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes("dify") || key.includes("chatbot") || key.includes("udify"))) {
          localStorage.removeItem(key);
        }
      }
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.includes("dify") || key.includes("chatbot") || key.includes("udify"))) {
          sessionStorage.removeItem(key);
        }
      }
    }

    // 1. 既存のDifyウィジェット描画要素を強制削除（古い設定のキャッシュや残留を防ぐ）
    const existingBubbleButton = document.getElementById("dify-chatbot-bubble-button");
    if (existingBubbleButton) existingBubbleButton.remove();

    const existingBubbleWindow = document.getElementById("dify-chatbot-bubble-window");
    if (existingBubbleWindow) existingBubbleWindow.remove();

    // 2. 既存のDifyスクリプトタグを完全に削除
    const existingScript = document.getElementById("rGZHq57acJlEcXgT");
    if (existingScript) existingScript.remove();

    // 🚀 ブラウザに過去の利用記録があるかチェック
    const hasVisitedBefore = typeof window !== "undefined" && localStorage.getItem("vce_ai_tutor_visited") === "true";

    // 3. window.difyChatbotConfig の初期化（確定したメールアドレス・最新の選択問題・ニックネーム・リピーター判定をセット）
    window.difyChatbotConfig = {
      token: 'rGZHq57acJlEcXgT',
      baseUrl: 'https://udify.app',
      inputs: {
        assigned_question: assignedQuestionText,
        ocr_text: "",
        user_email: userEmail,
        user_nickname: userNickname, // 👈 Difyにニックネームを自動連携！
        is_returning_user: hasVisitedBefore ? "true" : "false",
      },
      systemVariables: {
        // 🔻 修正：sessionKey を追加して選択ボタンを押すごとにフレッシュなセッションとしてDifyに認識させる
        user_id: selectedQuestion ? `${userEmail}_Q${selectedQuestion.id}_${sessionKey}` : userEmail,
      },
      userVariables: {} // 👈 オミット時の型エラー・Dify内部クラッシュを防ぐために明示的に定義
    };

    // 🚀 一度でも利用したらフラグを保存しておく
    if (typeof window !== "undefined") {
      localStorage.setItem("vce_ai_tutor_visited", "true");
    }

    // 4. 古いウィジェット要素の削除がブラウザ側で完了するのを待ってから（100msの遅延）、新しいスクリプトタグを挿入する
    const timer = setTimeout(() => {
      const script = document.createElement("script");
      script.src = "https://udify.app/embed.min.js";
      script.id = "rGZHq57acJlEcXgT";
      script.defer = true;
      script.onload = () => {
        // 🚀 Difyのスクリプトが読み込まれた後に、loadおよびDOMContentLoadedイベントを強制発火させます。
        window.dispatchEvent(new Event("load"));
        window.dispatchEvent(new Event("DOMContentLoaded"));
      };
      document.body.appendChild(script);
    }, 100);

    // クリーンアップ関数
    return () => {
      clearTimeout(timer);
      const bBtn = document.getElementById("dify-chatbot-bubble-button");
      if (bBtn) bBtn.remove();
      const bWin = document.getElementById("dify-chatbot-bubble-window");
      if (bWin) bWin.remove();
      const sEl = document.getElementById("rGZHq57acJlEcXgT");
      if (sEl) sEl.remove();
    };
  // 🔻 修正：依存配列に sessionKey を追加
  }, [loading, userEmail, userNickname, assignedQuestionText, sessionKey]);

  // 🚀 ログインセッションのチェックおよび profiles からのニックネーム取得
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        const email = session.user.email || "";
        setUserEmail(email);
        setUserId(session.user.id);

        // Supabase の profiles テーブルからニックネームを取得
        try {
          const { data, error } = await supabaseClient
            .from("profiles")
            .select("nickname")
            .eq("email", email)
            .single();

          if (data && data.nickname) {
            setUserNickname(data.nickname);
          } else {
            // 未設定の場合はメールアドレスの @ 前をデフォルト値にする
            const defaultName = email.split("@")[0];
            setUserNickname(defaultName);
          }
        } catch (err) {
          console.error("Error fetching profile nickname:", err);
        }

        setLoading(false);

        const savedModalTitle = sessionStorage.getItem("reopenModalTitle");
        if (savedModalTitle) {
          setActiveModal(savedModalTitle);
          sessionStorage.removeItem("reopenModalTitle");
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    };
    checkSession();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [navigate]);

  // 🚀 ニックネームの保存関数
  const handleSaveNickname = async () => {
    if (!userEmail || !userId) return;
    setIsSavingNickname(true);

    try {
      const { error } = await supabaseClient.from("profiles").upsert(
        {
          id: userId,
          email: userEmail,
          nickname: userNickname,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;
      alert("Preferred name saved! AI Yamato will address you by your new name starting from your next practice session (when you select a new task)! ✨");
    } catch (error: any) {
      console.error("Error saving nickname:", error);
      alert("保存に失敗しました: " + (error.message || "エラーが発生しました"));
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate("/");
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory =
      activeCategory === "all" || q.category === activeCategory;
    const matchesTextType =
      activeTextType === "all" || q.textType === activeTextType;
    return matchesCategory && matchesTextType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white font-sans">
        <h3 className="text-2xl font-semibold text-slate-700 animate-pulse">
          Checking your session... Secure Portal loading... 🔒
        </h3>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 font-sans bg-white min-h-screen text-slate-800 relative">
      {/* 🤖 Dify チャットバブル設定（デバイスごとにレスポンシブなexpand条件を適用） */}
      <style dangerouslySetInnerHTML={{ __html: `
        #dify-chatbot-bubble-button {
          background-color: #1C64F2 !important;
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 2147483647 !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
        }
        body #dify-chatbot-bubble-window {
          position: fixed !important;
          z-index: 2147483647 !important;
          ${isChatFullscreen ? `
            /* デフォルト（パソコン / 769px以上）：右側に90pxの余白を空けてアイコンを避ける */
            width: calc(100vw - 90px) !important;
            height: 100vh !important;
            max-width: calc(100vw - 90px) !important;
            max-height: 100vh !important;
            bottom: 0 !important;
            right: 90px !important;
            top: 0 !important;
            left: auto !important;
            border-radius: 0 !important;

            /* タブレット（481px 〜 768px）：余白を少し縮小して広く表示 */
            @media (max-width: 768px) {
              width: calc(100vw - 70px) !important;
              max-width: calc(100vw - 70px) !important;
              right: 70px !important;
            }

            /* スマートフォン（480px以下）：スマホではexpandを使わない仕様のため、このブロックは通常適用されません */
            @media (max-width: 480px) {
              width: 380px !important;
              height: 520px !important;
            }
          ` : `
            width: 450px !important;
            height: 620px !important;
            max-width: calc(100vw - 48px) !important;
            max-height: calc(100vh - 100px) !important;
          `}
        }

        /* 🚀 スマホのように横幅が狭い画面（480px以下）では、expand/shrinkボタンを自動的に非表示にする */
        @media (max-width: 480px) {
          #chat-resize-controls {
            display: none !important;
          }
        }
      `}} />

      {/* 🚀 チャット拡大・縮小コントロールボタン（IDを付与して480px以下で非表示に制御） */}
      <div id="chat-resize-controls" className="fixed bottom-24 right-6 z-[2147483646] pointer-events-auto flex flex-col items-center gap-1.5">
        <button
          onClick={() => setIsChatFullscreen(true)}
          className={`w-11 h-11 rounded-full shadow-2xl transition-all flex items-center justify-center cursor-pointer border-2 border-white font-black text-base ${
            isChatFullscreen
              ? "bg-slate-900 text-white ring-2 ring-blue-400"
              : "bg-blue-700 hover:bg-blue-800 text-white"
          }`}
          title="Expand Chat (大)"
        >
          <span>大</span>
        </button>
        <button
          onClick={() => setIsChatFullscreen(false)}
          className={`w-11 h-11 rounded-full shadow-2xl transition-all flex items-center justify-center cursor-pointer border-2 border-white font-black text-base ${
            !isChatFullscreen
              ? "bg-slate-900 text-white ring-2 ring-blue-400"
              : "bg-blue-700 hover:bg-blue-800 text-white"
          }`}
          title="Shrink Chat (小)"
        >
          <span>小</span>
        </button>
      </div>

      {/* 🚀 ユーザーヘッダー（メール表示 ＆ ニックネーム設定フォーム ＆ ログアウトボタン） */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-5 py-4 rounded-xl mb-6 border border-slate-200 shadow-sm gap-4">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <span className="text-base text-slate-600 font-bold">
            👤 Logged in as:{" "}
            <span className="text-slate-900 font-medium">{userEmail}</span>
          </span>

          {/* 🚀 ニックネーム入力フォーム */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <label htmlFor="nickname" className="text-sm font-bold text-indigo-900">
              🏷️ AI Preferred Name:
            </label>
            <input
              id="nickname"
              type="text"
              value={userNickname}
              onChange={(e) => setUserNickname(e.target.value)}
              placeholder="e.g. Taro"
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              onClick={handleSaveNickname}
              disabled={isSavingNickname}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingNickname ? "Saving..." : "Save Name"}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg cursor-pointer font-bold text-base transition-colors shadow-sm self-end sm:self-center"
        >
          Logout 🚪
        </button>
      </div>

      <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 m-0 mb-4 flex items-center gap-2">
          <span>📌</span> Useful Resources & Help Centre
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveModal("Genkooyooshi")}
            className="w-full text-left p-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl cursor-pointer font-bold text-lg shadow-sm transition-all box-border"
          >
            📝 How to use Genkooyooshi
          </button>
          <Link
            to="/faq"
            className="w-full p-4 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-xl no-underline font-bold text-lg block box-border shadow-sm transition-all"
          >
            <div className="text-emerald-900 mb-0.5">💡 FAQs: Exams and AI Yamato</div>
            <div className="text-sm font-normal text-emerald-700">Name rules, word counts, kanji and more</div>
          </Link>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfdNF18yTlwIrCunrkp-Cw0mspx5mP0iHtK7nPTwEcE95Gtjw/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 rounded-xl no-underline font-bold text-lg block box-border shadow-sm transition-all"
          >
            📸 Report Bug with Photo
            <div className="text-sm text-slate-500 font-normal mt-0.5">(Google account required)</div>
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfa4c9elcIiRigoMvFzHOlW1vSeYlUYvvUcV6TkdgS4TNaK7g/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 bg-white hover:bg-yellow-50 text-yellow-900 border border-yellow-200 hover:border-yellow-300 rounded-xl no-underline font-bold text-lg block box-border shadow-sm transition-all"
          >
            💬 Quick Text Feedback
            <div className="text-sm text-slate-500 font-normal mt-0.5">(No screenshot / No account needed)</div>
          </a>
        </div>
      </div>

      <div>
        {/* ガイド＆連携情報カード */}
        <div className="mb-6 p-5 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm space-y-4">
          {/* アカウント情報 */}
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg flex-wrap">
            <span>🤖</span> AI Yamato is ready for:{" "}
            <span className="font-bold text-indigo-800 underline">
              {userNickname || userEmail}
            </span>{" "}
            <span className="font-mono text-xs text-indigo-600">({userEmail})</span>
          </div>

          {/* アクティブ問題バナー */}
          <div id="active-ai-tutor-banner" className="px-4 py-3 bg-white/80 border border-indigo-200 rounded-lg text-indigo-900 text-base font-bold flex justify-between items-center shadow-xs scroll-mt-6">
            {selectedQuestion ? (
              <>
                <span>🎯 Active Question: Q{selectedQuestion.id} ({selectedQuestion.textType})</span>
                <span className="text-sm font-normal text-indigo-700 truncate max-w-md">{selectedQuestion.english}</span>
              </>
            ) : (
              <>
                <span className="text-amber-800">⚠️ Active Question: None selected</span>
                <span className="text-sm font-normal text-amber-700">Please select a question from the task list below 📋</span>
              </>
            )}
          </div>

          {/* ステップガイド */}
          <div className="pt-2 border-t border-indigo-100 text-slate-700 text-base leading-relaxed">
            <div className="mb-2 text-indigo-900 font-bold">
              To get started, please follow these two quick steps:
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-900 shrink-0">1️⃣</span>
                <div>
                  <strong>Select your question:</strong> Click the "🎯 Select for AI Tutor" button on the task below. 📋
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-900 shrink-0">2️⃣</span>
                <div>
                  <strong>Chat with AI Yamato:</strong> Open the blue chat bubble at the bottom-right of your screen (just below the 大 and 小 buttons) and upload a photo of your answer sheet. 📸
                  
                  <ul className="pl-6 mt-2.5 space-y-1.5 list-disc text-sm text-slate-600">
                    <li>
                      <strong>Image Quality:</strong> Ensure your uploaded image is clear and legible.
                    </li>
                    <li>
                      <strong>Orientation:</strong> Check that your image is in the correct landscape or portrait mode.
                    </li>
                    <li>
                      <strong>AI Reading:</strong> Minor errors in handwriting or character count (±20 chars) may occur. Let AI Yamato know if something is off.
                    </li>
                    <li>
                      <strong>System Performance:</strong> If AI Yamato responds slowly, fails to load, or loses track of the question during a long chat, simply close the chat bubble and start a fresh practice session! 🔄
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 VCE Kanji & Grammar Checker */}
      <div className="mb-12">
        <HighlightChecker />
      </div>

      <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-6">
        <h1 className="text-slate-800 text-2xl sm:text-3xl font-bold m-0">
          📚 Task List
        </h1>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-lg font-bold text-slate-600">
          Filter by Writing Style
        </div>
        <div className="flex gap-2.5 flex-wrap mb-4">
          {[
            "all",
            "Informative",
            "Evaluative",
            "Persuasive",
            "Personal",
            "Imaginative",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-base font-bold cursor-pointer transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        <div className="mb-2 text-lg font-bold text-slate-600">
          Filter by Text Type
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {[
            "all",
            "Speech",
            "Email",
            "Letter",
            "Article",
            "Journal",
            "Essay",
            "Story",
            "Report",
            "Account",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTextType(type)}
              className={`px-4 py-2 rounded-lg text-base font-bold cursor-pointer transition-colors ${
                activeTextType === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      <div id="text-type-instruction" className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-lg text-emerald-800 flex items-center gap-3 shadow-sm">
        <span className="text-xl">💡</span>
        <span>
          Click on the green text type tag on each question to see what is
          required for that text type and view a sample.
        </span>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        {filteredQuestions.map((q) => {
          const isSelected = selectedQuestion?.id === q.id;
          return (
            <div
              key={q.id}
              className={`p-6 border rounded-xl bg-white shadow-sm transition-all ${
                isSelected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-base bg-sky-100 text-sky-800 px-3 py-1 rounded-md font-bold">
                    {q.category}
                  </span>
                  <span
                    onClick={() => setActiveModal(q.textType)}
                    className="text-base bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-bold cursor-pointer hover:bg-emerald-200 transition-colors"
                  >
                    {q.textType}
                  </span>
                </div>
                <span className="text-lg text-slate-600 font-bold">
                  Q{q.id}
                </span>
              </div>

              <p className="text-[20px] text-slate-800 mb-3 leading-relaxed font-medium">
                {q.english}
              </p>

              <div
                className="text-lg sm:text-[20px] text-slate-700 mb-4 border-l-4 border-slate-200 pl-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: q.japanese }}
              />

              <button
                onClick={() => {
                  setSelectedQuestion(q);
                  setSessionKey(Date.now()); // 👈 🔻 修正：ボタンクリックのたびにタイムスタンプを更新して新セッションを作成
                  const banner = document.getElementById("active-ai-tutor-banner");
                  if (banner) {
                    banner.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`px-4 py-2 text-base rounded-lg cursor-pointer font-bold transition-colors shadow-sm ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-700"
                }`}
              >
                {isSelected ? "🤖 Currently Active in AI Tutor Bubble" : "🎯 Select for AI Tutor"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 🚀 上に戻るボタン（右上に配置） */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed top-6 right-6 z-50 p-3.5 bg-white hover:bg-slate-50 rounded-full shadow-xl cursor-pointer transition-all flex items-center justify-center w-12 h-12 border-2 border-red-500"
          aria-label="Scroll to top"
        >
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </button>
      )}

      {activeModal && modalData[activeModal] && (
        <TextTypeModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          modalKey={activeModal}
          {...modalData[activeModal]}
        />
      )}
    </main>
  );
}