
// Módulo de segurança para o chat
class ChatSecurity {
  private static suspiciousPatterns = [
    /https?:\/\/[^\s]+/gi, // URLs
    /www\.[^\s]+/gi,
    /[^\s]+\.(com|org|net|br|co)[^\s]*/gi,
    /whatsapp|telegram|discord/gi,
    /pix|transferência|conta bancária/gi
  ];

  private static sensitiveWords = [
    'senha', 'password', 'cartão', 'cpf', 'rg', 'documento',
    'conta', 'agência', 'banco', 'pix', 'chave pix'
  ];

  private static phonePattern = /(\(?[0-9]{2}\)?\s?)?[0-9]{4,5}[-\s]?[0-9]{4}/g;

  static checkMessage(content: string): { isValid: boolean; reason?: string; filteredContent?: string } {
    const lowerContent = content.toLowerCase();

    // Verificar links suspeitos
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        return {
          isValid: false,
          reason: 'Links externos não são permitidos por motivos de segurança.'
        };
      }
    }

    // Verificar palavras sensíveis
    for (const word of this.sensitiveWords) {
      if (lowerContent.includes(word)) {
        return {
          isValid: false,
          reason: 'Informações sensíveis devem ser compartilhadas com cuidado.'
        };
      }
    }

    return { isValid: true };
  }

  static filterPhoneNumbers(content: string): string {
    return content.replace(this.phonePattern, '[Número ocultado]');
  }

  static sanitizeContent(content: string): string {
    // Remove scripts e html
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}

export default ChatSecurity;
