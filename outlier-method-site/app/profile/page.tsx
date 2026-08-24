"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { StateOption } from "@/lib/states-client";
import { authFetch, clearUserToken, getUserToken } from "@/lib/auth-client";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  school: string | null;
  state_code: string | null;
  avatar_url: string | null;
  signature: string | null;
  voice_enabled: boolean;
}

function ProfileForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [states, setStates] = useState<StateOption[]>([]);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [signature, setSignature] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!getUserToken()) {
      router.push(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
      return;
    }
    authFetch("/api/profile")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setProfile(d.user);
        setName(d.user.name ?? "");
        setSchool(d.user.school ?? "");
        setStateCode(d.user.state_code ?? "");
        setSignature(d.user.signature ?? "");
        setVoiceEnabled(!!d.user.voice_enabled);
      })
      .catch(() => {
        clearUserToken();
        router.push("/login");
      });
    fetch("/api/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []));
  }, [router, next]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const res = await authFetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, school, stateCode, signature, voiceEnabled }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setProfile(data.user);
      setSignature(data.user.signature ?? "");
      if (next) {
        router.push(next);
        return;
      }
      setStatus("Saved.");
    } else {
      setStatus(data.error ?? "Save failed.");
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await authFetch("/api/profile/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setProfile((p) => (p ? { ...p, avatar_url: data.avatarUrl } : p));
    } else {
      setStatus(data.error ?? "Upload failed.");
    }
  }

  async function deleteAccount() {
    setBusy(true);
    await authFetch("/api/profile", { method: "DELETE" });
    clearUserToken();
    router.push("/");
  }

  function logout() {
    clearUserToken();
    router.push("/");
  }

  if (!profile) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen items-center justify-center bg-bone">
          <p className="text-sm text-slate">Loading…</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <p className="eyebrow text-red">Your profile</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">{profile.name || profile.email}</h1>

          <div className="mt-8 flex items-center gap-5 border border-rule bg-white p-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-rule bg-bone">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate">
                  {(profile.name || profile.email)[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <label className="inline-block cursor-pointer border border-navy-900 px-4 py-2 text-[13px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white">
                Change photo
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              </label>
              <p className="mt-2 text-[12px] text-slate">JPG or PNG, under 5MB.</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-6 space-y-4 border border-rule bg-white p-6">
            <label className="block text-[13px] text-slate">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                required
              />
            </label>
            <label className="block text-[13px] text-slate">
              School
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
              />
            </label>
            <label className="block text-[13px] text-slate">
              State association
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
              >
                <option value="">Select…</option>
                {states.map((s) => (
                  <option key={s.state_code} value={s.state_code}>
                    {s.state_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px] text-slate">
              Email
              <input
                value={profile.email}
                disabled
                className="mt-1 block w-full border border-rule bg-bone px-3 py-2 text-[14px] text-slate"
              />
            </label>
            <label className="block text-[13px] text-slate">
              Email signature
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={4}
                placeholder={"Jordan Ellis\nAthletic Director, Example High School\n(555) 123-4567"}
                className="mt-1 block w-full border border-rule px-3 py-2 font-mono text-[13px] focus:border-navy-900 focus:outline-none"
              />
              <span className="mt-1 block text-[12px] text-slate/80">
                How you sign off on emails. When you ask Eli to draft one, he&rsquo;ll sign it with this
                automatically.
              </span>
            </label>
            <label className="flex items-start gap-3 border border-rule bg-bone p-4">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="mt-1 h-4 w-4 accent-red"
              />
              <span>
                <span className="flex items-center gap-2 text-[14px] font-medium text-navy-900">
                  Voice
                  <span className="eyebrow bg-navy-900 px-1.5 py-0.5 text-[10px] text-bone">Premium</span>
                </span>
                <span className="mt-1 block text-[12px] text-slate">
                  Coach Eli reads his answers aloud in the chat. Off by default.
                </span>
              </span>
            </label>
            {status && <p className="text-[13px] text-navy-900">{status}</p>}
            <button
              type="submit"
              disabled={busy}
              className="border border-navy-900 bg-navy-900 px-5 py-2 text-[14px] font-medium text-white hover:bg-navy-700 disabled:opacity-50"
            >
              Save changes
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-rule pt-6">
            <button onClick={logout} className="text-[13px] text-slate hover:text-navy-900">
              Log out
            </button>

            {confirmingDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-red">Delete your account permanently?</span>
                <button onClick={deleteAccount} disabled={busy} className="text-[13px] font-medium text-red underline">
                  Yes, delete
                </button>
                <button onClick={() => setConfirmingDelete(false)} className="text-[13px] text-slate">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className="text-[13px] text-red hover:underline">
                Delete account
              </button>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileForm />
    </Suspense>
  );
}
