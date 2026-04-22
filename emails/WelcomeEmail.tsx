import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  fullName: string;
  plansUrl: string;
}

const PRIMARY = '#16a34a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';

export function WelcomeEmail({ fullName, plansUrl }: WelcomeEmailProps) {
  const firstName = fullName.split(' ')[0];

  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido a NutriIA — tu plan de dieta personalizado te espera</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>🌿 NutriIA</Text>
          </Section>

          {/* Encabezado */}
          <Section style={section}>
            <Heading style={h1}>¡Hola, {firstName}!</Heading>
            <Text style={p}>
              Bienvenido a <strong>NutriIA</strong>. Estás a un paso de tener
              tu plan de alimentación personalizado con inteligencia artificial.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* 3 pasos */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              ¿Cómo funciona?
            </Heading>

            {[
              {
                num: '1',
                titulo: 'Elige tu plan',
                desc: 'Selecciona el plan que mejor se adapte a tus objetivos. Desde S/29 al mes.',
              },
              {
                num: '2',
                titulo: 'Cuéntanos sobre ti',
                desc: 'Completa tu perfil de salud: peso, talla, objetivo y preferencias alimentarias.',
              },
              {
                num: '3',
                titulo: 'Recibe tu plan en segundos',
                desc: 'Nuestra IA genera un plan de 30 días adaptado a ti, con recetas peruanas.',
              },
            ].map((paso) => (
              <Section key={paso.num} style={stepRow}>
                <Text style={stepNumber}>{paso.num}</Text>
                <Section style={stepContent}>
                  <Text style={stepTitle}>{paso.titulo}</Text>
                  <Text style={stepDesc}>{paso.desc}</Text>
                </Section>
              </Section>
            ))}
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: 'center' }}>
            <Button style={button} href={plansUrl}>
              Ver planes y empezar →
            </Button>
            <Text style={disclaimer}>
              Sin compromisos · Cancela cuando quieras
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 NutriIA · Lima, Perú
            </Text>
            <Text style={footerText}>
              Recibiste este correo porque te registraste en NutriIA.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Estilos ──────────────────────────────────────────────────

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
  padding: '0',
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

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 12px',
};

const h2: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px',
};

const p: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: 0,
};

const stepRow: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginBottom: '16px',
};

const stepNumber: React.CSSProperties = {
  backgroundColor: PRIMARY,
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700',
  height: '28px',
  lineHeight: '28px',
  margin: '0 12px 0 0',
  minWidth: '28px',
  textAlign: 'center',
  width: '28px',
};

const stepContent: React.CSSProperties = {
  flex: 1,
};

const stepTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const stepDesc: React.CSSProperties = {
  color: MUTED,
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
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

const disclaimer: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  margin: '12px 0 0',
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
  lineHeight: '1.5',
  margin: '0 0 4px',
  textAlign: 'center',
};

export default WelcomeEmail;
