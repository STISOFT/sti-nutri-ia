import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components';

interface DietPlanReadyEmailProps {
  fullName: string;
  caloriesPerDay: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  monthYear: string; // ej: 'Abril 2026'
  planUrl: string;
}

const PRIMARY = '#16a34a';
const BORDER = '#e2e8f0';
const MUTED = '#64748b';

// Colores de macros
const MACRO_PROTEIN = '#3b82f6';
const MACRO_CARBS = '#f59e0b';
const MACRO_FAT = '#a855f7';

export function DietPlanReadyEmail({
  fullName,
  caloriesPerDay,
  proteinG,
  carbsG,
  fatG,
  monthYear,
  planUrl,
}: DietPlanReadyEmailProps) {
  const firstName = fullName.split(' ')[0];

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu plan de dieta de {monthYear} está listo — NutriIA</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>🌿 NutriIA</Text>
          </Section>

          {/* Encabezado */}
          <Section style={section}>
            <Text style={badge}>🎉 Tu plan está listo</Text>
            <Heading style={h1}>¡{firstName}, tu plan de {monthYear} ya está disponible!</Heading>
            <Text style={p}>
              Nuestra IA ha generado un plan de alimentación de 30 días
              completamente personalizado con tus datos. Aquí tienes un resumen
              de tus objetivos diarios:
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Resumen de macros */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              Tus macros diarios
            </Heading>

            {/* Calorías totales */}
            <Section style={calorieBox}>
              <Text style={calorieLabel}>Calorías por día</Text>
              <Text style={calorieValue}>{caloriesPerDay} kcal</Text>
            </Section>

            {/* Grid de macros */}
            <Row style={macroRow}>
              <Column style={macroCell}>
                <Section style={{ ...macroBadge, backgroundColor: `${MACRO_PROTEIN}15`, borderColor: `${MACRO_PROTEIN}40` }}>
                  <Text style={{ ...macroNum, color: MACRO_PROTEIN }}>{proteinG}g</Text>
                  <Text style={macroLabel}>Proteínas</Text>
                </Section>
              </Column>
              <Column style={macroCell}>
                <Section style={{ ...macroBadge, backgroundColor: `${MACRO_CARBS}15`, borderColor: `${MACRO_CARBS}40` }}>
                  <Text style={{ ...macroNum, color: MACRO_CARBS }}>{carbsG}g</Text>
                  <Text style={macroLabel}>Carbohidratos</Text>
                </Section>
              </Column>
              <Column style={macroCell}>
                <Section style={{ ...macroBadge, backgroundColor: `${MACRO_FAT}15`, borderColor: `${MACRO_FAT}40` }}>
                  <Text style={{ ...macroNum, color: MACRO_FAT }}>{fatG}g</Text>
                  <Text style={macroLabel}>Grasas</Text>
                </Section>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Lo que incluye */}
          <Section style={section}>
            <Heading as="h2" style={h2}>¿Qué incluye tu plan?</Heading>
            {[
              '30 días de comidas organizadas (desayuno, media mañana, almuerzo, media tarde, cena)',
              'Lista de compras semanal con ingredientes peruanos',
              'Consejos nutricionales personalizados cada día',
              'Descarga en PDF para llevar a donde quieras',
            ].map((item, i) => (
              <Text key={i} style={listItem}>
                ✓ {item}
              </Text>
            ))}
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: 'center' }}>
            <Button style={button} href={planUrl}>
              Ver mi plan completo →
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>© 2026 NutriIA · Lima, Perú</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '40px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: `1px solid ${BORDER}`,
  maxWidth: '560px',
  margin: '0 auto',
  overflow: 'hidden',
};

const logoSection: React.CSSProperties = {
  backgroundColor: PRIMARY,
  padding: '20px 32px',
};

const logoText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: 0,
};

const section: React.CSSProperties = {
  padding: '28px 32px',
};

const badge: React.CSSProperties = {
  color: PRIMARY,
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 12px',
};

const h2: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const p: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: 0,
};

const calorieBox: React.CSSProperties = {
  backgroundColor: `${PRIMARY}10`,
  border: `1px solid ${PRIMARY}30`,
  borderRadius: '8px',
  marginBottom: '16px',
  padding: '16px',
  textAlign: 'center',
};

const calorieLabel: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const calorieValue: React.CSSProperties = {
  color: PRIMARY,
  fontSize: '28px',
  fontWeight: '700',
  margin: 0,
};

const macroRow: React.CSSProperties = {
  gap: '8px',
};

const macroCell: React.CSSProperties = {
  padding: '0 4px',
  width: '33.33%',
};

const macroBadge: React.CSSProperties = {
  border: '1px solid',
  borderRadius: '8px',
  padding: '12px 8px',
  textAlign: 'center',
};

const macroNum: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 2px',
};

const macroLabel: React.CSSProperties = {
  color: MUTED,
  fontSize: '11px',
  margin: 0,
};

const listItem: React.CSSProperties = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const button: React.CSSProperties = {
  backgroundColor: PRIMARY,
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
};

const hr: React.CSSProperties = {
  borderColor: BORDER,
  borderTop: `1px solid ${BORDER}`,
  margin: 0,
};

const footer: React.CSSProperties = {
  padding: '20px 32px',
};

const footerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: 0,
  textAlign: 'center',
};

export default DietPlanReadyEmail;
