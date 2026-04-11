
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getHomeRoute = () => (!isAuthenticated ? "/login" : "/dashboard");
  const getPlansRoute = () => {
    if (userType === "solicitante") return "/solicitante-plans";
    if (userType === "freelancer") return "/freelancer-plans";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="w-full max-w-md rounded-2xl border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mx-auto w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-4xl font-extrabold text-gradient-primary">404</CardTitle>
            <CardDescription className="text-lg">Oops! Página não encontrada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
            <div className="text-center text-sm text-muted-foreground bg-accent/50 p-2 rounded-xl">Rota: <code className="font-mono text-foreground">{location.pathname}</code></div>
            <div className="space-y-3">
              <Button asChild className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Link to={getHomeRoute()}><Home className="h-4 w-4 mr-2" />Voltar ao Início</Link>
              </Button>
              {isAuthenticated && <Button variant="outline" asChild className="w-full rounded-xl"><Link to={getPlansRoute()}><ArrowLeft className="h-4 w-4 mr-2" />Ver Planos</Link></Button>}
              {!isAuthenticated && <Button variant="outline" asChild className="w-full rounded-xl"><Link to="/login"><ArrowLeft className="h-4 w-4 mr-2" />Fazer Login</Link></Button>}
            </div>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">Precisa de ajuda? <Link to="/chat" className="text-primary hover:underline">Entre em contato</Link></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;
