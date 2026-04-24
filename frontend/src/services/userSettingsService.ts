import { supabase } from "@/lib/supabase";

export interface UserSettingsData {
  notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  dark_mode_enabled: boolean;
  language: string;
  region: string;
}

export const defaultUserSettings: UserSettingsData = {
  notifications_enabled: true,
  email_notifications_enabled: true,
  dark_mode_enabled: false,
  language: "English",
  region: "UAE",
};

export const userSettingsService = {
  async getSettings(userId: string): Promise<UserSettingsData> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return defaultUserSettings;

    return {
      notifications_enabled: data.notifications_enabled,
      email_notifications_enabled: data.email_notifications_enabled,
      dark_mode_enabled: data.dark_mode_enabled,
      language: data.language,
      region: data.region,
    };
  },

  async saveSettings(userId: string, settings: UserSettingsData) {
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          ...settings,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
