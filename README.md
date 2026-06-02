# factur-x-pdf

Generate Factur-X hybrid PDFs (ZUGFeRD / XRechnung) from simplified invoice input or from [`@e-invoice-eu/core`](https://www.npmjs.com/package/@e-invoice-eu/core) `Invoice` data.

## Install

```bash
npm install factur-x-pdf
```

## Usage

Both functions return a single A4 PDF with a human-readable invoice layout and embedded `xrechnung.xml` (XRechnung / ZUGFeRD).

### Simplified input

Use `generateXRechnungPdf` with a flat `InvoiceInput` object. The library maps it to UBL internally.

```typescript
import { writeFile } from 'node:fs/promises';
import { generateXRechnungPdf, type InvoiceInput } from 'factur-x-pdf';

const invoice: InvoiceInput = {
  number: 'INV-2026-001',
  issueDateIso: '2026-05-29',
  dueDateIso: '2026-06-12',
  serviceStartIso: '2026-05-01',
  serviceEndIso: '2026-05-31',
  serviceDateIso: '2026-05-29',
  buyerReference: 'PO-12345',
  contract: 'SERVICE-2024-001',
  seller: {
    name: 'Acme Software GmbH',
    street: 'Musterstraße 1',
    postcode: '10115',
    city: 'Berlin',
    countryCode: 'DE',
    country: 'Germany',
    vatId: 'DE123456789',
    endpointSchemeId: '9930',
    phone: '+49 30 12345678',
    email: 'billing@example.com',
    website: 'example.com',
    registration: 'Berlin HRB 123456',
    director: 'Jane Doe',
  },
  buyer: {
    name: 'Example Customer S.A.',
    contact: 'John Smith',
    street: '1 Rue Exemple',
    postcode: '1234',
    city: 'Sample City',
    countryCode: 'LU',
    country: 'Luxembourg',
    vatId: 'LU99999999999',
    endpointSchemeId: '9938',
  },
  bank: {
    name: 'Example Bank',
    iban: 'DE89370400440532013000',
    ibanDisplay: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
  },
  line: {
    id: '1',
    name: 'Maintenance May 2026',
    description:
      'Maintenance May 2026 under contract SERVICE-2024-001; buyer reference PO-12345.',
    quantity: '1',
    unitCode: 'C62',
    price: '1250.00',
    net: '1250.00',
  },
  subtotal: '1250.00',
  vat: '0.00',
  total: '1250.00',
};

const pdf = await generateXRechnungPdf(invoice, { lang: 'en-us' });
await writeFile('invoice.pdf', pdf);
```

### `@e-invoice-eu/core` invoice data

Use `generateXRechnungPdfFromInvoice` when you already have UBL `Invoice` data from `@e-invoice-eu/core` (for example from a spreadsheet mapping).

```typescript
import { writeFile } from 'node:fs/promises';
import { generateXRechnungPdfFromInvoice, type Invoice } from 'factur-x-pdf';

const invoice = {
  'ubl:Invoice': {
    'cbc:ID': 'INV-2026-001',
    'cbc:IssueDate': '2026-05-29',
    'cbc:DueDate': '2026-06-12',
    'cbc:InvoiceTypeCode': '380',
    'cbc:Note': [
      'The VAT rate is 0% due to the application of the reverse charge procedure.',
    ],
    'cbc:TaxPointDate': '2026-05-29',
    'cbc:DocumentCurrencyCode': 'EUR',
    'cbc:BuyerReference': 'PO-12345',
    'cac:InvoicePeriod': {
      'cbc:StartDate': '2026-05-01',
      'cbc:EndDate': '2026-05-31',
    },
    'cac:ContractDocumentReference': { 'cbc:ID': 'SERVICE-2024-001' },
    'cac:AccountingSupplierParty': {
      'cac:Party': {
        'cbc:EndpointID': 'DE123456789',
        'cbc:EndpointID@schemeID': '9930',
        'cac:PartyName': { 'cbc:Name': 'Acme Software GmbH' },
        'cac:PostalAddress': {
          'cbc:StreetName': 'Musterstraße 1',
          'cbc:CityName': 'Berlin',
          'cbc:PostalZone': '10115',
          'cac:Country': { 'cbc:IdentificationCode': 'DE' },
        },
        'cac:PartyTaxScheme': [
          {
            'cbc:CompanyID': 'DE123456789',
            'cac:TaxScheme': { 'cbc:ID': 'VAT' },
          },
        ],
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': 'Acme Software GmbH',
          'cbc:CompanyID': 'Berlin HRB 123456',
        },
        'cac:Contact': {
          'cbc:Name': 'Jane Doe',
          'cbc:Telephone': '+49 30 12345678',
          'cbc:ElectronicMail': 'billing@example.com',
        },
      },
    },
    'cac:AccountingCustomerParty': {
      'cac:Party': {
        'cbc:EndpointID': 'LU99999999999',
        'cbc:EndpointID@schemeID': '9938',
        'cac:PartyName': { 'cbc:Name': 'Example Customer S.A.' },
        'cac:PostalAddress': {
          'cbc:StreetName': '1 Rue Exemple',
          'cbc:CityName': 'Sample City',
          'cbc:PostalZone': '1234',
          'cac:Country': { 'cbc:IdentificationCode': 'LU' },
        },
        'cac:PartyTaxScheme': {
          'cbc:CompanyID': 'LU99999999999',
          'cac:TaxScheme': { 'cbc:ID': 'VAT' },
        },
        'cac:PartyLegalEntity': { 'cbc:RegistrationName': 'Example Customer S.A.' },
        'cac:Contact': { 'cbc:Name': 'John Smith' },
      },
    },
    'cac:Delivery': { 'cbc:ActualDeliveryDate': '2026-05-29' },
    'cac:PaymentMeans': [
      {
        'cbc:PaymentMeansCode': '30',
        'cbc:PaymentID': 'INV-2026-001',
        'cac:PayeeFinancialAccount': {
          'cbc:ID': 'DE89370400440532013000',
          'cbc:Name': 'Example Bank',
          'cac:FinancialInstitutionBranch': { 'cbc:ID': 'COBADEFFXXX' },
        },
      },
    ],
    'cac:PaymentTerms': {
      'cbc:Note':
        'Please transfer the stated invoice amount within 14 days. Due date: 2026-06-12.',
    },
    'cac:TaxTotal': [
      {
        'cbc:TaxAmount': '0.00',
        'cbc:TaxAmount@currencyID': 'EUR',
        'cac:TaxSubtotal': [
          {
            'cbc:TaxableAmount': '1250.00',
            'cbc:TaxableAmount@currencyID': 'EUR',
            'cbc:TaxAmount': '0.00',
            'cbc:TaxAmount@currencyID': 'EUR',
            'cac:TaxCategory': {
              'cbc:ID': 'AE',
              'cbc:Percent': '0.00',
              'cac:TaxScheme': { 'cbc:ID': 'VAT' },
            },
          },
        ],
      },
    ],
    'cac:LegalMonetaryTotal': {
      'cbc:LineExtensionAmount': '1250.00',
      'cbc:LineExtensionAmount@currencyID': 'EUR',
      'cbc:TaxExclusiveAmount': '1250.00',
      'cbc:TaxExclusiveAmount@currencyID': 'EUR',
      'cbc:TaxInclusiveAmount': '1250.00',
      'cbc:TaxInclusiveAmount@currencyID': 'EUR',
      'cbc:PayableAmount': '1250.00',
      'cbc:PayableAmount@currencyID': 'EUR',
    },
    'cac:InvoiceLine': [
      {
        'cbc:ID': '1',
        'cbc:InvoicedQuantity': '1',
        'cbc:InvoicedQuantity@unitCode': 'C62',
        'cbc:LineExtensionAmount': '1250.00',
        'cbc:LineExtensionAmount@currencyID': 'EUR',
        'cac:Item': {
          'cbc:Name': 'Maintenance May 2026',
          'cac:ClassifiedTaxCategory': {
            'cbc:ID': 'AE',
            'cbc:Percent': '0.00',
            'cac:TaxScheme': { 'cbc:ID': 'VAT' },
          },
        },
        'cac:Price': {
          'cbc:PriceAmount': '1250.00',
          'cbc:PriceAmount@currencyID': 'EUR',
        },
      },
    ],
  },
} satisfies Invoice;

const pdf = await generateXRechnungPdfFromInvoice(invoice, { lang: 'en-us' });
await writeFile('invoice.pdf', pdf);
```

## Example output

Sample invoice generated from the test fixture (`npm run test` writes fresh artifacts to `docs/`):

![Sample invoice rendering](docs/sample-invoice.png)

[Download sample PDF](docs/sample-invoice.pdf)

## Development

```bash
npm install
npm run build
npm run test
```

The PNG preview in `docs/` is regenerated during tests via [`pdf-to-png-converter`](https://www.npmjs.com/package/pdf-to-png-converter) (PDF.js + `@napi-rs/canvas`).

## License

MIT
