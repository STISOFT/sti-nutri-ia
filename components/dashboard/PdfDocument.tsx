import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { DietPlanData } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    paddingHorizontal: 36,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #16a34a',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  macroBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
  },
  macroLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  weekTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 4,
    marginTop: 12,
  },
  weekTheme: {
    fontSize: 9,
    color: '#16a34a',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  dayRow: {
    marginBottom: 6,
    padding: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 3,
  },
  dayTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  mealRow: {
    flexDirection: 'row',
    marginTop: 3,
    gap: 4,
  },
  mealLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    width: 70,
  },
  mealName: {
    fontSize: 8,
    color: '#374151',
    flex: 1,
  },
  mealCal: {
    fontSize: 8,
    color: '#16a34a',
    width: 50,
    textAlign: 'right',
  },
  tip: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  shoppingTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginTop: 8,
    marginBottom: 3,
  },
  shoppingItem: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 6,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

const MEAL_LABELS: Record<string, string> = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  almuerzo: 'Almuerzo',
  media_tarde: 'Media tarde',
  cena: 'Cena',
};

const MEAL_ORDER = ['desayuno', 'media_manana', 'almuerzo', 'media_tarde', 'cena'];

interface PdfDocumentProps {
  planData: DietPlanData;
}

export function PdfDocument({ planData }: PdfDocumentProps) {
  const { summary, weeks } = planData;

  return (
    <Document title="Mi Plan NutriIA" author="NutriIA">
      {/* Página 1: Resumen */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>NutriIA — Plan de Alimentación</Text>
          <Text style={styles.subtitle}>Plan personalizado de 4 semanas</Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen nutricional diario</Text>
        <View style={styles.row}>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{summary.calories_per_day}</Text>
            <Text style={styles.macroLabel}>kcal/día</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{summary.protein_g}g</Text>
            <Text style={styles.macroLabel}>Proteínas</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{summary.carbs_g}g</Text>
            <Text style={styles.macroLabel}>Carbohidratos</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{summary.fat_g}g</Text>
            <Text style={styles.macroLabel}>Grasas</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{summary.water_ml}ml</Text>
            <Text style={styles.macroLabel}>Agua</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={{ fontSize: 9, color: '#374151' }}>{summary.notes}</Text>
        </View>

        <Text style={styles.footer}>
          Generado por NutriIA · Este plan es orientativo y no reemplaza consulta médica profesional
        </Text>
      </Page>

      {/* Una página por semana */}
      {weeks.map((week) => (
        <Page key={week.week_number} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Semana {week.week_number}</Text>
            <Text style={styles.subtitle}>{week.theme}</Text>
          </View>

          {week.days.map((day) => (
            <View key={day.day} style={styles.dayRow} wrap={false}>
              <Text style={styles.dayTitle}>
                Día {day.day} — {day.day_name} ({day.total_calories} kcal)
              </Text>
              {MEAL_ORDER.map((key) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const meal = (day.meals as any)[key];
                if (!meal) return null;
                return (
                  <View key={key} style={styles.mealRow}>
                    <Text style={styles.mealLabel}>{MEAL_LABELS[key]}</Text>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealCal}>{meal.calories} kcal</Text>
                  </View>
                );
              })}
              <Text style={styles.tip}>💡 {day.daily_tip}</Text>
            </View>
          ))}

          {/* Lista de compras */}
          <Text style={styles.shoppingTitle}>Lista de compras semana {week.week_number}</Text>
          {week.shopping_list.map((item, i) => (
            <Text key={i} style={styles.shoppingItem}>
              • {item}
            </Text>
          ))}

          <Text style={styles.footer}>
            Generado por NutriIA · Este plan es orientativo y no reemplaza consulta médica profesional
          </Text>
        </Page>
      ))}
    </Document>
  );
}
