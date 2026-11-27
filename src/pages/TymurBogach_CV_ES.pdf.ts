export const prerender = false;

import type { APIRoute } from "astro";
import { cvPdfResponse } from "../lib/cvPdf";

export const GET: APIRoute = () => cvPdfResponse("ES");
