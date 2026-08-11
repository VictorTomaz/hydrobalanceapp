import { useNavigate } from "react-router-dom";
import { ArrowLeft, Droplets } from "lucide-react";

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-heading text-lg font-bold text-[#3A4759] dark:text-slate-100 mb-2">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#5C6B7D] dark:text-slate-300">{children}</div>
    </section>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}

function UL({ children }) {
  return <ul className="list-disc pl-5 space-y-1.5">{children}</ul>;
}

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF7FA] to-[#F7FBFD] dark:from-slate-900 dark:to-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-[#E3EEF7] dark:border-slate-700">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 py-3 pt-[max(env(safe-area-inset-top),12px)]">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[#5C6B7D] dark:text-slate-200 hover:bg-[#EAF2FB] dark:hover:bg-slate-800"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 font-heading font-bold text-[#3A4759] dark:text-slate-100">
            <Droplets className="w-4 h-4 text-[#2BC4BB]" />
            Privacy Policy
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-6 space-y-7">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">
            HydroBalance Privacy Policy
          </h1>
          <p className="text-xs text-[#8A97A8] dark:text-slate-400 mt-1">Last updated: August 2026</p>
        </div>

        <Section title="1. Overview">
          <P>
            HydroBalance (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;the App&rdquo;) is a hydration and evening
            wind-down companion that helps you set a personalized daily water goal, log what you drink,
            and follow calming wind-down routines. This Privacy Policy explains, in plain language, every
            way this App collects and uses your data, the specific data we receive when you sign in with a
            third-party sign-in provider, and the choices you have over that data.
          </P>
          <P>
            By creating an account or using the App, you agree to the collection and use of information as
            described here. This policy applies to the HydroBalance app and to data gathered when you sign in
            using your chosen sign-in provider.
          </P>
        </Section>

        <Section title="2. Information We Collect">
          <P><strong>2.1 Information you provide directly</strong></P>
          <P>When you set up your profile and use the App, you provide:</P>
          <UL>
            <li><strong>Body data:</strong> your body weight and chosen weight unit (lbs or kg), used only to calculate a hydration goal.</li>
            <li><strong>Lifestyle &amp; preferences:</strong> activity level (sedentary / moderate / active) and preferred volume unit (ounces or milliliters).</li>
            <li><strong>Schedule preferences:</strong> your bedtime, how many minutes before bed your wind-down begins, and the reminder times you choose for water notifications.</li>
            <li><strong>Wind-down activities:</strong> which of our default activities you enable, plus any custom activities you create (a short label, an emoji, and an optional description).</li>
            <li><strong>Daily logs:</strong> the amount and type of each drink you log, and which wind-down activities you complete each day.</li>
          </UL>

          <P><strong>2.2 Information from sign-in providers</strong></P>
          <P>When you sign in with a provider, we receive the basic profile information that provider shares &mdash; described in detail in Section 4.</P>

          <P><strong>2.3 Information collected automatically</strong></P>
          <P>When you use the App, our platform and the App may collect:</P>
          <UL>
            <li>Account identifier and session tokens stored in your browser&rsquo;s local storage so you stay signed in and data loads correctly.</li>
            <li>Grant of in-app (browser) notification permission you choose to give, and the reminder times you schedule.</li>
            <li>Standard technical data processed by the hosting platform as part of operating the service (such as request timestamps and anonymized service telemetry).</li>
          </UL>
          <P>The App does not access your location, contacts, photos, microphone, camera, or calendars. It does not read your SMS, call logs, or financial data.</P>
        </Section>

        <Section title="3. How We Use Your Data">
          <P>We use the information we collect only to provide and improve the App&rsquo;s features to you:</P>
          <UL>
            <li>To create and authenticate your account and keep you signed in securely.</li>
            <li>To calculate a personalized daily hydration goal from your weight and activity level.</li>
            <li>To display your progress, streaks, and history, and to show your daily and weekly hydration and wind-down summaries.</li>
            <li>To save, recall, and update your wind-down routines and custom activities.</li>
            <li>To schedule and show you in-app water and wind-down reminders at the times you choose (in supported browsers; reminders only fire while the App is open).</li>
            <li>To show your name and profile photo inside the App when you sign in with your provider.</li>
            <li>To send you transactional or account-related messages to the email address on your account, where supported (for example, security or account changes).</li>
            <li>To diagnose issues, maintain security, and operate and improve the Service.</li>
          </UL>
          <P>We do <strong>not</strong> use your data to serve personalized advertisements, and we do <strong>not</strong> sell your data to anyone.</P>
        </Section>

        <Section title="4. Information From Your Sign-In Provider (Detailed)">
          <P>
            When you choose to sign in through a third-party provider, HydroBalance uses that provider&rsquo;s
            sign-in service (an API service). The provider shares with us only the basic profile information
            you approve during sign-in:
          </P>
          <UL>
            <li><strong>Your name</strong> &ndash; to greet you and display your identity within the App.</li>
            <li><strong>Your email address</strong> &ndash; used as your account identifier and for the transactional email described in Section 3.</li>
            <li><strong>Your profile photo URL</strong> &ndash; optionally displayed as your avatar inside the App, where the provider includes one.</li>
          </UL>
          <P>
            If your provider offers an email-relay option, you may use it; in that case the provider relays
            messages to your real address without revealing it to us, and we treat the relay address as your
            account email with the same use and protection described below.
          </P>

          <P><strong>4.1 Scopes we request</strong></P>
          <P>
            We request only the basic profile and email scopes from your provider. We do <strong>not</strong>
            request sensitive or additional data such as your email messages, files or documents, contacts,
            calendars, location, fitness, payments, or any other service the provider offers. We never
            receive or store your provider password &mdash; the provider authenticates you and only sends us a
            token plus the profile fields above.
          </P>

          <P><strong>4.2 How we use this data</strong></P>
          <P>We use the name, email, and profile photo received from your provider solely to:</P>
          <UL>
            <li>Authenticate you and create or sign in to your HydroBalance account;</li>
            <li>Display your name and profile image within the App;</li>
            <li>Email you account- or security-related messages at the address on file, where supported;</li>
            <li>Identify you across sessions as long as your account is active.</li>
          </UL>

          <P><strong>4.3 Data we do NOT collect from your provider</strong></P>
          <P>HydroBalance does not:</P>
          <UL>
            <li>Read or store your email messages, files, documents, calendars, contacts, or photos held by the provider;</li>
            <li>Access your provider account settings, purchase history, or any other provider service beyond the basic profile above;</li>
            <li>Receive or store your provider password in any form.</li>
          </UL>

          <P><strong>4.4 How we share this data</strong></P>
          <P>Your sign-in information is shared only as follows:</P>
          <UL>
            <li>With our hosting and authentication provider (the Base44 platform) strictly as a processor, to store your account and operate the Service on our behalf;</li>
            <li>As required by law, or to protect the rights, property, or safety of HydroBalance, our users, or the public.</li>
          </UL>
          <P>We do <strong>not</strong> sell, rent, or trade your sign-in information, and we do <strong>not</strong> share it with advertisers or use it to serve ads.</P>

          <P><strong>4.5 Compliance with provider policies (Limited Use)</strong></P>
          <P>
            Our use of the information received from a sign-in provider&rsquo;s API will adhere to that
            provider&rsquo;s applicable API Services and user-data policies, including any limited-use
            requirements. We only use information received from the provider to provide or improve features
            that you have engaged with in our App &mdash; we will not transfer it to others except as necessary
            to provide those features, and we will not use it for any independent purpose such as advertising
            or tracking.
          </P>

          <P><strong>4.6 Retention of sign-in data</strong></P>
          <P>
            We keep your provider-provided name, email, and profile photo only while your account is active.
            When you delete your account (Section 6), this information is removed from the live database;
            limited backup copies may persist briefly per the platform&rsquo;s standard backup retention and
            are then erased.
          </P>

          <P><strong>4.7 Revoking access</strong></P>
          <P>You can disconnect HydroBalance from your provider at any time:</P>
          <UL>
            <li>Open your provider&rsquo;s account security or connected-apps settings, select HydroBalance, and remove access;</li>
            <li>Or delete your HydroBalance account from the App&rsquo;s Settings screen.</li>
          </UL>
          <P>Revoking access stops new data sharing but does not automatically delete data already stored in your account &mdash; use Settings &rarr; Delete Account to remove it.</P>
        </Section>

        <Section title="5. Cookies, Storage &amp; Notifications">
          <P>
            HydroBalance does not use advertising cookies or third-party tracking cookies. We use your
            browser&rsquo;s local storage to keep your session token and remember your settings so the App
            loads without re-sign-in. If your browser supports notifications and you grant permission, we use
            that solely to show in-app water and wind-down reminders at the times you set. You can revoke
            notification permission at any time in your browser/device settings and delete local storage by
            signing out.
          </P>
        </Section>

        <Section title="6. Data Retention &amp; Deletion">
          <P>
            We retain your data only as long as your account is active. You can delete individual daily
            hydration entries from the Home or History screens at any time. To fully delete your data, use
            <strong> Settings &rarr; Delete Account</strong>, which permanently removes your profile from the
            App. Your hydration and wind-down logs are also associated with your account; to ensure complete
            deletion of all remaining records, you may also contact us (Section 12). After deletion, limited
            backup copies may persist briefly per the platform&rsquo;s backup schedule and are then erased.
          </P>
        </Section>

        <Section title="7. Data Sharing &amp; Disclosure">
          <P>
            We do not sell your data. We share data only: (a) with the Base44 platform that hosts and
            authenticates the App, acting as our service processor; (b) with your sign-in provider to the
            extent needed for sign-in; and (c) when required by law or to protect legal rights, safety, or
            security. We never share your data for any third party&rsquo;s independent marketing or
            advertising.
          </P>
        </Section>

        <Section title="8. Third-Party Services">
          <UL>
            <li><strong>Base44</strong> &ndash; hosts the App&rsquo;s database, authentication, and backend and processes your data on our behalf to operate the Service.</li>
            <li><strong>Your sign-in provider</strong> &ndash; authenticates your identity for sign-in; subject to that provider&rsquo;s own privacy policy.</li>
          </UL>
          <P>The processing performed by these providers is governed by their own privacy policies; we share only the minimum data described above.</P>
        </Section>

        <Section title="9. Security">
          <P>
            We take reasonable measures to protect your data, including authenticated access controls and the
            platform&rsquo;s encryption in transit and at rest. No method of transmission or storage is fully
            secure, however, and we cannot guarantee absolute security. Your data is accessible only to you
            and, where needed, to authorized platform operators operating the Service on our behalf.
          </P>
        </Section>

        <Section title="10. Your Rights &amp; Choices">
          <UL>
            <li><strong>Access &amp; update</strong> &ndash; view and edit your profile, schedule, and preferences anytime in Settings.</li>
            <li><strong>Delete</strong> &ndash; remove individual logs or your whole account via Settings &rarr; Delete Account.</li>
            <li><strong>Notifications</strong> &ndash; grant or revoke in-app notification permission in your device/browser settings.</li>
            <li><strong>Revoke sign-in</strong> &ndash; disconnect HydroBalance from your sign-in provider at any time via that provider&rsquo;s account security or connected-apps settings.</li>
            <li><strong>Contact</strong> &ndash; email us (Section 14) to request access to, correction of, or deletion of your data.</li>
          </UL>
          <P>
            Depending on where you live (for example, the EU/UK, California, and other jurisdictions), you
            may have additional rights under privacy laws such as the GDPR or CCPA/CPRA, including the
            right to access, port, correct, restrict, or delete your personal data and to object to
            certain processing. To exercise these rights, contact us.
          </P>
        </Section>

        <Section title="11. Children&rsquo;s Privacy">
          <P>
            HydroBalance is not directed to children under 13 (or the equivalent minimum age in your
            country). We do not knowingly collect personal information from children. If you believe a child
            has provided us personal data, contact us and we will take steps to delete it.
          </P>
        </Section>

        <Section title="12. International Data Transfers">
          <P>
            Your data is processed by the Base44 platform, which may store and process data in regions
            different from your own (including the United States). By using the App, you consent to such
            transfers as described in this policy.
          </P>
        </Section>

        <Section title="13. Changes to This Policy">
          <P>
            We may update this Privacy Policy to reflect changes in the App or the law. We will update the
            &ldquo;Last updated&rdquo; date above and, for significant changes, let you know within the App or
            by other means. Continued use after changes means you accept the updated policy.
          </P>
        </Section>

        <Section title="14. Contact Us">
          <P>
            For questions about this Privacy Policy or your data, or to make a data-deletion request, contact
            us at <span className="font-medium text-[#2BC4BB]">Support@based-peptides.com</span>. We will
            respond in accordance with applicable law.
          </P>
        </Section>

        <div className="h-6" />
      </div>
    </div>
  );
}