
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const getHomeRoute = () => {
    if (!isAuthenticated) return "/login";
    return "/";
  };

  const getPlansRoute = () => {
    if (userType === "solicitante") return "/solicitante-plans";
    if (userType === "freelancer") return "/freelancer-plans";
    return "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">404</CardTitle>
          <CardDescription className="text-lg">
            Oops! Página não encontrada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <div className="text-center text-sm text-gray-500 bg-gray-50 p-2 rounded">
            Rota tentada: <code className="font-mono">{location.pathname}</code>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to={getHomeRoute()}>
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            
            {isAuthenticated && (
              <Button variant="outline" asChild className="w-full">
                <Link to={getPlansRoute()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ver Planos
                </Link>
              </Button>
            )}
            
            {!isAuthenticated && (
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Fazer Login
                </Link>
              </Button>
            )}
          </div>
          
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Precisa de ajuda?{" "}
              <Link to="/chat" className="text-helpaqui-purple hover:underline">
                Entre em contato
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
