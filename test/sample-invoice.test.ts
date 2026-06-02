import { readFile, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  generateXRechnungPdf,
  generateXRechnungPdfFromInvoice,
} from '../src/generate.js';
import { sampleInvoiceInput } from './fixtures/sample-invoice-input.js';
import { sampleInvoice } from './fixtures/sample-invoice.js';
import { pdfPath, pngPath, writeDocsSample } from './write-docs-sample.js';

describe('generateXRechnungPdf', () => {
  it('returns a ZUGFeRD/XRechnung PDF for simplified invoice input', async () => {
    const signatureImage = await readFile(new URL('./fixtures/signature.png', import.meta.url));
    const pdf = await generateXRechnungPdf(sampleInvoiceInput, {
      lang: 'en-us',
      signatureImage,
    });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.subarray(0, 4).toString('ascii')).toBe('%PDF');
    expect(pdf.byteLength).toBeGreaterThan(10_000);

    const body = pdf.toString('latin1');
    expect(body).toContain('xrechnung.xml');
    expect(body).toContain('XRECHNUNG');

    await writeDocsSample(pdf);

    const [pdfInfo, pngInfo] = await Promise.all([stat(pdfPath), stat(pngPath)]);
    expect(pdfInfo.size).toBeGreaterThan(10_000);
    expect(pngInfo.size).toBeGreaterThan(10_000);
  }, 30_000);
});

describe('generateXRechnungPdfFromInvoice', () => {
  it('returns a ZUGFeRD/XRechnung PDF for @e-invoice-eu/core invoice data', async () => {
    const pdf = await generateXRechnungPdfFromInvoice(sampleInvoice, { lang: 'en-us' });

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.subarray(0, 4).toString('ascii')).toBe('%PDF');
    expect(pdf.byteLength).toBeGreaterThan(10_000);

    const body = pdf.toString('latin1');
    expect(body).toContain('xrechnung.xml');
    expect(body).toContain('XRECHNUNG');
  }, 30_000);
});
