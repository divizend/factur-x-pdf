import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib';
import type { GenerateXRechnungPdfOptions, InvoiceInput } from './types.js';

function formatIssueDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

function money(amount: string): string {
  return `${Number(amount).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;
}

function drawRight(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  font: PDFFont,
  size: number,
  color = rgb(0, 0, 0),
): void {
  page.drawText(text, {
    x: rightX - font.widthOfTextAtSize(text, size),
    y,
    size,
    font,
    color,
  });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/u).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  size: number,
  lineHeight = size * 1.25,
): number {
  const lines = wrapText(text, font, size, maxWidth);
  let currentY = y;
  for (const line of lines) {
    page.drawText(line, { x, y: currentY, size, font });
    currentY -= lineHeight;
  }
  return currentY;
}

/** Render a one-page human-readable invoice PDF from simplified input. */
export async function renderInvoicePdfFromInput(
  invoice: InvoiceInput,
  options: Pick<GenerateXRechnungPdfOptions, 'signatureImage'> = {},
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Invoice ${invoice.number}`);
  doc.setAuthor(invoice.seller.name);
  doc.setSubject(`Invoice ${invoice.number} for ${invoice.buyer.name}`);
  doc.setCreator('factur-x-pdf');
  doc.setProducer('pdf-lib');

  const page = doc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const left = 58;
  const right = width - 58;
  const tableFontSize = 10;
  const tableCellPadding = 8;
  const tableDescent = tableFontSize * 0.21;
  const tableCapHeight = tableFontSize * 0.72;
  const footerFontSize = 7.5;
  const footerLineStep = 9;
  const turquoise = rgb(0.18, 0.62, 0.62);
  const blue = rgb(0.13, 0.28, 0.75);
  let y = height - 96;

  const headerTitle = invoice.seller.name.toUpperCase();
  page.drawText(headerTitle, {
    x: width / 2 - bold.widthOfTextAtSize(headerTitle, 24) / 2,
    y,
    size: 24,
    font: bold,
    color: turquoise,
  });
  if (invoice.seller.website) {
    page.drawText(invoice.seller.website, {
      x: width / 2 - regular.widthOfTextAtSize(invoice.seller.website, 8) / 2,
      y: y - 12,
      size: 8,
      font: regular,
    });
  }

  y -= 46;
  const senderLine = `${invoice.seller.name} - ${invoice.seller.street} - ${invoice.seller.postcode} ${invoice.seller.city}`;
  const senderLineSize = 8;
  page.drawText(senderLine, { x: left, y, size: senderLineSize, font: regular });
  const senderLineWidth = regular.widthOfTextAtSize(senderLine, senderLineSize);
  page.drawLine({
    start: { x: left, y: y - 2 },
    end: { x: left + senderLineWidth, y: y - 2 },
    thickness: 0.5,
  });

  y -= 22;
  page.drawText(invoice.buyer.name, { x: left, y, size: 13, font: bold });
  y -= 18;
  page.drawText(invoice.buyer.street, { x: left, y, size: 11, font: regular });
  y -= 13;
  page.drawText(`${invoice.buyer.postcode} ${invoice.buyer.city}`, {
    x: left,
    y,
    size: 11,
    font: regular,
  });
  y -= 13;
  page.drawText(invoice.buyer.country, { x: left, y, size: 11, font: regular });
  y -= 25;
  page.drawText(`VAT ID: ${invoice.buyer.vatId}`, { x: left, y, size: 11, font: regular });

  const metaX = 372;
  const issueDateDisplay = formatIssueDate(invoice.issueDateIso);
  page.drawText('Invoice date', { x: metaX, y: height - 155, size: 12, font: bold });
  page.drawText(issueDateDisplay, { x: metaX, y: height - 169, size: 11, font: regular });
  page.drawText('Invoice number', { x: metaX, y: height - 206, size: 12, font: bold });
  page.drawText(invoice.number, { x: metaX, y: height - 220, size: 11, font: regular });

  y -= 38;
  if (invoice.buyer.contact) {
    page.drawText(`Dear ${invoice.buyer.contact},`, { x: left, y, size: 11, font: regular });
    y -= 25;
  }

  y = drawWrapped(
    page,
    `The following amount will be charged according to the contract "${invoice.contract}" and code ${invoice.buyerReference}:`,
    left,
    y,
    470,
    regular,
    10.5,
    13,
  );

  y -= 16;
  page.drawText('#', { x: left, y, size: tableFontSize, font: bold });
  page.drawText('Description', { x: left + 34, y, size: tableFontSize, font: bold });
  drawRight(page, 'Total', right, y, bold, tableFontSize);
  y -= tableCellPadding + tableDescent;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.8 });

  y -= tableCellPadding + tableCapHeight;
  page.drawText(invoice.line.id, { x: left, y, size: tableFontSize, font: regular });
  page.drawText(invoice.line.name, { x: left + 34, y, size: tableFontSize, font: regular });
  drawRight(page, money(invoice.line.net), right, y, regular, tableFontSize);

  y -= tableCellPadding + tableDescent;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1.2 });

  y -= 16;
  page.drawText('Subtotal', { x: 385, y, size: 10, font: regular });
  drawRight(page, money(invoice.subtotal), right, y, regular, 10);
  y -= 16;
  page.drawText('0% VAT', { x: 385, y, size: 10, font: regular });
  drawRight(page, money(invoice.vat), right, y, regular, 10);
  y -= 18;
  page.drawText('Total', { x: 385, y, size: 10, font: bold });
  drawRight(page, money(invoice.total), right, y, bold, 10);

  y -= 35;
  y = drawWrapped(
    page,
    invoice.vatNote ??
      'The VAT rate is 0% due to the application of the reverse charge procedure.',
    left,
    y,
    470,
    regular,
    11,
    14,
  );
  y -= 6;
  y = drawWrapped(
    page,
    invoice.paymentTermsNote ??
      'Please transfer the stated invoice amount within the next 14 days to the bank details listed below. The invoice date equals the service date.',
    left,
    y,
    470,
    regular,
    11,
    14,
  );

  y -= 18;
  page.drawText('Sincerely,', { x: left, y, size: 11, font: regular });
  y -= 32;
  const signatory = invoice.seller.director ?? invoice.seller.name;

  if (options.signatureImage) {
    const signature = await doc.embedPng(options.signatureImage);
    const signatureWidth = 120;
    const signatureHeight = (signature.height / signature.width) * signatureWidth;
    page.drawImage(signature, {
      x: left,
      y: y - signatureHeight + 12,
      width: signatureWidth,
      height: signatureHeight,
    });
    y -= signatureHeight + 4;
  } else {
    page.drawText(signatory, { x: left + 2, y, size: 18, font: italic, color: blue });
    y -= 26;
  }

  page.drawText(signatory, { x: left, y, size: 10, font: bold });
  y -= 12;
  page.drawText(`CEO ${invoice.seller.name}`, { x: left, y, size: 8, font: regular });

  const footerY = 82;
  page.drawText(invoice.seller.name, { x: left, y: footerY, size: footerFontSize, font: regular });
  page.drawText(invoice.seller.street, { x: left, y: footerY - footerLineStep, size: footerFontSize, font: regular });
  page.drawText(`${invoice.seller.postcode} ${invoice.seller.city}`, {
    x: left,
    y: footerY - footerLineStep * 2,
    size: footerFontSize,
    font: regular,
  });
  page.drawText(invoice.seller.country, {
    x: left,
    y: footerY - footerLineStep * 3,
    size: footerFontSize,
    font: regular,
  });

  let footerMiddleY = footerY;
  const drawFooterMiddleLine = (text: string): void => {
    page.drawText(text, { x: 210, y: footerMiddleY, size: footerFontSize, font: regular });
    footerMiddleY -= footerLineStep;
  };

  const contactLines = [
    invoice.seller.phone ? `Phone: ${invoice.seller.phone}` : null,
    invoice.seller.email ? `Email: ${invoice.seller.email}` : null,
    invoice.seller.website ? `Internet: ${invoice.seller.website}` : null,
  ].filter((line): line is string => line !== null);

  for (const line of contactLines) {
    drawFooterMiddleLine(line);
  }
  if (contactLines.length > 0) {
    footerMiddleY -= footerLineStep;
  }
  drawFooterMiddleLine(`Company headquarters: ${invoice.seller.city}`);
  if (invoice.seller.registration) {
    drawFooterMiddleLine(`Commercial register: ${invoice.seller.registration}`);
  }
  if (invoice.seller.director) {
    drawFooterMiddleLine(`Director: ${invoice.seller.director}`);
  }
  drawFooterMiddleLine(`VAT ID: ${invoice.seller.vatId}`);

  page.drawText(invoice.bank.name, { x: 385, y: footerY, size: footerFontSize, font: regular });
  page.drawText(`IBAN: ${invoice.bank.ibanDisplay ?? invoice.bank.iban}`, {
    x: 385,
    y: footerY - footerLineStep,
    size: footerFontSize,
    font: regular,
  });
  page.drawText(`BIC: ${invoice.bank.bic}`, {
    x: 385,
    y: footerY - footerLineStep * 2,
    size: footerFontSize,
    font: regular,
  });

  return Buffer.from(await doc.save());
}
