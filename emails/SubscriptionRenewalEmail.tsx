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

interface SubscriptionRenewalEmailProps {
  fullName: string;
  planName: string;
  renewalDate: string; // ej: '26 de mayo de 2026'
  amountSoles: number;
  manageUrl: string;
}

const PRIMARY = '#16a34a';
const BORDER = '#e2e8f0';
const MUTED = '#64748b';
const WARNING = '#f59e0b';

export function SubscriptionRenewalEmail({
  fullName,
  planName,
  renewalDate,
  amountSoles,
  manageUrl,
}: SubscriptionRenewalEmailProps) {
  const firstName = fullName.split(' ')[0];

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu suscripción NutriIA se renueva el {renewalDate}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>🌿 NutriIA</Text>
          </Section>

          {/* Encabezado */}
          <Section style={section}>
            <Text style={badge}>🔔 Recordatorio de renovación</Text>
            <Heading style={h1}>Hola, {firstName}</Heading>
            <Text style={p}>
              Te avisamos que tu suscripción al plan <strong>{planName}</strong>{' '}
              se renovará automáticamente en <strong>5 días</strong>.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Detalles */}
          <Section style={section}>
            <Section style={infoBox}>
              <Text style={infoLabel}>Fecha de renovación</Text>
              <Text style={infoValue}>{renewalDate}</Text>
            </Section>

            <Section style={{ ...infoBox, marginTop: '12px' }}>
              <Text style={infoLabel}>Monto a cobrar</Text>
              <Text style={infoValue}>S/{amountSoles}.00</Text>
            </Section>

            <Text style={{ ...p, marginTop: '16px', fontSize: '13px' }}>
              El cobro se realizará automáticamente a tu tarjeta registrada.
              Si no deseas renovar, puedes cancelar desde tu panel de cuenta
              antes de la fecha indicada.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: 'center' }}>
            <Button style={button} href={manageUrl}>
              Gestionar mi suscripción →
            </Button>
            <Text style={hint}>
              Desde ahí puedes cambiar de plan o cancelar en cualquier momento.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¿Necesitas ayuda? Escríbenos a soporte@nutriia.pe
            </Text>
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
  color: WARNING,
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const p: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: 0,
};

const infoBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: `1px solid ${BORDER}`,
  borderRadius: '8px',
  padding: '14px 18px',
};

const infoLabel: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  margin: '0 0 2px',
};

const infoValue: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '700',
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

const hint: React.CSSProperties = {
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

export default SubscriptionRenewalEmail;
