import { describe, it, expect } from "vitest";
import {
  leadFormSchema,
  dealFormSchema,
  campaignFormSchema,
  experimentFormSchema,
  offerFormSchema,
  webhookFormSchema,
  validateFormData,
  emailSchema,
  phoneSchema,
} from "@/lib/validation/form-schemas";

describe("Form Validation Schemas", () => {
  describe("emailSchema", () => {
    it("should validate correct emails", () => {
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("user.name@domain.co.uk").success).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(emailSchema.safeParse("").success).toBe(false);
      expect(emailSchema.safeParse("invalid").success).toBe(false);
      expect(emailSchema.safeParse("@nodomain.com").success).toBe(false);
    });
  });

  describe("phoneSchema", () => {
    it("should validate correct phone numbers", () => {
      expect(phoneSchema.safeParse("+33612345678").success).toBe(true);
      expect(phoneSchema.safeParse("+1 555-123-4567").success).toBe(true);
      expect(phoneSchema.safeParse("").success).toBe(true); // Optional
    });

    it("should reject invalid phone numbers", () => {
      expect(phoneSchema.safeParse("123").success).toBe(false);
      expect(phoneSchema.safeParse("abc").success).toBe(false);
    });
  });

  describe("leadFormSchema", () => {
    it("should validate correct lead data", () => {
      const validLead = {
        name: "Jean Dupont",
        email: "jean@example.com",
        company: "Acme Inc",
        phone: "+33612345678",
        source: "direct",
      };
      expect(leadFormSchema.safeParse(validLead).success).toBe(true);
    });

    it("should reject missing required fields", () => {
      expect(leadFormSchema.safeParse({ email: "test@test.com" }).success).toBe(false);
      expect(leadFormSchema.safeParse({ name: "Test" }).success).toBe(false);
    });

    it("should accept minimal valid data", () => {
      const minimalLead = {
        name: "Test",
        email: "test@example.com",
      };
      expect(leadFormSchema.safeParse(minimalLead).success).toBe(true);
    });
  });

  describe("campaignFormSchema", () => {
    it("should validate correct campaign data", () => {
      const validCampaign = {
        name: "Brand Campaign",
        budget_daily: 100,
        strategy: "maximize_conversions",
      };
      expect(campaignFormSchema.safeParse(validCampaign).success).toBe(true);
    });

    it("should reject invalid budget", () => {
      expect(campaignFormSchema.safeParse({
        name: "Test",
        budget_daily: 0,
        strategy: "maximize_conversions",
      }).success).toBe(false);
    });

    it("should reject invalid strategy", () => {
      expect(campaignFormSchema.safeParse({
        name: "Test",
        budget_daily: 100,
        strategy: "invalid_strategy",
      }).success).toBe(false);
    });
  });

  describe("experimentFormSchema", () => {
    it("should validate correct experiment data", () => {
      const validExperiment = {
        name: "Hero CTA Test",
        hypothesis: "Changing button color will increase CTR",
        page_url: "https://example.com/landing",
        test_type: "ab",
      };
      expect(experimentFormSchema.safeParse(validExperiment).success).toBe(true);
    });

    it("should accept minimal data", () => {
      expect(experimentFormSchema.safeParse({ name: "Test" }).success).toBe(true);
    });
  });

  describe("offerFormSchema", () => {
    it("should validate correct offer data", () => {
      const validOffer = {
        name: "Starter",
        tier: "starter",
        price: 99,
        price_period: "/mois",
        features: ["Feature 1", "Feature 2"],
      };
      expect(offerFormSchema.safeParse(validOffer).success).toBe(true);
    });

    it("should reject empty features array", () => {
      expect(offerFormSchema.safeParse({
        name: "Test",
        tier: "starter",
        price: 99,
        features: [],
      }).success).toBe(false);
    });
  });

  describe("webhookFormSchema", () => {
    it("should validate correct webhook data", () => {
      const validWebhook = {
        name: "Zapier Integration",
        url: "https://hooks.zapier.com/123",
        events: ["lead.created"],
        is_active: true,
      };
      expect(webhookFormSchema.safeParse(validWebhook).success).toBe(true);
    });

    it("should reject invalid URL", () => {
      expect(webhookFormSchema.safeParse({
        name: "Test",
        url: "not-a-url",
        events: ["test"],
      }).success).toBe(false);
    });
  });

  describe("validateFormData utility", () => {
    it("should return success with data for valid input", () => {
      const result = validateFormData(leadFormSchema, {
        name: "Test",
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test");
      }
    });

    it("should return errors for invalid input", () => {
      const result = validateFormData(leadFormSchema, {
        name: "",
        email: "invalid",
      });
      expect(result.success).toBe(false);
      if ('errors' in result) {
        expect(result.errors).toHaveProperty("name");
        expect(result.errors).toHaveProperty("email");
      }
    });
  });
});
