import type { APIRoute } from "astro";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement }  from "react";
import CVDocument         from "../cv/Document";
import { cvDataEs }       from "../cv/data.es";

export const prerender = true;

export const GET: APIRoute = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(createElement(CVDocument, { data: cvDataEs }) as any);

  return new Response(buffer as unknown as BodyInit, {
    headers: { "Content-Type": "application/pdf" },
  });
};
