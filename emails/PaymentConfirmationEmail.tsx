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

interface PaymentConfirmationEmailProps {
  fullName: string;
  planName: string;
  amountSoles: number;
  chargeId: string;
  profileUrl: string;
}

const PRIMARY = '#16a34a';
const BORDER = '#e2e8f0';
const MUTED = '#64748b';

export function PaymentConfirmationEmail({
  fullName,
  planName,
  amountSoles,
  chargeId,
  profileUrl,
}: PaymentConfirmationEmailProps) {
  const firstName = fullName.split(' ')[0];
  const fecha = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html lang="es">
      <Head />
      <Preview>Pago confirmado — Plan {planName} activado en KODA</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>🌿 KODA</Text>
          </Section>

          {/* Encabezado */}
          <Section style={section}>
            <Text style={badge}>✅ Pago confirmado</Text>
            <Heading style={h1}>¡Listo, {firstName}!</Heading>
            <Text style={p}>
              Tu suscripción al plan <strong>{planName}</strong> ha sido
              activada. Ya puedes completar tu perfil de salud para que nuestra
              IA genere tu plan personalizado.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Resumen del pago */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              Resumen de tu compra
            </Heading>
            <Section style={summaryBox}>
              <Row>
                <Column style={summaryLabel}>Plan</Column>
                <Column style={summaryValue}>{planName}</Column>
              </Row>
              <Row>
                <Column style={summaryLabel}>Monto</Column>
                <Column style={summaryValue}>S/{amountSoles}.00</Column>
              </Row>
              <Row>
                <Column style={summaryLabel}>Fecha</Column>
                <Column style={summaryValue}>{fecha}</Column>
              </Row>
              <Row>
                <Column style={summaryLabel}>N° de cargo</Column>
                <Column style={{ ...summaryValue, fontFamily: 'monospace', fontSize: '11px' }}>
                  {chargeId}
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Siguiente paso */}
          <Section style={{ ...section, textAlign: 'center' }}>
            <Text style={p}>
              El siguiente paso es completar tu perfil de salud. Solo toma
              2 minutos y con esos datos generamos tu plan de 30 días.
            </Text>
            <Button style={button} href={profileUrl}>
              Completar mi perfil →
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¿Problemas con tu pago? Escríbenos a soporte@nutriia.pe
            </Text>
            <Text style={footerText}>© 2026 KODA · Lima, Perú</Text>
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
  fontSize: '24px',
  fontWeight: '700',
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
  margin: '0 0 20px',
};

const summaryBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: `1px solid ${BORDER}`,
  padding: '16px 20px',
};

const summaryLabel: React.CSSProperties = {
  color: MUTED,
  fontSize: '13px',
  padding: '4px 0',
  width: '40%',
};

const summaryValue: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: '500',
  padding: '4px 0',
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
  lineHeight: '1.5',
  margin: '0 0 4px',
  textAlign: 'center',
};

export default PaymentConfirmationEmail;
