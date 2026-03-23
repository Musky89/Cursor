import { CREATIVE_ERAS, CREATIVE_ARCHETYPES, TIMELESS_DESIGN_PRINCIPLES, ICONIC_CAMPAIGNS, CATEGORY_PLAYBOOKS, PLATFORM_RULES, getCanonStats } from "@/lib/creative-canon";

export async function GET() {
  return Response.json({
    eras: CREATIVE_ERAS,
    archetypes: CREATIVE_ARCHETYPES,
    principles: TIMELESS_DESIGN_PRINCIPLES,
    iconicCampaigns: ICONIC_CAMPAIGNS,
    categoryPlaybooks: CATEGORY_PLAYBOOKS,
    platformRules: PLATFORM_RULES,
    stats: getCanonStats(),
  });
}
