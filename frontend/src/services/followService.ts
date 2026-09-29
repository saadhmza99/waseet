import { supabase } from '@/lib/supabase';

export const followService = {
  // Get users that the current user follows
  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles:following_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified,
          phone
        )
      `)
      .eq('follower_id', userId);

    if (error) throw error;
    return data;
  },

  // Get users that follow current user.
  // follower_id points at auth.users (members and visitors), so it cannot be
  // embedded as a profile. Visitors have no profile row and are omitted.
  async getFollowers(userId: string) {
    const { data: rows, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (error) throw error;
    const ids = [...new Set((rows || []).map((row) => row.follower_id).filter(Boolean))];
    if (!ids.length) return [];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_verified')
      .in('id', ids);

    if (profilesError) throw profilesError;
    const byId = new Map((profiles || []).map((profile) => [profile.id, profile]));
    return ids
      .filter((id) => byId.has(id))
      .map((id) => ({ follower_id: id, profiles: byId.get(id) }));
  },

  // Get posts from users that the current user follows
  async getPostsFromFollowing(userId: string, limit = 100) {
    // First get the list of users we follow
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followsError) throw followsError;

    if (!follows || follows.length === 0) {
      return [];
    }

    const followingIds = follows.map(f => f.following_id);

    // Get posts from those users
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          location,
          profession,
          is_verified,
          phone
        )
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Follow a user
  async followUser(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate
    return data;
  },

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  // Check if user is following another user
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  },
};

