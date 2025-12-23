import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-blue max-w-none space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using OWOO Social, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of the terms, you may not access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of Service</h2>
            <p>
              OWOO Social provides tools to create, schedule, and publish content to social media platforms and messaging apps you connect, and to send newsletters to your subscribers. Certain integrations use third-party APIs and providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Maintaining the confidentiality of your account and password.</li>
              <li>All activities that occur under your account.</li>
              <li>Ensuring your content complies with the policies of connected platforms (e.g., Facebook/Instagram, X/Twitter) and applicable laws.</li>
              <li>Not using the service for any illegal, harmful, or unauthorized purpose.</li>
              <li>Obtaining appropriate consent from recipients before sending messages or newsletters.</li>
              <li>Using only domains and sender information you own or control for email sending.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. API and Provider Usage</h2>
            <p>
              Our service interacts with third-party APIs and providers, including Facebook/WhatsApp Graph API and email services (e.g., Resend, SendGrid). We are not responsible for changes, downtime, or limitations imposed by third parties that may impact functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Emails and Newsletters</h2>
            <p>
              You are solely responsible for the content and recipients of emails and newsletters you send through OWOO Social. You agree to comply with anti-spam and communications laws, including obtaining consent and providing unsubscribe mechanisms where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Termination</h2>
            <p>
              We may suspend or terminate access to the service, without prior notice or liability, for any reason including breach of these Terms, abuse of the platform, or security concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Limitation of Liability</h2>
            <p>
              In no event shall OWOO Social, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
