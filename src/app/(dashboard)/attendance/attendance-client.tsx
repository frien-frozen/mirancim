"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getAttendance, markAttendance, markAllAttendance } from "@/lib/actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  CheckCheck,
  CheckSquare,
  Calendar,
  CalendarDays,
  Loader2,
  Undo2,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

interface GroupSchedule {
  id: string;
  dayOfWeek: number; // 0: Everyday, 1: Mon .. 7: Sun
  startTime: string;
  endTime: string;
}

interface Group {
  id: string;
  name: string;
  schedules?: GroupSchedule[];
  _count: { students: number };
}

interface StudentAttendance {
  id: string;
  name: string;
  phone: string;
  telegram?: string | null;
  attendance: {
    id: string;
    isPresent: boolean;
  } | null;
}

interface LessonDateOption {
  date: string; // YYYY-MM-DD
  formattedLabel: string; // e.g. "29-oktabr, Payshanba"
  dayName: string;
  time: string; // "10:00 - 11:30"
  status: "today" | "upcoming" | "past";
  isNearest: boolean;
}

const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
];
const UZ_DAYS = [
  "Yakshanba", "Dushanba", "Seshanba", "Chorshanba",
  "Payshanba", "Juma", "Shanba"
];

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const TR_DAYS = [
  "Pazar", "Pazartesi", "Salı", "Çarşamba",
  "Perşembe", "Cuma", "Cumartesi"
];

function parseYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string, locale: "uz" | "tr"): { label: string; dayName: string } {
  try {
    const d = parseYMD(dateStr);
    const dayNum = d.getDate();
    const monthIdx = d.getMonth();
    const jsDay = d.getDay();

    if (locale === "tr") {
      const dayName = TR_DAYS[jsDay];
      return {
        label: `${dayNum} ${TR_MONTHS[monthIdx]}, ${dayName}`,
        dayName,
      };
    }
    const dayName = UZ_DAYS[jsDay];
    return {
      label: `${dayNum}-${UZ_MONTHS[monthIdx]}, ${dayName}`,
      dayName,
    };
  } catch {
    return { label: dateStr, dayName: "" };
  }
}

function computeLessonDates(group: Group | undefined, locale: "uz" | "tr"): LessonDateOption[] {
  if (!group) return [];
  const today = new Date();
  const todayStr = formatYMD(today);

  const schedules = group.schedules || [];
  const options: LessonDateOption[] = [];

  if (schedules.length === 0) {
    for (let i = -7; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = formatYMD(d);
      const { label, dayName } = formatDisplayDate(dateStr, locale);
      options.push({
        date: dateStr,
        formattedLabel: label,
        dayName,
        time: "",
        status: dateStr === todayStr ? "today" : dateStr > todayStr ? "upcoming" : "past",
        isNearest: dateStr === todayStr,
      });
    }
    return options;
  }

  // Scan from past 28 days to next 28 days
  for (let i = -28; i <= 28; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const jsDay = d.getDay(); // 0 is Sun, 1 is Mon .. 6 is Sat
    const scheduleDay = jsDay === 0 ? 7 : jsDay;

    const matching = schedules.find(
      (s) => s.dayOfWeek === 0 || s.dayOfWeek === scheduleDay
    );
    if (matching) {
      const dateStr = formatYMD(d);
      const isToday = dateStr === todayStr;
      const isUpcoming = dateStr > todayStr;
      const { label, dayName } = formatDisplayDate(dateStr, locale);

      options.push({
        date: dateStr,
        formattedLabel: label,
        dayName,
        time: `${matching.startTime} - ${matching.endTime}`,
        status: isToday ? "today" : isUpcoming ? "upcoming" : "past",
        isNearest: false,
      });
    }
  }

  // Find the active/nearest lesson (today if lesson day, or the first upcoming lesson)
  const nearest = options.find((opt) => opt.date >= todayStr) || options[options.length - 1];
  if (nearest) {
    nearest.isNearest = true;
  }

  return options;
}

