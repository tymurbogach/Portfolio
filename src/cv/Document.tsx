import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CvData } from "./data";

const c = {
  black: "#111111",
  dark: "#2a2a2a",
  mid: "#555555",
  light: "#888888",
  accent: "#c8622a",
  rule: "#dddddd",
  bg: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8.2,
    color: c.dark,
    backgroundColor: c.bg,
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 44,
  },

  header: {
    marginBottom: 6,
  },

  headerName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    lineHeight: 1.2,
    color: c.black,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 10,
    color: c.accent,
    marginBottom: 6,
  },

  headerRule: {
    borderBottomWidth: 0.75,
    borderBottomColor: c.rule,
    marginBottom: 4,
  },

  headerContactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 7.5,
    color: c.mid,
    marginBottom: 6,
  },

  contactSep: {
    marginHorizontal: 6,
    color: c.light,
  },

  section: {
    marginTop: 10,
  },

  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  sectionRule: {
    borderBottomWidth: 0.75,
    borderBottomColor: c.rule,
    marginBottom: 6,
  },

  summary: {
    fontSize: 8.2,
    lineHeight: 1.5,
  },

  block: {
    marginBottom: 8,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },

  titlePrimary: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.4,
    flex: 1,
  },

  metaText: {
    fontSize: 7.5,
    color: c.light,
  },

  titleSecondary: {
    fontSize: 7.8,
    color: c.accent,
    marginBottom: 3,
  },

  bullet: {
    flexDirection: "row",
    paddingLeft: 8,
    marginBottom: 2,
  },

  bulletDot: {
    width: 8,
    fontSize: 8,
    color: c.mid,
  },

  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.4,
  },

  langRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  langItem: {
    fontSize: 8,
    marginRight: 16,
  },

  langLevel: {
    color: c.light,
  },

  refsRow: {
    flexDirection: "row",
    marginTop: 4,
  },

  refCol: {
    flex: 1,
    paddingRight: 16,
  },

  refName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.2,
    marginBottom: 1,
  },

  refRole: {
    fontSize: 7.5,
    color: c.accent,
    marginBottom: 1,
  },

  refContact: {
    fontSize: 7.5,
    color: c.mid,
  },
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={s.section}>
    <Text style={s.sectionLabel}>{title}</Text>
    <View style={s.sectionRule} />
    {children}
  </View>
);

const Bullet = ({ text }: { text: string }) => (
  <View style={s.bullet}>
    <Text style={s.bulletDot}>•</Text>
    <Text style={s.bulletText}>{text}</Text>
  </View>
);

export default function CVDocument({ data }: { data: CvData }) {
  const { personal, summary, experience, projects, education, languages, references } = data;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerName}>{personal.name}</Text>
          <Text style={s.headerTitle}>{personal.title}</Text>
        </View>

        <View style={s.headerRule} />

        <View style={s.headerContactRow}>
          <Text>{personal.email}</Text>
          <Text style={s.contactSep}>•</Text>
          <Text>{personal.phone}</Text>
          <Text style={s.contactSep}>•</Text>
          <Text>{personal.website}</Text>
          <Text style={s.contactSep}>•</Text>
          <Text>{personal.github}</Text>
          <Text style={s.contactSep}>•</Text>
          <Text>{personal.location}</Text>
        </View>

        <Section title="Resumen">
          <Text style={s.summary}>{summary}</Text>
        </Section>

        <Section title="Experiencia Profesional">
          {experience.map((exp, i) => (
            <View key={i} style={s.block}>
              <View style={s.topRow}>
                <Text style={s.titlePrimary}>{exp.role}</Text>
                <Text style={s.metaText}>
                  {exp.location} · {exp.period}
                </Text>
              </View>
              <Text style={s.titleSecondary}>{exp.company}</Text>
              {exp.bullets.map((b, j) => (
                <Bullet key={j} text={b} />
              ))}
            </View>
          ))}
        </Section>

        <Section title="Proyectos Personales">
          {projects.map((proj, i) => (
            <View key={i} style={s.block}>
              <View style={s.topRow}>
                <Text style={s.titlePrimary}>{proj.name}</Text>
                <Text style={s.metaText}>{proj.status}</Text>
              </View>
              {proj.bullets.map((b, j) => (
                <Bullet key={j} text={b} />
              ))}
            </View>
          ))}
        </Section>

        <Section title="Educación">
          {education.map((edu, i) => (
            <View key={i} style={s.block}>
              <View style={s.topRow}>
                <Text style={s.titlePrimary}>{edu.school}</Text>
                <Text style={s.metaText}>{edu.period}</Text>
              </View>
              <Text style={s.titleSecondary}>{edu.degree}</Text>
            </View>
          ))}
        </Section>

        <Section title="Idiomas">
          <View style={s.langRow}>
            {languages.map((l, i) => (
              <Text key={i} style={s.langItem}>
                {l.name} <Text style={s.langLevel}>({l.level})</Text>
              </Text>
            ))}
          </View>
        </Section>

        <Section title="Referencias">
          <View style={s.refsRow}>
            {references.map((ref, i) => (
              <View key={i} style={s.refCol}>
                <Text style={s.refName}>{ref.name}</Text>
                <Text style={s.refRole}>{ref.role}</Text>
                <Text style={s.refContact}>
                  {ref.phone} • {ref.email}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      </Page>
    </Document>
  );
}
