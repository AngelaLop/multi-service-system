"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EventForm from "@/components/EventForm";

function NewEventContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <Header title="New Event" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg mx-auto">
          <div
            className="p-6 rounded-xl"
            style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "var(--border-width) solid var(--border-color)",
            }}
          >
            <EventForm />
            <button
              onClick={() => router.back()}
              className="w-full mt-3 py-3 text-sm font-medium transition-colors"
              style={{
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                border: "var(--border-width) solid var(--border-color)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense>
      <NewEventContent />
    </Suspense>
  );
}
