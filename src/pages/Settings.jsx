import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateDailyGoalMl, formatAmount } from "@/lib/hydration";
import { requestNotificationPermission } from "@/hooks/useScheduledNotifications";
import DrawerSelect from "@/components/settings/DrawerSelect";
import ReminderTimesEditor from "@/components/settings/ReminderTimesEditor";
import { getStoredTheme, setTheme } from "@/lib/theme";
import { isSubscriptionActive, trialDaysRemaining } from "@/lib/subscription";
import { Crown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { LogOut, Trash2 } from "lucide-react";

export default function Settings() {
  const { profile, setProfile } = useOutletContext();
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const [theme, setThemeState] = useState(getStoredTheme());

  const handleThemeChange = (value) => {
    setTheme(value);
    setThemeState(value);
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const reminder_times = (form.reminder_times || []).filter(Boolean);
    const daily_goal_ml = calculateDailyGoalMl(form);
    const updated = await base44.entities.UserProfile.update(profile.id, {
      ...form,
      weight: parseFloat(form.weight),
      reminder_times,
      daily_goal_ml,
    });
    setProfile(updated);
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const user = await base44.auth.me();
    await base44.entities.HydrationLog.deleteMany({ created_by_id: user.id });
    await base44.entities.WindDownLog.deleteMany({ created_by_id: user.id });
    await base44.entities.UserProfile.delete(profile.id);
    base44.auth.logout();
  };

  const subscribed = isSubscriptionActive(profile);
  const daysLeft = trialDaysRemaining(profile);

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-6 space-y-5">
      <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Settings</h1>

      <Link
        to="/subscribe"
        className="flex items-center justify-between rounded-3xl p-5 border-2 border-[#2BC4BB] bg-[#EAF9F8] dark:bg-slate-800 dark:border-[#2BC4BB]"
      >
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-[#2BC4BB]" />
          <div>
            <div className="font-heading font-bold text-[#3A4759] dark:text-slate-100">
              {subscribed ? "Water Rest Pro" : "Manage Subscription"}
            </div>
            <div className="text-sm text-[#5C6B7D] dark:text-slate-400">
              {subscribed
                ? "Active subscription"
                : daysLeft > 0
                ? `Free trial — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                : "Subscribe to continue"}
            </div>
          </div>
        </div>
        <span className="text-[#2BC4BB] font-bold text-sm">{subscribed ? "View" : "Upgrade"}</span>
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-2 border-[#EAF2FB] dark:border-slate-700 space-y-4">
        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Body Weight</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              type="number"
              value={form.weight}
              onChange={(e) => update("weight", e.target.value)}
              className="rounded-xl"
            />
            <DrawerSelect
              value={form.weight_unit}
              onValueChange={(v) => update("weight_unit", v)}
              title="Weight Unit"
              options={[
                { value: "lbs", label: "lbs" },
                { value: "kg", label: "kg" },
              ]}
              triggerClassName="w-24 rounded-xl border-2 border-[#EAF2FB] dark:border-slate-700 font-bold text-[#5C6B7D] dark:text-slate-300 px-3 h-10"
            />
          </div>
        </div>

        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Activity Level</Label>
          <DrawerSelect
            value={form.activity_level}
            onValueChange={(v) => update("activity_level", v)}
            title="Activity Level"
            options={[
              { value: "sedentary", label: "Sedentary" },
              { value: "moderate", label: "Moderate" },
              { value: "active", label: "Active" },
            ]}
            triggerClassName="w-full mt-1.5 rounded-xl border-2 border-[#EAF2FB] dark:border-slate-700 font-bold text-[#5C6B7D] dark:text-slate-300 px-3 h-10"
          />
        </div>

        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Preferred Units</Label>
          <DrawerSelect
            value={form.unit_preference}
            onValueChange={(v) => update("unit_preference", v)}
            title="Preferred Units"
            options={[
              { value: "oz", label: "Ounces (oz)" },
              { value: "ml", label: "Milliliters (ml)" },
            ]}
            triggerClassName="w-full mt-1.5 rounded-xl border-2 border-[#EAF2FB] dark:border-slate-700 font-bold text-[#5C6B7D] dark:text-slate-300 px-3 h-10"
          />
        </div>

        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Water Reminder Times</Label>
          <ReminderTimesEditor
            times={form.reminder_times || []}
            onChange={(times) => update("reminder_times", times)}
          />
        </div>

        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Bedtime</Label>
          <Input type="time" value={form.bedtime} onChange={(e) => update("bedtime", e.target.value)} className="rounded-xl mt-1.5" />
        </div>

        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Wind-down starts before bed</Label>
          <DrawerSelect
            value={String(form.winddown_offset_minutes)}
            onValueChange={(v) => update("winddown_offset_minutes", parseInt(v))}
            title="Wind-down Offset"
            options={[
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60 minutes" },
            ]}
            triggerClassName="w-full mt-1.5 rounded-xl border-2 border-[#EAF2FB] dark:border-slate-700 font-bold text-[#5C6B7D] dark:text-slate-300 px-3 h-10"
          />
        </div>

        <div className="bg-[#F7FBFD] dark:bg-slate-700 rounded-xl p-3 text-sm text-[#5C6B7D] dark:text-slate-300 font-bold">
          Current daily goal: {formatAmount(form.daily_goal_ml || 0, form.unit_preference)}
        </div>

        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Appearance</Label>
          <DrawerSelect
            value={theme}
            onValueChange={handleThemeChange}
            title="Appearance"
            options={[
              { value: "system", label: "Follow System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            triggerClassName="w-full mt-1.5 rounded-xl border-2 border-[#EAF2FB] dark:border-slate-700 font-bold text-[#5C6B7D] dark:text-slate-300 px-3 h-10"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] font-heading font-bold h-12">
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          onClick={requestNotificationPermission}
          variant="outline"
          className="w-full rounded-xl border-2 font-heading font-bold h-12"
        >
          Enable Notifications
        </Button>
      </div>

      <Button
        onClick={() => base44.auth.logout()}
        variant="ghost"
        className="w-full rounded-xl text-[#C86464] font-bold gap-2"
      >
        <LogOut className="w-4 h-4" /> Log Out
      </Button>

      <div className="text-center pb-2">
        <Link to="/privacy" className="text-sm font-bold text-[#2BC4BB] hover:underline">
          Privacy Policy
        </Link>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full rounded-xl text-red-600 font-bold gap-2">
            <Trash2 className="w-4 h-4" /> Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl max-w-sm dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-slate-100">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              This permanently deletes your profile and all hydration data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}