
import React from 'react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { useFreelancerOffers } from '@/hooks/useFreelancerOffers';
import OffersSection from '@/components/solicitante/OffersSection';

const OffersPage = () => {
    const { offers, loading, reloadOffers } = useFreelancerOffers();

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <BackButton to="/" label="Voltar ao Início" />
                </div>
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
