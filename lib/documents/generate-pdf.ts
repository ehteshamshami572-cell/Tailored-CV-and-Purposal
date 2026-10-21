import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import type { ParsedCV, ResumeTemplateId } from "@/types/resume";
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
}

export async function generateResumePdf(
  rawCv: ParsedCV,
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

  // Safe drawText helper that guarantees WinAnsi compatibility (fixes 0x2011 and Unicode errors)
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

  // Deep sanitize all CV fields
  const cv: ParsedCV = {
    contact: {
      fullName: sanitizeForPdf(rawCv.contact?.fullName || "", fontBold),
      email: sanitizeForPdf(rawCv.contact?.email || "", fontRegular),
      phone: sanitizeForPdf(rawCv.contact?.phone || "", fontRegular),
      location: sanitizeForPdf(rawCv.contact?.location || "", fontRegular),
      linkedinUrl: sanitizeForPdf(rawCv.contact?.linkedinUrl || "", fontRegular),
      portfolioUrl: sanitizeForPdf(rawCv.contact?.portfolioUrl || "", fontRegular),
      githubUrl: sanitizeForPdf(rawCv.contact?.githubUrl || "", fontRegular),
    },
    professionalSummary: sanitizeForPdf(rawCv.professionalSummary || "", fontRegular),
    skills: (rawCv.skills || []).map((s) => sanitizeForPdf(s, fontRegular)),
    experience: (rawCv.experience || []).map((exp) => ({
      ...exp,
      jobTitle: sanitizeForPdf(exp.jobTitle || "", fontBold),
      employer: sanitizeForPdf(exp.employer || "", fontItalic),
      location: sanitizeForPdf(exp.location || "", fontItalic),
      startDate: sanitizeForPdf(exp.startDate || "", fontItalic),
      endDate: sanitizeForPdf(exp.endDate || "", fontItalic),
      bullets: (exp.bullets || []).map((b) => sanitizeForPdf(b, fontRegular)),
    })),
    education: (rawCv.education || []).map((edu) => ({
      ...edu,
      institution: sanitizeForPdf(edu.institution || "", fontItalic),
      degree: sanitizeForPdf(edu.degree || "", fontBold),
      fieldOfStudy: sanitizeForPdf(edu.fieldOfStudy || "", fontBold),
      graduationDate: sanitizeForPdf(edu.graduationDate || "", fontItalic),
      gpa: sanitizeForPdf(edu.gpa || "", fontItalic),
      achievements: (edu.achievements || []).map((a) => sanitizeForPdf(a, fontRegular)),
    })),
    certifications: (rawCv.certifications || []).map((cert) => ({
      ...cert,
      name: sanitizeForPdf(cert.name || "", fontBold),
      issuer: sanitizeForPdf(cert.issuer || "", fontRegular),
      date: sanitizeForPdf(cert.date || "", fontRegular),
      url: sanitizeForPdf(cert.url || "", fontRegular),
    })),
    projects: (rawCv.projects || []).map((proj) => ({
      ...proj,
      name: sanitizeForPdf(proj.name || "", fontBold),
      description: sanitizeForPdf(proj.description || "", fontRegular),
      url: sanitizeForPdf(proj.url || "", fontRegular),
      bullets: (proj.bullets || []).map((b) => sanitizeForPdf(b, fontRegular)),
      technologies: (proj.technologies || []).map((t) => sanitizeForPdf(t, fontRegular)),
    })),
    additionalSections: (rawCv.additionalSections || []).map((sec) => ({
      ...sec,
      heading: sanitizeForPdf(sec.heading || "", fontBold),
      items: (sec.items || []).map((item) => sanitizeForPdf(item, fontRegular)),
    })),
  };

  // Render header
  const printableWidth = ctx.width - ctx.margin * 2;
  const name = cv.contact.fullName || "Candidate Resume";
  const nameSize = 20;
  ensureSpace(nameSize + 25);

  drawText(name, {
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
      drawText(line, {
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
    drawText(title.toUpperCase(), {
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
      drawText(line, {
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
      drawText(line, {
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
      drawText(exp.jobTitle, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });

      const dateStr = `${exp.startDate} - ${exp.endDate}`;
      const dateWidth = measureText(dateStr, ctx.fontItalic, 9);
      drawText(dateStr, {
        x: ctx.width - ctx.margin - dateWidth,
        y: ctx.y - 10,
        size: 9,
        font: ctx.fontItalic,
        color: ctx.mutedColor,
      });
      ctx.y -= 13;

      // Employer & Location
      const employerLine = exp.location ? `${exp.employer}  |  ${exp.location}` : exp.employer;
      drawText(employerLine, {
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
              drawText("•", {
                x: ctx.margin + 2,
                y: ctx.y - 9,
                size: 9,
                font: ctx.fontBold,
                color: ctx.primaryColor,
              });
            }
            drawText(bulletLines[i], {
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
      drawText(degreeLine, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });

      if (edu.graduationDate) {
        const dateWidth = measureText(edu.graduationDate, ctx.fontItalic, 9);
        drawText(edu.graduationDate, {
          x: ctx.width - ctx.margin - dateWidth,
          y: ctx.y - 10,
          size: 9,
          font: ctx.fontItalic,
          color: ctx.mutedColor,
        });
      }
      ctx.y -= 13;

      const instLine = edu.gpa ? `${edu.institution}  (GPA: ${edu.gpa})` : edu.institution;
      drawText(instLine, {
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
      const certLine = cert.date ? `${cert.name} - ${cert.issuer} (${cert.date})` : `${cert.name} - ${cert.issuer}`;
      drawText(`•  ${certLine}`, {
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
      drawText(proj.name, {
        x: ctx.margin,
        y: ctx.y - 10,
        size: 10,
        font: ctx.fontBold,
        color: ctx.textColor,
      });
      if (proj.url) {
        const urlWidth = measureText(proj.url, ctx.fontRegular, 8.5);
        drawText(proj.url, {
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
          drawText(line, {
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
            drawText(i === 0 ? `•  ${itemLines[i]}` : `   ${itemLines[i]}`, {
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
    const pageNumberWidth = measureText(pageNumberStr, fontRegular, 8);
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
