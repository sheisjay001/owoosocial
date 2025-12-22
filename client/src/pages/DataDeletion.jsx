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
              According to the Facebook Platform rules, we have to provide <strong>User Data Deletion Callback URL</strong> or <strong>Data Deletion Instructions URL</strong>. 
              If you want to delete your activities for Owoo Social, you can remove your information by following these steps:
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Remove App via Facebook</h2>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Go to your Facebook Account's Setting & Privacy. Click "Settings".</li>
              <li>Look for "Apps and Websites" and you will see all of the apps and websites you linked with your Facebook.</li>
              <li>Search and Click "Owoo Social" in the search bar.</li>
              <li>Scroll and click "Remove".</li>
              <li>Congratulations, you have successfully removed your app activities.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Request Permanent Account Deletion</h2>
            <p>
              If you wish to delete your Owoo Social account and all associated data permanently from our servers, please:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Log in to your Owoo Social account.</li>
              <li>Go to <strong>Settings</strong>.</li>
              <li>Scroll down to the "Danger Zone".</li>
              <li>Click on <strong>Delete Account</strong>.</li>
            </ol>
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
