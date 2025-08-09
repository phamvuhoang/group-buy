import GroupProgress from "@/components/GroupProgress";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { sbSelectOne, sbSelectWhere } from "@/lib/supabaseRest";
import type { Group, Product } from "@/lib/types";
import dynamic from "next/dynamic";

const GroupJoinClient = dynamic(() => import("./page.client"), { ssr: false });

type GroupParticipant = { id: string; group_id: string; user_id: string };

export default async function GroupPage({ params }: { params: { id: string } }) {
  const t = await getTranslations();
  const group = await sbSelectOne<Group>("groups", { id: params.id });
  if (!group) return <div>Group not found</div>;
  const product = await sbSelectOne<Product>("products", { id: group.product_id });
  const participants = await sbSelectWhere<GroupParticipant>("group_participants", { group_id: group.id });

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg">Group for {product?.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <GroupProgress current={group.current_count} required={group.required_count} expiresAt={group.expires_at} />
          <div className="text-sm text-muted-foreground mt-3">Participants: {participants.length}</div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <GroupJoinClient groupId={group.id} />
        <ShareButtons url={`https://example.com/group/${group.id}`} title={`Join group`} />
      </div>
    </div>
  );
}

