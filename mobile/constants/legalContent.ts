export interface LegalSection {
  heading: string;
  content: string;
}

export const LEGAL_CONTENT = {
  effectiveDate: 'July 2026',
  version: '1.0',
  operatedBy: 'Nivara Wellness Private Limited',

  termsAndConditions: {
    title: 'Terms and Conditions (Users)',
    sections: [
      {
        heading: '1. Definitions',
        content: `• "Application" or "Platform" means the Nivara mobile application, website, and any associated software.
• "Nivara", "we", "us" or "our" means Nivara Wellness Private Limited.
• "Nivara Van" means the climate-controlled mobile wellness unit operated by a Wellness Partner.
• "Services" means the technology-based marketplace allowing Users to discover, book, and pay for wellness Sessions.
• "User", "You" or "Your" means any individual accessing the Platform to book a Session.
• "Wellness Partner" or "Vendor" means an independent third-party operator offering wellness Sessions via Nivara.
• "Session" means a scheduled or on-demand appointment booked through the Platform.`
      },
      {
        heading: '2. Eligibility and Account Registration',
        content: `2.1 You must be at least 18 years of age and legally capable of entering into a binding contract under the Indian Contract Act, 1872 to create an Account.
2.2 Minors under 18 years may avail a Session only when booked, paid for, and supervised by a parent or legal guardian.
2.3 You are solely responsible for maintaining the confidentiality of your login credentials.`
      },
      {
        heading: '3. Nature of the Platform and Services',
        content: `3.1 Nivara operates a technology-based marketplace connecting Users with independent Wellness Partners. Nivara itself does not own or operate the Nivara Vans and does not directly provide therapeutic services.
3.2 Nivara facilitates discovery, booking, scheduling, live location tracking, and secure payment collection.`
      },
      {
        heading: '4. Booking, Van Allocation and Use of the Service',
        content: `4.1 Prices inclusive of applicable taxes are displayed prior to booking confirmation.
4.2 Users agree to be present at the specified location at the scheduled time. Unexcused absence beyond 15 minutes is treated as a no-show.
4.3 Misuse or damage to equipment inside the Nivara Van shall render the User liable for repair or replacement costs.`
      },
      {
        heading: '5. Health, Safety and Wellness Disclaimer',
        content: `NIVARA IS NOT A MEDICAL, PSYCHIATRIC, OR PSYCHOLOGICAL SERVICE PROVIDER. SESSIONS ARE NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. IF YOU ARE EXPERIENCING A MENTAL HEALTH CRISIS, CONSULT A QUALIFIED HEALTHCARE PROFESSIONAL.`
      },
      {
        heading: '6. Governing Law and Dispute Resolution',
        content: `These Terms are governed by the laws of India. Disputes shall first be raised through Nivara Grievance Redressal. Failing resolution, disputes are subject to the jurisdiction of competent courts at Mumbai, Maharashtra, India.`
      }
    ] as LegalSection[]
  },

  cancellationAndRefundPolicy: {
    title: 'Cancellation and Refund Policy',
    sections: [
      {
        heading: '1. Cancellation by User',
        content: `• Free Cancellation: Up to 60 minutes before the scheduled Session start time, or anytime before the Nivara Van is dispatched — 100% full refund.
• Late Cancellation: Within 60 minutes of start time or after van dispatch — a cancellation fee of up to 50% of booking value applies.
• No-Show: User absence within 15 minutes of van arrival at location is charged up to 100% of booking value.`
      },
      {
        heading: '2. Cancellation by Wellness Partner or Non-Availability',
        content: `If a Wellness Partner cancels a confirmed booking or fails to arrive, the User is entitled to a 100% full refund of all amounts paid or a free rebooking.`
      },
      {
        heading: '3. Refund Processing',
        content: `Approved refunds are initiated within 48 hours and credited to the original mode of payment within 5–7 business days.`
      }
    ] as LegalSection[]
  },

  privacyPolicy: {
    title: 'Privacy Policy (DPDP Act 2023 Compliant)',
    sections: [
      {
        heading: '1. Personal Data We Collect',
        content: `In compliance with the Digital Personal Data Protection Act, 2023 ("DPDP Act"), we collect:
• Account Data: Full name, email, phone number, profile photo.
• Vendor Verification Data: Government identity (KYC), VIN, insurance, bank account details.
• Booking & Location Data: Service selected, time, location coordinates for matching and live tracking.`
      },
      {
        heading: '2. Data Security & Retention',
        content: `Data is encrypted in transit (SSL/TLS) and at rest. Personal data is retained only as long as your Account remains active or as required by Indian financial record laws.`
      },
      {
        heading: '3. Your Data Principal Rights',
        content: `Subject to the DPDP Act, you have the right to access a summary of your data, request correction/erasure, withdraw consent, or contact our Grievance Officer at grievance@nivara.in.`
      }
    ] as LegalSection[]
  },

  grievanceRedressal: {
    title: 'Grievance Redressal',
    content: `In compliance with the Information Technology Rules, 2021 and DPDP Act 2023:
Grievance Officer: Tanmay Belote
Designation: Grievance Redressal Officer
Email: grievance@nivara.in
Phone: +91 98765 43210
Address: Nivara Wellness Headquarters, Mumbai, Maharashtra, India.

Grievances are acknowledged within 48 hours and resolved within 30 days.`
  },

  vendorTerms: {
    title: 'Wellness Partner (Vendor) Terms',
    sections: [
      {
        heading: '1. Onboarding & Verification',
        content: `Wellness Partners must complete KYC, vehicle registration, roadworthiness, liability insurance, and hygiene self-certification before listing.`
      },
      {
        heading: '2. Commercial Settlement & Taxes',
        content: `Nivara collects Session fees as the limited collection agent, deducts platform commission, and settles the 80% vendor share within T+3 business days. Applicable TDS/TCS under Income-tax and GST Acts will be withheld where mandated by law.`
      }
    ] as LegalSection[]
  }
};
