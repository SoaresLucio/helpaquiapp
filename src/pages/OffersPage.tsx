
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { useFreelancerOffers } from '@/hooks/useFreelancerOffers';
import OffersSection from '@/components/solicitante/OffersSection';
import { useAuth } from '@/hooks/useAuth';

const OffersPage = () => {
    const { offers, loading, reloadOffers } = useFreelancerOffers();
    const { user } = useAuth();

    useEffect(() => {
        console.log('📄 OffersPage montada');
        console.log('👤 Usuário atual:', user?.id);
        console.log('🔢 Total de ofertas:', offers.length);
    }, [user, offers]);

    // Debug: Mostra informações no console a cada mudança
    useEffect(() => {
        if (!loading && offers.length === 0) {
            console.log('⚠️ Nenhuma oferta encontrada. Possíveis causas:');
            console.log('1. Não há ofertas ativas no banco');
            console.log('2. Problemas com RLS (Row Level Security)');
            console.log('3. Erro na query ou conversão de dados');
            console.log('4. Problema de autenticação do usuário');
        }
    }, [loading, offers]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <BackButton to="/" label="Voltar ao Início" />
                </div>
                
                {/* Debug info em desenvolvimento */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
                        <div className="text-sm text-yellow-700 space-y-1">
                            <p>• Usuário ID: {user?.id || 'Não autenticado'}</p>
                            <p>• Total de ofertas: {offers.length}</p>
                            <p>• Carregando: {loading ? 'Sim' : 'Não'}</p>
                            <p>• Última atualização: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Ofertas de Help Disponíveis</h1>
                        <p className="text-gray-600">
                            Encontre profissionais qualificados prontos para ajudar você
                        </p>
                    </div>
                    
                    <OffersSection
                        selectedCategoryName={null}
                        professionals={offers}
                        loading={loading}
                        onReload={reloadOffers}
                    />
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
