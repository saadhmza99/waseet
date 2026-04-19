import { supabase } from '@/lib/supabase';

export interface ReviewData {
  user_id: string; // The user being reviewed
  rating: number;
  text?: string;
  photos?: string[]; // Array of photo URLs
}

export const reviewService = {
  // Create a review
  async createReview(reviewerId: string, data: ReviewData) {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: reviewerId,
        user_id: data.user_id,
        rating: data.rating,
        text: data.text,
        photos: data.photos || [],
      })
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return review;
  },

  // Get reviews for a user
  async getReviewsByUser(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get review by ID
  async getReviewById(reviewId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', reviewId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update a review
  async updateReview(reviewId: string, reviewerId: string, updates: Partial<ReviewData>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('reviewer_id', reviewerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a review
  async deleteReview(reviewId: string, reviewerId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('reviewer_id', reviewerId);

    if (error) throw error;
  },
};

