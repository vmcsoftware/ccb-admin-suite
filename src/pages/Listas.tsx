import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { useCongregacoes, useMembros, useReforcos } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Listas() {
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const { reforcos } = useReforcos();

  const [selectedCongs, setSelectedCongs] = useState<string[]>([]);
  const [selectedMembros, setSelectedMembros] = useState<string[]>([]);
  const [incluirReforcos, setIncluirReforcos] = useState(false);

  const toggleCong = (id: string) => {
    setSelectedCongs((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const toggleMembro = (id: string) => {
    setSelectedMembros((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const gerarPDF = () => {
    const congsData = congregacoes.filter((c) => selectedCongs.includes(c.id));
    const membrosData = membros.filter((m) => selectedMembros.includes(m.id));

    let content = 'ADMINISTRAÇÃO ITUIUTABA - CCB\n';
    content += 'Lista Gerada em ' + new Date().toLocaleDateString('pt-BR') + '\n';
    content += '='.repeat(50) + '\n\n';

    if (congsData.length > 0) {
      content += 'CONGREGAÇÕES\n' + '-'.repeat(30) + '\n';
      congsData.forEach((c) => {
        content += `\n${c.nome}\n`;
        content += `  Endereço: ${c.endereco}, ${c.bairro} - ${c.cidade}\n`;
        if (c.diasCultos) content += `  Cultos: ${c.diasCultos}\n`;
        if (c.diasRJM) content += `  RJM: ${c.diasRJM}\n`;
        if (c.diasEnsaios) content += `  Ensaios: ${c.diasEnsaios}\n`;
      });
      content += '\n';
    }

    if (membrosData.length > 0) {
      content += 'MINISTÉRIO\n' + '-'.repeat(30) + '\n';
      membrosData.forEach((m) => {
        content += `  ${m.nome} — ${m.ministerio}\n`;
      });
      content += '\n';
    }

    if (incluirReforcos && reforcos.length > 0) {
      content += 'REFORÇOS AGENDADOS\n' + '-'.repeat(30) + '\n';
      reforcos.forEach((r) => {
        const cong = congregacoes.find((c) => c.id === r.congregacaoId);
        content += `  ${new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')} - ${r.tipo} - ${cong?.nome || '—'}\n`;
        if (r.membros.length > 0) {
          const nomes = r.membros.map((id) => membros.find((m) => m.id === id)?.nome || '—');
          content += `    Escalados: ${nomes.join(', ')}\n`;
        }
      });
    }

    // Create and download as text file (PDF would require a library)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-ccb-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasSelection = selectedCongs.length > 0 || selectedMembros.length > 0 || incluirReforcos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Listas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione os dados para gerar uma lista exportável
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Congregações */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold font-display text-foreground">Congregações</h3>
          {congregacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma congregação cadastrada.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {congregacoes.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedCongs.includes(c.id)} onCheckedChange={() => toggleCong(c.id)} />
                  <span className="text-foreground">{c.nome}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Ministério */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold font-display text-foreground">Ministério</h3>
          {membros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum membro cadastrado.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {membros.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedMembros.includes(m.id)} onCheckedChange={() => toggleMembro(m.id)} />
                  <span className="text-foreground">{m.nome}</span>
                  <span className="text-muted-foreground text-xs">({m.ministerio})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reforços */}
      <div className="glass-card rounded-xl p-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={incluirReforcos} onCheckedChange={(v) => setIncluirReforcos(!!v)} />
          <span className="font-semibold font-display text-foreground">Incluir Reforços Agendados</span>
          <span className="text-sm text-muted-foreground">({reforcos.length})</span>
        </label>
      </div>

      <Button onClick={gerarPDF} disabled={!hasSelection} className="gap-2">
        <Download className="h-4 w-4" /> Gerar e Baixar Lista
      </Button>
    </div>
  );
}
