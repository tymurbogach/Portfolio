import { expect, test } from "@playwright/test";

const desktopViewports = [
  { width: 960, height: 1000 },
  { width: 1024, height: 700 },
  { width: 1280, height: 900 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 2000, height: 1000 },
  { width: 2560, height: 1440 },
];

test("dual panels align to fixed left chrome and center within each column", async ({
  page,
}) => {
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ visitors: 0 }),
    }),
  );
  await page.route(/umami|analytics/, (route) => route.abort());
  await page.setViewportSize(desktopViewports[0]);
  await page.goto("/", { waitUntil: "networkidle" });

  for (const viewport of desktopViewports) {
    const { width, height } = viewport;
    await page.setViewportSize(viewport);
    const layout = await page.evaluate(() => {
      const fixedPanels = Array.from(
        document.querySelectorAll<HTMLElement>("body > div.fixed .nav-panel"),
      ).filter((element) => element.getBoundingClientRect().width > 0);
      const nameCard = fixedPanels.find((element) =>
        element.querySelector("h1"),
      );
      const socialLinks = fixedPanels.find((element) =>
        element.querySelector('a[target="_blank"]'),
      );
      const sidebar = document.querySelector<HTMLElement>(".dual-sidebar");
      const contentPanel =
        document.querySelector<HTMLElement>(".content-panel");
      const contentScroll =
        document.querySelector<HTMLElement>("#content-scroll");
      const profilePhoto = sidebar?.querySelector<HTMLElement>(
        "section > div > div:first-child",
      );
      const profileDetails = sidebar?.querySelector<HTMLElement>("dl");
      const pageContent = contentScroll?.firstElementChild;

      if (
        !nameCard ||
        !socialLinks ||
        !sidebar ||
        !contentPanel ||
        !contentScroll ||
        !profilePhoto ||
        !profileDetails ||
        !(pageContent instanceof HTMLElement)
      )
        throw new Error("Dual layout elements are missing");

      const rect = (element: HTMLElement) => {
        const { left, right, top, bottom } = element.getBoundingClientRect();
        return { left, right, top, bottom, center: (left + right) / 2 };
      };

      return {
        name: rect(nameCard),
        socials: rect(socialLinks),
        sidebar: rect(sidebar),
        profilePhoto: rect(profilePhoto),
        profileDetails: rect(profileDetails),
        content: rect(contentPanel),
        scroll: rect(contentScroll),
        pageContent: rect(pageContent),
        sidebarBorder: getComputedStyle(sidebar).borderRightWidth,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        overflow: [
          sidebar,
          contentPanel,
          contentScroll,
          document.querySelector<HTMLElement>(".atmosphere"),
        ]
          .filter((element): element is HTMLElement => element !== null)
          .map((element) => element.scrollWidth - element.clientWidth),
      };
    });

    expect(
      Math.abs(layout.name.right - layout.sidebar.right),
      `name at ${width}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.socials.right - layout.sidebar.right),
      `socials at ${width}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.content.left - layout.sidebar.right),
      `column seam at ${width}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.profilePhoto.center - layout.sidebar.center),
      `left content centered at ${width}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.scroll.center - layout.content.center),
      `content centered at ${width}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.pageContent.center - layout.content.center),
      `right page content centered at ${width}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      layout.profilePhoto.top,
      `photo below name card at ${width}x${height}`,
    ).toBeGreaterThanOrEqual(layout.name.bottom - 1);
    expect(
      layout.profileDetails.bottom,
      `operator details above social card at ${width}x${height}`,
    ).toBeLessThanOrEqual(layout.socials.top + 1);
    expect(layout.sidebarBorder).toBe("0px");
    expect(layout.overflow.every((difference) => difference <= 1)).toBe(true);
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  }
});
