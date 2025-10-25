import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, MapPin, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I can help you find the best food near you. Try asking me something like "best chole bhature" or "pizza near me"!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);

  // Get data from Redux store
  const { userData } = useSelector((state) => state.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const generateResponse = async (query) => {
    try {
      const response = await axios.post(
        '/api/ai/chat',
        { 
          query,
          location: userLocation 
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        return {
          text: response.data.text,
          results: response.data.results || []
        };
      } else {
        return {
          text: response.data.message,
          results: []
        };
      }
    } catch (error) {
      console.error('AI Error:', error);
      return {
        text: "Sorry, I'm having trouble connecting. Please try again.",
        results: []
      };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await generateResponse(currentQuery);
      
      const botMessage = {
        type: 'bot',
        text: response.text,
        results: response.results,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: "Sorry, something went wrong. Please try again!",
        results: [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ShopResultCard = ({ result }) => {
    const shop = result.shop;
    const itemsList = result.items.slice(0, 3);

    return (
      <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border-2 border-orange-200 mb-2 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-800 text-lg">{shop.name}</h4>
          {shop.rating?.average && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
              ⭐ {shop.rating.average.toFixed(1)}
            </span>
          )}
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin size={14} className="mr-1 text-orange-500" />
          {shop.address || 'Location available'}
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Available items:</p>
          <div className="space-y-1">
            {itemsList.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-orange-100">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <span className="text-sm font-bold text-orange-600">₹{item.price}</span>
              </div>
            ))}
          </div>
          {result.items.length > 3 && (
            <p className="text-xs text-gray-500 mt-1">+ {result.items.length - 3} more items</p>
          )}
        </div>

        <button 
          onClick={() => window.location.href = `/shop/${shop._id}`}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          View Shop
        </button>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center gap-2 group"
        >
          <MessageCircle size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
            Ask AI for Food
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden border-2 border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="text-orange-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Vingo AI</h3>
                <p className="text-xs text-orange-100">Your Food Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-orange-50 to-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl p-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none'
                        : 'bg-white border-2 border-orange-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  {message.results && message.results.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.results.map((result, idx) => (
                        <ShopResultCard key={idx} result={result} />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border-2 border-orange-200 rounded-2xl rounded-bl-none p-4">
                  <Loader2 className="animate-spin text-orange-500" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t-2 border-orange-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask for food suggestions..."
                className="flex-1 border-2 border-orange-200 rounded-full px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Try: "best chole bhature" or "pizza near me"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;