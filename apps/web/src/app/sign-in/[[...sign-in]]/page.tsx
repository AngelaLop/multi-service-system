"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Left side — zen branding */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1 p-12 relative overflow-hidden"
        style={{ background: "#1a1a1a" }}
      >
        {/* Subtle circle — enso inspired */}
        <div
          className="absolute"
          style={{
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            border: "1px solid rgba(196, 120, 106, 0.08)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            border: "1px solid rgba(196, 120, 106, 0.05)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: "linear-gradient(135deg, #c4786a, #d4a07a)", borderRadius: "8px" }}
            >
              W
            </div>
            <span className="text-lg font-semibold" style={{ color: "#e8e4de" }}>
              Weatherwise
            </span>
          </div>
        </div>

        {/* Center message */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-sm tracking-widest uppercase mb-4" style={{ color: "rgba(196, 120, 106, 0.7)", letterSpacing: "0.2em" }}>
              Mindful planning
            </p>
            <h1 className="text-4xl font-light leading-tight" style={{ color: "#e8e4de" }}>
              Find stillness<br />
              in your schedule.
            </h1>
          </div>
          <p className="text-sm leading-relaxed max-w-md" style={{ color: "rgba(232, 228, 222, 0.45)" }}>
            A calm space to organize your day, adapt to live weather,
            and keep your schedule aligned with how you feel.
          </p>

          {/* Features — minimal */}
          <div className="flex gap-8 pt-2">
            {[
              { label: "Plan", kanji: "\u8A08\u753B" },
              { label: "Focus", kanji: "\u96C6\u4E2D" },
              { label: "Reflect", kanji: "\u5185\u7701" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-lg mb-1" style={{ color: "rgba(196, 120, 106, 0.4)", fontFamily: "serif" }}>
                  {item.kanji}
                </div>
                <div className="text-[10px] tracking-wider uppercase" style={{ color: "rgba(232, 228, 222, 0.3)" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[10px]" style={{ color: "rgba(232, 228, 222, 0.2)" }}>
          MPCS 51238 &middot; Design, Build, Ship &middot; Spring 2026
        </p>
      </div>

      {/* Right side — sign in */}
      <div
        className="flex items-center justify-center flex-1 p-6"
        style={{ background: "#232322" }}
      >
        <div className="w-full max-w-md space-y-6">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #c4786a, #d4a07a)" }}
            >
              W
            </div>
            <h1 className="text-xl font-light" style={{ color: "#e8e4de" }}>Weatherwise</h1>
            <p className="text-xs mt-2" style={{ color: "rgba(232, 228, 222, 0.4)" }}>
              Find stillness in your schedule.
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "bg-transparent shadow-none border-none p-0",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
