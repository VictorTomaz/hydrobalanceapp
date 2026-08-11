import { useEffect, useRef, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { todayString, getActiveActivities, getWinddownTarget } from "@/lib/hydration";
import { ACTIVITY_NARRATION } from "@/lib/activityNarration";
import CountdownTimer from "@/components/winddown/CountdownTimer";
import RoutineGuide from "@/components/winddown/RoutineGuide";
import ActivityGuideDialog from "@/components/winddown/ActivityGuideDialog";
import Mascot from "@/components/mascot/Mascot";
import { Settings as SettingsIcon } from "lucide-react";

export default function WindDown() {
  const { profile } = useOutletContext();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualStart, setManualStart] = useState(false);
  const [guideActivity, setGuideActivity] = useState(null);
  const [narrationMuted, setNarrationMuted] = useState(false);
  const audioRef = useRef(null);
  const today = todayString();

  // Started synchronously inside the click handler (same call stack as the user
  // gesture) so browsers allow the audio to autoplay.
  const startGuide = (activity) => {
    setGuideActivity(activity);
    const url = ACTIVITY_NARRATION[activity.id];
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.currentTime = 0;
      if (!narrationMuted) audioRef.current.play().catch(() => {});
    }
  };

  const closeGuide = () => {
    audioRef.current?.pause();
    setGuideActivity(null);
  };

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const existing = await base44.entities.WindDownLog.filter({ created_by_id: user.id, date: today });
      setLog(existing[0] || null);
      setLoading(false);
    })();
  }, [today]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#EAF2FB] border-t-[#7B5FE0] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isWinddownTime = manualStart || Date.now() >= getWinddownTarget(profile.bedtime, profile.winddown_offset_minutes).getTime();
  const activities = getActiveActivities(profile);
  const completedIds = log?.activities_completed || [];
  const allDone = activities.length > 0 && completedIds.length === activities.length;

  const toggleActivity = async (id) => {
    const updated = completedIds.includes(id) ? completedIds.filter((a) => a !== id) : [...completedIds, id];
    const completed = updated.length === activities.length;
    const previousLog = log;
    // Optimistic UI: reflect the change instantly, then sync with the server.
    setLog({ ...(previousLog || { date: today }), activities_completed: updated, completed });
    try {
      if (previousLog?.id) {
        const saved = await base44.entities.WindDownLog.update(previousLog.id, {
          activities_completed: updated,
          completed,
        });
        setLog(saved);
      } else {
        const saved = await base44.entities.WindDownLog.create({
          date: today,
          activities_completed: updated,
          completed,
        });
        setLog(saved);
      }
    } catch (err) {
      setLog(previousLog);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-6">
      {!isWinddownTime ? (
        <>
          <div className="flex justify-end mb-2">
            <Link
              to="/winddown/customize"
              aria-label="Customize wind-down routine"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-[#EDE7FA] dark:border-slate-700 text-[#7B5FE0]"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
          <CountdownTimer bedtime={profile.bedtime} offsetMinutes={profile.winddown_offset_minutes} />
          <button
            onClick={() => setManualStart(true)}
            className="w-full mt-6 py-3 rounded-2xl bg-[#7B5FE0] text-white font-heading font-bold shadow-md active:scale-95 transition-transform"
          >
            Start Wind-down
          </button>
        </>
      ) : allDone ? (
        <div className="flex flex-col items-center text-center gap-4 pt-6">
          <Mascot percent={100} size={140} bounce />
          <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Sweet dreams! 🌙</h1>
          <p className="text-[#687785] dark:text-slate-400 max-w-xs">You completed your wind-down routine. Enjoy a calm, restful night.</p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Time to Unwind 🌙</h1>
              <p className="text-[#687785] dark:text-slate-400">Put the phone down and try these calming activities</p>
            </div>
            <Link
              to="/winddown/customize"
              aria-label="Customize wind-down routine"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-[#EDE7FA] dark:border-slate-700 text-[#7B5FE0]"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
          {activities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#687785] dark:text-slate-400 mb-4">No activities enabled yet.</p>
              <Link to="/winddown/customize" className="font-heading font-bold text-[#7B5FE0] underline">
                Add some activities
              </Link>
            </div>
          ) : (
            <RoutineGuide
              activities={activities}
              completedIds={completedIds}
              onToggle={toggleActivity}
              onGuide={startGuide}
            />
          )}
        </>
      )}
      <audio ref={audioRef} muted={narrationMuted} className="hidden" />
      <ActivityGuideDialog
        activity={guideActivity}
        open={!!guideActivity}
        onOpenChange={(open) => !open && closeGuide()}
        onComplete={() => {
          if (guideActivity) toggleActivity(guideActivity.id);
          closeGuide();
        }}
        muted={narrationMuted}
        onToggleMute={() => setNarrationMuted((m) => !m)}
      />
    </div>
  );
}