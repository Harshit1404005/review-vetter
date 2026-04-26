import { jsPDF } from "jspdf";
import { ProductIntelligence } from "./intelligence";

export class PDFService {
  /**
   * Generates a professional intelligence report PDF.
   */
  static generateReport(intel: ProductIntelligence, isPro: boolean = false) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = "#4f46e5"; // Indigo 600
    const secondaryColor = "#1e293b"; // Slate 800
    const accentColor = "#10b981"; // Emerald 500
    const lightBg = "#f8fafc";

    // ─── HELPER: Header Branding ───
    const addBranding = (pageDoc: jsPDF) => {
      // Header Background
      pageDoc.setFillColor(secondaryColor);
      pageDoc.rect(0, 0, 210, 35, "F");

      // App Logo (Manual Shield)
      pageDoc.setFillColor(primaryColor);
      pageDoc.roundedRect(20, 10, 12, 12, 2, 2, "F");
      pageDoc.setTextColor("#ffffff");
      pageDoc.setFontSize(10);
      pageDoc.setFont("helvetica", "bold");
      pageDoc.text("RV", 23, 18);

      // App Name
      pageDoc.setFontSize(20);
      pageDoc.text("ReviewVetter", 38, 20);
      
      pageDoc.setFontSize(8);
      pageDoc.setFont("helvetica", "normal");
      pageDoc.text("AI-POWERED MARKET INTELLIGENCE", 38, 26);

      // Meta Info
      pageDoc.setTextColor("#94a3b8");
      pageDoc.setFontSize(7);
      pageDoc.text(`DATE: ${new Date().toLocaleDateString()}`, 160, 18);
      pageDoc.text(`REF: RV-${Math.random().toString(36).substring(7).toUpperCase()}`, 160, 23);
      pageDoc.text(`TIER: ${isPro ? "PRO LICENSE" : "FREE AUDIT"}`, 160, 28);
    };

    // ─── HELPER: Footer ───
    const addFooter = (pageDoc: jsPDF, pageIndex: number) => {
      pageDoc.setFontSize(7);
      pageDoc.setTextColor("#94a3b8");
      pageDoc.setFont("helvetica", "normal");
      pageDoc.text("CONFIDENTIAL | FOR STRATEGIC INTERNAL USE ONLY", 105, 285, { align: "center" });
      pageDoc.text(`PAGE ${pageIndex} OF 2 | GENERATED VIA REVIEWVETTER.COM`, 105, 290, { align: "center" });
    };

    // ─── HELPER: Watermark ───
    const addWatermark = (pageDoc: jsPDF) => {
      if (!isPro) {
        pageDoc.saveGraphicsState();
        pageDoc.setGState(new (pageDoc as any).GState({ opacity: 0.05 }));
        pageDoc.setFontSize(70);
        pageDoc.setTextColor("#000000");
        pageDoc.setFont("helvetica", "bold");
        pageDoc.text("REVIEWVETTER FREE", 105, 150, { 
          align: "center", 
          angle: 45 
        });
        pageDoc.restoreGraphicsState();
      }
    };

    // ─── PAGE 1: OVERVIEW & SWOT ───
    addBranding(doc);
    addWatermark(doc);

    // Title / Product
    doc.setTextColor(secondaryColor);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(intel.productName.toUpperCase(), 20, 50);

    // Score Board
    doc.setFillColor(lightBg);
    doc.roundedRect(150, 42, 45, 25, 3, 3, "F");
    doc.setTextColor(secondaryColor);
    doc.setFontSize(8);
    doc.text("VETTER SCORE", 155, 49);
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text(`${intel.score}/100`, 155, 60);

    // Vectors
    doc.setTextColor(secondaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE VECTORS", 20, 75);

    const vectors = [
      { l: "Reliability", v: intel.details.quality },
      { l: "Market Value", v: intel.details.value },
      { l: "Logistics", v: intel.details.shipping },
      { l: "CS Resolution", v: intel.details.support },
    ];

    vectors.forEach((v, i) => {
      const rowY = 85 + (i * 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(secondaryColor);
      doc.text(v.l, 20, rowY);
      doc.text(`${v.v}%`, 185, rowY, { align: "right" });
      
      doc.setFillColor("#e2e8f0");
      doc.rect(20, rowY + 2, 165, 1.5, "F");
      doc.setFillColor(primaryColor);
      doc.rect(20, rowY + 2, (v.v / 100) * 165, 1.5, "F");
    });

    // SWOT Audit (Moved down)
    let currentY = 175;
    doc.setTextColor(secondaryColor);
    doc.setFontSize(11);
    doc.text("SWOT AUDIT SUMMARY", 20, currentY);

    // Revenue Leakage (New Section)
    doc.setFillColor("#fff1f2");
    doc.roundedRect(20, 138, 170, 20, 2, 2, "F");
    doc.setTextColor("#be123c");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("REVENUE LEAKAGE AUDIT", 25, 145);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Estimated ${intel.revenueImpact.recoveryEstimate} recovery through remediation of: ${intel.revenueImpact.leakageReason}`, 25, 151);

    const leftCol = 20;
    const rightCol = 110;
    currentY += 10;

    // Strengths (Green)
    doc.setFillColor(accentColor);
    doc.rect(leftCol, currentY, 80, 7, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(9);
    doc.text("CORE STRENGTHS", leftCol + 3, currentY + 5);
    
    // Weaknesses (Red)
    doc.setFillColor("#ef4444");
    doc.rect(rightCol, currentY, 80, 7, "F");
    doc.text("VULNERABILITIES", rightCol + 3, currentY + 5);

    currentY += 12;
    doc.setTextColor(secondaryColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    for (let i = 0; i < 4; i++) {
       if (intel.swot.strengths[i]) doc.text(`• ${intel.swot.strengths[i]}`, leftCol, currentY + (i * 6));
       if (intel.swot.weaknesses[i]) doc.text(`• ${intel.swot.weaknesses[i]}`, rightCol, currentY + (i * 6));
    }

    addFooter(doc, 1);

    // ─── PAGE 2: ROADMAP & ACTION ───
    doc.addPage();
    addBranding(doc);
    addWatermark(doc);

    doc.setTextColor(secondaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC EVOLUTION ROADMAP (90-DAY FIXES)", 20, 50);

    let roadmapY = 60;
    intel.roadmap.forEach((step, i) => {
      doc.setFillColor(lightBg);
      doc.roundedRect(20, roadmapY, 170, 18, 2, 2, "F");
      
      doc.setTextColor(primaryColor);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`FIX #${i+1}: ${step.title}`, 25, roadmapY + 7);
      
      doc.setTextColor("#475569");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(step.description, 25, roadmapY + 13, { maxWidth: 160 });
      
      roadmapY += 22;
    });

    // Bottom Action Hook
    doc.setFillColor(secondaryColor);
    doc.roundedRect(20, 240, 170, 25, 3, 3, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("NEXT STEPS FOR MANAGEMENT", 25, 250);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("1. Immediate internal pilot of Fix #1. 2. Brief Customer Support on vulnerability triggers. 3. Regenerate audit in 21 days.", 25, 258);

    addFooter(doc, 2);

    // Save
    doc.save(`${intel.productName.replace(/\s+/g, "_")}_Audit.pdf`);
  }
}
