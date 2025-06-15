
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';

const SecurityDashboard: React.FC = () => {
  const { auditResult, loading, runSecurityAudit } = useSecurityAudit();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityBadge = (isSecure: boolean) => {
    return isSecure ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Seguro
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Atenção Necessária
      </Badge>
    );
  };

  if (loading || !auditResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Painel de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Executando auditoria de segurança...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Painel de Segurança
          </div>
          <Button variant="outline" size="sm" onClick={runSecurityAudit}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status Geral:</span>
          {getSecurityBadge(auditResult.isSecure)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pontuação de Segurança:</span>
          <span className={`text-2xl font-bold ${getScoreColor(auditResult.score)}`}>
            {auditResult.score}/100
          </span>
        </div>

        {auditResult.warnings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-600 mb-2">Avisos:</h4>
            <ul className="space-y-1">
              {auditResult.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-orange-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {auditResult.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-600 mb-2">Recomendações:</h4>
            <ul className="space-y-1">
              {auditResult.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-600">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;
