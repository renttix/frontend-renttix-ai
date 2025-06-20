import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <div class=" bg-gray-50">
        <div class="mx-auto max-w-6xl px-4 py-8 text-dark-2">
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-4xl font-bold sm:text-left">
              Privacy Statement
            </h1>
            <h2 class="mb-4 text-center text-2xl font-bold sm:text-left">
              Introduction
            </h2>
            <p class="mb-4 text-center text-lg sm:text-left">
              Welcome to the Privacy Notice of
              <a
                class="ml-1 text-blue-600 hover:underline"
                href="http://www.renttix.com"
              >
                Renttix.com.
              </a>
            </p>
            <p class="leading-relaxed">
              At Renttix, we respect your privacy and are committed to
              protecting your personal data across all global markets where we
              operate. This privacy notice informs you about how we handle your
              personal data when you use our website or services, in accordance
              with applicable global privacy laws. It also outlines your privacy
              rights and how the law protects you.
            </p>
            <p>
              For a downloadable PDF version of the policy, please email us at
              <a
                class="ml-1 text-blue-600 hover:underline"
                href="http://www.privacy@renttix.com"
              >
                privacy@renttix.com
              </a>
              .
            </p>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              1. Important Information and Who We Are
            </h1>
            <h3 class="mb-4 text-center text-xl font-bold sm:text-left">
              Purpose of This Privacy Notice
            </h3>
            <p>
              This privacy notice provides details on how Renttix collects,
              uses, and processes your personal data in compliance with global
              data protection laws, including but not limited to GDPR, CCPA,
              PIPEDA, APPs, and LGPD.
            </p>
            <h3 class="mb-4 text-center text-xl font-bold sm:text-left">
              Controller
            </h3>
            <p>
              {" "}
              we mention &quot;Renttix,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our,&quot; we are referring to
              [object Object], the entity responsible for processing your data.
            </p>
            <h2 class="mb-4 text-center text-xl font-bold sm:text-left">
              Global Contact Information
            </h2>
            <p>
              If you have any questions or wish to exercise your legal rights,
              please contact our data protection officer (DPO) using the details
              below.
            </p>
            <ul class="list-inside list-disc space-y-2 leading-relaxed">
              <li>
                <strong>Full Legal Entity Name:</strong> Renttix Limited
              </li>
              <li>
                <strong>DPO Name:</strong> Renttix Limited
              </li>
              <li>
                <strong>Email Address:</strong> privacy@renttix.com
              </li>
              <li>
                <strong>Postal Address:</strong> Any
              </li>
              <li>
                <strong>Telephone Number:</strong> 00000000000
              </li>
              <li>
                For U.S. residents under <strong>CCPA</strong>, please reach out
                to us at
                <a
                  class="ml-1 text-blue-600 hover:underline"
                  href="http://www.usprivacy@renttix.com"
                >
                  usprivacy@renttix.com
                </a>{" "}
                for any privacy-related requests.
              </li>
            </ul>
            <p>
              For Brazilian users under <strong>LGPD</strong>, you can reach us
              at
              <a
                class="ml-1 text-blue-600 hover:underline"
                href="http://www.brprivacy@renttix.com"
              >
                brprivacy@renttix.com
              </a>
              .
            </p>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              2. The Data We Collect About You
            </h1>
            <p>
              We collect and use personal data in accordance with global
              regulations mentioned below:
            </p>
            <ul class="list-inside list-disc space-y-2 leading-relaxed">
              <li>
                <strong>GDPR (EU/EEA):</strong> Identity, contact, financial,
                technical, and marketing data.
              </li>
              <li>
                <strong>CCPA (United States):</strong> Includes similar data
                categories to GDPR but with additional provisions for opting out
                of data selling and specific rights for Californian residents.
              </li>
              <li>
                <strong>APPs (Australia):</strong> Covers how personal data is
                collected, used, and shared, including international transfers.
              </li>
              <li>
                <strong>LGPD (Brazil):</strong> Provides access to, correction,
                and deletion of personal data for Brazilian users.
              </li>
            </ul>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              3. How We Collect Your Personal Data
            </h1>
            <p>We collect data through:</p>
            <ul class="list-inside list-disc space-y-2 leading-relaxed">
              <li>
                <strong>Direct Interactions:</strong> You provide data when
                registering, purchasing, or interacting with us.
              </li>
              <li>
                <strong>Automated Technologies:</strong> Cookies, server logs,
                and other tracking tools collect data.
              </li>
              <li>
                <strong>Third Parties:</strong> Including analytics providers,
                payment processors, and public databases.
              </li>
            </ul>
            <p>
              Specific rules apply in different markets, such as additional
              rights for California residents under<strong>CCPA</strong>, where
              you can request to opt out of data selling.
            </p>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              4. How We Use Your Personal Data
            </h1>
            <p>We use personal data in line with global laws:</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <strong>Purpose</strong>
                <ul class="list-inside space-y-2">
                  <li>To register you as a customer</li>
                  <li>To process transactions</li>
                  <li>To send marketing communications</li>
                  <li>To improve our services</li>
                </ul>
              </div>
              <div>
                <strong>Type of Data</strong>
                <ul class="list-inside space-y-2">
                  <li>Identity, Contact</li>
                  <li>Identity, Contact, Financial</li>
                  <li>Identity, Contact, Marketing</li>
                  <li>Technical, Usage</li>
                </ul>
              </div>
              <div>
                <strong>Legal Basis for Processing</strong>
                <ul class="list-inside space-y-2">
                  <li>
                    <strong>GDPR:</strong> Performance of contract
                  </li>
                  <li>
                    <strong>CCPA:</strong> Performance of contract
                  </li>
                  <li>
                    <strong>LGPD:</strong> Legitimate interest
                  </li>
                  <li>
                    <strong>GDPR/CCPA/LGPD:</strong> Performance of contract
                  </li>
                  <li>
                    <strong>GDPR/CCPA:</strong> Consent
                  </li>
                  <li>
                    <strong>PIPEDA:</strong> Consent
                  </li>
                  <li>
                    <strong>GDPR/CCPA/LGPD:</strong> Legitimate interest
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              5. Disclosures of Your Personal Data
            </h1>
            <p>
              We may share your personal data with third parties globally under
              the following conditions:
            </p>
            <ul class="list-inside list-disc space-y-2 leading-relaxed">
              <li>
                <strong>Service Providers:</strong> We rely on third parties for
                IT, payment processing, and marketing services.
              </li>
              <li>
                <strong>Legal Compliance:</strong> Data may be disclosed to
                comply with legal obligations in your jurisdiction.
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of mergers or
                acquisitions, your data may be transferred to the new entity.
              </li>
            </ul>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              6. International Transfers
            </h1>
            <p>
              Wherever we transfer data internationally, we ensure compliance
              with applicable data protection laws, including:
            </p>
            <ul class="list-inside list-disc space-y-2 leading-relaxed">
              <li>
                <strong>GDPR (EU/EEA):</strong> Implementing standard
                contractual clauses or obtaining explicit consent.
              </li>
              <li>
                <strong>CCPA (United States):</strong> Data transfers adhere to
                CCPA rights.
              </li>
              <li>
                <strong>LGPD (Brazil):</strong> Complying with international
                transfer rules under LGPD.
              </li>
            </ul>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left">
              7. Data Security
            </h1>
            <p>
              We have global security measures to protect your data, preventing
              unauthorized access, loss, or misuse. Access to your data is
              restricted to employees and partners who require it to fulfill
              their roles. In case of a breach, we will notify affected users
              and regulatory authorities as required by law.
            </p>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left sm:text-3xl">
              8. Data Retention
            </h1>
            <p class="text-base sm:text-lg">
              We retain your personal data only as long as necessary to fulfill
              the purposes for which it was collected, in compliance with
              applicable global regulations, including GDPR’s data minimization
              principle, CCPA’s deletion rights, and similar provisions in
              PIPEDA, APPs, and LGPD.
            </p>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left sm:text-3xl">
              9. Your Legal Rights
            </h1>
            <p class="text-base sm:text-lg">
              You have various rights depending on your location:
            </p>
            <ul class="list-inside list-disc space-y-4 text-base leading-relaxed text-gray-700 sm:text-lg">
              <h1>
                <strong>GDPR (EU/EEA):</strong>
              </h1>
              <li>
                Right to access, correct, delete, or restrict the processing of
                your data.
              </li>
              <li>Right to data portability and to object to processing.</li>
              <h1>
                <strong>CCPA (California, U.S.):</strong>
              </h1>
              <li>Right to request access to your data.</li>
              <li>Right to request deletion of your personal data.</li>
              <li>
                Right to opt out of data selling (Renttix does not sell your
                data).
              </li>
              <h1>
                <strong>PIPEDA (Canada):</strong>
              </h1>
              <li>Right to access and correct personal data.</li>
              <li>Right to transparency on cross-border data transfers.</li>
              <h1>
                <strong>APPs (Australia):</strong>
              </h1>
              <li>
                Right to access, correct, and opt out of direct marketing.
              </li>
              <li>
                Right to ensure reasonable security of data when transferred
                overseas.
              </li>
              <h1>
                <strong>LGPD (Brazil):</strong>
              </h1>
              <li>Right to access, correct, delete, and port your data.</li>
              <li>Right to object to data processing.</li>
            </ul>
            <p class="mt-4">
              If you wish to exercise any of these rights, please contact us at{" "}
              <a
                href="http://www.privacy@renttix.com"
                class="text-blue-600 hover:underline"
              >
                privacy@renttix.com
              </a>{" "}
              or your region-specific privacy email.
            </p>
          </div>
          <div class="mb-8 border-b pb-8">
            <h1 class="mb-4 text-center text-2xl font-bold sm:text-left sm:text-3xl">
              10. Glossary
            </h1>
            <ul class="list-inside list-disc space-y-4 text-base leading-relaxed text-gray-700 sm:text-lg">
              <li>
                <strong>Legitimate Interest:</strong> Business interest in
                conducting and managing our operations.
              </li>
              <li>
                <strong>Performance of Contract:</strong> Processing necessary
                to fulfill a contract with you.
              </li>
              <li>
                <strong>Consent:</strong> (Canada): Your explicit agreement for
                us to process your personal data.
              </li>
              <li>
                <strong>CCPA (California Consumer Privacy Act):</strong> A U.S.
                law that provides California residents with rights over their
                personal data.
              </li>
              <li>
                <strong>GDPR (General Data Protection Regulation):</strong> An
                EU law governing personal data protection.
              </li>
              <li>
                <strong>LGPD (Lei Geral de Proteção de Dados):</strong> Brazil’s
                general data protection law.
              </li>
              <li>
                <strong>PIPEDA:</strong> Canada’s Personal Information
                Protection and Electronic Documents Act.
              </li>
              <li>
                <strong>APPs:</strong> Australian Privacy Principles under the
                Australian Privacy Act 1988.
              </li>
            </ul>
          </div>
          <div class="mt-12 text-center text-sm">
            <p>
              This version of the privacy notice was last updated on :{" "}
              <strong>November 21st 2024</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
