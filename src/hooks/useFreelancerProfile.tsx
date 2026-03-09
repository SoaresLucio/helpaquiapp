
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFreelancerProfile = (freelancerId: string | undefined) => {
    const [freelancer, setFreelancer] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!freelancerId) {
            setLoading(false);
            return;
        };

        const fetchProfile = async () => {
            setLoading(true);

            // Fetch profile data via public_profiles view for non-owner access
            const { data: profileData, error: profileError } = await supabase
                .from('public_profiles')
                .select('*')
                .eq('id', freelancerId)
                .single();

            if (profileError) {
                console.error('Error fetching freelancer profile:', profileError);
            } else {
                setFreelancer(profileData);
            }

            // Fetch freelancer offers
            const { data: offersData, error: offersError } = await supabase
                .from('freelancer_service_offers')
                .select('*')
                .eq('freelancer_id', freelancerId);

            if (offersError) {
                console.error('Error fetching freelancer offers:', offersError);
            } else {
                setOffers(offersData || []);
            }

            setLoading(false);
        };

        fetchProfile();
    }, [freelancerId]);

    return { freelancer, offers, loading };
}
