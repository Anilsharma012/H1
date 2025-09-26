import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type AdminPrefs = {
  currencyLocale: string;
  compactTables: boolean;
  showTooltips: boolean;
  dateFormat: string;
};

const STORAGE_KEY = "admin.ui.prefs";

export default function AdminSettings() {
  const [prefs, setPrefs] = useState<AdminPrefs>({
    currencyLocale: "en-IN",
    compactTables: false,
    showTooltips: true,
    dateFormat: "dd-MMM-yyyy",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const reset = () => {
    const d: AdminPrefs = {
      currencyLocale: "en-IN",
      compactTables: false,
      showTooltips: true,
      dateFormat: "dd-MMM-yyyy",
    };
    setPrefs(d);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  };

  return (
    <div className="grid gap-6">
      <div className="text-2xl font-semibold">Settings</div>

      <Card>
        <CardContent className="p-5 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <Label>Currency Locale</Label>
            <Select
              value={prefs.currencyLocale}
              onValueChange={(v) =>
                setPrefs((p) => ({ ...p, currencyLocale: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-IN">en-IN (₹)</SelectItem>
                <SelectItem value="en-US">en-US ($)</SelectItem>
                <SelectItem value="en-GB">en-GB (£)</SelectItem>
              </SelectContent>
            </Select>

            <Label>Compact Tables</Label>
            <div className="flex justify-end">
              <Switch
                checked={prefs.compactTables}
                onCheckedChange={(v) =>
                  setPrefs((p) => ({ ...p, compactTables: v }))
                }
              />
            </div>

            <Label>Show Tooltips</Label>
            <div className="flex justify-end">
              <Switch
                checked={prefs.showTooltips}
                onCheckedChange={(v) =>
                  setPrefs((p) => ({ ...p, showTooltips: v }))
                }
              />
            </div>

            <Label htmlFor="df">Date Format</Label>
            <Input
              id="df"
              value={prefs.dateFormat}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, dateFormat: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button onClick={save}>{saved ? "Saved" : "Save"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Preferences are stored locally in your browser. They do not affect
          server data.
        </CardContent>
      </Card>
    </div>
  );
}
