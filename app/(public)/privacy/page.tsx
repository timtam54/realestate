export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            When you use our authentication services, we collect the following information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Name and email address from your Google, Microsoft, or Facebook account</li>
            <li>Profile picture (if provided by the authentication provider)</li>
            <li>Authentication tokens to verify your identity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Create and manage your account</li>
            <li>Authenticate your identity when you sign in</li>
            <li>Provide personalized property listings and services</li>
            <li>Communicate with you about your account and transactions</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. OAuth Authentication</h2>
          <p className="text-gray-700 mb-4">
            We use OAuth 2.0 protocol for authentication through Google, Microsoft, and Facebook. When you sign in:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>You are redirected to the provider&apos;s secure authentication page</li>
            <li>We do not have access to your account password</li>
            <li>We only receive the information you authorize the provider to share</li>
            <li>You can revoke access at any time through your provider&apos;s account settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
          <p className="text-gray-700 mb-4">
            We take the security of your data seriously:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Your data is stored securely using industry-standard encryption</li>
            <li>We use Azure cloud services for hosting and data storage</li>
            <li>Authentication tokens are encrypted and securely stored</li>
            <li>We implement regular security updates and monitoring</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell or rent your personal information. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Maintain your session when you&apos;re logged in</li>
            <li>Remember your preferences</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            Our platform integrates with the following third-party services:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Google OAuth:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF6600] hover:underline">Google Privacy Policy</a></li>
            <li><strong>Microsoft OAuth:</strong> <a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" className="text-[#FF6600] hover:underline">Microsoft Privacy Statement</a></li>
            <li><strong>Facebook OAuth:</strong> <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-[#FF6600] hover:underline">Facebook Privacy Policy</a></li>
            <li><strong>Azure Cloud Services:</strong> For hosting and storage</li>
            <li><strong>Pusher:</strong> For real-time messaging functionality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-700">
            Our service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this privacy policy or your personal data, please contact us at:
          </p>
          <p className="text-gray-700">
            Email: <a href="mailto:privacy@buysel.com" className="text-[#FF6600] hover:underline">privacy@buysel.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
