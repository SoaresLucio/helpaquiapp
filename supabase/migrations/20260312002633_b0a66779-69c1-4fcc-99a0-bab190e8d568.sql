-- Allow job listing owners to delete their own listings
CREATE POLICY "Owners can delete their own job listings"
ON public.job_listings
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Allow job listing owners to update their own listings  
CREATE POLICY "Owners can update their own job listings"
ON public.job_listings
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());