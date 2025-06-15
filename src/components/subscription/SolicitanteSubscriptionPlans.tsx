
import React from 'react';
import LoadingState from './LoadingState';
import PlansHeader from './solicitante/PlansHeader';
import PlansGrid from './solicitante/PlansGrid';
import SubscriptionStatusCard from './solicitante/SubscriptionStatusCard';
import PlanSummaryModal from './PlanSummaryModal';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import ActiveSubscriptionWarningModal from './ActiveSubscriptionWarningModal';
import { useSolicitanteSubscription } from './solicitante/useSolicitanteSubscription';

const SolicitanteSubscriptionPlans: React.FC = () => {
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
  } = useSolicitanteSubscription();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="space-y-6">
        <PlansHeader />

        <PlansGrid
          plans={plans}
          currentPlanId={currentSubscription?.plan_id || null}
          subscribingPlanId={subscribing}
          onSubscribe={handleSubscribe}
        />

        {currentSubscription && (
          <SubscriptionStatusCard
            currentSubscription={currentSubscription}
            onCancelClick={() => setShowCancelModal(true)}
          />
        )}
      </div>

      <PlanSummaryModal
        isOpen={showPlanSummary}
        onClose={() => setShowPlanSummary(false)}
        plan={selectedPlan}
        onConfirm={handleConfirmPlan}
      />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        planName={currentSubscription?.subscription_plans?.name || ''}
        isLoading={cancelling}
      />

      <ActiveSubscriptionWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        currentPlanName={currentSubscription?.subscription_plans?.name || ''}
        newPlanName={warningPlanName}
      />
    </>
  );
};

export default SolicitanteSubscriptionPlans;
