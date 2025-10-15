import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  route("products", "routes/products.tsx"),
  route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;
