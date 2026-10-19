import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { ExportResumePdfPayloadSchema } from "@/lib/validation/resume-schema";
import { generateResumePdf } from "@/lib/documents/generate-pdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const limit = checkRateLimit(ip, 30, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = ExportResumePdfPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid resume data provided for export.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { cv, templateId } = parseResult.data;
    const pdfBytes = await generateResumePdf(cv, templateId);

    const safeFilename = `${cv.contact.fullName.replace(/[^a-zA-Z0-9_-]/g, "_") || "tailored"}_resume.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate resume PDF.";
    console.error("[API Resume Export Error]:", err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
