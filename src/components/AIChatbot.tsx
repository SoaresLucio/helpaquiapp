
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Sou o assistente virtual do HelpAqui. Como posso ajudar você hoje?',
    sender: 'bot',
    timestamp: new Date()
  }
];

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    // Simula uma API externa que geraria respostas de IA
    setIsTyping(true);
    
    // Simula uma latência de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Respostas pré-definidas para palavras-chave comuns
    const responses: { [key: string]: string } = {
      'olá': 'Olá! Como posso ajudar você hoje?',
      'oi': 'Olá! Como posso ajudar você hoje?',
      'ajuda': 'Estou aqui para ajudar! Posso responder perguntas sobre como usar o HelpAqui, como encontrar profissionais, como se tornar um freelancer, etc.',
      'freelancer': 'Para se tornar um freelancer no HelpAqui, você precisa criar uma conta como profissional, preencher seu perfil com suas habilidades e começar a oferecer seus serviços!',
      'pagamento': 'Aceitamos diversos métodos de pagamento como cartão de crédito, débito e PIX. Os freelancers recebem pagamentos através de transferência bancária.',
      'serviços': 'O HelpAqui conecta você a diversos profissionais como: encanadores, eletricistas, desenvolvedores, designers, professores particulares e muito mais!',
      'problema': 'Sinto muito que esteja enfrentando problemas. Por favor, descreva melhor a situação para que eu possa ajudar.',
      'contato': 'Você pode entrar em contato com nossa equipe de suporte pelo email suporte@helpaqui.com ou pelo telefone (11) 1234-5678.',
      'preço': 'Os preços variam de acordo com cada profissional e serviço. Cada freelancer define seus próprios valores.',
      'avaliação': 'Após a conclusão de um serviço, você pode avaliar o profissional com 1 a 5 estrelas e deixar um comentário sobre sua experiência.',
      'segurança': 'Sua segurança é nossa prioridade. Todos os profissionais passam por verificação de antecedentes e são avaliados pela comunidade.',
      'conta': 'Para criar uma conta, clique em "Cadastrar" no topo da página e siga as instruções para se registrar como cliente ou profissional.',
    };
    
    // Verificação para palavras-chave
    let responseText = 'Desculpe, não entendi completamente. Poderia reformular sua pergunta?';
    
    Object.keys(responses).forEach(keyword => {
      if (userMessage.toLowerCase().includes(keyword)) {
        responseText = responses[keyword];
        return;
      }
    });
    
    // Para mensagens que não contêm palavras-chave conhecidas
    if (userMessage.includes('?')) {
      responseText = 'Essa é uma ótima pergunta! Estou em fase inicial de treinamento, então ainda estou aprendendo. Nossa equipe de suporte poderá ajudá-lo melhor com essa dúvida específica.';
    }
    
    setIsTyping(false);
    return responseText;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Adiciona a mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Gera e adiciona a resposta do bot
    try {
      const response = await generateResponse(input);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar uma resposta. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-helpaqui-blue" />
          Assistente HelpAqui
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[80%] rounded-lg p-3 gap-2 
                  ${msg.sender === 'user' 
                    ? 'bg-helpaqui-blue text-white' 
                    : 'bg-muted text-foreground border'}`}
              >
                <div className="mt-0.5">
                  {msg.sender === 'user' ? (
                    <User className="h-5 w-5 text-white/80" />
                  ) : (
                    <Bot className="h-5 w-5 text-helpaqui-blue" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg p-3 border max-w-[80%]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="flex-none"
            onClick={scrollToBottom}
            title="Rolar para baixo"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="flex-none"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIChatbot;
