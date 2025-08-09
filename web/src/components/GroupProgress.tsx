"use client";
import { useState, useEffect } from "react";
import Countdown from "@/components/Countdown";

interface GroupProgressProps {
  current: number;
  required: number;
  expiresAt: string;
  optimisticCurrent?: number;
}

export default function GroupProgress({
  current,
  required,
  expiresAt,
  optimisticCurrent
}: GroupProgressProps) {
  const [displayCurrent, setDisplayCurrent] = useState(current);
  const [isOptimistic, setIsOptimistic] = useState(false);

  // Handle optimistic updates
  useEffect(() => {
    if (optimisticCurrent !== undefined && optimisticCurrent > current) {
      setDisplayCurrent(optimisticCurrent);
      setIsOptimistic(true);
    } else {
      setDisplayCurrent(current);
      setIsOptimistic(false);
    }
  }, [current, optimisticCurrent]);

  const percent = Math.min(100, Math.round((displayCurrent / required) * 100));
  const isCompleted = displayCurrent >= required;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span className={isOptimistic ? "opacity-70" : ""}>
          {displayCurrent}/{required}
          {isCompleted && " ✅"}
          {isOptimistic && " (updating...)"}
        </span>
        <Countdown to={expiresAt} />
      </div>
      <div className="h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-2 rounded transition-all duration-300 ${
            isCompleted
              ? "bg-green-500"
              : isOptimistic
                ? "bg-blue-400"
                : "bg-orange-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isCompleted && (
        <div className="text-xs text-green-600 mt-1 font-medium">
          Group completed! 🎉
        </div>
      )}
    </div>
  );
}

