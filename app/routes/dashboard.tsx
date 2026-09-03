import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { createClient } from "@supabase/supabase-js";
import type { MetaFunction } from "react-router";
import TextTypeModal from "../components/TextTypeModal";
import questionsData from "../data/questions.json";
// 📝 モーダル用のテキストデータをインポート（ふりがな付きのJSONがあればそちらを指定してください）
import textTypesData from "../data/texttypes.json";

const questions = questionsData as any[];
const modalData: { [key: string]: any } = textTypesData;

export const meta: MetaFunction = () => {
  return [
    { title: "学習ダッシュボード | VCE EOY Exam Writing Tutor" },
    { name: "description", content: "VCE Japaneseのライティング学習、添削、およびタスク管理ポータル" },
  ];
};

// Supabase の接続情報
const SUPABASE_URL = "https://ybquwzoreecxxbewjpdn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicXV3em9yZWVjeHhiZXdqcGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTA5NDksImV4cCI6MjEwMjI2Njk0OX0.OHz5CEV9CLO02vzP4FOBCwPSs-aHuDOZtgobfiO5VM0";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { experimental: { passkey: true } },
});

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
        Paste text here to accurately highlight unique VCE Kanji (🟡 Yellow) and
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

  // ログイン監視（セキュリティ保護＆セッションガード）
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        setUserEmail(session.user.email || "");
        setLoading(false);

        const savedModalTitle = sessionStorage.getItem("reopenModalTitle");
        if (savedModalTitle) {
          setActiveModal(savedModalTitle);
          sessionStorage.removeItem("reopenModalTitle");
        }
      }
    };
    checkSession();
  }, [navigate]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate("/");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied! Please paste it into the chat.");
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
    <main className="max-w-4xl mx-auto px-4 py-8 font-sans bg-white min-h-screen text-slate-800">
      {/* ログイン情報 & ログアウトヘッダー */}
      <div className="flex justify-between items-center bg-white px-5 py-3 rounded-xl mb-6 border border-slate-200 shadow-sm">
        <span className="text-lg text-slate-600 font-bold">
          👤 Logged in as:{" "}
          <span className="text-slate-900 font-medium">{userEmail}</span>
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer font-bold text-base transition-colors shadow-sm"
        >
          Logout 🚪
        </button>
      </div>

      {/* 📝 Genkooyooshi & 💡 FAQ セクション（横並び） */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <button
            onClick={() => setActiveModal("Genkooyooshi")}
            className="w-full h-full py-4 px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl cursor-pointer font-bold text-lg shadow-sm transition-colors box-border"
          >
            📝 How to use Genkooyooshi
          </button>
        </div>

        <div className="flex-[2] min-w-[300px] p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center box-border shadow-sm">
          <div>
            <h3 className="m-0 mb-1 text-lg font-bold text-emerald-900">
              💡 Exam Writing FAQs?
            </h3>
            <p className="m-0 text-lg text-emerald-700">
              Name rules, word counts, kanji & text types.
            </p>
          </div>
          <Link
            to="/faq"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg no-underline font-bold text-lg whitespace-nowrap shadow-sm transition-colors"
          >
            View FAQs →
          </Link>
        </div>
      </div>

      {/* 📝 2つのグーグルフォームボタン（横並び） */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfdNF18yTlwIrCunrkp-Cw0mspx5mP0iHtK7nPTwEcE95Gtjw/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[240px] block p-5 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-500 hover:border-blue-600 rounded-xl no-underline font-bold text-lg text-center box-border shadow-sm transition-all"
        >
          📸 Report Bug with Photo
          <br />
          <span className="text-sm text-slate-500 font-normal">
            (Google account required)
          </span>
        </a>

        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfa4c9elcIiRigoMvFzHOlW1vSeYlUYvvUcV6TkdgS4TNaK7g/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[240px] block p-5 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-500 hover:border-emerald-600 rounded-xl no-underline font-bold text-lg text-center box-border shadow-sm transition-all"
        >
          💬 Quick Text Feedback
          <br />
          <span className="text-sm text-slate-500 font-normal">
            (No screenshot / No account needed)
          </span>
        </a>
      </div>

      {/* Difyチャットボット埋め込み */}
      <div className="h-[700px] mb-6 border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <iframe
          src="https://udify.app/chatbot/rGZHq57acJlEcXgT"
          className="w-full h-full border-none"
          allow="microphone; clipboard-write"
        />
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-6 text-lg text-amber-900 leading-relaxed shadow-sm">
        <strong>📌 Notice</strong>
        <ul className="m-0 mt-2 pl-5 space-y-1">
          <li>
            <strong>Image Quality:</strong> Ensure your uploaded image is clear
            and legible.
          </li>
          <li>
            <strong>Orientation:</strong> Check that your image is in the
            correct landscape or portrait mode.
          </li>
          <li>
            <strong>AI Reading:</strong> Minor errors in handwriting or character
            count (±20 chars) may occur. Just let the AI know if something is
            off!
          </li>
        </ul>
      </div>

      {/* 🌟 VCE Kanji & Grammar Highlight Checker */}
      <HighlightChecker />

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
            "Article",
            "Story",
            "Report",
            "Letter",
            "Journal",
            "Essay",
            "Email",
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

      {/* 💡 Text Type Instruction Banner */}
      <div id="text-type-instruction" className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-lg text-emerald-800 flex items-center gap-3 shadow-sm">
        <span className="text-xl">💡</span>
        <span>
          Click on the green text type tag on each question to see what is
          required for that text type and view a sample.
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm"
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

            {/* 英文（文字サイズ20px指定） */}
            <p className="text-[20px] text-slate-800 mb-3 leading-relaxed font-medium">
              {q.english}
            </p>

            {/* ふりがな付きの日本語をHTMLとして正しく表示 */}
            <div
              className="text-lg sm:text-[20px] text-slate-700 mb-4 border-l-4 border-slate-200 pl-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: q.japanese }}
            />

            <button
              onClick={() =>
                copyToClipboard(
                  `I am working on Question ${q.id} (${q.textType}). Could you please provide feedback?`
                )
              }
              className="px-4 py-2 text-base bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-slate-700 font-bold transition-colors shadow-sm"
            >
              📋 Copy Task Info
            </button>
          </div>
        ))}
      </div>

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