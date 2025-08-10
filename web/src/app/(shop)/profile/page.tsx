import { Suspense } from "react";
import ProfileClient from "./page.client";

export default function ProfilePage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <Suspense fallback={<div>Loading profile...</div>}>
        <ProfileClient />
      </Suspense>
    </div>
  );
}

