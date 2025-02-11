import { onRequest as __api_courses_js_onRequest } from "D:\\hankgit\\GPA-calculator-2\\GPA-calculator-2\\GPA-calculator-2\\functions\\api\\courses.js"

export const routes = [
    {
      routePath: "/api/courses",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_courses_js_onRequest],
    },
  ]