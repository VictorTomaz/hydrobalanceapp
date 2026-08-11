import { useState } from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EMOJI_GROUPS } from "@/lib/emojis";

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const selectEmoji = (emoji) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="no-select w-16 h-9 flex items-center justify-center rounded-xl border border-input bg-transparent dark:bg-slate-800 text-lg shadow-sm"
        >
          {value || "😀"}
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70vh] dark:bg-slate-900 dark:border-slate-700">
        <DrawerHeader>
          <DrawerTitle className="dark:text-slate-100">Choose an emoji</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <Tabs defaultValue={EMOJI_GROUPS[0].label}>
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 mb-2">
              {EMOJI_GROUPS.map((group) => (
                <TabsTrigger key={group.label} value={group.label} className="text-base px-2 py-1">
                  {group.emojis[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {EMOJI_GROUPS.map((group) => (
              <TabsContent key={group.label} value={group.label} className="mt-0">
                <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
                  {group.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => selectEmoji(emoji)}
                      className="text-lg rounded-lg hover:bg-accent w-8 h-8 flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}