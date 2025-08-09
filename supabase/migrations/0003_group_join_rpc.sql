-- Atomic join RPC and completion logic

create or replace function public.join_group(p_group_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_group record;
  v_user uuid := auth.uid();
  v_participants int;
  v_completed boolean := false;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Fetch group with lock
  select * into v_group from public.groups where id = p_group_id for update;
  if not found then
    raise exception 'Group not found';
  end if;
  if v_group.status <> 'open' then
    raise exception 'Group is not open';
  end if;
  if v_group.expires_at < now() then
    update public.groups set status = 'failed' where id = v_group.id;
    raise exception 'Group expired';
  end if;

  -- Avoid duplicate participation
  if exists (select 1 from public.group_participants gp where gp.group_id = v_group.id and gp.user_id = v_user) then
    return jsonb_build_object('already_member', true, 'group_id', v_group.id);
  end if;

  -- Insert participant
  insert into public.group_participants(id, group_id, user_id)
  values (gen_random_uuid(), v_group.id, v_user);

  -- Increment and check completion
  update public.groups
  set current_count = current_count + 1
  where id = v_group.id
  returning * into v_group;

  if v_group.current_count >= v_group.required_count then
    update public.groups set status = 'completed' where id = v_group.id;
    v_completed := true;
  end if;

  -- Return outcome
  select count(*)::int into v_participants from public.group_participants where group_id = v_group.id;
  return jsonb_build_object(
    'group_id', v_group.id,
    'current_count', v_group.current_count,
    'required_count', v_group.required_count,
    'completed', v_completed,
    'participants', v_participants
  );
end;
$$;

