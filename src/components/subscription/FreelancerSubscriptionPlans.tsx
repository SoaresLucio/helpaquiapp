
import React from 'react';
import LoadingState from './LoadingState';
import PlansHeader from './freelancer/PlansHeader';
import PlansGrid from './freelancer/PlansGrid';
import SubscriptionStatusCard from './freelancer/SubscriptionStatusCard';
import PlanSummaryModal from './PlanSummaryModal';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import ActiveSubscriptionWarningModal from './ActiveSubscriptionWarningModal';
import { useFreelancerSubscription } from './freelancer/useFreelancerSubscription';

/**
 * Componente principal para exibição e gerenciamento de planos de assinatura para freelancers
 * 
 * Funcionalidades:
 * - Exibe lista de planos disponíveis
 * - Mostra status da assinatura atual
 * - Permite assinar novos planos
 * - Gerencia cancelamento de assinaturas
 * - Exibe modais de confirmação e avisos
 */
const FreelancerSubscriptionPlans: React.FC = () => {
  const {
    plans,
    currentSubscription,
    loading,
    subscribing,
    cancelling,
    selectedPlan,
    showPlanSummary,
    showCancelModal,
    showWarningModal,
    warningPlanName,
    handleSubscribe,
    handleConfirmPlan,
    handleCancelSubscription,
    setShowPlanSummary,
    setShowCancelModal,
    setShowWarningModal
  } = useFreelancerSubscription();

  // Exibe estado de carregamento enquanto busca dados
  if (loading) {
    return <LoadingState message="Carregando planos para freelancers..." />;
  }

  return (
    <>
      {/* Conteúdo principal da página */}
      <div className="space-y-6">
        {/* Cabeçalho com título e descrição */}
        <PlansHeader />

        {/* Grade de planos disponíveis */}
        <PlansGrid
          plans={plans}
          currentPlanId={currentSubscription?.plan_id || null}
          subscribingPlanId={subscribing}
          onSubscribe={handleSubscribe}
        />

        {/* Card de status da assinatura atual (se houver) */}
        {currentSubscription && (
          <SubscriptionStatusCard
            currentSubscription={currentSubscription}
            onCancelClick={() => setShowCancelModal(true)}
          />
        )}
      </div>

      {/* Modal de resumo do plano selecionado */}
      <PlanSummaryModal
        isOpen={showPlanSummary}
        onClose={() => setShowPlanSummary(false)}
        plan={selectedPlan}
        onConfirm={handleConfirmPlan}
      />

      {/* Modal de confirmação de cancelamento */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        planName={currentSubscription?.subscription_plans?.name || ''}
        isLoading={cancelling}
      />

      {/* Modal de aviso para assinatura ativa */}
      <ActiveSubscriptionWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        currentPlanName={currentSubscription?.subscription_plans?.name || ''}
        newPlanName={warningPlanName}
      />
    </>
  );
};

export default FreelancerSubscriptionPlans;
