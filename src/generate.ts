import { InvoiceService } from '@e-invoice-eu/core';
import { buildUblInvoice } from './build-ubl.js';
import { renderInvoicePdf } from './render-invoice-pdf.js';
import type { GenerateXRechnungPdfOptions, InvoiceInput } from './types.js';

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

/**
 * Generate a ZUGFeRD/XRechnung hybrid PDF from a simple invoice object.
 *
 * Returns a single A4 PDF with a human-readable invoice page and embedded
 * XRechnung XML (`xrechnung.xml`).
 */
export async function generateXRechnungPdf(
  invoice: InvoiceInput,
  options: GenerateXRechnungPdfOptions = {},
): Promise<Buffer> {
  const visualPdf = await renderInvoicePdf(invoice, {
    signatureImage: options.signatureImage,
  });
  const invoiceService = new InvoiceService(silentLogger);

  const result = await invoiceService.generate(buildUblInvoice(invoice), {
    format: 'ZUGFeRD-XRechnung',
    lang: options.lang ?? 'en-us',
    pdf: {
      buffer: visualPdf,
      filename: `${invoice.number}-invoice.pdf`,
      mimetype: 'application/pdf',
    },
  });

  return toBuffer(result);
}
