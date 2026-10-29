"use client";

import { useState } from "react";
import { createGroup, updateGroup, deleteGroup } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Folder, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-context";

export interface GroupSchedule {
  id?: string;
  dayOfWeek: number; // 0: Everyday, 1: Mon, ..., 7: Sun
  startTime: string; // e.g. "14:00"
  endTime: string;   // e.g. "16:00"
}

export interface Group {
  id: string;
  name: string;
  schedules?: GroupSchedule[];
  _count: { students: number };
}

interface GroupsClientProps {
  groups: Group[];
  isAdmin: boolean;
}

function GroupForm({
  group,
  onSubmit,
  loading,
  error,
  submitLabel,
}: {
  group?: Group | null;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error: string;
  submitLabel: string;
}) {
  const { t } = useApp();
  const [schedules, setSchedules] = useState<GroupSchedule[]>(
    group?.schedules ? [...group.schedules] : []
  );

  function addScheduleSlot() {
    setSchedules((prev) => [
      ...prev,
      { dayOfWeek: 2, startTime: "14:00", endTime: "16:00" },
    ]);
  }

  function updateSlot(index: number, field: keyof GroupSchedule, value: any) {
    setSchedules((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  }

  function removeSlot(index: number) {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={onSubmit} className="space-y-4 pt-1 font-sans">
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground/80">{t.groups.nameLabel}</Label>
        <Input
          name="name"
          required
          defaultValue={group?.name}
          placeholder={t.groups.namePlaceholder}
          className="h-9 rounded-md border-border bg-background text-sm text-foreground"
        />
      </div>

      {/* Weekly Lesson Schedule Manager */}
      <div className="space-y-2 pt-1 border-t border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground stroke-[1.75]" />
            <Label className="text-xs font-medium text-foreground/90">{t.groups.scheduleLabel}</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addScheduleSlot}
            className="h-7 text-[11px] gap-1 rounded-md border-border hover:bg-foreground/[0.05] text-foreground font-medium px-2.5"
          >
            <Plus className="h-3 w-3 stroke-[2]" />
            {t.groups.addScheduleSlot}
          </Button>
        </div>

        {schedules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 p-3 text-center bg-foreground/[0.01]">
            <p className="text-xs text-muted-foreground">
              {t.groups.noSchedule}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {schedules.map((slot, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-xs"
              >
                {/* Day selector */}
                <div className="flex-1 min-w-[120px]">
                  <Select
                    value={slot.dayOfWeek.toString()}
                    onValueChange={(val) => updateSlot(index, "dayOfWeek", parseInt(val ?? "1"))}
                  >
                    <SelectTrigger className="h-7.5 w-full text-xs bg-background">
                      <SelectValue>
                        {t.groups.daysOfWeek[slot.dayOfWeek] || t.groups.daysOfWeek[1]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground rounded-md">
                      <SelectItem value="0">{t.groups.daysOfWeek[0]}</SelectItem>
                      <SelectItem value="1">{t.groups.daysOfWeek[1]}</SelectItem>
                      <SelectItem value="2">{t.groups.daysOfWeek[2]}</SelectItem>
                      <SelectItem value="3">{t.groups.daysOfWeek[3]}</SelectItem>
                      <SelectItem value="4">{t.groups.daysOfWeek[4]}</SelectItem>
                      <SelectItem value="5">{t.groups.daysOfWeek[5]}</SelectItem>
                      <SelectItem value="6">{t.groups.daysOfWeek[6]}</SelectItem>
                      <SelectItem value="7">{t.groups.daysOfWeek[7]}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start time */}
                <div className="flex items-center gap-1">
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                    className="h-7.5 w-21 text-xs bg-background px-1.5 py-0.5 text-center font-sans"
                  />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                    className="h-7.5 w-21 text-xs bg-background px-1.5 py-0.5 text-center font-sans"
                  />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="O'chirish"
                >
                  <X className="h-3.5 w-3.5 stroke-[2]" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input type="hidden" name="schedules" value={JSON.stringify(schedules)} />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-9 rounded-md bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs base44-btn mt-2"
      >
        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}

export function GroupsClient({ groups, isAdmin }: GroupsClientProps) {
  const router = useRouter();
  const { t } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await createGroup(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setCreateOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!selectedGroup) return;
    setLoading(true);
    setError("");
    const result = await updateGroup(selectedGroup.id, formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditOpen(false);
      setSelectedGroup(null);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!selectedGroup) return;
    setLoading(true);
    await deleteGroup(selectedGroup.id);
    setLoading(false);
    setDeleteOpen(false);
    setSelectedGroup(null);
    router.refresh();
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Base44 Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[34px] font-normal tracking-tight text-foreground base44-headline">
            {t.groups.title}
          </h1>
          <p className="text-[14px] text-muted-foreground font-sans">
            {t.groups.subtitle}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button className="h-8.5 gap-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 px-3.5 text-xs font-semibold shadow-xs base44-btn">
                  <Plus className="h-3.5 w-3.5 stroke-[2]" />
                  {t.groups.addGroup}
                </Button>
              }
            />
            <DialogContent className="border-border bg-card text-foreground rounded-lg max-w-md">
              <DialogHeader>
                <DialogTitle className="font-semibold text-lg">{t.groups.createTitle}</DialogTitle>
              </DialogHeader>
              <GroupForm
                onSubmit={handleCreate}
                loading={loading}
                error={error}
                submitLabel={t.groups.addGroup}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Table Container */}
      {groups.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-foreground/[0.04] text-muted-foreground mb-3">
            <Folder className="h-5 w-5 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-semibold text-foreground">{t.groups.noGroups}</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">{t.groups.noGroupsDesc}</p>
          {isAdmin && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="mt-4 h-8 gap-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold px-3.5 base44-btn"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2]" />
              {t.groups.addGroup}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">{t.groups.nameCol}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">{t.groups.scheduleCol}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">{t.groups.studentsCol}</TableHead>
                {isAdmin && (
                  <TableHead className="text-right text-xs font-medium text-muted-foreground">
                    {t.common.actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow
                  key={group.id}
                  className="border-border hover:bg-foreground/[0.02] transition-colors"
                >
                  <TableCell className="font-semibold text-foreground text-[13.5px]">
                    {group.name}
                  </TableCell>
                  <TableCell>
                    {group.schedules && group.schedules.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {group.schedules.map((s, idx) => (
                          <span
                            key={s.id || idx}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-foreground/[0.03] px-2 py-0.5 text-xs text-foreground font-medium"
                          >
                            <Clock className="h-3 w-3 text-muted-foreground stroke-[1.75]" />
                            <span className="font-semibold text-foreground/90">
                              {t.groups.shortDaysOfWeek[s.dayOfWeek] || t.groups.shortDaysOfWeek[1]}:
                            </span>
                            <span className="text-muted-foreground text-[11.5px]">
                              {s.startTime} - {s.endTime}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        {t.groups.noSchedule}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {t.groups.studentCount.replace("{count}", group._count.students.toString())}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setEditOpen(true);
                            setError("");
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
                          title="Tahrirlash"
                        >
                          <Edit2 className="h-3.5 w-3.5 stroke-[1.75]" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setDeleteOpen(true);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="O'chirish"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-border bg-card text-foreground rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg">{t.groups.editTitle}</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <GroupForm
              group={selectedGroup}
              onSubmit={handleUpdate}
              loading={loading}
              error={error}
              submitLabel={t.common.save}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-card text-foreground rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg">{t.groups.deleteConfirmTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.groups.deleteConfirmText.replace("{name}", selectedGroup?.name || "")}
          </p>
          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-8.5 rounded-md border-border bg-transparent text-xs text-foreground hover:bg-foreground/[0.05] base44-btn"
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-8.5 rounded-md bg-red-500/20 text-red-500 hover:bg-red-500/30 text-xs font-semibold base44-btn"
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {t.common.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
