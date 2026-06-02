import type { Invoice } from '@e-invoice-eu/core';
import type { InvoiceInput } from './types.js';

const EUR = 'EUR';

export function buildUblInvoice(invoice: InvoiceInput): Invoice {
  const vatNote =
    invoice.vatNote ??
    'The VAT rate is 0% due to the application of the reverse charge procedure.';
  const paymentTermsNote =
    invoice.paymentTermsNote ??
    `Please transfer the stated invoice amount within 14 days. Due date: ${invoice.dueDateIso}.`;

  return {
    'ubl:Invoice': {
      'cbc:ID': invoice.number,
      'cbc:IssueDate': invoice.issueDateIso,
      'cbc:DueDate': invoice.dueDateIso,
      'cbc:InvoiceTypeCode': '380',
      'cbc:Note': [vatNote],
      'cbc:TaxPointDate': invoice.serviceDateIso,
      'cbc:DocumentCurrencyCode': EUR,
      'cbc:BuyerReference': invoice.buyerReference,

      'cac:InvoicePeriod': {
        'cbc:StartDate': invoice.serviceStartIso,
        'cbc:EndDate': invoice.serviceEndIso,
      },

      'cac:ContractDocumentReference': {
        'cbc:ID': invoice.contract,
      },

      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cbc:EndpointID': invoice.seller.vatId,
          'cbc:EndpointID@schemeID': invoice.seller.endpointSchemeId,
          'cac:PartyName': { 'cbc:Name': invoice.seller.name },
          'cac:PostalAddress': {
            'cbc:StreetName': invoice.seller.street,
            'cbc:CityName': invoice.seller.city,
            'cbc:PostalZone': invoice.seller.postcode,
            'cac:Country': { 'cbc:IdentificationCode': invoice.seller.countryCode },
          },
          'cac:PartyTaxScheme': [
            {
              'cbc:CompanyID': invoice.seller.vatId,
              'cac:TaxScheme': { 'cbc:ID': 'VAT' },
            },
          ],
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': invoice.seller.name,
            'cbc:CompanyID': invoice.seller.registration,
            'cbc:CompanyLegalForm': `Company headquarters: ${invoice.seller.city}; Commercial register: ${invoice.seller.registration}; Director: ${invoice.seller.director}`,
          },
          'cac:Contact': {
            'cbc:Name': invoice.seller.director,
            'cbc:Telephone': invoice.seller.phone,
            'cbc:ElectronicMail': invoice.seller.email,
          },
        },
      },

      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cbc:EndpointID': invoice.buyer.vatId,
          'cbc:EndpointID@schemeID': invoice.buyer.endpointSchemeId,
          'cac:PartyName': { 'cbc:Name': invoice.buyer.name },
          'cac:PostalAddress': {
            'cbc:StreetName': invoice.buyer.street,
            'cbc:CityName': invoice.buyer.city,
            'cbc:PostalZone': invoice.buyer.postcode,
            'cac:Country': { 'cbc:IdentificationCode': invoice.buyer.countryCode },
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': invoice.buyer.vatId,
            'cac:TaxScheme': { 'cbc:ID': 'VAT' },
          },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': invoice.buyer.name,
          },
          'cac:Contact': {
            'cbc:Name': invoice.buyer.contact,
          },
        },
      },

      'cac:Delivery': {
        'cbc:ActualDeliveryDate': invoice.serviceDateIso,
      },

      'cac:PaymentMeans': [
        {
          'cbc:PaymentMeansCode': '30',
          'cbc:PaymentMeansCode@name': 'Credit transfer',
          'cbc:PaymentID': invoice.number,
          'cac:PayeeFinancialAccount': {
            'cbc:ID': invoice.bank.iban,
            'cbc:Name': invoice.bank.name,
            'cac:FinancialInstitutionBranch': {
              'cbc:ID': invoice.bank.bic,
            },
          },
        },
      ],

      'cac:PaymentTerms': {
        'cbc:Note': paymentTermsNote,
      },

      'cac:TaxTotal': [
        {
          'cbc:TaxAmount': invoice.vat,
          'cbc:TaxAmount@currencyID': EUR,
          'cac:TaxSubtotal': [
            {
              'cbc:TaxableAmount': invoice.subtotal,
              'cbc:TaxableAmount@currencyID': EUR,
              'cbc:TaxAmount': invoice.vat,
              'cbc:TaxAmount@currencyID': EUR,
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
        'cbc:LineExtensionAmount': invoice.subtotal,
        'cbc:LineExtensionAmount@currencyID': EUR,
        'cbc:TaxExclusiveAmount': invoice.subtotal,
        'cbc:TaxExclusiveAmount@currencyID': EUR,
        'cbc:TaxInclusiveAmount': invoice.total,
        'cbc:TaxInclusiveAmount@currencyID': EUR,
        'cbc:PayableAmount': invoice.total,
        'cbc:PayableAmount@currencyID': EUR,
      },

      'cac:InvoiceLine': [
        {
          'cbc:ID': invoice.line.id,
          'cbc:InvoicedQuantity': invoice.line.quantity,
          'cbc:InvoicedQuantity@unitCode': invoice.line.unitCode,
          'cbc:LineExtensionAmount': invoice.line.net,
          'cbc:LineExtensionAmount@currencyID': EUR,
          'cac:InvoicePeriod': {
            'cbc:StartDate': invoice.serviceStartIso,
            'cbc:EndDate': invoice.serviceEndIso,
          },
          'cac:Item': {
            'cbc:Description': invoice.line.description,
            'cbc:Name': invoice.line.name,
            'cac:ClassifiedTaxCategory': {
              'cbc:ID': 'AE',
              'cbc:Percent': '0.00',
              'cac:TaxScheme': { 'cbc:ID': 'VAT' },
            },
          },
          'cac:Price': {
            'cbc:PriceAmount': invoice.line.price,
            'cbc:PriceAmount@currencyID': EUR,
            'cbc:BaseQuantity': invoice.line.quantity,
            'cbc:BaseQuantity@unitCode': invoice.line.unitCode,
          },
        },
      ],
    },
  } as unknown as Invoice;
}
