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
  return `${n.toFixed(2)} ${currency}`;
};

const fmtDate = (d: Date): string => {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Builds a professional invoice PDF and returns it as a Buffer.
 */
export const buildInvoicePdf = (invoice: InvoiceForPdf): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const primaryColor = "#1a1a2e";
    const accentColor = "#4361ee";
    const mutedColor = "#666666";
    const lineColor = "#e0e0e0";

    // ─── Header ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
    doc
      .fillColor("#ffffff")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("INVOICE", 50, 25);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`#${invoice.invoice_number}`, 50, 57);

    // ─── Invoice Meta ─────────────────────────────────────────
    doc.fillColor(primaryColor).fontSize(10).font("Helvetica");
    const metaTop = 100;
    doc.text(`Issue Date:  ${fmtDate(invoice.issue_date)}`, 50, metaTop);
    doc.text(`Due Date:    ${fmtDate(invoice.due_date)}`, 50, metaTop + 16);

    // ─── Bill To ──────────────────────────────────────────────
    doc
      .fillColor(accentColor)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("BILL TO", 300, metaTop);

    doc.fillColor(primaryColor).fontSize(10).font("Helvetica-Bold");
    doc.text(invoice.client.name, 300, metaTop + 14);

    doc.font("Helvetica").fillColor(mutedColor);
    if (invoice.client.company) doc.text(invoice.client.company, 300);
    if (invoice.client.email) doc.text(invoice.client.email, 300);
    if (invoice.client.address) doc.text(invoice.client.address, 300);

    // ─── Divider ──────────────────────────────────────────────
    const tableTop = 200;
    doc
      .moveTo(50, tableTop - 10)
      .lineTo(doc.page.width - 50, tableTop - 10)
      .strokeColor(lineColor)
      .lineWidth(1)
      .stroke();

    // ─── Table Header ─────────────────────────────────────────
    doc.rect(50, tableTop, doc.page.width - 100, 20).fill(primaryColor);

    doc
      .fillColor("#ffffff")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("DESCRIPTION", 56, tableTop + 6, { width: 230 })
      .text("QTY", 286, tableTop + 6, { width: 60, align: "right" })
      .text("RATE", 356, tableTop + 6, { width: 80, align: "right" })
      .text("AMOUNT", 436, tableTop + 6, { width: 80, align: "right" });

    // ─── Table Rows ───────────────────────────────────────────
    let rowY = tableTop + 26;
    invoice.invoice_items.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.rect(50, rowY - 4, doc.page.width - 100, 18).fill("#f7f7f7");
      }
      doc.fillColor(primaryColor).fontSize(9).font("Helvetica");
      doc.text(item.description, 56, rowY, { width: 225 });
      doc.text(toNum(item.quantity).toFixed(2), 286, rowY, {
        width: 60,
        align: "right",
      });
      doc.text(fmt(item.rate, invoice.currency), 356, rowY, {
        width: 80,
        align: "right",
      });
      doc.text(fmt(item.amount, invoice.currency), 436, rowY, {
        width: 80,
        align: "right",
      });
      rowY += 20;
    });

    // ─── Totals ───────────────────────────────────────────────
    rowY += 10;
    doc
      .moveTo(50, rowY)
      .lineTo(doc.page.width - 50, rowY)
      .strokeColor(lineColor)
      .lineWidth(0.5)
      .stroke();
    rowY += 12;

    const labelX = 350;
    const valueX = 436;

    const drawTotalRow = (label: string, value: string, bold = false) => {
      doc
        .fillColor(bold ? primaryColor : mutedColor)
        .fontSize(bold ? 11 : 9)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .text(label, labelX, rowY, { width: 80, align: "right" })
        .text(value, valueX, rowY, { width: 80, align: "right" });
      rowY += bold ? 20 : 16;
    };

    drawTotalRow("Subtotal", fmt(invoice.subtotal, invoice.currency));
    drawTotalRow("Tax", fmt(invoice.tax, invoice.currency));
    drawTotalRow("Discount", `- ${fmt(invoice.discount, invoice.currency)}`);

    doc
      .moveTo(labelX, rowY)
      .lineTo(doc.page.width - 50, rowY)
      .strokeColor(accentColor)
      .lineWidth(1)
      .stroke();
    rowY += 8;

    drawTotalRow("TOTAL", fmt(invoice.total, invoice.currency), true);

    // ─── Notes / Terms ────────────────────────────────────────
    if (invoice.notes || invoice.terms) {
      rowY += 20;
      doc
        .moveTo(50, rowY)
        .lineTo(doc.page.width - 50, rowY)
        .strokeColor(lineColor)
        .lineWidth(0.5)
        .stroke();
      rowY += 12;

      if (invoice.notes) {
        doc
          .fillColor(accentColor)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text("NOTES", 50, rowY);
        rowY += 13;
        doc
          .fillColor(mutedColor)
          .fontSize(9)
          .font("Helvetica")
          .text(invoice.notes, 50, rowY, { width: doc.page.width - 100 });
        rowY +=
          doc.heightOfString(invoice.notes, { width: doc.page.width - 100 }) +
          10;
      }

      if (invoice.terms) {
        doc
          .fillColor(accentColor)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text("TERMS & CONDITIONS", 50, rowY);
        rowY += 13;
        doc
          .fillColor(mutedColor)
          .fontSize(9)
          .font("Helvetica")
          .text(invoice.terms, 50, rowY, { width: doc.page.width - 100 });
      }
    }

    // ─── Footer ───────────────────────────────────────────────
    doc
      .fillColor(mutedColor)
      .fontSize(8)
      .font("Helvetica")
      .text("Thank you for your business.", 50, doc.page.height - 60, {
        align: "center",
        width: doc.page.width - 100,
      });

    doc.end();
  });
};
