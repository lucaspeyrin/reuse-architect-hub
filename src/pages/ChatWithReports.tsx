
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';

const ChatWithReports: React.FC = () => {
  const [message, setMessage] = useState('');
  
  // Mock chat history
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'msg1',
      sender: 'user',
      text: 'Quelles sont les pratiques actuelles pour le réemploi des fenêtres dans les projets de rénovation ?',
      time: '14:25',
    },
    {
      id: 'msg2',
      sender: 'bot',
      text: `D'après l'analyse de nos rapports, le réemploi des fenêtres présente plusieurs défis :

1. **Contraintes techniques** : Les fenêtres anciennes ne respectent souvent pas les standards actuels d'isolation thermique et acoustique.

2. **Viabilité économique** : La dépose soigneuse et la remise en état peuvent coûter plus cher qu'un remplacement neuf.

3. **Meilleures pratiques identifiées** : 
   - Pour les fenêtres en bois de qualité : restauration et amélioration des performances (double vitrage)
   - Pour les châssis métalliques : réutilisation possible dans des cloisons intérieures
   - Récupération du verre pour d'autres applications

4. **Projets exemplaires** : Le rapport du projet "Rénovation Collège Saint-Martin" détaille un cas réussi de réemploi de 24 fenêtres en chêne après restauration.

5. **Filières** : Des entreprises spécialisées comme "Fenêtres Seconde Vie" à Lyon et "ReWin" à Paris se développent pour cette niche.`,
      time: '14:27',
    },
  ]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const newMessage = {
      id: `msg${Date.now()}`,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = {
        id: `msg${Date.now()}`,
        sender: 'bot',
        text: "Je recherche dans notre base de rapports pour vous apporter une réponse détaillée. D'après nos données, cette question a été traitée dans plusieurs de nos projets récents. Je vous propose une synthèse des meilleures pratiques observées.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setChatHistory(prev => [...prev, botResponse]);
    }, 1500);
  };
  
  return (
    <MainLayout>
      <h1 className="page-title">Discuter avec les rapports</h1>
      
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm min-h-[600px] flex flex-col">
        <div className="bg-neutral-50 p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary-50 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-medium">Assistant RAEDIFICARE</h2>
              <p className="text-sm text-neutral-500">
                Posez des questions sur l'ensemble de vos rapports et projets
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id}
              className={`mb-6 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3/4 p-4 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span className={`text-xs block mt-2 ${msg.sender === 'user' ? 'text-primary-50' : 'text-neutral-500'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSendMessage} className="border-t border-neutral-200 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Posez une question sur vos rapports et projets..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            L'assistant analysera l'ensemble de vos rapports pour vous fournir des informations pertinentes.
          </p>
        </form>
      </div>
    </MainLayout>
  );
};

export default ChatWithReports;
