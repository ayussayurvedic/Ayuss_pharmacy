import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | S.S. Pharmacy',
  description: 'Terms of Service for S.S. Pharmacy. Governing law: Alabama, USA.',
  alternates: {
    canonical: 'https://www.sspharmacy.in/terms',
  },
};

export default function TermsPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[768px] mx-auto px-4">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-1.5px] leading-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-muted mb-8">Last Updated: 2024</p>

        {/* Content */}
        <div className="space-y-6 text-sm text-body-text leading-relaxed">
          <p>
            Welcome to the website of S.S. Pharmacy (&quot;S.S. Pharmacy&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By accessing or using this website, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            1. Acceptance of Terms
          </h2>
          <p>
            By browsing or submitting inquiries through this website, you acknowledge that you have read, understood, and agree to these terms. If you do not agree to these terms, please do not use this site.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            2. Use of Website
          </h2>
          <p>
            You agree to use this website only for lawful purposes related to exploring IT staffing and talent placement services. You are prohibited from:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submitting false or misleading information through our forms</li>
            <li>Attempting to interfere with the proper working of this site or our portal services</li>
            <li>Using automated scripts or crawlers to extract content without our consent</li>
          </ul>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            3. Disclaimer of Warranties
          </h2>
          <p>
            This website and all information provided on it are provided on an &quot;as is&quot; and &quot;as available&quot; basis. S.S. Pharmacy makes no representation or warranties of any kind, express or implied, regarding the accuracy, completeness, reliability, or availability of the site or its content.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall S.S. Pharmacy be liable for any direct, indirect, incidental, special, or consequential damages arising out of your use of or inability to use this website, even if we have been advised of the possibility of such damages.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            5. Governing Law
          </h2>
          <p>
            These Terms of Service and any dispute arising from your use of this website shall be governed by and construed in accordance with the laws of the State of Alabama, USA, without regard to its conflict of law principles.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            6. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be posted to this page with an updated &quot;Last Updated&quot; date.
          </p>

          <h2 className="text-xl font-semibold text-ink pt-4 border-t border-hairline">
            7. Contact Information
          </h2>
          <p>
            For questions regarding these Terms of Service, please contact:
          </p>
          <p className="font-semibold text-ink">
            S.S. Pharmacy<br />
            Email: <a href="mailto:hr@sspharmacy.in" className="text-teal-primary hover:underline">hr@sspharmacy.in</a><br />
            Address: 1680, Unit 2G, 14th Ave S, Birmingham, AL 35205
          </p>
        </div>
      </div>
    </section>
  );
}
