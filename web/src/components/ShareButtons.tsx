"use client";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Copied link to clipboard");
    }
  };
  return (
    <button onClick={share} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
      Share
    </button>
  );
}

