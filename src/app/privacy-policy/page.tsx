import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Scruvia',
  description: 'Our commitment to protecting your privacy at Scruvia.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            Welcome to Scruvia ("we," "our," or "us"). We are committed to protecting your privacy and handling your data with transparency and care. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our AI-powered chatbot services for taxation and financial analytics.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Create an account</li>
            <li>Fill out forms on our website</li>
            <li>Subscribe to our newsletter</li>
            <li>Request customer support</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          <p>This information may include your name, email address, phone number, billing information, and any other information you choose to provide.</p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">2.2 Usage Data</h3>
          <p>When you access our services, we may automatically collect information about your device and how you interact with our services, including:</p>
          <ul className="list-disc ml-6 my-2">
            <li>IP address</li>
            <li>Device type and operating system</li>
            <li>Browser type and settings</li>
            <li>Time spent on our services</li>
            <li>Pages viewed</li>
            <li>Links clicked</li>
            <li>Usage patterns</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2 mt-4">2.3 AI Interaction Data</h3>
          <p>When you use our AI chatbot for taxation and financial analytics, we collect:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Questions and queries you submit</li>
            <li>Conversation history</li>
            <li>Financial information you voluntarily share</li>
            <li>Feedback on AI responses</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative information, such as updates, security alerts, and support messages</li>
            <li>Respond to comments, questions, and requests</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
            <li>Monitor usage patterns and analyze trends to improve user experience</li>
            <li>Protect against, identify, and prevent fraud and other illegal activities</li>
            <li>Train and improve our AI models</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Service providers who perform services on our behalf</li>
            <li>Business partners with whom we jointly offer products or services</li>
            <li>Legal authorities when required by law or to protect our rights</li>
            <li>Affiliated companies within our corporate family</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the personal information we collect and store. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Restrict or object to processing of your information</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
          <p>To exercise these rights, please contact us at support@scruvia.com.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to collect and track information about how you interact with our website. For more information about our use of cookies, please see our Cookie Policy.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we learn we have collected personal information from a child under 18, we will delete that information as quickly as possible.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: support@scruvia.com
          </p>
        </section>
      </div>
    </div>
  );
} 