// lib/pdf/StudentReportDocument.tsx
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

import type { StudentReportData } from "@/app/modules/class/server/report.service";

const NAVY = "#0a2d87";
const SLATE = "#475569";
const SLATE_LIGHT = "#94a3b8";
const BORDER = "#e2e8f0";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#1e293b",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 10,
    marginBottom: 14,
  },
  studentName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  reportTitle: {
    fontSize: 9,
    color: SLATE_LIGHT,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  brand: {
    textAlign: "right",
  },
  brandName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  brandSub: {
    fontSize: 8,
    color: SLATE_LIGHT,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 7.5,
    color: SLATE_LIGHT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: 10,
  },
  paragraph: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: SLATE,
  },
  twoCol: {
    flexDirection: "row",
    gap: 14,
  },
  col: { flex: 1 },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "white",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tableRowAvg: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: "#f8fafc",
  },
  cellCompetency: { flex: 2, fontSize: 9.5, color: "#1e293b" },
  cellScore: { flex: 1, fontSize: 9.5, color: "#1e293b", textAlign: "center" },
  cellLabel: { flex: 1.4, fontSize: 9.5, color: SLATE, textAlign: "right" },
  cellCompetencyBold: {
    flex: 2,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  cellScoreBold: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    textAlign: "center",
  },
  cellLabelBold: {
    flex: 1.4,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#b45309",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerLabel: {
    fontSize: 7.5,
    color: SLATE_LIGHT,
    textTransform: "uppercase",
  },
  footerName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginTop: 2,
  },
});

function StudentReportPage({ data }: { data: StudentReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.studentName}>{data.studentName}</Text>
          <Text style={styles.reportTitle}>STUDENT PROGRESS REPORT</Text>
        </View>
        <View style={styles.brand}>
          <Text style={styles.brandName}>Inggris Go</Text>
          <Text style={styles.brandSub}>{data.programTitle}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Program</Text>
          <Text style={styles.metaValue}>{data.programTitle}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Tutor</Text>
          <Text style={styles.metaValue}>{data.tutorName || "-"}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Periode</Text>
          <Text style={styles.metaValue}>{data.periodLabel || "-"}</Text>
        </View>
      </View>

      {data.summary && (
        <>
          <Text style={styles.sectionLabel}>Ringkasan Perkembangan</Text>
          <Text style={styles.paragraph}>{data.summary}</Text>
        </>
      )}

      <View style={styles.twoCol}>
        {data.strengths && (
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Kekuatan Ananda</Text>
            <Text style={styles.paragraph}>{data.strengths}</Text>
          </View>
        )}
        {data.areasToImprove && (
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Area yang Perlu Dikembangkan</Text>
            <Text style={styles.paragraph}>{data.areasToImprove}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>Penilaian Kompetensi</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Kompetensi</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>
            Skor
          </Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.4, textAlign: "right" }]}>
            Keterangan
          </Text>
        </View>

        {data.competencies.map((c) => (
          <View key={c.key} style={styles.tableRow}>
            <Text style={styles.cellCompetency}>{c.label}</Text>
            <Text style={styles.cellScore}>{c.score}</Text>
            <Text style={styles.cellLabel}>{c.scoreLabel}</Text>
          </View>
        ))}

        <View style={styles.tableRowAvg}>
          <Text style={styles.cellCompetencyBold}>Rata-rata</Text>
          <Text style={styles.cellScoreBold}>{data.average.toFixed(1)}</Text>
          <Text style={styles.cellLabelBold}>{data.progressLabel}</Text>
        </View>
      </View>

      {data.tutorNotes && (
        <>
          <Text style={styles.sectionLabel}>Catatan Tutor</Text>
          <Text style={styles.paragraph}>{data.tutorNotes}</Text>
        </>
      )}

      {data.parentRecommendation && (
        <>
          <Text style={styles.sectionLabel}>Rekomendasi Orang Tua</Text>
          <Text style={styles.paragraph}>{data.parentRecommendation}</Text>
        </>
      )}

      <View style={styles.footer} fixed>
        <View>
          <Text style={styles.footerLabel}>Tutor Coordinator</Text>
          <Text style={styles.footerName}>
            {data.tutorCoordinatorName || "-"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.footerLabel}>Inggris Go</Text>
          <Text style={styles.footerName}>{data.programTitle}</Text>
        </View>
      </View>
    </Page>
  );
}

export function StudentReportDocument({
  reports,
}: {
  reports: StudentReportData[];
}) {
  return (
    <Document>
      {reports.map((data) => (
        <StudentReportPage key={data.scoreId} data={data} />
      ))}
    </Document>
  );
}
