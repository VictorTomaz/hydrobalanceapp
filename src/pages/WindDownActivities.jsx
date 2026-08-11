import { useState } from "react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { WINDDOWN_ACTIVITIES } from "@/lib/hydration";
import EmojiPicker from "@/components/winddown/EmojiPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Trash2, Plus } from "lucide-react";

export default function WindDownActivities() {
  const { profile, setProfile } = useOutletContext();
  const navigate = useNavigate();
  const [enabledIds, setEnabledIds] = useState(
    profile?.enabled_activities || WINDDOWN_ACTIVITIES.map((a) => a.id)
  );
  const [customActivities, setCustomActivities] = useState(profile?.custom_activities || []);
  const [newActivity, setNewActivity] = useState({ emoji: "", label: "", description: "" });
  const [saving, setSaving] = useState(false);

  const toggleDefault = (id) => {
    setEnabledIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const addCustomActivity = () => {
    if (!newActivity.label.trim()) return;
    const activity = {
      id: `custom_${Date.now()}`,
      emoji: newActivity.emoji.trim() || "✨",
      label: newActivity.label.trim(),
      description: newActivity.description.trim(),
    };
    setCustomActivities((prev) => [...prev, activity]);
    setNewActivity({ emoji: "", label: "", description: "" });
  };

  const removeCustomActivity = (id) => {
    setCustomActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = await base44.entities.UserProfile.update(profile.id, {
      enabled_activities: enabledIds,
      custom_activities: customActivities,
    });
    setProfile(updated);
    setSaving(false);
    navigate("/winddown");
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/winddown" aria-label="Back to wind-down" className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 dark:border-slate-700 border-2 border-[#EDE7FA] text-[#7B5FE0]">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Customize Routine</h1>
      </div>

      <h2 className="font-heading font-bold text-[#3A4759] dark:text-slate-100 mb-3">Default Activities</h2>
      <div className="space-y-2 mb-6">
        {WINDDOWN_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 py-3 border-2 border-[#EDE7FA]"
          >
            <span className="text-2xl">{activity.emoji}</span>
            <div className="flex-1">
              <div className="font-bold text-[#3A4759] dark:text-slate-200">{activity.label}</div>
              <div className="text-xs text-[#687785] dark:text-slate-400">{activity.description}</div>
            </div>
            <Switch checked={enabledIds.includes(activity.id)} onCheckedChange={() => toggleDefault(activity.id)} />
          </div>
        ))}
      </div>

      <h2 className="font-heading font-bold text-[#3A4759] dark:text-slate-100 mb-3">Your Custom Activities</h2>
      <div className="space-y-2 mb-4">
        {customActivities.length === 0 && (
          <p className="text-sm text-[#687785] dark:text-slate-400">No custom activities yet.</p>
        )}
        {customActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 py-3 border-2 border-[#EDE7FA]"
          >
            <span className="text-2xl">{activity.emoji}</span>
            <div className="flex-1">
              <div className="font-bold text-[#3A4759] dark:text-slate-200">{activity.label}</div>
              <div className="text-xs text-[#687785] dark:text-slate-400">{activity.description}</div>
            </div>
            <button onClick={() => removeCustomActivity(activity.id)} className="text-[#E38B8B]">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl p-4 border-2 border-dashed border-[#D8D2EB] mb-6 space-y-2">
        <div className="flex gap-2">
          <EmojiPicker
            value={newActivity.emoji}
            onChange={(emoji) => setNewActivity((p) => ({ ...p, emoji }))}
          />
          <Input
            placeholder="Activity name"
            value={newActivity.label}
            onChange={(e) => setNewActivity((p) => ({ ...p, label: e.target.value }))}
            className="flex-1 rounded-xl"
          />
        </div>
        <Input
          placeholder="Short description"
          value={newActivity.description}
          onChange={(e) => setNewActivity((p) => ({ ...p, description: e.target.value }))}
          className="rounded-xl"
        />
        <Button onClick={addCustomActivity} variant="outline" className="w-full rounded-xl gap-2 font-heading font-bold">
          <Plus className="w-4 h-4" /> Save Activity
        </Button>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-[#7B5FE0] hover:bg-[#6A4FCB] font-heading font-bold h-12"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}