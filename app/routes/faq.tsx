import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { marked } from "marked";
import faqsData from "../data/faqs.json";

export const meta: MetaFunction = () => {
  return [
    { title: "Exams & AI Yamato FAQs | VCE EOY Exam Writing AI Tutor" },
    { 
      name: "description", 
      content: "VCE Japanese の試験ライティング（名前ルール、文字数、漢字、テキストタイプなど）および AI Yamato の使い方・誤読修正に関するよくある質問" 
    },
  ];
};




interface FaqQuestion {
  id: string | number;
  question: string;
  answer: string;
}

interface FaqCategory {
  category: string;
  questions: FaqQuestion[];
}

// faqs.json の実際の構造に合わせて型をキャスト
const faqCategories = faqsData as FaqCategory[];

// カテゴリー名をURLアンカー（id）用の文字列に変換する関数
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 font-sans bg-white min-h-screen text-slate-800 scroll-smooth">
      {/* 戻るボタンヘッダー */}
      <div className="flex justify-between items-center bg-white px-5 py-3 rounded-xl mb-6 border border-slate-200 shadow-sm">
        <span className="text-lg text-slate-700 font-bold">
          💡 FAQs: exams and AI Yamato
        </span>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg no-underline font-bold text-base transition-colors shadow-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* イントロダクション */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2 mt-0">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-emerald-700 m-0">
          Everything you need to know about VCE Japanese external exam writing rules—including names, word counts, kanji, text types—and how to interact with AI Yamato.
        </p>
      </div>

      {/* トピック一覧（ナビゲーション） */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-bold text-slate-700 mb-3 mt-0 flex items-center gap-2">
          <span>📌</span> Jump to Topic
        </h2>
        <div className="flex flex-wrap gap-2">
          {faqCategories.map((catGroup, catIndex) => {
            const categoryId = slugify(catGroup.category);
            return (
              <a
                key={catIndex}
                href={`#${categoryId}`}
                className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-lg font-medium text-sm no-underline shadow-sm transition-all duration-150 flex items-center gap-1"
              >
                {catGroup.category}
              </a>
            );
          })}
        </div>
      </div>

      {/* カテゴリごとの FAQ リスト */}
      <div className="flex flex-col gap-10">
        {faqCategories.map((catGroup, catIndex) => {
          const categoryId = slugify(catGroup.category);
          return (
            <div key={catIndex} id={categoryId} className="bg-white scroll-mt-6">
              {/* カテゴリ名 */}
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-2 mb-4">
                {catGroup.category}
              </h2>

              <div className="flex flex-col gap-6">
                {catGroup.questions.map((faq, qIndex) => (
                  <div
                    key={faq.id || qIndex}
                    className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 mt-0 flex items-start gap-2">
                      <span className="text-emerald-600">Q.</span>
                      <span>{faq.question}</span>
                    </h3>
                    <div
                      className="text-lg text-slate-700 leading-relaxed pl-6 border-l-4 border-emerald-200"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(faq.answer, { breaks: true }),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* フッターの戻るリンク */}
      <div className="mt-12 text-center">
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors no-underline text-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}