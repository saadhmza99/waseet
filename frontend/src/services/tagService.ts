import { supabase } from "@/lib/supabase";
import { extractMentionUsernames } from "@/lib/mentions";

export const tagService = {
  async tagFromText(
    entityType: "post" | "comment",
    entityId: string,
    taggedBy: string,
    text: string
  ) {
    const usernames = extractMentionUsernames(text);
    if (!usernames.length) return;
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, username")
      .or(usernames.map((name) => `username.ilike.${name}`).join(","));
    if (error || !profiles?.length) return;

    await Promise.all(
      profiles.map(async (profile) => {
        if (profile.id === taggedBy) return;
        const { error: tagError } = await supabase.from("user_tags").insert({
          tagged_user_id: profile.id,
          tagged_by: taggedBy,
          entity_type: entityType,
          entity_id: entityId,
        });
        if (tagError && !String(tagError.message || "").includes("TAG_NOT_ALLOWED") && tagError.code !== "23505") {
          console.error("Error saving tag:", tagError);
        }
      })
    );
  },
};
