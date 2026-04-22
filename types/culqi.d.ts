// Tipos globales para Culqi.js (sin tipado oficial)

interface CulqiSettings {
  title: string;
  currency: string;
  description: string;
  amount: number;
}

interface CulqiToken {
  id: string;
  email: string;
  object: string;
  type: string;
  creation_date: number;
  card_number: string;
  last_four: string;
  active: boolean;
  iin: {
    object: string;
    bin: string;
    card_brand: string;
    card_type: string;
    card_category: string;
    issuer: {
      name: string;
      country: string;
      country_code: string;
      website: string | null;
      phone_number: string | null;
    };
    installments_allowed: number[];
  };
  client: {
    ip: string;
    ip_country: string;
    ip_country_code: string;
    browser: string;
    device_fingerprint: string;
    device_type: string;
  };
}

interface CulqiPaymentEventDetail {
  token?: CulqiToken;
  order?: { id: string; [key: string]: unknown };
}

// El evento 'payment' que dispara Culqi.js tras tokenizar la tarjeta
interface CulqiPaymentEvent extends Event {
  token?: CulqiToken;
  order?: { id: string; [key: string]: unknown };
}

interface CulqiInstance {
  publicKey: string;
  settings: (settings: CulqiSettings) => void;
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Culqi: CulqiInstance;
    // Función que Culqi.js invoca cuando genera un token (Culqi v3 legacy)
    culqi?: () => void;
  }
}

export {};
