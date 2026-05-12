import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ComplaintReceiptEmailProps {
  code: string;
  type: 'queja' | 'reclamo';
  document_type: string;
  document_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  province: string;
  district: string;
  address: string;
  is_minor: boolean;
  guardian_name?: string | null;
  service_name?: string | null;
  amount_soles?: number | null;
  detail: string;
  request: string;
  created_at: string;
  deadline_at: string;
  audience: 'consumer' | 'admin';
}

const PRIMARY = '#16a34a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';

export function ComplaintReceiptEmail(props: ComplaintReceiptEmailProps) {
  const {
    code,
    type,
    document_type,
    document_id,
    first_name,
    last_name,
    email,
    phone,
    department,
    province,
    district,
    address,
    is_minor,
    guardian_name,
    service_name,
    amount_soles,
    detail,
    request,
    created_at,
    deadline_at,
    audience,
  } = props;

  const isAdmin = audience === 'admin';
  const title = isAdmin
    ? `Nuevo ${type} registrado · ${code}`
    : `Recibimos tu ${type} · ${code}`;
  const intro = isAdmin
    ? `Se registró un nuevo ${type} en el Libro de Reclamaciones. Plazo legal de respuesta: 30 días calendario.`
    : `Hola ${first_name}, hemos recibido tu ${type}. Aquí te dejamos una copia para tus registros. Te responderemos dentro de los próximos 30 días calendario por este mismo correo.`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{title}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>🌿 KODA · Libro de Reclamaciones</Text>
          </Section>

          <Section style={section}>
            <Heading style={h1}>{title}</Heading>
            <Text style={p}>{intro}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={h2}>Detalle del registro</Heading>
            <Row label="Código" value={code} />
            <Row label="Tipo" value={type === 'reclamo' ? 'Reclamo (producto/servicio)' : 'Queja (atención)'} />
            <Row label="Fecha de registro" value={created_at} />
            <Row label="Plazo de respuesta" value={deadline_at} />
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={h2}>Consumidor</Heading>
            <Row label="Nombre" value={`${first_name} ${last_name}`} />
            <Row label="Documento" value={`${document_type} ${document_id}`} />
            <Row label="Correo" value={email} />
            <Row label="Teléfono" value={phone} />
            <Row label="Dirección" value={`${address}, ${district}, ${province}, ${department}`} />
            {is_minor && guardian_name ? (
              <Row label="Padre / madre / tutor" value={guardian_name} />
            ) : null}
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={h2}>Reclamo</Heading>
            {service_name ? <Row label="Servicio" value={service_name} /> : null}
            {typeof amount_soles === 'number' ? (
              <Row label="Monto" value={`S/ ${amount_soles.toFixed(2)}`} />
            ) : null}
            <Text style={blockLabel}>Detalle</Text>
            <Text style={blockValue}>{detail}</Text>
            <Text style={blockLabel}>Pedido del consumidor</Text>
            <Text style={blockValue}>{request}</Text>
          </Section>

          {!isAdmin ? (
            <>
              <Hr style={hr} />
              <Section style={section}>
                <Text style={legend}>
                  Conforme al Código de Protección y Defensa del Consumidor
                  (Ley N° 29571), KODA cuenta con un Libro de Reclamaciones
                  virtual. Conserva este correo como constancia de tu registro.
                </Text>
              </Section>
            </>
          ) : null}

          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>© 2026 KODA · Lima, Perú</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={row}>
      <span style={rowLabel}>{label}:</span> <span style={rowValue}>{value}</span>
    </Text>
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
  maxWidth: '600px',
  margin: '0 auto',
  overflow: 'hidden',
};

const logoSection: React.CSSProperties = {
  backgroundColor: PRIMARY,
  padding: '20px 32px',
};

const logoText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  margin: 0,
};

const section: React.CSSProperties = { padding: '24px 32px' };

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const h2: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const p: React.CSSProperties = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: 0,
};

const row: React.CSSProperties = {
  color: '#334155',
  fontSize: '13px',
  lineHeight: '1.7',
  margin: '0 0 4px',
};

const rowLabel: React.CSSProperties = {
  color: MUTED,
  fontWeight: 500,
  marginRight: '4px',
};

const rowValue: React.CSSProperties = {
  color: '#0f172a',
  fontWeight: 600,
};

const blockLabel: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  fontWeight: 600,
  margin: '12px 0 4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const blockValue: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: `1px solid ${BORDER}`,
  borderRadius: '6px',
  color: '#0f172a',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: 0,
  padding: '10px 12px',
  whiteSpace: 'pre-wrap',
};

const legend: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: 0,
};

const hr: React.CSSProperties = {
  borderColor: BORDER,
  borderTop: `1px solid ${BORDER}`,
  margin: 0,
};

const footer: React.CSSProperties = { padding: '16px 32px' };

const footerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: 0,
  textAlign: 'center',
};

export default ComplaintReceiptEmail;
