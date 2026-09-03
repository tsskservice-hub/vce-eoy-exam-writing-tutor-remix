import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // ルートパス ( / ) に home.tsx を割り当て
  index("routes/home.tsx"),

  // ダッシュボードパス ( /dashboard ) に dashboard.tsx を割り当て
  route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;