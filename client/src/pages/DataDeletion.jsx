import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Deletion Instructions</h1>
        
        <div className="prose prose-blue max-w-none space-y-6 text-gray-600">
          <section>
            <p>
              This page explains how to delete your data associated with OWOO Social. You can revoke connected platform access, remove imported contacts and subscribers, and request permanent account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Revoke App Access (Facebook/WhatsApp)</h2>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Go to Facebook Settings & Privacy → Settings.</li>
              <li>Open "Apps and Websites".</li>
              <li>Search for "OWOO Social".</li>
              <li>Select the app and click "Remove".</li>
              <li>This revokes OWOO's access to your Facebook/WhatsApp assets.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Remove Connected Accounts and Data in OWOO</h2>
            <p>From your OWOO account:</p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Log in and go to <strong>Settings</strong>.</li>
              <li>Under <strong>Messaging Apps</strong> and <strong>Social Media Connections</strong>, remove any connected accounts.</li>
              <li>Go to <strong>WhatsApp</strong> and delete imported contacts if desired.</li>
              <li>Go to <strong>Subscribers</strong> and remove subscriber lists you no longer want stored.</li>
              <li>If you added <strong>Email Domains</strong>, you can delete them in the Email Domains section.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Request Permanent Account Deletion</h2>
            <p>
              To delete your OWOO Social account and all associated data from our servers, please contact us:
            </p>
            <p className="mt-2">
              Email <strong>support@owoosocial.com</strong> with the subject "Data Deletion Request" from your registered email address. 
              We will verify your identity and process your request within 30 days, removing your account, connections, contacts, and subscribers.
            </p>
            <p className="mt-4">
              Alternatively, you can contact us directly via email at <strong>support@owoosocial.com</strong> with the subject "Data Deletion Request". 
              Please provide your registered email address, and we will process your request within 30 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
