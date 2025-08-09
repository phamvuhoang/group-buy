import Countdown from "@/components/Countdown";

export default function GroupProgress({ current, required, expiresAt }: { current: number; required: number; expiresAt: string }) {
  const percent = Math.min(100, Math.round((current / required) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>
          {current}/{required}
        </span>
        <Countdown to={expiresAt} />
      </div>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-green-500 rounded" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

