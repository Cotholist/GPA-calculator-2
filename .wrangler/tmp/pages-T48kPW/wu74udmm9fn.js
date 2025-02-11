// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: ["/*"],
  exclude: [],
  routes: [
    {
      pattern: "/api/courses",
      function: "courses"
    },
    {
      pattern: "/api/courses/.*",
      function: "courses"
    }
  ]
};

// C:/Users/Administrator/AppData/Roaming/npm/node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "D:\\hankgit\\GPA-calculator-2\\GPA-calculator-2\\GPA-calculator-2\\.wrangler\\tmp\\pages-T48kPW\\functionsWorker-0.7056320953519268.mjs";
import { isRoutingRuleMatch } from "C:\\Users\\Administrator\\AppData\\Roaming\\npm\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "D:\\hankgit\\GPA-calculator-2\\GPA-calculator-2\\GPA-calculator-2\\.wrangler\\tmp\\pages-T48kPW\\functionsWorker-0.7056320953519268.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        if (worker.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return worker.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=wu74udmm9fn.js.map
