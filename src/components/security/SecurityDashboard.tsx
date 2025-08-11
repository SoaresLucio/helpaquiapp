
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

export const SecurityDashboard: React.FC = () => {
  const { auditResult, loading, runSecurityAudit } = useSecurityAudit();
  const { securityStats, securityEvents } = useSecurityMonitor();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Dashboard de Segurança</h2>
        </div>
        <Button 
          onClick={runSecurityAudit} 
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Executar Auditoria
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Security Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(auditResult?.score || 0)}`}>
              {auditResult?.score || 0}/100
            </div>
            <Badge variant={getScoreBadge(auditResult?.score || 0)} className="mt-2">
              {auditResult?.isSecure ? 'Seguro' : 'Requer Atenção'}
            </Badge>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Segurança</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {securityStats.failedAttempts} tentativas falharam
            </p>
            {securityStats.suspiciousActivity && (
              <Badge variant="destructive" className="mt-2">
                Atividade Suspeita Detectada
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Last Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atividade</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {securityStats.lastActivity 
                ? new Date(securityStats.lastActivity).toLocaleString('pt-BR')
                : 'Nenhuma atividade registrada'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Warnings */}
      {auditResult?.warnings && auditResult.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Avisos de Segurança
            </CardTitle>
            <CardDescription>
              Questões que requerem atenção para melhorar a segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {auditResult.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Security Recommendations */}
      {auditResult?.recommendations && auditResult.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recomendações
            </CardTitle>
            <CardDescription>
              Ações sugeridas para melhorar a segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {auditResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboard;
