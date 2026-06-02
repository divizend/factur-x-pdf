import { InvoiceService } from '@e-invoice-eu/core';
import { buildUblInvoice } from './build-ubl.js';
import { getInvoiceId } from './invoice-accessors.js';
import { renderInvoicePdfFromInput } from './render-invoice-pdf-from-input.js';
import { renderInvoicePdf } from './render-invoice-pdf.js';
import type { GenerateXRechnungPdfOptions, Invoice, InvoiceInput } from './types.js';

const silentLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  log: () => {},
};

function toBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (typeof value === 'string') return Buffer.from(value, 'binary');
  throw new TypeError(`Unexpected PDF output type: ${typeof value}`);
}

async function embedXRechnungXml(
  invoice: Invoice,
  visualPdf: Buffer,
  invoiceNumber: string,
  options: GenerateXRechnungPdfOptions,
): Promise<Buffer> {
  const invoiceService = new InvoiceService(silentLogger);

  const result = await invoiceService.generate(invoice, {
    format: 'ZUGFeRD-XRechnung',
    lang: options.lang ?? 'en-us',
    pdf: {
      buffer: visualPdf,
      filename: `${invoiceNumber}-invoice.pdf`,
      mimetype: 'application/pdf',
    },
  });

  return toBuffer(result);
}

/**
 * Generate a ZUGFeRD/XRechnung hybrid PDF from simplified invoice input.
 *
 * The input is mapped to UBL internally before embedding `xrechnung.xml`.
 */
export async function generateXRechnungPdf(
  invoice: InvoiceInput,
  options: GenerateXRechnungPdfOptions = {},
): Promise<Buffer> {
  const ublInvoice = buildUblInvoice(invoice);
  const visualPdf = await renderInvoicePdfFromInput(invoice, {
    signatureImage: options.signatureImage,
  });

  return embedXRechnungXml(ublInvoice, visualPdf, invoice.number, options);
}

/**
 * Generate a ZUGFeRD/XRechnung hybrid PDF from `@e-invoice-eu/core` invoice data.
 */
export async function generateXRechnungPdfFromInvoice(
  invoice: Invoice,
  options: GenerateXRechnungPdfOptions = {},
): Promise<Buffer> {
  const visualPdf = await renderInvoicePdf(invoice, {
    signatureImage: options.signatureImage,
  });

  return embedXRechnungXml(invoice, visualPdf, getInvoiceId(invoice), options);
}
