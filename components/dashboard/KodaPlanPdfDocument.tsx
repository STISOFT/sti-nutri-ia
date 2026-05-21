import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { KodaPlan } from '@/types/method';

// PDF del KodaPlan (Bloques 6+8 del Método). Tres secciones:
// nutrición, entrenamiento, recuperación. Páginas A4.

const PRIMARY = '#16a34a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const DARK = '#0f172a';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DARK,
    paddingHorizontal: 36,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 16,
    borderBottom: `2 solid ${PRIMARY}`,
    paddingBottom: 8,
  },
  brand: {
    color: PRIMARY,
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
  },
  subtitle: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: PRIMARY,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: `1 solid ${BORDER}`,
  },
  subsectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  muted: {
    color: MUTED,
    fontSize: 9,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  macroCard: {
    flex: 1,
    border: `1 solid ${BORDER}`,
    borderRadius: 4,
    padding: 6,
  },
  macroLabel: {
    color: MUTED,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  macroValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    marginTop: 2,
  },
  macroUnit: {
    color: MUTED,
    fontSize: 8,
  },
  list: {
    paddingLeft: 8,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    fontSize: 8,
    color: DARK,
    backgroundColor: '#f1f5f9',
    border: `1 solid ${BORDER}`,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: `1 solid ${BORDER}`,
    paddingBottom: 3,
    marginBottom: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `0.5 solid ${BORDER}`,
    paddingVertical: 3,
  },
  cellName: { flex: 3 },
  cellNum: { flex: 1, textAlign: 'center' },
  thMuted: { color: MUTED, fontSize: 8, textTransform: 'uppercase' },
  intervention: {
    border: `1 solid ${BORDER}`,
    borderRadius: 4,
    padding: 6,
    marginBottom: 5,
    backgroundColor: '#f8fafc',
  },
  interventionName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: MUTED,
    textAlign: 'center',
    paddingTop: 6,
    borderTop: `0.5 solid ${BORDER}`,
  },
});

const TIER_LABEL: Record<KodaPlan['meta']['plan_tier'], string> = {
  inicio: 'PLAN INICIO',
  core: 'PLAN CORE',
  pro: 'PLAN PRO',
};

const ROUTINE_LABEL: Record<KodaPlan['training']['routine_type'], string> = {
  full_body: 'Full Body',
  upper_lower: 'Upper / Lower',
  ppl_ul: 'PPL + Upper/Lower',
  ppl_x2: 'PPL x2',
};

interface KodaPlanPdfDocumentProps {
  plan: KodaPlan;
  userName?: string;
}

