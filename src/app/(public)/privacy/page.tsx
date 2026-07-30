import type { Metadata } from 'next';
import { CANONICAL_DOMAIN } from '@/lib/seo';

const path = '/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | S.S. Pharmacy',
  description: 'Privacy Policy for S.S. Pharmacy. Learn how we collect, use, and protect your information.',
  alternates: {
    canonical: `${CANONICAL_DOMAIN}${path}`,
  },
};

export default function PrivacyPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[768px] mx-auto px-4">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-1.5px] leading-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted mb-8">Last Updated: 2026</p>

        {/* Content */}
        <div className="space-y-6 text-sm text-body-text leading-relaxed">
          <p>
            At S.S. Pharmacy, we value your privacy and are committed to protecting your personal information. This Privacy Policy details how we handle the data you provide when interacting with our public website, ordering products, or submitting inquiries.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            1. Information We Collect
          </h2>
          <p>
            We collect information that you voluntarily submit through our contact, checkout, and distributor inquiry forms. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Company Name / Distributor Information</li>
            <li>Delivery Address and billing information for orders</li>
            <li>Formulation and wholesale requirement details</li>
          </ul>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            2. How We Use Your Information
          </h2>
          <p>
            We use the collected information exclusively to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Respond to your product orders and distributor inquiries</li>
            <li>Process and fulfill shipping of Ayurvedic formulations</li>
            <li>Coordinate B2B wholesale distribution applications</li>
            <li>Communicate with you regarding order confirmations, updates, or manufacturing services</li>
          </ul>
          <p>
            We do not use your information for unrelated marketing campaigns, tracking, or automated profiling.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            3. Sharing and Selling Information
          </h2>
          <p>
            <strong>We do not sell, rent, or trade your personal information to third parties.</strong> Your data is accessed only by authorized S.S. Pharmacy personnel and trusted shipping/delivery partners for the purpose of fulfilling your orders and distribution requests.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            4. Security
          </h2>
          <p>
            We implement industry-standard administrative and electronic security measures to safeguard the information we collect online. However, please be aware that no transmission over the internet can be guaranteed as 100% secure.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            5. Governing Law
          </h2>
          <p>
            This website and our manufacturing operations are governed by the laws of Andhra Pradesh, India, under the regulations of the AYUSH Department and the Drugs and Cosmetics Act.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            6. Contact Us
          </h2>
          <p>
            If you have questions or concerns about this policy, please reach out to us at:
          </p>
          <p className="font-semibold text-ink">
            S.S. Pharmacy<br />
            Email: <a href="mailto:info@sspharmacy.com" className="text-teal-primary hover:underline">info@sspharmacy.com</a><br />
            Address: D. No. 1-2-211 & 1-2-212, Prakash Nagar, Yerraguntla, Kadapa District, Andhra Pradesh - 516309, India
          </p>
        </div>
      </div>
    </section>
  );
}
