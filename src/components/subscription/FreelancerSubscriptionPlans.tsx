
import React from 'react';
import LoadingState from './LoadingState';
import PlansHeader from './freelancer/PlansHeader';
import PlansGrid from './freelancer/PlansGrid';
import SubscriptionStatusCard from './freelancer/SubscriptionStatusCard';
import PlanSummaryModal from './PlanSummaryModal';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import ActiveSubscriptionWarningModal from './ActiveSubscriptionWarningModal';
import SubscriptionSuccessMessage from './SubscriptionSuccessMessage';
import { useFreelancerSubscription } from './freelancer/useFreelancerSubscription';

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
    showSuccessMessage,
    successPlanName,
    handleSubscribe,
    handleConfirmPlan,
    handleCancelSubscription,
    setShowPlanSummary,
    setShowCancelModal,
    setShowWarningModal,
    setShowSuccessMessage
  } = useFreelancerSubscription();

  if (loading) {
    return <LoadingState message="Carregando planos para freelancers..." />;
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

      {showSuccessMessage && (
        <SubscriptionSuccessMessage
          planName={successPlanName}
          onClose={() => setShowSuccessMessage(false)}
        />
      )}
    </>
  );
};

export default FreelancerSubscriptionPlans;
