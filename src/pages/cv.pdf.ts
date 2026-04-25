import type { APIRoute } from "astro";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import CVDocument from "../components/CVDocument";
import { cvData } from "../data/cv";

export const prerender = true;

export const GET: APIRoute = async () => {
  const buffer = await renderToBuffer(createElement(CVDocument, { data: cvData }));
  return new Response(buffer as unknown as BodyInit, {
    headers: { "Content-Type": "application/pdf" },
  });
};
