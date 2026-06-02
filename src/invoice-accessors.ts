import type { Invoice } from '@e-invoice-eu/core';

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Germany',
  LU: 'Luxembourg',
};

function ubl(invoice: Invoice) {
  return invoice['ubl:Invoice'];
}

function first<T>(value: T | T[] | undefined): T | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function countryName(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return COUNTRY_NAMES[code] ?? code;
}

function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export function getInvoiceId(invoice: Invoice): string {
  return ubl(invoice)['cbc:ID'];
}

export function getIssueDate(invoice: Invoice): string {
  return ubl(invoice)['cbc:IssueDate'];
}

export function getBuyerReference(invoice: Invoice): string | undefined {
  return ubl(invoice)['cbc:BuyerReference'];
}

export function getContractReference(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:ContractDocumentReference']?.['cbc:ID'];
}

export function getVatNote(invoice: Invoice): string | undefined {
  const note = ubl(invoice)['cbc:Note'];
  if (Array.isArray(note)) return note[0];
  return note;
}

export function getPaymentTermsNote(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:PaymentTerms']?.['cbc:Note'];
}

export function getSellerName(invoice: Invoice): string {
  return (
    ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PartyName']?.['cbc:Name'] ?? ''
  );
}

export function getSellerStreet(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PostalAddress']?.[
    'cbc:StreetName'
  ];
}

export function getSellerCity(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PostalAddress']?.[
    'cbc:CityName'
  ];
}

export function getSellerPostcode(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PostalAddress']?.[
    'cbc:PostalZone'
  ];
}

export function getSellerCountry(invoice: Invoice): string | undefined {
  const code =
    ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PostalAddress']?.['cac:Country']?.[
      'cbc:IdentificationCode'
    ];
  return countryName(code);
}

export function getSellerVatId(invoice: Invoice): string | undefined {
  const schemes = ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PartyTaxScheme'];
  return first(schemes)?.['cbc:CompanyID'];
}

export function getSellerPhone(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:Contact']?.['cbc:Telephone'];
}

export function getSellerEmail(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:Contact']?.[
    'cbc:ElectronicMail'
  ];
}

export function getSellerDirector(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:Contact']?.['cbc:Name'];
}

export function getSellerRegistration(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingSupplierParty']['cac:Party']['cac:PartyLegalEntity']?.[
    'cbc:CompanyID'
  ];
}

export function getBuyerName(invoice: Invoice): string {
  return (
    ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:PartyName']?.['cbc:Name'] ?? ''
  );
}

export function getBuyerContact(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:Contact']?.['cbc:Name'];
}

export function getBuyerStreet(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:PostalAddress']?.[
    'cbc:StreetName'
  ];
}

export function getBuyerCity(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:PostalAddress']?.[
    'cbc:CityName'
  ];
}

export function getBuyerPostcode(invoice: Invoice): string | undefined {
  return ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:PostalAddress']?.[
    'cbc:PostalZone'
  ];
}

export function getBuyerCountry(invoice: Invoice): string | undefined {
  const code =
    ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:PostalAddress']?.['cac:Country']?.[
      'cbc:IdentificationCode'
    ];
  return countryName(code);
}

export function getBuyerVatId(invoice: Invoice): string | undefined {
  const scheme = ubl(invoice)['cac:AccountingCustomerParty']['cac:Party']['cac:PartyTaxScheme'];
  if (Array.isArray(scheme)) return scheme[0]?.['cbc:CompanyID'];
  return scheme?.['cbc:CompanyID'];
}

export function getFirstInvoiceLine(invoice: Invoice) {
  return ubl(invoice)['cac:InvoiceLine'][0];
}

export function getLineId(invoice: Invoice): string {
  return getFirstInvoiceLine(invoice)['cbc:ID'];
}

export function getLineName(invoice: Invoice): string {
  return getFirstInvoiceLine(invoice)['cac:Item']['cbc:Name'];
}

export function getLineNet(invoice: Invoice): string {
  return getFirstInvoiceLine(invoice)['cbc:LineExtensionAmount'];
}

export function getSubtotal(invoice: Invoice): string {
  return ubl(invoice)['cac:LegalMonetaryTotal']['cbc:LineExtensionAmount'];
}

export function getVat(invoice: Invoice): string {
  return first(ubl(invoice)['cac:TaxTotal'])?.['cbc:TaxAmount'] ?? '0.00';
}

export function getTotal(invoice: Invoice): string {
  return ubl(invoice)['cac:LegalMonetaryTotal']['cbc:PayableAmount'];
}

export function getBankName(invoice: Invoice): string | undefined {
  return first(ubl(invoice)['cac:PaymentMeans'])?.['cac:PayeeFinancialAccount']?.['cbc:Name'];
}

export function getBankIban(invoice: Invoice): string | undefined {
  return first(ubl(invoice)['cac:PaymentMeans'])?.['cac:PayeeFinancialAccount']?.['cbc:ID'];
}

export function getBankIbanDisplay(invoice: Invoice): string | undefined {
  const iban = getBankIban(invoice);
  return iban ? formatIban(iban) : undefined;
}

export function getBankBic(invoice: Invoice): string | undefined {
  return first(ubl(invoice)['cac:PaymentMeans'])?.['cac:PayeeFinancialAccount']?.[
    'cac:FinancialInstitutionBranch'
  ]?.['cbc:ID'];
}
