import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Scruvia',
  description: 'Terms and conditions for using Scruvia services.',
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            Welcome to Scruvia. These Terms and Conditions govern your use of our website and AI-powered chatbot services for taxation and financial analytics. By accessing or using our services, you agree to be bound by these Terms and Conditions.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Definitions</h2>
          <ul className="list-disc ml-6 my-2">
            <li><strong>"Service"</strong> refers to the Scruvia website and AI-powered chatbot for taxation and financial analytics.</li>
            <li><strong>"User"</strong> refers to individuals who access or use our Service.</li>
            <li><strong>"Subscription"</strong> refers to the paid access to our Service.</li>
            <li><strong>"Content"</strong> refers to information, data, text, and other materials displayed on or through our Service.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Account Registration</h2>
          <p>
            To access certain features of our Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p className="mt-2">
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Subscriptions and Payments</h2>
          <p>
            Our Service may offer subscription-based access to premium features. By subscribing to our Service, you agree to pay the applicable fees as described on our website. All payments are non-refundable, except as expressly stated in our Cancellations and Refunds Policy.
          </p>
          <p className="mt-2">
            We reserve the right to change our subscription fees at any time. Any price changes will be communicated to you in advance and will apply to the next billing cycle.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">5. AI Chatbot Usage</h2>
          <p>
            Our AI-powered chatbot provides information and insights related to taxation and financial analytics. While we strive to provide accurate and helpful information, the advice provided by our AI is not a substitute for professional financial or tax advice.
          </p>
          <p className="mt-2">
            You acknowledge that the information provided by our AI chatbot:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>Is for informational purposes only</li>
            <li>May not be complete, accurate, or up-to-date</li>
            <li>Should not be relied upon for making financial or tax decisions</li>
            <li>Does not constitute professional advice or services</li>
          </ul>
          <p className="mt-2">
            We recommend consulting with qualified financial or tax professionals before making any financial decisions.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. User Content</h2>
          <p>
            When you submit questions, information, or other content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display that content for the purpose of providing our Service.
          </p>
          <p className="mt-2">
            You represent and warrant that you have all rights necessary to grant us this license and that your content does not violate any third-party rights or applicable laws.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Use our Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to any part of our Service</li>
            <li>Interfere with or disrupt the integrity or performance of our Service</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Submit false or misleading information</li>
            <li>Use our Service to send spam or unsolicited messages</li>
            <li>Scrape, data mine, or otherwise extract data from our Service</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Intellectual Property Rights</h2>
          <p>
            Our Service and its original content, features, and functionality are owned by Scruvia and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p className="mt-2">
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of our materials, except as permitted by our Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
          <p>
            OUR SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-2">
            WE DO NOT WARRANT THAT OUR SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SCRUVIA, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">11. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Scruvia, its directors, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms and Conditions or your use of the Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">12. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms and Conditions.
          </p>
          <p className="mt-2">
            Upon termination, your right to use the Service will immediately cease. All provisions of these Terms and Conditions which by their nature should survive termination shall survive termination.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">13. Changes to Terms and Conditions</h2>
          <p>
            We reserve the right to modify or replace these Terms and Conditions at any time. We will notify you of any changes by posting the new Terms and Conditions on this page and updating the "Last Updated" date.
          </p>
          <p className="mt-2">
            Your continued use of our Service after any such changes constitutes your acceptance of the new Terms and Conditions.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">14. Governing Law</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which Scruvia operates, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">15. Contact Us</h2>
          <p>
            If you have any questions or concerns about these Terms and Conditions, please contact us at:
          </p>
          <p className="mt-2">
            Email: support@scruvia.com
          </p>
        </section>
      </div>
    </div>
  );
} 