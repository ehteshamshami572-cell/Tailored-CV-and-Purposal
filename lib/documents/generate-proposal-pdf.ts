import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import type { ProposalOutput, ProposalTemplateId } from "@/types/proposal";
import { sanitizeForPdf } from "./sanitize-pdf-text";

interface PageContext {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  width: number;
  height: number;
  margin: number;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  fontItalic: PDFFont;
  primaryColor: ReturnType<typeof rgb>;
  textColor: ReturnType<typeof rgb>;
  mutedColor: ReturnType<typeof rgb>;
  cardBgColor: ReturnType<typeof rgb>;
}

export async function generateProposalPdf(
  rawProposal: ProposalOutput,
  templateId: ProposalTemplateId = "modern-corp"
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  const isCreative = templateId === "creative-agency";
  const isMinimal = templateId === "minimalist";

  const fontRegular = await doc.embedFont(isCreative ? StandardFonts.Helvetica : StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(isCreative ? StandardFonts.HelveticaBold : StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  // Palettes
  let primaryColor = rgb(0.12, 0.28, 0.54); // classic corporate navy
  let textColor = rgb(0.15, 0.18, 0.22);
  let mutedColor = rgb(0.42, 0.46, 0.52);
  let cardBgColor = rgb(0.96, 0.97, 0.99);

  if (isCreative) {
    primaryColor = rgb(0.45, 0.15, 0.65); // deep purple/creative
    cardBgColor = rgb(0.98, 0.96, 1.0);
  } else if (isMinimal) {
    primaryColor = rgb(0.1, 0.1, 0.1);
    cardBgColor = rgb(0.97, 0.97, 0.97);
  }

  const margin = 45;
  const initialPage = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = initialPage.getSize();

  const ctx: PageContext = {
    doc,
    page: initialPage,
    y: height - margin,
    width,
    height,
    margin,
    fontRegular,
    fontBold,
    fontItalic,
    primaryColor,
    textColor,
    mutedColor,
    cardBgColor,
  };

  function ensureSpace(neededHeight: number) {
    if (ctx.y - neededHeight < ctx.margin) {
      ctx.page = ctx.doc.addPage([ctx.width, ctx.height]);
      ctx.y = ctx.height - ctx.margin;
    }
  }

  // Safe drawText helper that guarantees WinAnsi compatibility
  function drawText(
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      font: PDFFont;
      color?: ReturnType<typeof rgb>;
    }
  ) {
    const clean = sanitizeForPdf(text, options.font);
    ctx.page.drawText(clean, options);
  }

  // Safe measure text helper
  function measureText(text: string, font: PDFFont, size: number): number {
    const clean = sanitizeForPdf(text, font);
    return font.widthOfTextAtSize(clean, size);
  }

  // Text wrapper with WinAnsi sanitization
  function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const cleanText = sanitizeForPdf(text, font);
    const words = cleanText.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const cleanCandidate = sanitizeForPdf(candidate, font);
      const lineWidth = measureText(cleanCandidate, font, fontSize);
      if (lineWidth <= maxWidth) {
        currentLine = cleanCandidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = sanitizeForPdf(word, font);
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Deep sanitize proposal data
  const proposal: ProposalOutput = {
    ...rawProposal,
    title: sanitizeForPdf(rawProposal.title || "", fontBold),
    clientName: sanitizeForPdf(rawProposal.clientName || "", fontRegular),
    applicantName: sanitizeForPdf(rawProposal.applicantName || "", fontRegular),
    date: sanitizeForPdf(rawProposal.date || "", fontRegular),
    executiveSummary: sanitizeForPdf(rawProposal.executiveSummary || "", fontRegular),
    sections: (rawProposal.sections || []).map((sec) => ({
      ...sec,
      title: sanitizeForPdf(sec.title || "", fontBold),
      content: sanitizeForPdf(sec.content || "", fontRegular),
    })),
    deliverables: (rawProposal.deliverables || []).map((d) => sanitizeForPdf(d, fontRegular)),
    milestones: (rawProposal.milestones || []).map((m) => ({
      ...m,
      name: sanitizeForPdf(m.name || "", fontBold),
      description: sanitizeForPdf(m.description || "", fontRegular),
      estimatedDuration: sanitizeForPdf(m.estimatedDuration || "", fontItalic),
    })),
    pricingSummary: sanitizeForPdf(rawProposal.pricingSummary || "", fontRegular),
    nextSteps: sanitizeForPdf(rawProposal.nextSteps || "", fontRegular),
  };

  const printableWidth = ctx.width - ctx.margin * 2;

  // Header Title
  ensureSpace(40);
  const titleSize = 22;
  const titleLines = wrapText(proposal.title, ctx.fontBold, titleSize, printableWidth);
  for (const tLine of titleLines) {
    drawText(tLine, {
      x: ctx.margin,
      y: ctx.y - titleSize,
      size: titleSize,
      font: ctx.fontBold,
      color: ctx.primaryColor,
    });
    ctx.y -= titleSize + 4;
  }
  ctx.y -= 6;

  // Metadata block (Client, Applicant, Date, Type)
  ensureSpace(28);
  const applicantTypeLabel = proposal.applicantType === "agency" ? "AGENCY PROPOSAL" : "INDEPENDENT CONSULTANT PROPOSAL";

  drawText(applicantTypeLabel, {
    x: ctx.margin,
    y: ctx.y - 10,
    size: 9,
    font: ctx.fontBold,
    color: ctx.primaryColor,
  });

  const dateText = `Date: ${proposal.date}`;
  const dateWidth = measureText(dateText, ctx.fontRegular, 9);
  drawText(dateText, {
    x: ctx.width - ctx.margin - dateWidth,
    y: ctx.y - 10,
    size: 9,
    font: ctx.fontRegular,
    color: ctx.mutedColor,
  });
  ctx.y -= 14;

  const partyDetails: string[] = [];
  if (proposal.applicantName) partyDetails.push(`Prepared by: ${proposal.applicantName}`);
  if (proposal.clientName) partyDetails.push(`Prepared for: ${proposal.clientName}`);

  if (partyDetails.length > 0) {
    drawText(partyDetails.join("   |   "), {
      x: ctx.margin,
      y: ctx.y - 9,
      size: 9.5,
      font: ctx.fontItalic,
      color: ctx.textColor,
    });
    ctx.y -= 14;
  }

  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 1,
    color: ctx.primaryColor,
  });
  ctx.y -= 16;

  // Helper for Section Titles
  function drawSectionHeader(title: string) {
    ensureSpace(28);
    drawText(title, {
      x: ctx.margin,
      y: ctx.y - 13,
      size: 13,
      font: ctx.fontBold,
      color: ctx.primaryColor,
    });
    ctx.y -= 16;

    ctx.page.drawLine({
      start: { x: ctx.margin, y: ctx.y },
      end: { x: ctx.width - ctx.margin, y: ctx.y },
      thickness: 0.5,
      color: rgb(0.8, 0.83, 0.88),
    });
    ctx.y -= 12;
  }

  // 1. Executive Summary
  if (proposal.executiveSummary) {
    drawSectionHeader("Executive Summary");
    const execLines = wrapText(proposal.executiveSummary, ctx.fontRegular, 10, printableWidth);
    for (const line of execLines) {
      ensureSpace(14);
      drawText(line, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontRegular,
        color: ctx.textColor,
      });
      ctx.y -= 14;
    }
    ctx.y -= 10;
  }

  // 2. Proposal Sections
  if (proposal.sections && proposal.sections.length > 0) {
    for (const section of proposal.sections) {
      drawSectionHeader(section.title);
      if (section.content) {
        // Split paragraphs
        const paragraphs = section.content.split("\n\n");
        for (const para of paragraphs) {
          const paraLines = wrapText(para.trim(), ctx.fontRegular, 9.5, printableWidth);
          for (const line of paraLines) {
            ensureSpace(13);
            drawText(line, {
              x: ctx.margin,
              y: ctx.y - 9.5,
              size: 9.5,
              font: ctx.fontRegular,
              color: ctx.textColor,
            });
            ctx.y -= 13;
          }
          ctx.y -= 6;
        }
      }
      ctx.y -= 6;
    }
  }

  // 3. Key Deliverables
  if (proposal.deliverables && proposal.deliverables.length > 0) {
    drawSectionHeader("Key Deliverables & Scope");
    for (const deliverable of proposal.deliverables) {
      const delLines = wrapText(deliverable, ctx.fontRegular, 9.5, printableWidth - 14);
      for (let i = 0; i < delLines.length; i++) {
        ensureSpace(13);
        if (i === 0) {
          drawText("•", {
            x: ctx.margin + 2,
            y: ctx.y - 9.5,
            size: 9.5,
            font: ctx.fontBold,
            color: ctx.primaryColor,
          });
        }
        drawText(delLines[i], {
          x: ctx.margin + 16,
          y: ctx.y - 9.5,
          size: 9.5,
          font: ctx.fontRegular,
          color: ctx.textColor,
        });
        ctx.y -= 13;
      }
    }
    ctx.y -= 10;
  }

  // 4. Project Milestones
  if (proposal.milestones && proposal.milestones.length > 0) {
    drawSectionHeader("Project Timeline & Milestones");
    for (const milestone of proposal.milestones) {
      ensureSpace(26);

      // Milestone name and duration
      drawText(milestone.name, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });

      if (milestone.estimatedDuration) {
        const durText = `Duration: ${milestone.estimatedDuration}`;
        const durWidth = measureText(durText, ctx.fontItalic, 9);
        drawText(durText, {
          x: ctx.width - ctx.margin - durWidth,
          y: ctx.y - 10,
          size: 9,
          font: ctx.fontItalic,
          color: ctx.mutedColor,
        });
      }
      ctx.y -= 13;

      if (milestone.description) {
        const descLines = wrapText(milestone.description, ctx.fontRegular, 9, printableWidth - 10);
        for (const line of descLines) {
          ensureSpace(12);
          drawText(line, {
            x: ctx.margin + 10,
            y: ctx.y - 9,
            size: 9,
            font: ctx.fontRegular,
            color: ctx.mutedColor,
          });
          ctx.y -= 12;
        }
      }
      ctx.y -= 8;
    }
    ctx.y -= 6;
  }

  // 5. Pricing & Investment
  if (proposal.pricingSummary && proposal.pricingSummary.trim().length > 0) {
    drawSectionHeader("Investment & Commercial Terms");
    const pricingLines = wrapText(proposal.pricingSummary, ctx.fontRegular, 9.5, printableWidth);
    for (const line of pricingLines) {
      ensureSpace(13);
      drawText(line, {
        x: ctx.margin,
        y: ctx.y - 9.5,
        size: 9.5,
        font: ctx.fontRegular,
        color: ctx.textColor,
      });
      ctx.y -= 13;
    }
    ctx.y -= 10;
  }

  // 6. Next Steps & Execution
  if (proposal.nextSteps && proposal.nextSteps.trim().length > 0) {
    drawSectionHeader("Next Steps & Project Kickoff");
    const nextStepLines = wrapText(proposal.nextSteps, ctx.fontRegular, 9.5, printableWidth);
    for (const line of nextStepLines) {
      ensureSpace(13);
      drawText(line, {
        x: ctx.margin,
        y: ctx.y - 9.5,
        size: 9.5,
        font: ctx.fontRegular,
        color: ctx.textColor,
      });
      ctx.y -= 13;
    }
  }

  // Add Page Numbers
  const totalPages = doc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const page = doc.getPage(i);
    const pageNumberStr = `Page ${i + 1} of ${totalPages}`;
    const pageNumberWidth = measureText(pageNumberStr, fontRegular, 8.5);
    page.drawText(pageNumberStr, {
      x: width - margin - pageNumberWidth,
      y: margin / 2,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    const footerDoc = proposal.applicantName || "Proposal Document";
    page.drawText(sanitizeForPdf(footerDoc, fontItalic), {
      x: margin,
      y: margin / 2,
      size: 8.5,
      font: fontItalic,
      color: rgb(0.55, 0.55, 0.55),
    });
  }

  return await doc.save();
}
