import React from "react";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { formatBubbleTime, formatTimeLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";
import type { ScheduleItem } from "@/types/schedule";

export default function Schedule() {
  const { t, resolvedLocale } = usePreferences();
  const { items, addItem, setStatus } = useScheduleItems();
  const [tab, setTab] = React.useState<"active" | "done">("active");
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftDue, setDraftDue] = React.useState("");

  const activeItems = items.filter((row) => row.status === "active");
  const doneItems = items.filter((row) => row.status === "done");
  const visible = tab === "active" ? activeItems : doneItems;

  const handleSave = () => {
    const title = draftTitle.trim();
    if (!title) return;
    let dueAt: number | null = null;
    if (draftDue) {
      const parsed = Date.parse(draftDue);
      if (Number.isFinite(parsed)) dueAt = parsed;
    }
    addItem(title, dueAt);
    setDraftTitle("");
    setDraftDue("");
    setComposerOpen(false);
    setTab("active");
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="shrink-0 px-4 pb-2 pt-1">
        <h1 className="text-lg font-semibold text-text">{t("schedule.title")}</h1>
        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{t("schedule.subtitle")}</p>
      </header>

      <div className="shrink-0 px-4 pb-3">
        <div className="flex rounded-[12px] bg-surface p-0.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {(
            [
              { key: "active" as const, label: t("schedule.tabActive") },
              { key: "done" as const, label: t("schedule.tabDone") },
            ] satisfies { key: "active" | "done"; label: string }[]
          ).map((seg) => (
            <button
              key={seg.key}
              type="button"
              onClick={() => setTab(seg.key)}
              className={cn(
                "flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition active:scale-[0.99]",
                tab === seg.key ? "bg-bg text-text shadow-sm" : "text-text-tertiary"
              )}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24">
        {visible.length === 0 ? (
          <EmptyState
            icon={<ScheduleGlyph className="h-7 w-7" />}
            title={tab === "active" ? t("schedule.emptyActiveTitle") : t("schedule.emptyDoneTitle")}
            description={
              tab === "active" ? t("schedule.emptyActiveDesc") : t("schedule.emptyDoneDesc")
            }
            action={
              tab === "active" ? (
                <Button type="button" onClick={() => setComposerOpen(true)}>
                  {t("schedule.add")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {visible.map((row) => (
              <ScheduleRow
                key={row.id}
                item={row}
                tab={tab}
                locale={resolvedLocale}
                today={t("time.today")}
                yesterday={t("time.yesterday")}
                dayBeforeYesterday={t("time.dayBeforeYesterday")}
                dueLabel={t("schedule.due")}
                noDue={t("schedule.noDue")}
                completeLabel={t("schedule.complete")}
                reopenLabel={t("schedule.reopen")}
                onComplete={() => setStatus(row.id, "done")}
                onReopen={() => setStatus(row.id, "active")}
              />
            ))}
          </ul>
        )}
      </div>

      {tab === "active" && visible.length > 0 && (
        <div className="pointer-events-none fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 flex justify-center px-6">
          <div className="pointer-events-auto">
            <Button
              type="button"
              className="shadow-[0_8px_24px_rgba(9,184,62,0.35)]"
              onClick={() => setComposerOpen(true)}
            >
              {t("schedule.add")}
            </Button>
          </div>
        </div>
      )}

      {composerOpen && (
        <ComposerSheet
          title={t("schedule.composerTitle")}
          fieldTitle={t("schedule.fieldTitle")}
          placeholder={t("schedule.fieldTitlePlaceholder")}
          fieldTime={t("schedule.fieldTime")}
          saveLabel={t("schedule.save")}
          cancelLabel={t("schedule.cancel")}
          draftTitle={draftTitle}
          draftDue={draftDue}
          onChangeTitle={setDraftTitle}
          onChangeDue={setDraftDue}
          onClose={() => {
            setComposerOpen(false);
            setDraftTitle("");
            setDraftDue("");
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ScheduleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </svg>
  );
}

function ScheduleRow({
  item,
  tab,
  locale,
  today,
  yesterday,
  dayBeforeYesterday,
  dueLabel,
  noDue,
  completeLabel,
  reopenLabel,
  onComplete,
  onReopen,
}: {
  item: ScheduleItem;
  tab: "active" | "done";
  locale: string;
  today: string;
  yesterday: string;
  dayBeforeYesterday: string;
  dueLabel: string;
  noDue: string;
  completeLabel: string;
  reopenLabel: string;
  onComplete: () => void;
  onReopen: () => void;
}) {
  const dueText = React.useMemo(() => {
    if (item.dueAt === null) return noDue;
    const day = formatTimeLabel(item.dueAt, {
      locale,
      today,
      yesterday,
      dayBeforeYesterday,
    });
    return `${day} ${formatBubbleTime(item.dueAt)}`;
  }, [dayBeforeYesterday, item.dueAt, locale, noDue, today, yesterday]);

  return (
    <li
      className={cn(
        "rounded-[14px] border border-border bg-surface px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        tab === "done" && "opacity-75"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[15px] font-semibold leading-snug text-text",
              tab === "done" && "text-text-muted line-through decoration-text-muted/60"
            )}
          >
            {item.title}
          </p>
          <p className="mt-1.5 text-[11px] text-text-tertiary">
            {dueLabel}：{dueText}
          </p>
        </div>
        {tab === "active" ? (
          <button
            type="button"
            onClick={onComplete}
            className="shrink-0 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition active:scale-[0.97]"
          >
            {completeLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onReopen}
            className="shrink-0 rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] font-semibold text-text-muted transition active:scale-[0.97]"
          >
            {reopenLabel}
          </button>
        )}
      </div>
    </li>
  );
}

function ComposerSheet({
  title,
  fieldTitle,
  placeholder,
  fieldTime,
  saveLabel,
  cancelLabel,
  draftTitle,
  draftDue,
  onChangeTitle,
  onChangeDue,
  onClose,
  onSave,
}: {
  title: string;
  fieldTitle: string;
  placeholder: string;
  fieldTime: string;
  saveLabel: string;
  cancelLabel: string;
  draftTitle: string;
  draftDue: string;
  onChangeTitle: (v: string) => void;
  onChangeDue: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        aria-label={cancelLabel}
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[85vh] overflow-y-auto rounded-t-[18px] border border-border bg-bg px-4 pb-6 pt-4 shadow-lift"
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong/50" aria-hidden="true" />
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <label className="mt-4 block text-xs font-semibold text-text-muted">{fieldTitle}</label>
        <textarea
          value={draftTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="mt-1.5 w-full resize-none rounded-[12px] border border-transparent bg-white/80 px-3 py-2.5 text-sm text-text placeholder:text-input-placeholder backdrop-blur-sm transition focus:outline-none focus:shadow-[0_0_0_1px_rgba(9,184,62,0.2),0_0_12px_rgba(9,184,62,0.15)]"
        />
        <label className="mt-3 block text-xs font-semibold text-text-muted">{fieldTime}</label>
        <Input
          type="datetime-local"
          className="mt-1.5 bg-surface"
          value={draftDue}
          onChange={(e) => onChangeDue(e.target.value)}
        />
        <div className="mt-5 flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!draftTitle.trim()}
            onClick={onSave}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
