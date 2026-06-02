import type { Invoice } from '@e-invoice-eu/core';

/** Sample reverse-charge maintenance invoice for tests and documentation. */
export const sampleInvoice = {
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

    'cac:ContractDocumentReference': {
      'cbc:ID': 'SERVICE-2024-001',
    },

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
          'cbc:CompanyLegalForm':
            'Company headquarters: Berlin; Commercial register: Berlin HRB 123456; Director: Jane Doe',
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
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': 'Example Customer S.A.',
        },
        'cac:Contact': {
          'cbc:Name': 'John Smith',
        },
      },
    },

    'cac:Delivery': {
      'cbc:ActualDeliveryDate': '2026-05-29',
    },

    'cac:PaymentMeans': [
      {
        'cbc:PaymentMeansCode': '30',
        'cbc:PaymentMeansCode@name': 'Credit transfer',
        'cbc:PaymentID': 'INV-2026-001',
        'cac:PayeeFinancialAccount': {
          'cbc:ID': 'DE89370400440532013000',
          'cbc:Name': 'Example Bank',
          'cac:FinancialInstitutionBranch': {
            'cbc:ID': 'COBADEFFXXX',
          },
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
              'cbc:TaxExemptionReasonCode': 'VATEX-EU-AE',
              'cbc:TaxExemptionReason': 'Reverse charge',
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
        'cac:InvoicePeriod': {
          'cbc:StartDate': '2026-05-01',
          'cbc:EndDate': '2026-05-31',
        },
        'cac:Item': {
          'cbc:Description':
            'Maintenance May 2026 under contract SERVICE-2024-001; buyer reference PO-12345.',
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
          'cbc:BaseQuantity': '1',
          'cbc:BaseQuantity@unitCode': 'C62',
        },
      },
    ],
  },
} as unknown as Invoice;
