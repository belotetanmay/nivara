export interface FAQItem {
  question: string;
  answer: string;
}

export const COMPANY_INFO = {
  name: 'Nivara Wellness',
  tagline: 'Escape the Chaos, Find Your Calm',
  description: 'Next-Gen Immersive Mobile Sanctuary for Active Recovery & Stress Management',
  appVersion: '1.0.0',
  legalEntity: 'Nivara Wellness Private Limited',
  registeredAddress: 'Mumbai, Maharashtra, India',
  supportEmail: 'support@nivara.in',
  privacyEmail: 'privacy@nivara.in',
  grievanceEmail: 'grievance@nivara.in',
  supportPhone: '+91 98765 43210',
  
  grievanceOfficer: {
    name: 'Tanmay Belote',
    designation: 'Grievance Redressal Officer',
    email: 'grievance@nivara.in',
    phone: '+91 98765 43210',
    address: 'Nivara Wellness Headquarters, Mumbai, Maharashtra, India',
  },

  faqs: [
    {
      question: 'What is NIVARA?',
      answer: 'NIVARA is an on-demand wellness platform connecting users with climate-controlled, sensory-optimized mobile recovery vans equipped with zero-gravity seating, circadian lighting, and sound-dampening acoustic technology.',
    },
    {
      question: 'How do I book a wellness session?',
      answer: 'Open the NIVARA mobile app or website, choose your location, select an available wellness van and preferred duration (30, 45, or 60 minutes), and confirm your booking with secure online payment.',
    },
    {
      question: 'What is the cancellation and refund policy?',
      answer: 'Cancellations made more than 60 minutes prior to session start time or before van dispatch receive a 100% full refund. Late cancellations incur a 50% fee. If the van fails to arrive, you receive a 100% full refund.',
    },
    {
      question: 'Is NIVARA a medical service?',
      answer: 'No. NIVARA provides general relaxation, sensory relief, and stress management amenities. NIVARA is not a medical, psychiatric, or healthcare provider.',
    },
    {
      question: 'How do host payouts work for Wellness Partners?',
      answer: 'Wellness Partners earn an 80% share of gross session booking revenue. Payouts are transferred automatically to the registered bank account within T+3 business days.',
    },
  ] as FAQItem[],
};