export function KodaPlanPdfDocument({ plan, userName }: KodaPlanPdfDocumentProps) {
  const avgKcal = Math.round(
    (plan.requirements.target_kcal.min + plan.requirements.target_kcal.max) / 2
  );

  return (
    <Document>
      {/* Página 1 — Resumen + Nutrición */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>KODA — {TIER_LABEL[plan.meta.plan_tier]}</Text>
          <Text style={styles.title}>
            Tu plan personalizado{userName ? ` — ${userName}` : ''}
          </Text>
          <Text style={styles.subtitle}>
            Generado el {new Date(plan.meta.generated_at).toLocaleDateString('es-PE')} ·
            Método {plan.meta.method_version}
          </Text>
        </View>

        {/* Macros */}
        <View style={styles.macroRow}>
          <MacroBox label="Calorías" value={String(avgKcal)} unit="kcal/día" />
          <MacroBox label="Proteína" value={String(plan.requirements.protein_g)} unit="g" />
          <MacroBox label="Carbohidratos" value={String(plan.requirements.carbs_g)} unit="g" />
          <MacroBox label="Grasas" value={String(plan.requirements.fats_g)} unit="g" />
        </View>
        <Text style={styles.muted}>
          Déficit: {plan.requirements.deficit_type} · Rango{' '}
          {plan.requirements.target_kcal.min}–{plan.requirements.target_kcal.max} kcal/día
        </Text>

        {/* Nutrición */}
        <Text style={styles.sectionTitle}>1. Nutrición</Text>

        <Text style={styles.subsectionTitle}>Estructura del día</Text>
        <Text style={styles.paragraph}>
          Comidas al día: {plan.nutrition.meal_count}
        </Text>
        <Text style={styles.paragraph}>{plan.nutrition.daily_distribution}</Text>
        {plan.nutrition.flexibility_notes ? (
          <Text style={styles.paragraph}>{plan.nutrition.flexibility_notes}</Text>
        ) : null}

        <Text style={styles.subsectionTitle}>Distribución de macros</Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Proteína: </Text>
          {plan.nutrition.protein_distribution}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Carbohidratos: </Text>
          {plan.nutrition.carbs_distribution}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Grasas: </Text>
          {plan.nutrition.fats_distribution}
        </Text>

        <Text style={styles.subsectionTitle}>Alimentos recomendados</Text>
        <View style={styles.tagRow}>
          {plan.nutrition.recommended_foods.map((f, i) => (
            <Text key={i} style={styles.tag}>
              {f}
            </Text>
          ))}
        </View>

        {plan.nutrition.foods_to_avoid.length > 0 ? (
          <>
            <Text style={styles.subsectionTitle}>Alimentos a evitar</Text>
            <View style={styles.tagRow}>
              {plan.nutrition.foods_to_avoid.map((f, i) => (
                <Text key={i} style={styles.tag}>
                  {f}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        {plan.nutrition.food_notes ? (
          <Text style={[styles.paragraph, { marginTop: 6 }]}>
            {plan.nutrition.food_notes}
          </Text>
        ) : null}

        {plan.nutrition.interventions.length > 0 ? (
          <>
            <Text style={styles.subsectionTitle}>Intervenciones específicas</Text>
            {plan.nutrition.interventions.map((iv, i) => (
              <View key={i} style={styles.intervention} wrap={false}>
                <Text style={styles.interventionName}>
                  {iv.name} <Text style={styles.muted}>— {iv.reason}</Text>
                </Text>
                <Text style={[styles.paragraph, { marginTop: 2 }]}>{iv.how_to_apply}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.footer} fixed>
          KODA · 3BMARKETPLACE S.A.C. · Plan personalizado, orientativo. No reemplaza el
          consejo médico profesional.
        </Text>
      </Page>

      {/* Página 2 — Entrenamiento */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>KODA — Entrenamiento</Text>
          <Text style={styles.subtitle}>Plan de pesas + cardio + core</Text>
        </View>

        <Text style={styles.sectionTitle}>2. Entrenamiento</Text>

        <Text style={styles.subsectionTitle}>Estructura semanal</Text>
        <View style={styles.macroRow}>
          <MacroBox
            label="Frecuencia"
            value={String(plan.training.weekly_frequency)}
            unit="días/sem"
          />
          <MacroBox label="Rutina" value={ROUTINE_LABEL[plan.training.routine_type]} unit="" />
          <MacroBox
            label="Duración"
            value={String(plan.training.session_duration_min)}
            unit="min/sesión"
          />
          <MacroBox
            label="Cardio"
            value={
              plan.training.cardio.type === 'ninguno'
                ? '—'
                : plan.training.cardio.type.toUpperCase()
            }
            unit={
              plan.training.cardio.type === 'ninguno'
                ? ''
                : `${plan.training.cardio.weekly_frequency}x/sem`
            }
          />
        </View>
        <Text style={styles.muted}>{plan.training.weekly_distribution}</Text>

        {plan.training.sessions.map((s, i) => (
          <View key={i} wrap={false} style={{ marginTop: 10 }}>
            <Text style={styles.subsectionTitle}>{s.day_label}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellName, styles.thMuted]}>Ejercicio</Text>
              <Text style={[styles.cellNum, styles.thMuted]}>Tipo</Text>
              <Text style={[styles.cellNum, styles.thMuted]}>Series</Text>
              <Text style={[styles.cellNum, styles.thMuted]}>Reps</Text>
              <Text style={[styles.cellNum, styles.thMuted]}>RIR</Text>
            </View>
            {s.exercises.map((ex, j) => (
              <View key={j} style={styles.tableRow}>
                <Text style={styles.cellName}>{ex.name}</Text>
                <Text style={[styles.cellNum, styles.muted]}>{ex.category}</Text>
                <Text style={styles.cellNum}>{ex.series}</Text>
                <Text style={styles.cellNum}>{ex.reps}</Text>
                <Text style={[styles.cellNum, styles.muted]}>{ex.rir}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Cardio */}
        <Text style={styles.subsectionTitle}>Cardio</Text>
        {plan.training.cardio.type === 'ninguno' ? (
          <Text style={styles.muted}>No se incluye cardio adicional en este plan.</Text>
        ) : (
          <>
            <Text style={styles.paragraph}>
              {plan.training.cardio.type.toUpperCase()} ·{' '}
              {plan.training.cardio.weekly_frequency} veces/semana ·{' '}
              {plan.training.cardio.duration_min} min ·{' '}
              {plan.training.cardio.placement}
            </Text>
            {plan.training.cardio.notes ? (
              <Text style={styles.paragraph}>{plan.training.cardio.notes}</Text>
            ) : null}
          </>
        )}

        {/* Core */}
        <Text style={styles.subsectionTitle}>Core</Text>
        <Text style={styles.paragraph}>
          {plan.training.core.weekly_frequency} veces/semana ·{' '}
          {plan.training.core.total_weekly_series} series totales/semana
        </Text>
        <View style={styles.tagRow}>
          {plan.training.core.exercises.map((e, i) => (
            <Text key={i} style={styles.tag}>
              {e}
            </Text>
          ))}
        </View>

        {plan.training.interventions.length > 0 ? (
          <>
            <Text style={styles.subsectionTitle}>Notas</Text>
            <View style={styles.list}>
              {plan.training.interventions.map((n, i) => (
                <Text key={i} style={styles.listItem}>
                  • {n}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.footer} fixed>
          KODA · 3BMARKETPLACE S.A.C. · Plan personalizado, orientativo. No reemplaza el
          consejo médico profesional.
        </Text>
      </Page>

      {/* Página 3 — Recuperación */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>KODA — Recuperación y estilo de vida</Text>
          <Text style={styles.subtitle}>Sueño · hidratación · NEAT · estrés</Text>
        </View>

        <Text style={styles.sectionTitle}>3. Recuperación y estilo de vida</Text>

        <Text style={styles.subsectionTitle}>Sueño</Text>
        <Text style={styles.paragraph}>Objetivo: {plan.recovery.sleep.target_hours}</Text>
        <Text style={styles.paragraph}>{plan.recovery.sleep.recommendation}</Text>

        <Text style={styles.subsectionTitle}>Hidratación</Text>
        <Text style={styles.paragraph}>
          Meta diaria: {plan.recovery.hydration.daily_target_ml} ml
        </Text>
        {plan.recovery.hydration.notes ? (
          <Text style={styles.paragraph}>{plan.recovery.hydration.notes}</Text>
        ) : null}
        {plan.recovery.hydration.interventions.length > 0 ? (
          <View style={styles.tagRow}>
            {plan.recovery.hydration.interventions.map((t, i) => (
              <Text key={i} style={styles.tag}>
                {t}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.subsectionTitle}>Actividad diaria (NEAT)</Text>
        <Text style={styles.paragraph}>
          Pasos al día: {plan.recovery.neat.daily_steps_target.toLocaleString('es-PE')}
        </Text>
        <View style={styles.list}>
          {plan.recovery.neat.recommendations.map((r, i) => (
            <Text key={i} style={styles.listItem}>
              • {r}
            </Text>
          ))}
        </View>

        <Text style={styles.subsectionTitle}>Manejo del estrés</Text>
        <Text style={styles.paragraph}>{plan.recovery.stress.recommendation}</Text>
        {plan.recovery.stress.interventions.length > 0 ? (
          <View style={styles.tagRow}>
            {plan.recovery.stress.interventions.map((t, i) => (
              <Text key={i} style={styles.tag}>
                {t}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.subsectionTitle}>Organización y adherencia</Text>
        <Text style={styles.paragraph}>{plan.recovery.organization.recommendation}</Text>
        {plan.recovery.organization.practical_tips.length > 0 ? (
          <View style={styles.list}>
            {plan.recovery.organization.practical_tips.map((tip, i) => (
              <Text key={i} style={styles.listItem}>
                • {tip}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          KODA · 3BMARKETPLACE S.A.C. · Plan personalizado, orientativo. No reemplaza el
          consejo médico profesional.
        </Text>
      </Page>
    </Document>
  );
}

function MacroBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {value}
        {unit ? <Text style={styles.macroUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}
