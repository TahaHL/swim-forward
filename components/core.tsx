"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Check, X, Waves } from "lucide-react";
import Link from "next/link";
import { statusLabels, type Status } from "@/features/progress/model";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <Waves aria-hidden size={26} />
      <span>Swim Forward</span>
    </Link>
  );
}
export function StatusMark({ value }: { value: Status }) {
  return (
    <span className={`status ${value ?? "none"}`}>
      {value === "pass" && <Check size={14} aria-hidden />}
      {statusLabels[value ?? "none"]}
    </span>
  );
}
export function Lane({ week }: { week: number }) {
  return (
    <div className="programme-lane" role="img" aria-label={`Week ${week} of 6`}>
      <div className="lane-track">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={
              i + 1 < week ? "complete" : i + 1 === week ? "current" : ""
            }
          >
            {i + 1 === week ? <span className="position" /> : null}
          </span>
        ))}
        <b className="lane-end" />
      </div>
      <div className="lane-labels" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
    </div>
  );
}
export function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="sheet"
      onCancel={onClose}
      aria-labelledby="sheet-title"
    >
      <div className="sheet-heading">
        <h2 id="sheet-title">{title}</h2>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Skeleton() {
  return (
    <div
      className="skeleton-layout"
      aria-label="Loading your updates"
      aria-busy="true"
    >
      <div className="skeleton short" />
      <div className="skeleton heading" />
      <div className="skeleton block" />
      <div className="skeleton block" />
    </div>
  );
}
export function StatusControl({
  value,
  onChange,
  label,
}: {
  value: Status;
  onChange: (v: Status) => void;
  label: string;
}) {
  const values: Status[] = [null, "needs_practice", "fair", "good", "pass"];
  return (
    <div
      className="status-control"
      role="group"
      aria-label={label}
      onKeyDown={(e) => {
        const n = Number(e.key);
        if (n >= 1 && n <= 5) {
          e.preventDefault();
          onChange(values[n - 1]);
        }
      }}
    >
      {values.map((v) => (
        <button
          key={v ?? "none"}
          type="button"
          aria-pressed={value === v}
          onClick={() => {
            onChange(v);
            navigator.vibrate?.(15);
          }}
        >
          <span>{statusLabels[v ?? "none"]}</span>
          {value === v && <Check size={14} aria-hidden />}
        </button>
      ))}
    </div>
  );
}
