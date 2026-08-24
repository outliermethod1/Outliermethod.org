"use client";

// Renders inline at the bottom of the conversation once an anonymous
// visitor's free questions run out — never a modal or redirect, so the
// conversation they already had with Eli stays fully visible above it.
export function FreeQuestionGate({
  onSignup,
  onLogin,
}: {
  onSignup: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="border border-navy-900 bg-white p-6 sm:p-8">
      <p className="font-serif text-xl font-semibold text-navy-900 sm:text-2xl">Keep Coach Eli on call.</p>
      <p className="mt-2 text-[14px] text-slate">
        Free account — unlimited questions, saved conversations, and PDF export of any determination.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onSignup}
          className="border border-red bg-red px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#8c1d27]"
        >
          Create free account
        </button>
        <button
          onClick={onLogin}
          className="border border-navy-900 px-5 py-2.5 text-[14px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
