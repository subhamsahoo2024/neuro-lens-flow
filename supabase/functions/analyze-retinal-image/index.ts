import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validateImageData = (base64: string): boolean => {
  const imageRegex = /^data:image\/(jpeg|jpg|png);base64,/;
  return imageRegex.test(base64);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, metadata } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!validateImageData(imageData)) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Please provide a valid JPEG or PNG image." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const metadataContext = metadata?.source === 'upload' 
      ? "\n\nNote: This image was uploaded from storage/gallery rather than captured directly. Consider potential quality variations."
      : "";

    const systemPrompt = `You are an expert ophthalmologist and vascular neurologist AI assistant specialized in retinal imaging analysis for stroke risk assessment.

IMPORTANT: The provided image may be from various sources:
- Direct camera capture (highest quality, controlled lighting)
- Uploaded from photo gallery (quality may vary)
- Medical imaging device export (professional quality)

Analyze the provided retinal macula image for biomarkers associated with cerebrovascular disease and stroke risk.

Assess the following indicators with special attention to image quality:
1. Image quality and suitability for analysis
2. Retinal vessel caliber (arteriolar narrowing, venular widening)
3. Arteriovenous nicking severity
4. Cotton wool spots (retinal nerve fiber layer infarcts)
5. Retinal hemorrhages (dot-blot or flame-shaped)
6. Hard exudates (lipid deposits)
7. Optic disc abnormalities
8. Overall microvascular health

If image quality is poor or unsuitable for medical analysis, clearly state this in your assessment and recommend re-capturing with better lighting/focus.

Be conservative and emphasize that AI analysis supplements but does not replace clinical judgment.${metadataContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this retinal macula image for stroke risk assessment."
              },
              {
                type: "image_url",
                image_url: { url: imageData }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "assess_stroke_risk",
              description: "Provide structured stroke risk assessment from retinal image analysis",
              parameters: {
                type: "object",
                properties: {
                  imageQualityScore: {
                    type: "number",
                    description: "Image quality score from 0-100"
                  },
                  strokeRiskPercentage: {
                    type: "number",
                    description: "Stroke risk percentage from 0-100"
                  },
                  riskLevel: {
                    type: "string",
                    enum: ["Low", "Moderate", "High", "Critical", "Insufficient Quality"],
                    description: "Categorical risk level"
                  },
                  riskFactors: {
                    type: "object",
                    properties: {
                      vesselCaliberAbnormalities: { type: "boolean" },
                      arteriovenousNicking: { type: "boolean" },
                      cottonWoolSpots: { type: "boolean" },
                      retinalHemorrhages: { type: "boolean" },
                      exudates: { type: "boolean" },
                      opticDiscAbnormalities: { type: "boolean" },
                      findings: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["findings"]
                  },
                  clinicalRecommendations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  confidence: {
                    type: "number",
                    description: "Analysis confidence from 0-100"
                  }
                },
                required: ["imageQualityScore", "strokeRiskPercentage", "riskLevel", "riskFactors", "clinicalRecommendations", "confidence"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "assess_stroke_risk" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
