
// Módulo básico de segurança para o chat
class ChatSecurity {
  static checkMessage(content: string): { isValid: boolean; reason?: string; filteredContent?: string } {
    // Validação básica apenas
    if (!content || content.trim().length === 0) {
      return {
        isValid: false,
        reason: 'Mensagem não pode estar vazia.'
      };
    }

    if (content.length > 1000) {
      return {
        isValid: false,
        reason: 'Mensagem muito longa.'
      };
    }

    return { isValid: true };
  }

  static sanitizeContent(content: string): string {
    // Sanitização básica apenas
    return content.trim();
  }
}

export default ChatSecurity;
