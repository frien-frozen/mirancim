"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { confirmPayment, unconfirmPayment, getPayments } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  CreditCard,
  Loader2,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface GroupItem {
  id: string;
  name: string;
  _count?: { students: number };
}

interface StudentPayment {
  id: string;
  name: string;
  phone: string;
  tuitionFee: number;
  group: { id: string; name: string };
  payment: {
    id: string;
    isPaid: boolean;
    amount: number;
    paidAt: string | null;
  } | null;
}

export function PaymentsClient({
  initialStudents,
  groups = [],
}: {
  initialStudents: StudentPayment[];
  groups?: GroupItem[];
}) {
  const { t, locale } = useApp();
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loadingData, setLoadingData] = useState(false);

  // Classes/Groups Filter
  const availableGroups = useMemo(() => {
    if (groups && groups.length > 0) return groups;
    const map = new Map<string, { id: string; name: string }>();
    students.forEach((s) => {
      if (s.group && !map.has(s.group.id)) {
        map.set(s.group.id, s.group);
      }
    });
    return Array.from(map.values());
  }, [groups, students]);

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() =>
    groups?.length ? groups.map((g) => g.id) : []
  );
  const [initializedGroups, setInitializedGroups] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initializedGroups && availableGroups.length > 0) {
      setSelectedGroupIds(availableGroups.map((g) => g.id));
      setInitializedGroups(true);
    }
  }, [availableGroups, initializedGroups]);

  // Click outside to close group filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterOpen]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectAllGroups = () => {
    setSelectedGroupIds(availableGroups.map((g) => g.id));
  };

  const deselectAllGroups = () => {
    setSelectedGroupIds([]);
  };

  const monthDate = `${selectedMonth}-01`;

  const loadPayments = useCallback(async () => {
    setLoadingData(true);
    const data = await getPayments(monthDate);
    setStudents(JSON.parse(JSON.stringify(data)));
    setLoadingData(false);
  }, [monthDate]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const groupFilteredStudents = useMemo(() => {
    return students.filter((s) => selectedGroupIds.includes(s.group.id));
  }, [students, selectedGroupIds]);

  const filtered = useMemo(() => {
    return groupFilteredStudents.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.group.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "paid" && s.payment?.isPaid) ||
        (filter === "unpaid" && !s.payment?.isPaid);
      return matchSearch && matchFilter;
    });
  }, [groupFilteredStudents, search, filter]);

  const paidCount = groupFilteredStudents.filter((s) => s.payment?.isPaid).length;
  const unpaidCount = groupFilteredStudents.length - paidCount;
  const totalCollected = groupFilteredStudents
    .filter((s) => s.payment?.isPaid)
    .reduce((sum, s) => sum + s.tuitionFee, 0);
  const totalExpected = groupFilteredStudents.reduce((sum, s) => sum + s.tuitionFee, 0);

  async function handleConfirm(studentId: string) {
    setLoadingId(studentId);
    await confirmPayment(studentId, monthDate);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              payment: {
                id: s.payment?.id || "temp",
                isPaid: true,
                amount: s.tuitionFee,
                paidAt: new Date().toISOString(),
              },
            }
          : s
      )
    );
    setLoadingId(null);
  }

  async function handleUnconfirm(studentId: string) {
    setLoadingId(studentId);
    await unconfirmPayment(studentId, monthDate);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, payment: null }
          : s
      )
    );
    setLoadingId(null);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Base44 Page Header */}
      <div className="space-y-1">
        <h1 className="text-[34px] font-normal tracking-tight text-foreground base44-headline">
          {t.payments.title}
        </h1>
        <p className="text-[14px] text-muted-foreground font-sans">
          {t.payments.subtitle}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-2xs">
          <p className="text-[12px] font-medium text-muted-foreground">
            {t.payments.collectedLabel}
          </p>
          <p className="mt-3 text-[28px] sm:text-[32px] font-bold text-foreground font-sans tracking-tight leading-none">
            {formatCurrency(totalCollected)}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t.payments.expectedSub.replace("{amount}", formatCurrency(totalExpected))}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-2xs">
          <p className="text-[12px] font-medium text-muted-foreground">
            {t.payments.paidStudentsLabel}
          </p>
          <p className="mt-3 text-[28px] sm:text-[32px] font-bold text-emerald-600 dark:text-emerald-400 font-sans tracking-tight leading-none">
            {paidCount}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t.payments.outOfTotal.replace("{total}", groupFilteredStudents.length.toString())}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-2xs">
          <p className="text-[12px] font-medium text-muted-foreground">
            {t.payments.unpaidStudentsLabel}
          </p>
          <p className="mt-3 text-[28px] sm:text-[32px] font-bold text-red-600 dark:text-red-400 font-sans tracking-tight leading-none">
            {unpaidCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.payments.outstandingSub.replace(
              "{amount}",
              formatCurrency(Math.max(0, totalExpected - totalCollected))
            )}
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-48 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground stroke-[1.75]" />
            <Input
              placeholder={t.payments.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 rounded-md border-border bg-card pl-8 text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Month Input */}
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8.5 w-36 rounded-md border-border bg-card text-xs text-foreground"
          />

          {/* Classes/Groups Filter with Ticks */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
              className={cn(
                "flex h-8.5 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.04] outline-none select-none",
                selectedGroupIds.length !== availableGroups.length &&
                  "border-[#ff5c16]/50 text-[#ff5c16] bg-[#ff5c16]/5",
                filterOpen && "ring-1 ring-foreground/20"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>{t.payments.filterClasses}</span>
              {selectedGroupIds.length !== availableGroups.length && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5c16] px-1 text-[10px] font-bold text-white leading-none">
                  {selectedGroupIds.length}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform duration-150 ml-0.5",
                  filterOpen && "rotate-180"
                )}
              />
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 rounded-lg border border-border bg-card p-2 shadow-lg z-50 font-sans animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/80 mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    {t.payments.filterByClass}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllGroups}
                      className="text-[#ff5c16] hover:underline font-medium"
                    >
                      {t.payments.selectAll}
                    </button>
                    <span className="text-muted-foreground/40">•</span>
                    <button
                      type="button"
                      onClick={deselectAllGroups}
                      className="text-muted-foreground hover:text-foreground font-medium"
                    >
                      {t.payments.clearAll}
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5 max-h-64 overflow-y-auto py-1">
                  {availableGroups.map((group) => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    const studentCount = students.filter(
                      (s) => s.group.id === group.id
                    ).length;

                    return (
                      <div
                        key={group.id}
                        onClick={() => toggleGroup(group.id)}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-foreground/[0.05] transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "bg-[#ff5c16] border-[#ff5c16] text-white"
                                : "border-border bg-background"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 stroke-[2.5]" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "truncate",
                              isSelected
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {group.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                          {studentCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center rounded-md bg-foreground/[0.04] border border-border p-0.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors base44-btn ${
              filter === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.common.filterAll}
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors base44-btn ${
              filter === "paid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.payments.filterPaid}
          </button>
          <button
            onClick={() => setFilter("unpaid")}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors base44-btn ${
              filter === "unpaid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.payments.filterUnpaid}
          </button>
        </div>
      </div>

      {/* Table Canvas */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-foreground/[0.04] text-muted-foreground mb-3">
            <CreditCard className="h-5 w-5 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-normal text-foreground base44-subheading">
            {t.payments.noPaymentsFound}
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {t.payments.studentCol}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {t.payments.groupCol}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {t.payments.feeCol}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {t.payments.statusCol}
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">
                  {t.common.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => {
                const isPaid = student.payment?.isPaid;
                const isLoading = loadingId === student.id;

                return (
                  <TableRow
                    key={student.id}
                    className="border-border hover:bg-foreground/[0.02] transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground text-[13.5px]">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {student.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-md border border-border bg-foreground/[0.05] text-foreground text-[11px] font-medium px-2 py-0.5"
                      >
                        {student.group.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-semibold text-xs">
                      {formatCurrency(student.tuitionFee)}
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <div className="flex items-center gap-1.5">
                          <Badge className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 font-medium">
                            <Check className="mr-1 h-3 w-3 stroke-[2.5]" />
                            {t.payments.paid}
                          </Badge>
                        </div>
                      ) : (
                        <Badge className="rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs px-2.5 py-0.5 font-medium">
                          <X className="mr-1 h-3 w-3 stroke-[2.5]" />
                          {t.payments.unpaid}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLoading ? (
                        <div className="flex justify-end">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : isPaid ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnconfirm(student.id)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground font-medium"
                        >
                          {t.payments.undo}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(student.id)}
                          className="h-8 rounded-md bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity base44-btn"
                        >
                          <Check className="mr-1 h-3.5 w-3.5 stroke-[2]" />
                          {t.payments.confirmPayment}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
