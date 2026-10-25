/**
 * Preview route `/preview/pros` still uses archived mock rows.
 * Production feed/explore use Supabase profiles.
 */
export {
  PROFESSIONAL_PREVIEW_ROWS,
  servicesForProfessional,
  type ProfessionalPreview,
} from "@/lib/archive/showcaseProfessionalsPreview.mock";
