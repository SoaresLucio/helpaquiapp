
import React from 'react';
import { MessageCircle, CreditCard, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Ações Rápidas</h3>
      <div className="grid grid-cols-3 gap-2">
        {/* Chat — botão primário */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/chat')}
          className="rounded-2xl p-3 flex flex-col items-center gap-1.5 text-white shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #6c2ea0, #2b439b)',
            boxShadow: '0 4px 16px rgba(108,46,160,0.25)',
          }}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs font-medium">Mensagens</span>
        </motion.button>

        {/* Pedidos */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/my-requests')}
          className="rounded-2xl p-3 flex flex-col items-center gap-1.5 bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50/40 transition-all shadow-sm"
        >
          <Settings className="h-5 w-5" style={{ color: '#6c2ea0' }} />
          <span className="text-xs font-medium text-slate-700">Pedidos</span>
        </motion.button>

        {/* Pagamentos */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/payment-settings')}
          className="rounded-2xl p-3 flex flex-col items-center gap-1.5 bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50/40 transition-all shadow-sm"
        >
          <CreditCard className="h-5 w-5" style={{ color: '#6c2ea0' }} />
          <span className="text-xs font-medium text-slate-700">Pagamentos</span>
        </motion.button>
      </div>
    </div>
  );
};

export default QuickActions;
