import React from 'react';

export const metadata = {
  title: 'Cancellations & Refunds | Scruvia',
  description: 'Our cancellation and refund policies for Scruvia services.',
};

export default function CancellationsRefunds() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Cancellations & Refunds Policy</h1>
      
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This Cancellations and Refunds Policy outlines the terms and conditions for cancellations, refunds, and subscription management for Scruvia's AI-powered chatbot services for taxation and financial analytics.
          </p>
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mt-4">
            <p className="font-medium">
              IMPORTANT NOTICE: Once a subscription is purchased, NO REFUNDS will be provided under any circumstances. By subscribing to our services, you acknowledge and agree to this strict no-refund policy.
            </p>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Subscription Plans</h2>
          <p>
            Scruvia offers various subscription plans with different billing cycles (monthly, quarterly, annual) and service tiers. The specific details, including pricing and features, are available on our website's pricing page.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Billing Cycles</h2>
          <p>
            Your subscription will automatically renew at the end of each billing period unless you cancel it before the renewal date. The renewal will be for the same duration as your original subscription period and at the current subscription rate.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Subscription Cancellation</h2>
          
          <h3 className="text-xl font-medium mb-2">4.1 How to Cancel</h3>
          <p>
            You can cancel your subscription at any time by:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>Logging into your account and accessing the subscription management page</li>
            <li>Contacting our customer support team at support@scruvia.com</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2 mt-4">4.2 Cancellation Timing</h3>
          <p>
            When you cancel your subscription:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>Your subscription will remain active until the end of your current billing period.</li>
            <li>You will not be charged for the next billing period.</li>
            <li>You will continue to have access to your subscription features until the end of your current billing period.</li>
            <li>No partial refunds will be issued for the remaining days in your current billing period.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Refund Policy</h2>
          
          <h3 className="text-xl font-medium mb-2">5.1 Standard Refund Policy</h3>
          <p className="font-bold text-red-600">
            NO REFUNDS: Scruvia maintains a strict no-refund policy for all subscription plans. Once payment has been processed, no refunds will be issued under any circumstances.
          </p>
          <p className="mt-2">
            By subscribing to Scruvia services, you explicitly acknowledge and agree that you will not receive a refund for any subscription payments made, regardless of usage or satisfaction level.
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">5.2 Exceptions</h3>
          <p>
            There are no exceptions to our no-refund policy. In cases of:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>Accidental purchases</li>
            <li>Dissatisfaction with the service</li>
            <li>Changes in personal circumstances</li>
            <li>Unused subscription time</li>
          </ul>
          <p className="mt-2">
            No refunds will be provided. Please ensure you understand our services before subscribing.
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">5.3 Billing Errors</h3>
          <p>
            In the rare case of demonstrable billing errors (such as being charged multiple times for the same subscription period), please contact our customer support team with appropriate documentation. These cases will be reviewed individually but are not guaranteed to result in a refund.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. How to Contact Us About Billing</h2>
          <p>
            If you have questions about your billing or subscription, please contact our customer support team at support@scruvia.com with the following information:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>Your account email address</li>
            <li>Date of purchase</li>
            <li>Subscription plan</li>
            <li>Specific billing questions</li>
          </ul>
          <p className="mt-2">
            We aim to respond to all inquiries within 3 business days.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Free Trial Conversion</h2>
          <p>
            If you subscribed after a free trial period:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>You will be charged on the first day after your free trial ends unless you cancel beforehand.</li>
            <li>No refunds will be provided if you forgot to cancel your subscription before the trial period ended.</li>
            <li>It is your responsibility to cancel during the trial period if you do not wish to continue with a paid subscription.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Plan Changes and Upgrades</h2>
          <p>
            When changing subscription plans:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li><strong>Upgrades:</strong> When upgrading to a higher-tier plan, you will be charged the prorated difference for the remainder of your current billing cycle.</li>
            <li><strong>Downgrades:</strong> When downgrading to a lower-tier plan, the change will take effect at the start of your next billing cycle, and no partial refunds will be issued for the current cycle.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Account Termination</h2>
          <p>
            We reserve the right to terminate accounts that violate our Terms and Conditions. In such cases:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>No refunds will be provided if your account is terminated due to violation of our Terms and Conditions.</li>
            <li>Any unused subscription time will be forfeited.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Price Changes</h2>
          <p>
            We may change our subscription prices from time to time. If we do:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li>We will notify you in advance of any price changes.</li>
            <li>Price changes will take effect at the start of your next billing cycle.</li>
            <li>If you do not agree with the price changes, you can cancel your subscription before your next billing date.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">11. Changes to This Policy</h2>
          <p>
            We may update this Cancellations and Refunds Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
          <p className="mt-2">
            You are advised to review this policy periodically for any changes. Changes to this policy are effective when they are posted on this page.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Cancellations and Refunds Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: support@scruvia.com
          </p>
        </section>
      </div>
    </div>
  );
} 