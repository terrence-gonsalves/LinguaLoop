-- make language and goal deletes work
--
-- what:
--   - time_entries.language_id -> languages: ON DELETE CASCADE (was NO ACTION)
--   - goals.language_id -> languages: ON DELETE CASCADE (was SET NULL)
--   - time_entries.associated_goal_id -> goals: ON DELETE SET NULL (was NO ACTION)
--
-- why: deleting a language deletes all its time entries and goals, as the
-- confirmation dialog in language-settings promises. today the delete fails
-- with 23503 whenever the language has time entries (DB_AUDIT 4.5). deleting
-- a goal should keep the time logged against it and just unlink it, instead of
-- failing when entries reference the goal.
--
-- constraint names are unchanged, so nothing that refers to them breaks.
--
-- idempotent: each constraint is dropped if it exists and re-added in the same
-- statement.

begin;

alter table public.time_entries
  drop constraint if exists fk_language_id,
  add constraint fk_language_id foreign key (language_id)
    references public.languages(id) on delete cascade;

alter table public.goals
  drop constraint if exists fk_goal_language_id,
  add constraint fk_goal_language_id foreign key (language_id)
    references public.languages(id) on delete cascade;

alter table public.time_entries
  drop constraint if exists time_entries_associated_goal_id_fkey,
  add constraint time_entries_associated_goal_id_fkey foreign key (associated_goal_id)
    references public.goals(id) on delete set null;

commit;

-- rollback (restores the original rules)
-- begin;
-- alter table public.time_entries
--   drop constraint if exists fk_language_id,
--   add constraint fk_language_id foreign key (language_id)
--     references public.languages(id);
-- alter table public.goals
--   drop constraint if exists fk_goal_language_id,
--   add constraint fk_goal_language_id foreign key (language_id)
--     references public.languages(id) on delete set null;
-- alter table public.time_entries
--   drop constraint if exists time_entries_associated_goal_id_fkey,
--   add constraint time_entries_associated_goal_id_fkey foreign key (associated_goal_id)
--     references public.goals(id);
-- commit;
