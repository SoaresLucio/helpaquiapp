
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, XCircle, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const defaultMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Sou o assistente virtual do HelpAqui. Como posso ajudar você hoje?',
    sender: 'bot',
    timestamp: new Date(),
  },
];

const faqs = [
  { question: 'Como encontrar um profissional?', answer: 'Para encontrar um profissional, use a barra de pesquisa ou navegue pelas categorias. Você pode filtrar por localização, avaliações e preço.' },
  { question: 'Como funciona o pagamento?', answer: 'Os pagamentos são processados de forma segura através da plataforma. Aceitamos cartões de crédito, débito e Pix. O valor só é repassado ao profissional após a conclusão do serviço.' },
  { question: 'O que é o Perfil Verificado?', answer: 'O selo "Perfil Verificado" indica que o profissional passou por nossa verificação de documentos e identidade, oferecendo mais segurança para sua contratação.' },
  { question: 'Como cancelar um serviço?', answer: 'Você pode cancelar um serviço através da seção "Meus Serviços" no seu perfil. Dependendo do prazo de cancelamento, podem ser aplicadas taxas conforme nossos termos de uso.' },
  { question: 'O que é a HELPAQUI Garantia?', answer: 'A HELPAQUI Garantia oferece cobertura para reparos em caso de má execução do serviço por até 7 dias após a conclusão. Para acioná-la, entre em contato com nosso suporte.' },
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message: string): Message => {
    const lowercaseMessage = message.toLowerCase();
    
    // Check if message matches any FAQs
    const matchedFaq = faqs.find(faq => 
      lowercaseMessage.includes(faq.question.toLowerCase()) || 
      lowercaseMessage.includes(faq.answer.toLowerCase().substring(0, 10))
    );
    
    if (matchedFaq) {
      return {
        id: Date.now().toString(),
        text: matchedFaq.answer,
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    // Default responses based on keywords
    if (lowercaseMessage.includes('preço') || lowercaseMessage.includes('valor') || lowercaseMessage.includes('custo')) {
      return {
        id: Date.now().toString(),
        text: 'Os preços variam conforme o serviço e o profissional. Você pode ver o valor estimado no perfil de cada profissional ou solicitar um orçamento específico.',
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    if (lowercaseMessage.includes('urgência') || lowercaseMessage.includes('urgente')) {
      return {
        id: Date.now().toString(),
        text: 'Para serviços urgentes, você pode ativar o Modo Urgência ao solicitar um serviço. Isso dá prioridade à sua solicitação, mas tem um acréscimo de 50% no valor.',
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    if (lowercaseMessage.includes('verificado') || lowercaseMessage.includes('confiável')) {
      return {
        id: Date.now().toString(),
        text: 'Profissionais com o selo "Perfil Verificado" passaram por nossa verificação de documentos e identidade, oferecendo mais segurança para sua contratação.',
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    if (lowercaseMessage.includes('garantia')) {
      return {
        id: Date.now().toString(),
        text: 'A HELPAQUI Garantia cobre reparos em caso de má execução do serviço por até 7 dias após a conclusão. Para acioná-la, entre em contato com nosso suporte.',
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      text: 'Não tenho uma resposta específica para isso. Você pode entrar em contato com nosso suporte para mais informações ou fazer uma pergunta diferente.',
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg bg-helpaqui-purple hover:bg-helpaqui-purple/90 z-50"
            size="icon"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh] h-[85vh] rounded-t-xl flex flex-col">
          <div className="bg-helpaqui-purple text-white p-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-white">
                <AvatarImage src="/placeholder.svg" alt="Chatbot" />
                <AvatarFallback className="bg-white text-helpaqui-purple">HQ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">HelpAqui Assistente</h3>
                <p className="text-xs text-white/70">Tiramos suas dúvidas</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-helpaqui-purple/90" 
              onClick={() => setIsOpen(false)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-helpaqui-purple text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-white text-gray-800 rounded-tl-none shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                className="bg-helpaqui-purple hover:bg-helpaqui-purple/90"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 text-center">
                Sugestões: <span className="text-helpaqui-purple">Garantia</span> • <span className="text-helpaqui-purple">Pagamento</span> • <span className="text-helpaqui-purple">Perfil Verificado</span>
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ChatbotWidget;
