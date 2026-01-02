import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions | SMS - Strangers Meeting Strangers',
  description: 'Terms and Conditions for Strangers Meeting Strangers',
}

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using Strangers Meeting Strangers (&quot;SMS,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) platform and services,
              you agree to be bound by these Terms and Conditions. If you do not agree to these terms,
              please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
            <p className="text-gray-700 mb-4">
              SMS provides a platform that connects people through curated social experiences and events.
              Our services include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Matching attendees with events based on interests and preferences</li>
              <li>Facilitating event registration and payment processing</li>
              <li>Providing tools for hosts to create and manage events</li>
              <li>Sending notifications about upcoming events via SMS and email</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Eligibility</h2>
            <p className="text-gray-700 mb-4">
              To use our services, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
            <p className="text-gray-700 mb-4">When using our platform and attending events, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Treat all participants, hosts, and staff with respect</li>
              <li>Not engage in harassment, discrimination, or harmful behavior</li>
              <li>Not misrepresent your identity or intentions</li>
              <li>Follow all event-specific rules and guidelines</li>
              <li>Not use our platform for any illegal purposes</li>
              <li>Not share others&apos; personal information without consent</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We reserve the right to remove users who violate these conduct standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Event Policies</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">Registration and Payment</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Event registration is confirmed upon successful payment</li>
              <li>Prices are displayed in USD and include applicable fees</li>
              <li>Payment is processed through secure third-party providers</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Cancellation and Refunds</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Cancellations made 48+ hours before the event: Full refund</li>
              <li>Cancellations made 24-48 hours before: 50% refund</li>
              <li>Cancellations made less than 24 hours before: No refund</li>
              <li>Event cancellations by SMS or hosts: Full refund provided</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">No-Shows</h3>
            <p className="text-gray-700 mb-4">
              Failure to attend a registered event without prior cancellation may affect your ability
              to register for future events and will not result in a refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Host Responsibilities</h2>
            <p className="text-gray-700 mb-4">If you host events through our platform, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide accurate event descriptions and details</li>
              <li>Ensure a safe and welcoming environment for all attendees</li>
              <li>Communicate any changes or cancellations promptly</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain appropriate insurance if required</li>
              <li>Not discriminate against attendees</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, trademarks, and intellectual property on our platform are owned by SMS
              or our licensors. You may not use, reproduce, or distribute our content without
              explicit permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              SMS provides a platform to connect people but is not responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>The actions or conduct of users, hosts, or attendees</li>
              <li>The quality or safety of events hosted through our platform</li>
              <li>Any disputes between users</li>
              <li>Loss or damage arising from use of our services</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, SMS shall not be liable for any indirect,
              incidental, special, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold harmless SMS, its officers, directors, employees,
              and agents from any claims, damages, or expenses arising from your use of our
              services or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account at any time for violations
              of these terms or for any other reason at our discretion. You may also delete your
              account at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may modify these Terms and Conditions at any time. Continued use of our services
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the
              State of Minnesota, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> legal@strangersmeetingstrangers.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            &larr; Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}
