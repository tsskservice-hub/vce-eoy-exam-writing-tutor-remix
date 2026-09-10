import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // ルートパス ( / ) に home.tsx を割り当て（ログイン画面）[cite: 62]
  index("routes/home.tsx"),

  // ダッシュボードパス ( /dashboard ) に dashboard.tsx を割り当て[cite: 62]
  route("dashboard", "routes/dashboard.tsx"),

  // 🌟 追加：FAQパス ( /faq ) に faq.tsx を割り当て[cite: 80]
  route("faq", "routes/faq.tsx"),
] satisfies RouteConfig;