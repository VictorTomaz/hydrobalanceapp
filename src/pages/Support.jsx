import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Droplets, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const SUPPORT_EMAIL = "basedpeptidesllc@gmail.com";

export default function Support() {
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
            Support
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-6 space-y-7">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">
            WaterRest Support
          </h1>
          <p className="text-xs text-[#8A97A8] dark:text-slate-400 mt-1">We're here to help.</p>
        </div>

        <Section title="Contact us">
          <P>
            If you have a question, a problem, or feedback, email us and we'll get back to you as soon
            as we can. We usually reply within 2 business days.
          </P>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="block no-underline">
            <Button
              className="w-full rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] font-heading font-bold text-base h-12"
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </Button>
          </a>
        </Section>

        <Section title="Frequently asked questions">
          <P><strong>How is my daily water goal calculated?</strong></P>
          <P>
            Your goal is based on your body weight and activity level, which you set during onboarding.
            You can change either value at any time in Settings and your goal recalculates automatically.
          </P>

          <P><strong>How do I change my goal, units, or reminder times?</strong></P>
          <P>
            Open the Settings tab. You can update your weight and activity level (which recalculate your
            goal), switch your volume unit between ounces (oz) and milliliters (ml), and edit your four
            reminder time slots. Changes save automatically.
          </P>

          <P><strong>I'm not getting reminders.</strong></P>
          <P>
            First, make sure notifications are enabled for WaterRest in your device's iOS Settings. Then
            open the app's Settings tab and confirm that your reminder times are set. Reminders are
            delivered as in-app notifications, so the app needs to be allowed to notify you.
          </P>

          <P><strong>What is Wind-down?</strong></P>
          <P>
            Wind-down is an evening routine that helps you unwind before sleep. It starts a set number of
            minutes before the bedtime you configured in Settings. When you start Wind-down, a countdown
            begins and guides you through calming activities until your bedtime. Open the Wind-down tab
            and press Start to begin.
          </P>

          <P><strong>How do I log an amount that isn't one of the presets?</strong></P>
          <P>
            On the Home screen, choose "Custom Amount" to enter any volume in your preferred unit and add
            it to today's log.
          </P>

          <P><strong>How do I delete a logged entry?</strong></P>
          <P>
            In the "Today's Water" list on the Home screen, tap the trash icon next to any entry to remove
            it.
          </P>

          <P><strong>How do I delete my account?</strong></P>
          <P>
            Go to Settings → Delete Account. This permanently removes your account and all of its data
            (profile, hydration logs, and wind-down history). This action cannot be undone.
          </P>
        </Section>

        <Section title="Privacy">
          <P>
            For details on how WaterRest collects, uses, and protects your data, read our{" "}
            <Link to="/privacy" className="font-medium text-[#2BC4BB] underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </P>
        </Section>

        <div className="h-6" />
      </div>
    </div>
  );
}