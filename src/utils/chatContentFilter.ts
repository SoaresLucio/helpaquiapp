
// Robust phone number and contact info blocking for chat messages
// Blocks attempts to share phone numbers, WhatsApp, and sequential digits

/**
 * Detects phone numbers in various formats:
 * - (64) 99388-7736
 * - 64993887736
 * - 64 993 887 736
 * - 6499388 7736
 * - Spaced digits: 6 4 9 9 3 8 8 7 7 3 6
 * - Mixed with text: meu numero eh seis quatro nove nove tres...
 */

const PHONE_PATTERNS = [
  // Standard Brazilian phone: (XX) XXXXX-XXXX or XX XXXXX-XXXX
  /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g,
  // Sequences of 8+ digits (with optional spaces/dashes between)
  /(\d[\s\-._]*){8,}/g,
  // Numbers split with spaces like "6 4 9 9 3 8 8 7 7 3 6"
  /(\d\s+){6,}\d/g,
  // +55 format
  /\+?\d{1,3}[\s\-]?\(?\d{2}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}/g,
];

const BLOCKED_KEYWORDS = [
  /whats\s*app/gi,
  /whats/gi,
  /wpp/gi,
  /w\.a/gi,
  /zap/gi,
  /zapzap/gi,
  /telegram/gi,
  /t\.me/gi,
  /signal/gi,
  /discord/gi,
  /liga\s*(pra|para)\s*mim/gi,
  /me\s*liga/gi,
  /meu\s*(numero|número|tel|telefone|celular|cell|fone)/gi,
  /manda\s*(msg|mensagem)\s*(no|pelo)/gi,
  /chama\s*(no|pelo)\s*(zap|whats|telegram)/gi,
];

const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /[^\s]+\.(com|org|net|br|co|io|me)[^\s]*/gi,
];

// Detect numbers written as words in Portuguese
const NUMBER_WORDS: Record<string, string> = {
  'zero': '0', 'um': '1', 'uma': '1', 'dois': '2', 'duas': '2',
  'tres': '3', 'três': '3', 'quatro': '4', 'cinco': '5',
  'seis': '6', 'sete': '7', 'oito': '8', 'nove': '9',
};

function extractDigitsFromWords(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  let digits = '';
  let consecutiveNumbers = 0;
  
  for (const word of words) {
    if (NUMBER_WORDS[word]) {
      digits += NUMBER_WORDS[word];
      consecutiveNumbers++;
    } else if (/^\d$/.test(word)) {
      digits += word;
      consecutiveNumbers++;
    } else {
      if (consecutiveNumbers >= 6) return digits;
      digits = '';
      consecutiveNumbers = 0;
    }
  }
  
  return consecutiveNumbers >= 6 ? digits : '';
}

function stripNonDigits(text: string): string {
  return text.replace(/\D/g, '');
}

export interface ContentFilterResult {
  isBlocked: boolean;
  reason?: string;
}

export function filterChatMessage(content: string): ContentFilterResult {
  if (!content || content.trim().length === 0) {
    return { isBlocked: false };
  }

  const trimmed = content.trim();

  // 1. Check blocked keywords (WhatsApp, Telegram, etc.)
  for (const pattern of BLOCKED_KEYWORDS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed)) {
      return {
        isBlocked: true,
        reason: 'Não é permitido compartilhar contatos de aplicativos externos. Use apenas o chat do HelpAqui para se comunicar.'
      };
    }
  }

  // 2. Check links
  for (const pattern of LINK_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed)) {
      return {
        isBlocked: true,
        reason: 'Links externos não são permitidos por motivos de segurança.'
      };
    }
  }

  // 3. Check phone number patterns
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = trimmed.match(pattern);
    if (matches) {
      for (const match of matches) {
        const digits = stripNonDigits(match);
        if (digits.length >= 8) {
          return {
            isBlocked: true,
            reason: 'Não é permitido compartilhar números de telefone. Por segurança, use apenas o chat do HelpAqui.'
          };
        }
      }
    }
  }

  // 4. Check sequential digits in full text
  const allDigits = stripNonDigits(trimmed);
  if (allDigits.length >= 8) {
    // Check if there's a sequence of 8+ digits that could be a phone
    const digitSequences = trimmed.match(/[\d\s\-._]{8,}/g);
    if (digitSequences) {
      for (const seq of digitSequences) {
        const digits = stripNonDigits(seq);
        if (digits.length >= 8) {
          return {
            isBlocked: true,
            reason: 'Sequências numéricas que podem conter números de telefone não são permitidas. Use apenas o chat do HelpAqui.'
          };
        }
      }
    }
  }

  // 5. Check numbers written as words
  const wordDigits = extractDigitsFromWords(trimmed);
  if (wordDigits.length >= 8) {
    return {
      isBlocked: true,
      reason: 'Não é permitido compartilhar números de telefone (mesmo por extenso). Use apenas o chat do HelpAqui.'
    };
  }

  return { isBlocked: false };
}

// Sanitize HTML from content
export function sanitizeChatContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}
