import { supabase } from "@/lib/supabase";

export type PrivateThread = {
  id: string;
  post_id: string;
  business_id: string;
  sender_id: string;
  sender_name: string;
  sender_phone: string | null;
  message: string;
  reply: string | null;
  created_at: string;
  replied_at: string | null;
};

export const privateThreadService = {
  async listForPost(postId: string): Promise<PrivateThread[]> {
    const { data, error } = await supabase
      .from("post_private_threads")
      .select("id, post_id, business_id, sender_id, sender_name, sender_phone, message, reply, created_at, replied_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []) as PrivateThread[];
  },

  async send(postId: string, message: string): Promise<PrivateThread> {
    const { data, error } = await supabase.rpc("send_private_thread", {
      p_post_id: postId,
      p_message: message.trim(),
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as PrivateThread;
  },

  async reply(threadId: string, reply: string): Promise<PrivateThread> {
    const { data, error } = await supabase.rpc("reply_private_thread", {
      p_thread_id: threadId,
      p_reply: reply.trim(),
    });
    if (error) throw error;
    return (Array.isArray(data) ? data[0] : data) as PrivateThread;
  },
};
