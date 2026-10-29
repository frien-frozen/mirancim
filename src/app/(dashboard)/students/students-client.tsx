"use client";

import { useState } from "react";
import {
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/actions";
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
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit2, Trash2, Users, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string | null;
  telegram?: string | null;
  tuitionFee: number;
  isActive: boolean;
  groupId: string;
  group: { id: string; name: string };
}

interface Group {
  id: string;
  name: string;
  _count: { students: number };
}

interface StudentsClientProps {
  students: Student[];
  groups: Group[];
}

function StudentForm({
  groups,
  student,
  onSubmit,
  loading,
  error,
}: {
  groups: Group[];
  student?: Student | null;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error: string;
}) {
  const { t } = useApp();
  const [selectedGroup, setSelectedGroup] = useState(student?.groupId || "");

  return (
    <form action={onSubmit} className="space-y-4 pt-1 font-sans">
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground/80">{t.students.nameLabel}</Label>
        <Input
          name="name"
          required
          defaultValue={student?.name}
          placeholder={t.students.namePlaceholder}
          className="h-9 rounded-md border-border bg-background text-sm text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80">{t.students.phoneLabel}</Label>
          <Input
            name="phone"
            required
            defaultValue={student?.phone}
            placeholder={t.students.phonePlaceholder}
            className="h-9 rounded-md border-border bg-background text-sm text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80">{t.students.telegramLabel}</Label>
          <Input
            name="telegram"
            defaultValue={student?.telegram || ""}
            placeholder={t.students.telegramPlaceholder}
            className="h-9 rounded-md border-border bg-background text-sm text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80">{t.students.parentPhoneLabel}</Label>
          <Input
            name="parentPhone"
            defaultValue={student?.parentPhone || ""}
            placeholder={t.students.parentPhonePlaceholder}
            className="h-9 rounded-md border-border bg-background text-sm text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80">{t.students.tuitionFeeLabel}</Label>
          <Input
            name="tuitionFee"
            type="number"
            required
            defaultValue={student?.tuitionFee}
            placeholder={t.students.tuitionFeePlaceholder}
            className="h-9 rounded-md border-border bg-background text-sm text-foreground"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground/80">{t.students.groupLabel}</Label>
        <Select
          name="groupId"
          value={selectedGroup}
          onValueChange={(val) => setSelectedGroup(val ?? "")}
          required
        >
          <SelectTrigger className="h-9 w-full rounded-md border-border bg-background text-sm text-foreground">
            <SelectValue placeholder={t.students.selectGroup}>
              {groups.find((g) => g.id === selectedGroup)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="border-border bg-card text-foreground rounded-md">
            {groups.map((g) => (
              <SelectItem
                key={g.id}
                value={g.id}
                className="text-xs"
              >
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="groupId" value={selectedGroup} />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-9 rounded-md bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs base44-btn"
      >
        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {student ? t.common.save : t.students.addStudent}
      </Button>
    </form>
  );
}

export function StudentsClient({ students, groups }: StudentsClientProps) {
  const router = useRouter();
  const { t } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchGroup = filterGroup === "all" || s.groupId === filterGroup;
    return matchSearch && matchGroup;
  });

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await createStudent(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setCreateOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!selectedStudent) return;
    setLoading(true);
    setError("");
    const result = await updateStudent(selectedStudent.id, formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditOpen(false);
      setSelectedStudent(null);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!selectedStudent) return;
    setLoading(true);
    await deleteStudent(selectedStudent.id);
    setLoading(false);
    setDeleteOpen(false);
    setSelectedStudent(null);
    router.refresh();
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Base44 Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[34px] font-normal tracking-tight text-foreground base44-headline">
            {t.students.title}
          </h1>
          <p className="text-[14px] text-muted-foreground font-sans">
            {t.students.subtitle}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button className="h-8.5 gap-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 px-3.5 text-xs font-semibold shadow-xs base44-btn">
                <Plus className="h-3.5 w-3.5 stroke-[2]" />
                {t.students.addStudent}
              </Button>
            }
          />
          <DialogContent className="border-border bg-card text-foreground rounded-lg">
            <DialogHeader>
              <DialogTitle className="font-semibold text-lg">{t.students.createTitle}</DialogTitle>
            </DialogHeader>
            <StudentForm
              groups={groups}
              onSubmit={handleCreate}
              loading={loading}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground stroke-[1.75]" />
          <Input
            placeholder={t.students.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8.5 rounded-md border-border bg-card pl-8 text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select
          value={filterGroup}
          onValueChange={(val) => setFilterGroup(val ?? "all")}
        >
          <SelectTrigger className="h-8.5 w-48 rounded-md border-border bg-card text-xs text-foreground">
            <SelectValue placeholder={t.students.allGroups}>
              {filterGroup === "all" ? t.students.allGroups : groups.find((g) => g.id === filterGroup)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="border-border bg-card text-foreground rounded-md">
            <SelectItem
              value="all"
              className="focus:bg-foreground/10 focus:text-foreground text-xs"
            >
              {t.students.allGroups}
            </SelectItem>
            {groups.map((g) => (
              <SelectItem
                key={g.id}
                value={g.id}
                className="focus:bg-foreground/10 focus:text-foreground text-xs"
              >
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Canvas */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-foreground/[0.04] text-muted-foreground mb-3">
            <Users className="h-5 w-5 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-normal text-foreground base44-subheading">{t.students.noStudents}</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">{t.students.nameLabel}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">{t.students.phoneLabel}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">{t.students.groupLabel}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">{t.students.tuitionFeeLabel}</TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">
                  {t.common.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow
                  key={student.id}
                  className="border-border hover:bg-foreground/[0.02] transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground text-[13.5px]">{student.name}</p>
                      {student.parentPhone && (
                        <p className="text-[11px] text-muted-foreground">
                          {t.students.parentPrefix} {student.parentPhone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    <div>
                      <p className="text-foreground/90 font-medium">{student.phone}</p>
                      {student.telegram && (
                        <a
                          href={`https://t.me/${student.telegram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#ff5c16] hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          {student.telegram.startsWith("@") ? student.telegram : `@${student.telegram}`}
                        </a>
                      )}
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setEditOpen(true);
                          setError("");
                        }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5 stroke-[1.75]" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setDeleteOpen(true);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-border bg-card text-foreground rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg">{t.students.editTitle}</DialogTitle>
          </DialogHeader>
          <StudentForm
            groups={groups}
            student={selectedStudent}
            onSubmit={handleUpdate}
            loading={loading}
            error={error}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-card text-foreground rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg">{t.students.deleteConfirmTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.students.deleteConfirmText.replace("{name}", selectedStudent?.name || "")}
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
