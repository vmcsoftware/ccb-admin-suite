import { Church, Users, Calendar, ShieldCheck } from 'lucide-react';
import { useCongregacoes, useMembros, useEventos, useReforcos } from '@/hooks/useData';

export default function Dashboard() {
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const { eventos } = useEventos();
  const { reforcos } = useReforcos();

  const stats = [
    { label: 'Congregações', value: congregacoes.length, icon: Church, color: 'text-primary' },
    { label: 'Ministério', value: membros.length, icon: Users, color: 'text-accent' },
    { label: 'Eventos', value: eventos.length, icon: Calendar, color: 'text-success' },
    { label: 'Reforços', value: reforcos.length, icon: ShieldCheck, color: 'text-warning' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Bem-vindo ao Painel
        </h1>
        <p className="text-muted-foreground mt-1">
          Administração Ituiutaba — Congregação Cristã no Brasil
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card stat-card-hover rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`rounded-xl bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {congregacoes.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Church className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold font-display text-foreground">
            Comece cadastrando suas congregações
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse o menu <strong>Congregações</strong> para adicionar a primeira.
          </p>
        </div>
      )}
    </div>
  );
}
