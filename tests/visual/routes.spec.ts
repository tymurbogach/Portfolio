import { expect, test } from "@playwright/test";

const routes = ["/", "/about", "/resume", "/projects", "/contact"];
const viewports = [
  { name: "mobile", width: 320, height: 720 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
  { name: "fhd", width: 1920, height: 1080 },
  { name: "qhd", width: 2560, height: 1440 },
  { name: "uhd", width: 3840, height: 2160 },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ visitors: 0 }),
    }),
  );
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ message: "" }),
    }),
  );
  await page.route(/umami|analytics/, (route) => route.abort());
});

for (const viewport of viewports) {
  for (const route of routes) {
    test(`${route} at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route, { waitUntil: "networkidle" });
      await page.addStyleTag({
        content:
          "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; } body::after { display: none !important; }",
      });
      await page.locator("#local-time").evaluateAll((elements) => {
        for (const element of elements) element.textContent = "12:00";
      });
      await page.locator("[data-visual-matrix]").evaluateAll((elements) => {
        for (const element of elements) {
          element.textContent = element.getAttribute("aria-label") ?? "";
        }
      });

      await expect(page).toHaveScreenshot(
        `${route === "/" ? "home" : route.slice(1)}-${viewport.name}.png`,
        {
          animations: "disabled",
          caret: "hide",
          fullPage: true,
        },
      );

      const dimensions = await page.evaluate(() => ({
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);

      const chrome = page.locator(".nav-panel:visible");
      expect(await chrome.count()).toBeGreaterThanOrEqual(2);

      if (viewport.width <= 768) {
        const targets = await page
          .locator("header a, footer a, .chat-toggle")
          .evaluateAll((elements) =>
            elements
              .filter((element) => {
                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return (
                  style.display !== "none" &&
                  style.visibility !== "hidden" &&
                  rect.width > 0 &&
                  rect.height > 0
                );
              })
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return Math.min(rect.width, rect.height);
              }),
          );
        expect(targets.length).toBeGreaterThan(0);
        expect(Math.min(...targets)).toBeGreaterThanOrEqual(40);
      }
    });
  }
}
