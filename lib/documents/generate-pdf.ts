import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import type { ParsedCV, ResumeTemplateId } from "@/types/resume";

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
}

export async function generateResumePdf(
  cv: ParsedCV,
  templateId: ResumeTemplateId = "ats-classic"
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  // Pick fonts based on template
  const isSerif = templateId === "executive-serif";
  const fontRegular = await doc.embedFont(isSerif ? StandardFonts.TimesRoman : StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(isSerif ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(isSerif ? StandardFonts.TimesRomanItalic : StandardFonts.HelveticaOblique);

  // Palettes
  let primaryColor = rgb(0.1, 0.1, 0.1); // classic ATS black
  let textColor = rgb(0.15, 0.15, 0.15);
  let mutedColor = rgb(0.4, 0.4, 0.4);

  if (templateId === "modern-clean") {
    primaryColor = rgb(0.08, 0.28, 0.53); // modern navy
    textColor = rgb(0.12, 0.15, 0.2);
    mutedColor = rgb(0.38, 0.42, 0.48);
  } else if (templateId === "executive-serif") {
    primaryColor = rgb(0.18, 0.15, 0.12); // dark charcoal/warm
    textColor = rgb(0.15, 0.15, 0.15);
    mutedColor = rgb(0.42, 0.42, 0.42);
  }

  const margin = 40;
  const initialPage = doc.addPage([595.28, 841.89]); // A4 in points
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
  };

  // Helper to ensure enough vertical room or start a new page
  function ensureSpace(neededHeight: number) {
    if (ctx.y - neededHeight < ctx.margin) {
      ctx.page = ctx.doc.addPage([ctx.width, ctx.height]);
      ctx.y = ctx.height - ctx.margin;
    }
  }

  // Text wrapper
  function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = font.widthOfTextAtSize(candidate, fontSize);
      if (lineWidth <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Render header
  const printableWidth = ctx.width - ctx.margin * 2;
  const name = cv.contact.fullName || "Candidate Resume";
  const nameSize = 20;
  ensureSpace(nameSize + 25);

  ctx.page.drawText(name, {
    x: ctx.margin,
    y: ctx.y - nameSize,
    size: nameSize,
    font: ctx.fontBold,
    color: ctx.primaryColor,
  });
  ctx.y -= nameSize + 6;

  // Contact info line
  const contactParts: string[] = [];
  if (cv.contact.email) contactParts.push(cv.contact.email);
  if (cv.contact.phone) contactParts.push(cv.contact.phone);
  if (cv.contact.location) contactParts.push(cv.contact.location);
  if (cv.contact.linkedinUrl) contactParts.push(cv.contact.linkedinUrl);
  if (cv.contact.portfolioUrl) contactParts.push(cv.contact.portfolioUrl);
  if (cv.contact.githubUrl) contactParts.push(cv.contact.githubUrl);

  const contactString = contactParts.join("  |  ");
  if (contactString) {
    const contactLines = wrapText(contactString, ctx.fontRegular, 9, printableWidth);
    for (const line of contactLines) {
      ensureSpace(12);
      ctx.page.drawText(line, {
        x: ctx.margin,
        y: ctx.y - 9,
        size: 9,
        font: ctx.fontRegular,
        color: ctx.mutedColor,
      });
      ctx.y -= 12;
    }
  }

  ctx.y -= 8;

  // Horizontal divider rule
  ensureSpace(6);
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 0.8,
    color: ctx.primaryColor,
  });
  ctx.y -= 14;

  // Helper for Section Titles
  function drawSectionHeader(title: string) {
    ensureSpace(24);
    ctx.page.drawText(title.toUpperCase(), {
      x: ctx.margin,
      y: ctx.y - 12,
      size: 11,
      font: ctx.fontBold,
      color: ctx.primaryColor,
    });
    ctx.y -= 14;

    ctx.page.drawLine({
      start: { x: ctx.margin, y: ctx.y },
      end: { x: ctx.width - ctx.margin, y: ctx.y },
      thickness: 0.5,
      color: rgb(0.75, 0.75, 0.75),
    });
    ctx.y -= 10;
  }

  // 1. Professional Summary
  if (cv.professionalSummary && cv.professionalSummary.trim().length > 0) {
    drawSectionHeader("Professional Summary");
    const summaryLines = wrapText(cv.professionalSummary.trim(), ctx.fontRegular, 9.5, printableWidth);
    for (const line of summaryLines) {
      ensureSpace(13);
      ctx.page.drawText(line, {
        x: ctx.margin,
        y: ctx.y - 9.5,
        size: 9.5,
        font: ctx.fontRegular,
        color: ctx.textColor,
      });
      ctx.y -= 13;
    }
    ctx.y -= 8;
  }

  // 2. Skills
  if (cv.skills && cv.skills.length > 0) {
    drawSectionHeader("Core Competencies & Technical Skills");
    const skillsText = cv.skills.join("  •  ");
    const skillLines = wrapText(skillsText, ctx.fontRegular, 9.5, printableWidth);
    for (const line of skillLines) {
      ensureSpace(13);
      ctx.page.drawText(line, {
        x: ctx.margin,
        y: ctx.y - 9.5,
        size: 9.5,
        font: ctx.fontRegular,
        color: ctx.textColor,
      });
      ctx.y -= 13;
    }
    ctx.y -= 8;
  }

  // 3. Work Experience
  if (cv.experience && cv.experience.length > 0) {
    drawSectionHeader("Professional Experience");
    for (const exp of cv.experience) {
      ensureSpace(28);

      // Job Title and Date
      ctx.page.drawText(exp.jobTitle, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });

      const dateStr = `${exp.startDate} – ${exp.endDate}`;
      const dateWidth = ctx.fontItalic.widthOfTextAtSize(dateStr, 9);
      ctx.page.drawText(dateStr, {
        x: ctx.width - ctx.margin - dateWidth,
        y: ctx.y - 10,
        size: 9,
        font: ctx.fontItalic,
        color: ctx.mutedColor,
      });
      ctx.y -= 13;

      // Employer & Location
      const employerLine = exp.location ? `${exp.employer}  |  ${exp.location}` : exp.employer;
      ctx.page.drawText(employerLine, {
        x: ctx.margin,
        y: ctx.y - 9,
        size: 9,
        font: ctx.fontItalic,
        color: ctx.mutedColor,
      });
      ctx.y -= 12;

      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          const bulletLines = wrapText(bullet, ctx.fontRegular, 9, printableWidth - 14);
          for (let i = 0; i < bulletLines.length; i++) {
            ensureSpace(12);
            if (i === 0) {
              // Bullet symbol
              ctx.page.drawText("•", {
                x: ctx.margin + 2,
                y: ctx.y - 9,
                size: 9,
                font: ctx.fontBold,
                color: ctx.primaryColor,
              });
            }
            ctx.page.drawText(bulletLines[i], {
              x: ctx.margin + 12,
              y: ctx.y - 9,
              size: 9,
              font: ctx.fontRegular,
              color: ctx.textColor,
            });
            ctx.y -= 12;
          }
        }
      }
      ctx.y -= 6;
    }
  }

  // 4. Education
  if (cv.education && cv.education.length > 0) {
    drawSectionHeader("Education");
    for (const edu of cv.education) {
      ensureSpace(24);
      const degreeLine = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;
      ctx.page.drawText(degreeLine, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });

      if (edu.graduationDate) {
        const dateWidth = ctx.fontItalic.widthOfTextAtSize(edu.graduationDate, 9);
        ctx.page.drawText(edu.graduationDate, {
          x: ctx.width - ctx.margin - dateWidth,
          y: ctx.y - 10,
          size: 9,
          font: ctx.fontItalic,
          color: ctx.mutedColor,
        });
      }
      ctx.y -= 13;

      const instLine = edu.gpa ? `${edu.institution}  (GPA: ${edu.gpa})` : edu.institution;
      ctx.page.drawText(instLine, {
        x: ctx.margin,
        y: ctx.y - 9,
        size: 9,
        font: ctx.fontItalic,
        color: ctx.mutedColor,
      });
      ctx.y -= 14;
    }
  }

  // 5. Certifications
  if (cv.certifications && cv.certifications.length > 0) {
    drawSectionHeader("Certifications");
    for (const cert of cv.certifications) {
      ensureSpace(16);
      const certLine = cert.date ? `${cert.name} — ${cert.issuer} (${cert.date})` : `${cert.name} — ${cert.issuer}`;
      ctx.page.drawText(`•  ${certLine}`, {
        x: ctx.margin,
        y: ctx.y - 9,
        size: 9,
        font: ctx.fontRegular,
        color: ctx.textColor,
      });
      ctx.y -= 13;
    }
    ctx.y -= 6;
  }

  // 6. Key Projects
  if (cv.projects && cv.projects.length > 0) {
    drawSectionHeader("Key Projects");
    for (const proj of cv.projects) {
      ensureSpace(22);
      ctx.page.drawText(proj.name, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });
      if (proj.url) {
        const urlWidth = ctx.fontRegular.widthOfTextAtSize(proj.url, 8.5);
        ctx.page.drawText(proj.url, {
          x: ctx.width - ctx.margin - urlWidth,
          y: ctx.y - 10,
          size: 8.5,
          font: ctx.fontRegular,
          color: ctx.mutedColor,
        });
      }
      ctx.y -= 13;

      if (proj.description) {
        const descLines = wrapText(proj.description, ctx.fontRegular, 9, printableWidth);
        for (const line of descLines) {
          ensureSpace(12);
          ctx.page.drawText(line, {
            x: ctx.margin,
            y: ctx.y - 9,
            size: 9,
            font: ctx.fontRegular,
            color: ctx.textColor,
          });
          ctx.y -= 12;
        }
      }
      ctx.y -= 5;
    }
  }

  // 7. Additional Sections
  if (cv.additionalSections && cv.additionalSections.length > 0) {
    for (const sec of cv.additionalSections) {
      if (sec.heading && sec.items.length > 0) {
        drawSectionHeader(sec.heading);
        for (const item of sec.items) {
          const itemLines = wrapText(item, ctx.fontRegular, 9, printableWidth - 10);
          for (let i = 0; i < itemLines.length; i++) {
            ensureSpace(12);
            ctx.page.drawText(i === 0 ? `•  ${itemLines[i]}` : `   ${itemLines[i]}`, {
              x: ctx.margin,
              y: ctx.y - 9,
              size: 9,
              font: ctx.fontRegular,
              color: ctx.textColor,
            });
            ctx.y -= 12;
          }
        }
        ctx.y -= 6;
      }
    }
  }

  // Add Page Numbers
  const totalPages = doc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const page = doc.getPage(i);
    const pageNumberStr = `Page ${i + 1} of ${totalPages}`;
    const pageNumberWidth = fontRegular.widthOfTextAtSize(pageNumberStr, 8);
    page.drawText(pageNumberStr, {
      x: width - margin - pageNumberWidth,
      y: margin / 2,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return await doc.save();
}
