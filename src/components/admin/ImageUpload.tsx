"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-900 outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-200";

async function upload(file: File, folder: string): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Upload failed.");
  return json.url as string;
}

/** A single image field: upload a file (stored in Supabase) or paste a URL. */
export function ImageUpload({
  name,
  label,
  folder,
  defaultValue,
  error,
  hint,
  required,
}: {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string | null;
  error?: string[];
  hint?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    try {
      setValue(await upload(file, folder));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-forest-800">
        {label}
      </label>
      <div className="flex items-start gap-3">
        {value && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-forest-200">
            <Image src={value} alt="" fill sizes="64px" className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            id={name}
            name={name}
            required={required}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a URL, or upload a file"
            className={inputCls}
          />
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-forest-200 hover:bg-forest-100">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {busy ? "Uploading…" : "Upload image"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>
      {hint && !error && !uploadError && <p className="mt-1 text-xs text-forest-700/60">{hint}</p>}
      {uploadError && <p className="mt-1 text-xs font-medium text-red-600">{uploadError}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error[0]}</p>}
    </div>
  );
}

/** A gallery field: an ordered list of image URLs, each uploadable or pasted, encoded newline-separated. */
export function ImageListUpload({
  name,
  label,
  folder,
  defaultValue,
  error,
  hint,
}: {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string;
  error?: string[];
  hint?: string;
}) {
  const [items, setItems] = useState<string[]>(
    (defaultValue ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
  );
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => upload(f, folder)));
      setItems((prev) => [...prev, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-forest-800">{label}</label>
      <input type="hidden" name={name} value={items.join("\n")} />

      {items.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {items.map((url, i) => (
            <li key={`${url}-${i}`} className="group relative h-16 w-16 overflow-hidden rounded-lg ring-1 ring-forest-200">
              <Image src={url} alt="" fill sizes="64px" className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remove image"
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-forest-200 hover:bg-forest-100">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? "Uploading…" : "Add images"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {hint && !error && !uploadError && <p className="mt-1 text-xs text-forest-700/60">{hint}</p>}
      {uploadError && <p className="mt-1 text-xs font-medium text-red-600">{uploadError}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error[0]}</p>}
    </div>
  );
}
