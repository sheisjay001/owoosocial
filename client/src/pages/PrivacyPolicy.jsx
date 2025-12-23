import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-blue max-w-none space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
            <p>
              Welcome to OWOO Social ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, disclose, and protect your information when you visit our website or use our scheduling, broadcasting, and newsletter services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Data We Collect</h2>
            <p>We collect, use, store, and transfer different kinds of personal data about you:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Identity:</strong> Name, username.</li>
              <li><strong>Contact:</strong> Email address, phone number.</li>
              <li><strong>Account Security:</strong> Passwords are stored in hashed form only.</li>
              <li><strong>Connections:</strong> OAuth access tokens, platform/page IDs, WhatsApp phone number IDs, identifiers and API keys you provide to enable publishing and broadcasting.</li>
              <li><strong>Email Settings:</strong> Email domains and sender information used for newsletters.</li>
              <li><strong>Subscribers:</strong> Email addresses of newsletter subscribers you upload or collect.</li>
              <li><strong>Usage and Analytics:</strong> Information about how you use our website and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. How We Use Your Data</h2>
            <p>We use your data to provide and improve OWOO Social:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Account creation, login, and email verification.</li>
              <li>Scheduling and publishing posts to social platforms and messaging apps you connect.</li>
              <li>Sending newsletters you author to your subscriber lists.</li>
              <li>Providing analytics, improving features, and support.</li>
              <li>Security, fraud prevention, and legal compliance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Third-Party Services</h2>
            <p>
              We integrate with third-party providers to deliver the service. By using OWOO Social, you agree to the terms of those platforms:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Facebook/WhatsApp Graph API:</strong> Used to send WhatsApp messages and publish content to connected assets. We do not store social media passwords.</li>
              <li><strong>Email Providers (e.g., Resend, SendGrid):</strong> Used to send verification emails and newsletters.</li>
              <li><strong>Hosting/CDN (e.g., Vercel):</strong> Used to host our frontend application.</li>
            </ul>
            <p className="mt-2">We only store access tokens and identifiers you provide to enable functionality. You may revoke access at any time from your Settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Data Security</h2>
            <p>
              We implement technical and organizational measures to protect your data, including hashing passwords, access controls, and secure communications. No system is 100% secure; we work continuously to enhance protections.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Data Retention</h2>
            <p>
              We retain data for as long as your account is active and as necessary to provide the service. When you delete connections, subscribers, or your account, we remove associated data within a reasonable period unless we are required to retain it for legal, security, or compliance reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Your Rights</h2>
            <p>
              You have rights to access, correct, delete, or export your data, and to withdraw consent for communications. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Contact Us</h2>
            <p>
              For questions about this policy or our practices, contact: support@owoosocial.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
