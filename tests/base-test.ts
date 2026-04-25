import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        throw new Error(`Browser console ${type} detected: ${msg.text()}`);
      }
    });

    page.on("pageerror", (exception) => {
      throw new Error(`Uncaught page exception detected: ${exception.message}`);
    });

    await use(page);
  },
});
