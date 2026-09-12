import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateDailyGoalMl } from "@/lib/hydration";
import DrawerSelect from "@/components/settings/DrawerSelect";
import Mascot from "@/components/mascot/Mascot";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useOutletContext();
  const [form, setForm] = useState({
    weight: "",
    weight_unit: "lbs",
    unit_preference: "oz",
    activity_level: "moderate",
    bedtime: "22:30",
    winddown_offset_minutes: 45,
  });
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.weight) return;
    setSaving(true);
    const goal = calculateDailyGoalMl(form);
    const created = await base44.entities.UserProfile.create({
      ...form,
      weight: parseFloat(form.weight),
      daily_goal_ml: goal,
      reminder_times: ["09:00", "12:00", "15:00", "18:00"],
      onboarding_completed: true,
      subscription_status: "none",
      trial_start_date: new Date().toISOString(),
    });
    setProfile(created);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-[#EAF7FA] to-[#F7FBFD] dark:from-slate-900 dark:to-slate-900">
      <Mascot percent={10} size={100} />
      <h1 className="font-heading text-3xl font-extrabold text-[#3A4759] dark:text-slate-100 mt-4 mb-1 text-center">Welcome to WaterRest</h1>
      <p className="text-[#8A97A8] dark:text-slate-400 text-center mb-8 max-w-xs">Let's set up your personal hydration goal and evening wind-down.</p>

      <div className="w-full max-w-sm space-y-5 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_0_0_#E3EEF7] dark:shadow-none border-2 border-[#EAF2FB] dark:border-slate-700">
        <div>
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Body Weight</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              type="number"
              value={form.weight}
              onChange={(e) => update("weight", e.target.value)}
              placeholder="e.g. 150"
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
          <Label className="font-bold text-[#5C6B7D] dark:text-slate-300">Bedtime</Label>
          <Input
            type="time"
            value={form.bedtime}
            onChange={(e) => update("bedtime", e.target.value)}
            className="rounded-xl mt-1.5"
          />
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

        <Button
          onClick={handleSubmit}
          disabled={!form.weight || saving}
          className="w-full rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] font-heading font-bold text-base h-12"
        >
          {saving ? "Setting up..." : "Start My Journey 🌊"}
        </Button>
      </div>
    </div>
  );
}