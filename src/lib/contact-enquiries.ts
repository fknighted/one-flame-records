/**
 * Enquiry types offered on /contact, in the order the form shows them.
 * The keys match the `contact_enquiries.enquiry_type` database check.
 */
export const ENQUIRY_TYPES = {
  general:           "General enquiry",
  studio_session:    "Studio session",
  event:             "Event",
  private_hire:      "Private hire",
  press:             "Press & media",
  sync:              "Sync licensing",
  artist_submission: "Artist submission",
} as const;

export type EnquiryType = keyof typeof ENQUIRY_TYPES;

export function isEnquiryType(value: unknown): value is EnquiryType {
  return typeof value === "string" && Object.hasOwn(ENQUIRY_TYPES, value);
}
