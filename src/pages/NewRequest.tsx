import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ServiceRequest from '@/components/ServiceRequest';

const NewRequest: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 container mx-auto px-4 py-6 max-w-2xl"
    >
      <ServiceRequest />
    </motion.main>
  </div>
);

export default NewRequest;
