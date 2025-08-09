"use client";
import { useEffect, useState } from "react";

export default function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState(() => new Date(to).getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(new Date(to).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [to]);

  if (left <= 0) return <span className="text-red-600">00:00:00</span>;
  const hours = Math.floor(left / 1000 / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((left / 1000 / 60) % 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor((left / 1000) % 60)
    .toString()
    .padStart(2, "0");

  return (
    <span className="font-mono text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
      {hours}:{mins}:{secs}
    </span>
  );
}