export function AttendanceClient({ groups }: { groups: Group[] }) {
  const { t, locale } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<string>(() => groups[0]?.id || "");
  const [isCustomDate, setIsCustomDate] = useState(false);

  const currentGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroup),
    [groups, selectedGroup]
  );

  const lessonDates = useMemo(
    () => computeLessonDates(currentGroup, locale),
    [currentGroup, locale]
  );

  const activeLessonDate = useMemo(() => {
    const nearest = lessonDates.find((opt) => opt.isNearest);
    return nearest?.date || formatYMD(new Date());
  }, [lessonDates]);

  const [selectedDate, setSelectedDate] = useState<string>(activeLessonDate);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  // When group changes, auto-switch to active lesson date
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    setIsCustomDate(false);
    const targetGroup = groups.find((g) => g.id === groupId);
    const opts = computeLessonDates(targetGroup, locale);
    const nearest = opts.find((opt) => opt.isNearest);
    if (nearest) {
      setSelectedDate(nearest.date);
    }
  };

  const loadAttendance = useCallback(async () => {
    if (!selectedGroup || !selectedDate) return;
    setLoadingStudents(true);
    const data = await getAttendance(selectedGroup, selectedDate);
    setStudents(data as StudentAttendance[]);
    setLoadingStudents(false);
  }, [selectedGroup, selectedDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const toggleAttendance = async (studentId: string, currentStatus: boolean | undefined | null) => {
    setTogglingId(studentId);
    // Cycle: unmarked -> true, true -> false, false -> true
    const newStatus = currentStatus === true ? false : true;
    await markAttendance(studentId, selectedDate, newStatus);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              attendance: { id: s.attendance?.id || "temp", isPresent: newStatus },
            }
          : s
      )
    );
    setTogglingId(null);
  };

  const handleMarkAllPresent = async () => {
    if (!selectedGroup || !selectedDate || students.length === 0) return;
    setMarkingAll(true);
    const studentIds = students.map((s) => s.id);
    await markAllAttendance(studentIds, selectedDate, true);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        attendance: { id: s.attendance?.id || "temp", isPresent: true },
      }))
    );
    setMarkingAll(false);
  };

  const upcomingLessons = useMemo(
    () => lessonDates.filter((l) => l.status === "today" || l.status === "upcoming"),
    [lessonDates]
  );

  const pastLessons = useMemo(
    () => lessonDates.filter((l) => l.status === "past").slice().reverse(),
    [lessonDates]
  );

  const currentLessonOption = useMemo(
    () => lessonDates.find((l) => l.date === selectedDate),
    [lessonDates, selectedDate]
  );

  const presentCount = students.filter((s) => s.attendance?.isPresent === true).length;
  const absentCount = students.filter((s) => s.attendance?.isPresent === false).length;
  const unmarkedCount = students.filter((s) => !s.attendance).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Base44 Page Header */}
      <div className="space-y-1">
        <h1 className="text-[34px] font-normal tracking-tight text-foreground base44-headline">
          {t.attendance.title}
        </h1>
        <p className="text-[14px] text-muted-foreground font-sans">
          {t.attendance.subtitle}
        </p>
      </div>

      {/* Selectors Bar & Controls */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: Group and Date Selectors */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end w-full lg:w-auto">
          {/* Group Selector */}
          <div className="space-y-1.5 w-full sm:w-auto">
            <Label className="text-xs font-medium text-foreground/80 block leading-tight">
              {t.students.groupLabel}
            </Label>
            <Select
              value={selectedGroup}
              onValueChange={(val) => val && handleGroupSelect(val)}
            >
              <SelectTrigger className="h-9 w-full sm:w-64 rounded-md border-border bg-card text-xs text-foreground">
                <SelectValue placeholder={t.attendance.selectGroup}>
                  {currentGroup ? `${currentGroup.name} (${currentGroup._count.students})` : t.attendance.selectGroup}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground rounded-md">
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id} className="text-xs">
                    {g.name} ({g._count.students})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Smart Lesson Date Selector */}
          <div className="space-y-1.5 w-full sm:w-auto">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground/80 block leading-tight">
                {t.attendance.dateLabel}
              </Label>
              {isCustomDate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDate(false);
                    setSelectedDate(activeLessonDate);
                  }}
                  className="flex items-center gap-1 text-[11px] text-[#ff5c16] hover:underline"
                >
                  <Undo2 className="h-3 w-3" />
                  <span>{t.attendance.upcomingLessons}</span>
                </button>
              )}
            </div>

            {isCustomDate ? (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 w-full sm:w-44 rounded-md border-border bg-card text-xs text-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDate(false);
                    setSelectedDate(activeLessonDate);
                  }}
                  className="h-9 px-3 rounded-md border border-border bg-card hover:bg-foreground/[0.04] text-xs text-muted-foreground flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Jadval</span>
                </button>
              </div>
            ) : (
              <Select
                value={selectedDate}
                onValueChange={(val) => {
                  if (val === "__custom__") {
                    setIsCustomDate(true);
                  } else if (val) {
                    setSelectedDate(val);
                  }
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-72 rounded-md border-border bg-card text-xs text-foreground">
                  <SelectValue placeholder={t.attendance.dateLabel}>
                    {currentLessonOption ? (
                      <div className="flex items-center gap-2 truncate">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{currentLessonOption.formattedLabel}</span>
                        {currentLessonOption.time && (
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            ({currentLessonOption.time})
                          </span>
                        )}
                      </div>
                    ) : (
                      formatDisplayDate(selectedDate, locale).label
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground rounded-md max-h-80">
                  {upcomingLessons.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[11px] font-semibold text-[#ff5c16]">
                        {t.attendance.upcomingLessons}
                      </SelectLabel>
                      {upcomingLessons.map((item) => (
                        <SelectItem key={item.date} value={item.date} className="text-xs">
                          <div className="flex items-center justify-between w-full gap-2.5">
                            <span className={cn("font-medium", item.isNearest && "text-foreground font-semibold")}>
                              {item.formattedLabel}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.time && (
                                <span className="text-[11px] text-muted-foreground">{item.time}</span>
                              )}
                              {item.status === "today" ? (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0 font-medium">
                                  {t.attendance.todayLesson}
                                </Badge>
                              ) : item.isNearest ? (
                                <Badge className="bg-[#ff5c16]/15 text-[#ff5c16] border border-[#ff5c16]/30 text-[10px] px-1.5 py-0 font-medium">
                                  {t.attendance.nextLesson}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {pastLessons.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[11px] font-semibold text-muted-foreground">
                        {t.attendance.pastLessons}
                      </SelectLabel>
                      {pastLessons.map((item) => (
                        <SelectItem key={item.date} value={item.date} className="text-xs text-muted-foreground hover:text-foreground">
                          <div className="flex items-center justify-between w-full gap-2.5">
                            <span>{item.formattedLabel}</span>
                            {item.time && (
                              <span className="text-[11px] text-muted-foreground/70">{item.time}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  <SelectSeparator />
                  <SelectItem value="__custom__" className="text-xs text-[#ff5c16] font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{t.attendance.customDate}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Right: Badges & Mark All Present Button */}
        {selectedGroup && students.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0 w-full lg:w-auto justify-between sm:justify-start">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 font-medium">
                {t.attendance.presentCount.replace("{count}", presentCount.toString())}
              </Badge>
              <Badge className="rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs px-2.5 py-1 font-medium">
                {t.attendance.absentCount.replace("{count}", absentCount.toString())}
              </Badge>
              {unmarkedCount > 0 && (
                <Badge className="rounded-md bg-foreground/[0.05] text-muted-foreground border border-border text-xs px-2.5 py-1 font-medium">
                  {t.attendance.unmarkedCount.replace("{count}", unmarkedCount.toString())}
                </Badge>
              )}
            </div>

            <button
              type="button"
              onClick={handleMarkAllPresent}
              disabled={markingAll}
              className="h-9 px-3.5 rounded-md border border-border bg-card hover:bg-foreground/[0.04] text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors base44-btn ml-auto sm:ml-1 disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <span>{t.attendance.markAllPresent}</span>
            </button>
          </div>
        )}
      </div>

      {/* Attendance Canvas */}
      {!selectedGroup ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-foreground/[0.04] text-muted-foreground mb-3">
            <CheckSquare className="h-5 w-5 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t.attendance.selectGroupPrompt}
          </h3>
        </div>
      ) : loadingStudents ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-border bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-foreground/[0.04] text-muted-foreground mb-3">
            <CheckSquare className="h-5 w-5 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t.attendance.noStudentsInGroup}
          </h3>
        </div>
      ) : (
        <div className="grid gap-2">
          {students.map((student, index) => {
            const isPresent = student.attendance?.isPresent;
            const isToggling = togglingId === student.id;

            return (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:border-foreground/20 shadow-2xs gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <span className="w-4 sm:w-5 text-center text-xs text-muted-foreground shrink-0 font-medium">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-[13.5px] truncate">
                      {student.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{student.phone}</span>
                      {student.telegram && (
                        <>
                          <span>•</span>
                          <a
                            href={`https://t.me/${student.telegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff5c16] hover:underline"
                          >
                            {student.telegram.startsWith("@") ? student.telegram : `@${student.telegram}`}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center shrink-0 ml-4">
                  {isToggling ? (
                    <div className="flex h-8 w-24 items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleAttendance(student.id, isPresent)}
                      className={cn(
                        "flex h-8 min-w-[92px] items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all base44-btn",
                        isPresent === true
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          : isPresent === false
                          ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25"
                          : "bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground border border-border"
                      )}
                    >
                      {isPresent === true ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[2.2]" />
                          <span>{t.attendance.present}</span>
                        </>
                      ) : isPresent === false ? (
                        <>
                          <X className="h-3.5 w-3.5 stroke-[2.2]" />
                          <span>{t.attendance.absent}</span>
                        </>
                      ) : (
                        <span>{t.attendance.mark}</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
