import React from 'react';

export const metadata = {
  title: 'Cookie Policy | Scruvia',
  description: 'How we use cookies and similar technologies at Scruvia.',
};

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
      
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This Cookie Policy explains how Scruvia ("we", "us", or "our") uses cookies and similar technologies on our website and AI-powered chatbot services for taxation and financial analytics. This policy provides you with information about how we use these technologies, what types we use, and how you can control them.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to the owners of the site.
          </p>
          <p className="mt-2">
            Cookies are not harmful and do not contain any information that directly identifies you as a person. They cannot access other information from your device.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Types of Cookies We Use</h2>
          
          <h3 className="text-xl font-medium mb-2">3.1 Essential Cookies</h3>
          <p>
            These cookies are necessary for our website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">3.2 Performance Cookies</h3>
          <p>
            These cookies collect information about how visitors use our website, such as which pages they visit most often and if they receive error messages. This data helps us improve our website and your browsing experience. All information collected by these cookies is aggregated and anonymous.
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">3.3 Functionality Cookies</h3>
          <p>
            These cookies allow our website to remember choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">3.4 Targeting/Advertising Cookies</h3>
          <p>
            These cookies record your visit to our website, the pages you have visited, and the links you have followed. We may use this information to make our website and the advertising displayed on it more relevant to your interests.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third parties on our website. These third parties may include analytics providers (like Google Analytics), advertising networks, and social media platforms. These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our website and other websites.
          </p>
          <p className="mt-2">
            We do not control these third parties or their use of cookies. Please refer to the privacy policies of these third parties for more information about how they use cookies.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">5. How We Use Cookies</h2>
          <p>We use cookies for several purposes, including:</p>
          <ul className="list-disc ml-6 my-2">
            <li>Authenticating and identifying you on our website so we can provide you with the services you requested</li>
            <li>Remembering your preferences and settings</li>
            <li>Analyzing how our website is used so we can maintain, improve, and develop it</li>
            <li>Personalizing content and advertisements</li>
            <li>Measuring the effectiveness of our marketing campaigns</li>
            <li>Ensuring the security and smooth functioning of our website</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. You can set your browser to block or alert you about these cookies, but some parts of the site may not function properly if you disable certain cookies.
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">6.1 How to Delete Cookies</h3>
          <p>
            To opt out of cookies, you can modify your browser settings to block or delete cookies. Instructions for managing cookies in the most common browsers are provided below:
          </p>
          <ul className="list-disc ml-6 my-2">
            <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Do Not Track Signals</h2>
          <p>
            Some browsers have a "Do Not Track" feature that signals to websites that you visit that you do not want to have your online activity tracked. Our website does not currently respond to "Do Not Track" signals.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Similar Technologies</h2>
          <p>
            In addition to cookies, we may use other technologies such as web beacons (also known as pixel tags or clear GIFs) and local storage to collect information about your use of our website.
          </p>
          <p className="mt-2">
            Web beacons are tiny transparent images that are embedded in web pages, applications, and emails that allow us to collect information about your browsing and email interaction.
          </p>
          <p className="mt-2">
            Local storage (including HTML5 local storage and browser cache) allows websites to store data on your device for longer periods and can be used to store user preferences or data to improve website performance.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Changes to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date. You are advised to review this Cookie Policy periodically for any changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Cookie Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: support@scruvia.com
          </p>
        </section>
      </div>
    </div>
  );
} 