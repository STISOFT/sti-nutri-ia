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

interface PasswordResetEmailProps {
  fullName: string;
  resetUrl: string;
}

const PRIMARY = '#16a34a';
const BORDER = '#e2e8f0';
const MUTED = '#64748b';

export function PasswordResetEmail({ fullName, resetUrl }: PasswordResetEmailProps) {
  const firstName = fullName.split(' ')[0];

  return (
    <Html lang="es">
      <Head />
      <Preview>Recupera el acceso a tu cuenta NutriIA</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>🌿 NutriIA</Text>
          </Section>

          {/* Encabezado */}
          <Section style={section}>
            <Heading style={h1}>Recupera tu contraseña</Heading>
            <Text style={p}>
              Hola, <strong>{firstName}</strong>. Recibimos una solicitud para
              restablecer la contraseña de tu cuenta.
            </Text>
            <Text style={p}>
              Haz clic en el botón de abajo para crear una nueva contraseña.
              El enlace es válido por <strong>1 hora</strong>.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={{ ...section, textAlign: 'center' }}>
            <Button style={button} href={resetUrl}>
              Restablecer contraseña →
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Alternativa con URL */}
          <Section style={section}>
            <Text style={altText}>
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </Text>
            <Text style={urlText}>{resetUrl}</Text>
          </Section>

          <Hr style={hr} />

          {/* Aviso de seguridad */}
          <Section style={warningSection}>
            <Text style={warningText}>
              🔒 Si no solicitaste este cambio, puedes ignorar este correo.
              Tu contraseña actual seguirá siendo la misma y tu cuenta está segura.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¿Problemas? Escríbenos a soporte@nutriia.pe
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

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const p: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
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

const altText: React.CSSProperties = {
  color: MUTED,
  fontSize: '13px',
  margin: '0 0 8px',
};

const urlText: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
  color: '#475569',
  fontFamily: 'monospace',
  fontSize: '12px',
  lineHeight: '1.5',
  padding: '10px 14px',
  wordBreak: 'break-all',
};

const warningSection: React.CSSProperties = {
  backgroundColor: '#fefce8',
  padding: '16px 32px',
};

const warningText: React.CSSProperties = {
  color: '#854d0e',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
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

export default PasswordResetEmail;
