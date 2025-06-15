
-- Create a table to store reviews for freelancers
CREATE TABLE public.reviews (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    freelancer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    -- A user can only review a freelancer once, this can be changed later if needed
    CONSTRAINT unique_review_per_reviewer UNIQUE (freelancer_id, reviewer_id)
);

-- Add comments to the table and columns
COMMENT ON TABLE public.reviews IS 'Stores ratings and comments for freelancers from other users.';
COMMENT ON COLUMN public.reviews.rating IS 'Rating from 1 to 5.';
COMMENT ON COLUMN public.reviews.comment IS 'The review comment text.';
COMMENT ON COLUMN public.reviews.reviewer_id IS 'The user who wrote the review.';
COMMENT ON COLUMN public.reviews.freelancer_id IS 'The freelancer being reviewed.';

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for the reviews table
-- 1. Allow public read access to all reviews
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
-- 2. Allow authenticated users to insert reviews
CREATE POLICY "Allow authenticated users to insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
-- 3. Allow users to update their own reviews
CREATE POLICY "Allow users to update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
-- 4. Allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Create a view to easily query aggregated ratings for freelancers
CREATE OR REPLACE VIEW public.freelancer_ratings AS
SELECT
    freelancer_id,
    avg(rating) AS avg_rating,
    count(*) AS rating_count
FROM
    public.reviews
GROUP BY
    freelancer_id;

COMMENT ON VIEW public.freelancer_ratings IS 'Aggregated average rating and review count for each freelancer.';
