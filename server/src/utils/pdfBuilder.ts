import PDFDocument from "pdfkit";

interface InvoiceForPdf {
  invoice_number: string;
  issue_date: Date;
  due_date: Date;
  subtotal: number | string | { toNumber(): number };
  tax: number | string | { toNumber(): number };
  discount: number | string | { toNumber(): number };
  total: number | string | { toNumber(): number };
  currency: string;
  notes?: string | null;
  terms?: string | null;
  user: {
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  };
  client: {
    name: string;
    company?: string | null;
    email?: string | null;
    address?: string | null;
  };
  invoice_items: Array<{
    description: string;
    quantity: number | string | { toNumber(): number };
    rate: number | string | { toNumber(): number };
    amount: number | string | { toNumber(): number };
  }>;
}

const toNum = (val: number | string | { toNumber(): number }): number => {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val);
  return val.toNumber();
};

const fmt = (
  val: number | string | { toNumber(): number },
  currency: string,
): string => {
  const n = toNum(val);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);
};

const fmtQty = (val: number | string | { toNumber(): number }): string => {
  const n = toNum(val);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

const fmtDate = (d: Date): string =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const PRIMARY = "#1a1a2e";
const ACCENT = "#4361ee";
const MUTED = "#666666";
const LINE = "#e0e0e0";
const WHITE = "#ffffff";
const ROW_ALT = "#f7f7f7";

const PAGE_MARGIN = 50;
const PAGE_BOTTOM_MARGIN = 80; // reserve space for footer
const COL = {
  desc: { x: 56, w: 225 },
  qty: { x: 286, w: 60 },
  rate: { x: 356, w: 80 },
  amount: { x: 436, w: 80 },
};

/**
 * Builds a professional invoice PDF and returns it as a Buffer.
 */
export const buildInvoicePdf = (invoice: InvoiceForPdf): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4", autoFirstPage: true });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - PAGE_MARGIN * 2;

    // ─── Header bar ───────────────────────────────────────────
    doc.rect(0, 0, pageWidth, 80).fill(PRIMARY);

    doc
      .fillColor(WHITE)
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("INVOICE", PAGE_MARGIN, 25);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`#${invoice.invoice_number}`, PAGE_MARGIN, 57);

    // ─── FROM / TO / meta row ────────────────────────────────
    const infoTop = 105;

    // FROM (left)
    doc
      .fillColor(ACCENT)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("FROM", PAGE_MARGIN, infoTop);

    const fromName =
      [invoice.user.first_name, invoice.user.last_name].filter(Boolean).join(" ") ||
      invoice.user.email;

    doc
      .fillColor(PRIMARY)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(fromName, PAGE_MARGIN, infoTop + 13);

    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font("Helvetica")
      .text(invoice.user.email, PAGE_MARGIN, infoTop + 27);

    // BILL TO (center)
    const toX = 210;
    doc
      .fillColor(ACCENT)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("BILL TO", toX, infoTop);

    doc
      .fillColor(PRIMARY)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(invoice.client.name, toX, infoTop + 13);

    doc.fillColor(MUTED).fontSize(9).font("Helvetica");
    let clientY = infoTop + 27;
    if (invoice.client.company) {
      doc.text(invoice.client.company, toX, clientY);
      clientY += 13;
    }
    if (invoice.client.email) {
      doc.text(invoice.client.email, toX, clientY);
      clientY += 13;
    }
    if (invoice.client.address) {
      doc.text(invoice.client.address, toX, clientY, { width: 130 });
    }

    // Dates (right)
    const dateX = 390;
    doc
      .fillColor(ACCENT)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("ISSUE DATE", dateX, infoTop);
    doc
      .fillColor(PRIMARY)
      .fontSize(9)
      .font("Helvetica")
      .text(fmtDate(invoice.issue_date), dateX, infoTop + 13);

    doc
      .fillColor(ACCENT)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("DUE DATE", dateX, infoTop + 34);
    doc
      .fillColor(PRIMARY)
      .fontSize(9)
      .font("Helvetica")
      .text(fmtDate(invoice.due_date), dateX, infoTop + 47);

    // ─── Divider ──────────────────────────────────────────────
    const tableTop = 185;
    doc
      .moveTo(PAGE_MARGIN, tableTop - 8)
      .lineTo(pageWidth - PAGE_MARGIN, tableTop - 8)
      .strokeColor(LINE)
      .lineWidth(1)
      .stroke();

    // ─── Table header ─────────────────────────────────────────
    doc.rect(PAGE_MARGIN, tableTop, contentWidth, 20).fill(PRIMARY);
    doc
      .fillColor(WHITE)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("DESCRIPTION", COL.desc.x, tableTop + 6, { width: COL.desc.w })
      .text("QTY", COL.qty.x, tableTop + 6, { width: COL.qty.w, align: "right" })
      .text("RATE", COL.rate.x, tableTop + 6, { width: COL.rate.w, align: "right" })
      .text("AMOUNT", COL.amount.x, tableTop + 6, { width: COL.amount.w, align: "right" });

    // ─── Table rows ───────────────────────────────────────────
    let rowY = tableTop + 26;
    const ROW_PADDING = 8;

    const ensureSpace = (needed: number) => {
      if (rowY + needed > pageHeight - PAGE_BOTTOM_MARGIN) {
        doc.addPage();
        rowY = PAGE_MARGIN;
      }
    };

    invoice.invoice_items.forEach((item, idx) => {
      const descHeight = doc.heightOfString(item.description, { width: COL.desc.w });
      const rowHeight = Math.max(descHeight, 12) + ROW_PADDING * 2;

      ensureSpace(rowHeight);

      if (idx % 2 === 1) {
        doc.rect(PAGE_MARGIN, rowY - ROW_PADDING, contentWidth, rowHeight).fill(ROW_ALT);
      }

      const textY = rowY;
      doc.fillColor(PRIMARY).fontSize(9).font("Helvetica");
      doc.text(item.description, COL.desc.x, textY, { width: COL.desc.w });
      doc.text(fmtQty(item.quantity), COL.qty.x, textY, { width: COL.qty.w, align: "right" });
      doc.text(fmt(item.rate, invoice.currency), COL.rate.x, textY, { width: COL.rate.w, align: "right" });
      doc.text(fmt(item.amount, invoice.currency), COL.amount.x, textY, { width: COL.amount.w, align: "right" });

      rowY += rowHeight;
    });

    // ─── Totals ───────────────────────────────────────────────
    ensureSpace(120);

    rowY += 8;
    doc
      .moveTo(PAGE_MARGIN, rowY)
      .lineTo(pageWidth - PAGE_MARGIN, rowY)
      .strokeColor(LINE)
      .lineWidth(0.5)
      .stroke();
    rowY += 14;

    const labelX = 350;
    const valueX = COL.amount.x;

    const drawTotalRow = (label: string, value: string, bold = false) => {
      doc
        .fillColor(bold ? PRIMARY : MUTED)
        .fontSize(bold ? 11 : 9)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .text(label, labelX, rowY, { width: COL.rate.w, align: "right" })
        .text(value, valueX, rowY, { width: COL.amount.w, align: "right" });
      rowY += bold ? 22 : 16;
    };

    drawTotalRow("Subtotal", fmt(invoice.subtotal, invoice.currency));

    const taxVal = toNum(invoice.tax);
    if (taxVal > 0) {
      drawTotalRow("Tax", fmt(taxVal, invoice.currency));
    }

    const discountVal = toNum(invoice.discount);
    if (discountVal > 0) {
      drawTotalRow("Discount", `- ${fmt(discountVal, invoice.currency)}`);
    }

    doc
      .moveTo(labelX, rowY)
      .lineTo(pageWidth - PAGE_MARGIN, rowY)
      .strokeColor(ACCENT)
      .lineWidth(1)
      .stroke();
    rowY += 8;

    drawTotalRow("TOTAL", fmt(invoice.total, invoice.currency), true);

    // ─── Notes / Terms ────────────────────────────────────────
    if (invoice.notes || invoice.terms) {
      rowY += 16;

      const notesTermsHeight =
        (invoice.notes
          ? 22 + doc.heightOfString(invoice.notes, { width: contentWidth })
          : 0) +
        (invoice.terms
          ? 22 + doc.heightOfString(invoice.terms, { width: contentWidth })
          : 0);

      ensureSpace(notesTermsHeight + 20);

      doc
        .moveTo(PAGE_MARGIN, rowY)
        .lineTo(pageWidth - PAGE_MARGIN, rowY)
        .strokeColor(LINE)
        .lineWidth(0.5)
        .stroke();
      rowY += 14;

      if (invoice.notes) {
        doc.fillColor(ACCENT).fontSize(8).font("Helvetica-Bold").text("NOTES", PAGE_MARGIN, rowY);
        rowY += 13;
        doc
          .fillColor(MUTED)
          .fontSize(9)
          .font("Helvetica")
          .text(invoice.notes, PAGE_MARGIN, rowY, { width: contentWidth });
        rowY += doc.heightOfString(invoice.notes, { width: contentWidth }) + 12;
      }

      if (invoice.terms) {
        doc
          .fillColor(ACCENT)
          .fontSize(8)
          .font("Helvetica-Bold")
          .text("TERMS & CONDITIONS", PAGE_MARGIN, rowY);
        rowY += 13;
        doc
          .fillColor(MUTED)
          .fontSize(9)
          .font("Helvetica")
          .text(invoice.terms, PAGE_MARGIN, rowY, { width: contentWidth });
      }
    }

    // ─── Footer (on every page) ───────────────────────────────
    const pageCount = (doc as any).bufferedPageRange
      ? (doc as any).bufferedPageRange().count
      : 1;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(MUTED)
        .fontSize(8)
        .font("Helvetica")
        .text("Thank you for your business.", PAGE_MARGIN, pageHeight - 55, {
          align: "center",
          width: contentWidth,
        });

      if (pageCount > 1) {
        doc.text(`Page ${i + 1} of ${pageCount}`, PAGE_MARGIN, pageHeight - 42, {
          align: "right",
          width: contentWidth,
        });
      }
    }

    doc.end();
  });
};
