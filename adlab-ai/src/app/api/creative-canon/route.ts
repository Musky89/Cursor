import { CREATIVE_ERAS, CREATIVE_ARCHETYPES, TIMELESS_DESIGN_PRINCIPLES } from "@/lib/creative-canon";

export async function GET() {
  return Response.json({
    eras: CREATIVE_ERAS,
    archetypes: CREATIVE_ARCHETYPES,
    principles: TIMELESS_DESIGN_PRINCIPLES,
    stats: {
      erasCovered: CREATIVE_ERAS.length,
      archetypes: CREATIVE_ARCHETYPES.length,
      principles: TIMELESS_DESIGN_PRINCIPLES.length,
      iconicCampaignsReferenced: CREATIVE_ERAS.reduce((sum, era) => sum + era.iconicReferences.length, 0),
    },
  });
}
