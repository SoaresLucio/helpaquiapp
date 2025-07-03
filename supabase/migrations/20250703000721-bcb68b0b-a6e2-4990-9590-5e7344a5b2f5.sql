-- Criar política para permitir que administradores atualizem planos de assinatura
CREATE POLICY "Administradores podem atualizar planos" 
ON public.subscription_plans 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.administradores 
    WHERE administradores.id = auth.uid() 
    AND administradores.ativo = true
  )
);