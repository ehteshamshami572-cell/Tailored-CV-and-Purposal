import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { ExportProposalPdfPayloadSchema } from "@/lib/validation/proposal-schema";
import { generateProposalPdf } from "@/lib/documents/generate-proposal-pdf";

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
    const parseResult = ExportProposalPdfPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid proposal data provided for export.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { proposal, templateId } = parseResult.data;
    const pdfBytes = await generateProposalPdf(proposal, templateId);

    const safeFilename = `${(proposal.title || "Project_Proposal").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate proposal PDF.";
    console.error("[API Proposal Export Error]:", err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
