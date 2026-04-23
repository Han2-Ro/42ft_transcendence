"use client";
import { useState } from "react";

export default function Page() {
  const [hostname] = useState(() => 
    typeof window !== 'undefined' ? window.location.hostname : ''
  );

  return (
    <main className="p-4 prose prose-invert">
      <h1>Terms of Service for 42Chess</h1>
      <p>
        <em>Last Updated: April 22, 2026</em>
      </p>

      <h2>Agreement to Terms</h2>
      <p>
        By accessing or using the services provided by 42Chess at {hostname}
        (the &quot;Service&quot;), you agree to be bound by these Terms of
        Service (&quot;Terms&quot;). If you disagree with any part of these
        terms, you may not access the Service.
      </p>

      <h2>Use of Service</h2>
      <p>
        You agree to use the Service only for lawful purposes and in accordance
        with these Terms. You agree not to:
      </p>
      <ul>
        <li>
          Use the Service in any way that violates any applicable law or
          regulation
        </li>
        <li>
          Use the Service to transmit any harmful, threatening, abusive, or
          otherwise objectionable material
        </li>
        <li>
          Attempt to gain unauthorized access to any portion of the Service
        </li>
        <li>Use the Service to infringe upon the rights of others</li>
        <li>
          Use any automated system to access the Service in a manner that sends
          more requests than a human can reasonably produce
        </li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are
        and will remain the exclusive property of 42Chess. The Service is
        protected by copyright, trademark, and other laws. Our trademarks may
        not be used in connection with any product or service without our prior
        written consent.
      </p>

      <h2>User Content</h2>
      <p>
        You retain ownership of any content you submit to or through the
        Service. By submitting content, you grant 42Chess a non-exclusive,
        worldwide, royalty-free license to use, reproduce, and display such
        content in connection with operating the Service.
      </p>

      <h2>Termination</h2>
      <p>
        We may terminate or suspend your access to the Service immediately,
        without prior notice or liability, for any reason, including without
        limitation if you breach the Terms.
      </p>
      <p>
        Upon termination, your right to use the Service will cease immediately.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        In no event shall 42Chess, nor its directors, employees, partners,
        agents, suppliers, or affiliates, be liable for any indirect,
        incidental, special, consequential, or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other
        intangible losses, resulting from:
      </p>
      <ul>
        <li>
          Your access to or use of (or inability to access or use) the Service
        </li>
        <li>Any conduct or content of any third party on the Service</li>
        <li>Any content obtained from the Service</li>
        <li>
          Unauthorized access, use, or alteration of your transmissions or
          content
        </li>
      </ul>

      <h2>Disclaimer</h2>
      <p>
        The Service is provided on an &quot;AS IS&quot; and &quot;AS
        AVAILABLE&quot; basis. The Service is provided without warranties of any
        kind, whether express or implied, including, but not limited to, implied
        warranties of merchantability, fitness for a particular purpose,
        non-infringement, or course of performance.
      </p>

      <h2>Governing Law (EU Users)</h2>
      <p>
        For users in the European Union, these Terms shall be governed by and
        construed in accordance with applicable EU laws. Nothing in these Terms
        shall affect your statutory rights as a consumer under applicable EU
        consumer protection legislation.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws
        of the jurisdiction in which 42Chess operates, without regard to its
        conflict of law provisions.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these Terms at any time. If a
        revision is material, we will try to provide at least 30 days&#x27;
        notice prior to any new terms taking effect.
      </p>
      <p>
        By continuing to access or use our Service after those revisions become
        effective, you agree to be bound by the revised terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please contact
        us:
      </p>
      <ul>
        <li>By email: support@42chess.mail</li>
        <li>By visiting: {hostname}</li>
      </ul>
    </main>
  );
}
