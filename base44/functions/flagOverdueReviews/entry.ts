import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled function: runs daily.
 * Finds active PHB cases with overdue review dates and:
 *   1. Updates case status to "Under Review" if review is overdue
 *   2. Creates an AuditLog entry for traceability
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authenticate — allow service-role calls from scheduled automation
    const today = new Date().toISOString().slice(0, 10);

    const cases = await base44.asServiceRole.entities.PHBCase.filter({ status: "Active" });

    const overdueCases = cases.filter(c =>
      c.next_review_date && c.next_review_date < today
    );

    let flagged = 0;

    for (const c of overdueCases) {
      await base44.asServiceRole.entities.PHBCase.update(c.id, { status: "Under Review" });

      await base44.asServiceRole.entities.AuditLog.create({
        user_email: "system@qa360phb",
        user_name: "System Automation",
        user_role: "system",
        action: "Status Change",
        entity_type: "PHBCase",
        entity_id: c.id,
        entity_reference: c.case_reference || c.patient_name,
        description: `Auto-flagged overdue review: case moved to 'Under Review'. Review was due ${c.next_review_date}.`,
        previous_value: JSON.stringify({ status: "Active" }),
        new_value: JSON.stringify({ status: "Under Review" }),
      });

      flagged++;
    }

    return Response.json({
      success: true,
      flagged,
      message: `Flagged ${flagged} overdue review(s) as 'Under Review'`,
      date: today,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});