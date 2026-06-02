export type { Invoice } from '@e-invoice-eu/core';

export interface InvoiceParty {
  name: string;
  street: string;
  postcode: string;
  city: string;
  countryCode: string;
  country: string;
  vatId: string;
  endpointSchemeId: string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  registration?: string;
  director?: string;
}

export interface InvoiceBankDetails {
  name: string;
  iban: string;
  ibanDisplay?: string;
  bic: string;
}

export interface InvoiceLine {
  id: string;
  name: string;
  description?: string;
  quantity: string;
  unitCode: string;
  price: string;
  net: string;
}

/** Simplified input for {@link generateXRechnungPdf}. */
export interface InvoiceInput {
  number: string;
  issueDateIso: string;
  dueDateIso: string;
  serviceStartIso: string;
  serviceEndIso: string;
  serviceDateIso: string;
  buyerReference: string;
  contract: string;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  bank: InvoiceBankDetails;
  line: InvoiceLine;
  subtotal: string;
  vat: string;
  total: string;
  vatNote?: string;
  paymentTermsNote?: string;
}

export interface GenerateXRechnungPdfOptions {
  lang?: string;
  /** PNG image buffer rendered above the signatory name (transparent background recommended). */
  signatureImage?: Buffer;
}
