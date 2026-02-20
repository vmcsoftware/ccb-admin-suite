import { useState, useRef } from 'react';
import { Plus, Trash2, Check, X, Calendar, Clock, MapPin, Eye, Edit, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useEventos, useCongregacoes, useMembros } from '@/hooks/useData';
import { Evento } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SantaCeiaForm extends Evento {
  anciaoAtende1?: string;
  anciaoAtende2?: string;
  diaconoAuxiliar1?: string;
  diaconoAuxiliar2?: string;
}

export default function SantaCeia() {
  const { eventos, adicionar, remover } = useEventos();
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const tableRef = useRef<HTMLDivElement>(null);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedSantaCeia, setSelectedSantaCeia] = useState<Evento | null>(null);
  const [editingForm, setEditingForm] = useState<SantaCeiaForm | null>(null);
  const [form, setForm] = useState({
    titulo: 'Santa Ceia',
    data: '',
    horario: '03:00',
    congregacaoId: congregacoes[0]?.id || '',
    anciaoAtende1: '',
    anciaoAtende2: '',
    diaconoResponsavel: '',
    diaconoAuxiliar1: '',
    diaconoAuxiliar2: '',
    responsavelContagem: '',
  });

  // Filtrar apenas eventos de Santa Ceia
  const santaCeias = eventos.filter(e => e.subtipoReuniao === 'Santa-Ceia' || (e.tipo === 'Reunião' && e.subtipoReuniao === 'Santa-Ceia'));

  const getCongregacaoNome = (id: string) => {
    const cong = congregacoes.find(c => c.id === id);
    if (!cong) return 'Sem localidade';
    return cong.nome.toLowerCase().includes('central')
      ? `${cong.nome} - ${cong.cidade}`
      : cong.nome;
  };

  const getMembrosAnciaos = () => {
    return membros.filter(m => m.ministerio === 'Ancião');
  };

  const getMembrosD = () => {
    return membros.filter(m => m.ministerio === 'Diácono');
  };

  const handleSubmit = () => {
    if (!form.data || !form.congregacaoId) {
      alert('Preencha data e congregação');
      return;
    }

    const novoEvento = {
      titulo: form.titulo,
      data: form.data,
      horario: form.horario,
      tipo: 'Reunião' as const,
      subtipoReuniao: 'Santa-Ceia',
      congregacaoId: form.congregacaoId,
      anciaoAtende: [form.anciaoAtende1, form.anciaoAtende2].filter(Boolean).sort().join(', '),
      diaconoResponsavel: form.diaconoResponsavel,
      diaconoAuxiliar: [form.diaconoAuxiliar1, form.diaconoAuxiliar2].filter(Boolean).sort().join(', '),
      responsavelContagem: form.responsavelContagem,
    };

    adicionar(novoEvento);
    setForm({
      titulo: 'Santa Ceia',
      data: '',
      horario: '03:00',
      congregacaoId: congregacoes[0]?.id || '',
      anciaoAtende1: '',
      anciaoAtende2: '',
      diaconoResponsavel: '',
      diaconoAuxiliar1: '',
      diaconoAuxiliar2: '',
      responsavelContagem: '',
    });
    setOpen(false);
  };

  const handleViewDetails = (santaCeia: Evento) => {
    setSelectedSantaCeia(santaCeia);
    setDetailsOpen(true);
  };

  const handleEdit = (santaCeia: Evento) => {
    setSelectedSantaCeia(santaCeia);
    setEditingForm({
      ...santaCeia,
      anciaoAtende1: santaCeia.anciaoAtende?.split(', ')[0] || '',
      anciaoAtende2: santaCeia.anciaoAtende?.split(', ')[1] || '',
      diaconoAuxiliar1: santaCeia.diaconoAuxiliar?.split(', ')[0] || '',
      diaconoAuxiliar2: santaCeia.diaconoAuxiliar?.split(', ')[1] || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingForm.data || !editingForm.congregacaoId) {
      alert('Preencha data e congregação');
      return;
    }

    await remover(editingForm.id);
    const { id, ...eventoSemId } = editingForm;
    const updatedEvento = {
      ...eventoSemId,
      anciaoAtende: [editingForm.anciaoAtende1, editingForm.anciaoAtende2].filter(Boolean).sort().join(', '),
      diaconoAuxiliar: [editingForm.diaconoAuxiliar1, editingForm.diaconoAuxiliar2].filter(Boolean).sort().join(', '),
    };
    adicionar(updatedEvento);
    setEditOpen(false);
    setEditingForm(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSantaCeia && !isDeleting) {
      setIsDeleting(true);
      try {
        console.log('Tentando deletar evento com ID:', selectedSantaCeia.id);
        console.log('Evento completo:', selectedSantaCeia);
        
        await remover(selectedSantaCeia.id);
        
        console.log('Evento deletado com sucesso!');
        setDeleteConfirmOpen(false);
        setSelectedSantaCeia(null);
        setIsDeleting(false);
        alert('Santa Ceia deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar Santa Ceia:', error);
        const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
        const errorCode = error instanceof Object && 'code' in error ? (error as Record<string, unknown>).code : undefined;
        console.error('Detalhes do erro:', errorCode, errorMessage);
        alert(`Erro ao deletar: ${errorMessage}`);
        setIsDeleting(false);
      }
    }
  };

  const gerarPDF = async () => {
    if (!pdfPreviewRef.current) return;
    try {
      setShowPdfPreview(true);
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(pdfPreviewRef.current, { 
        scale: 1.5,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297 - 16;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 8, 8, imgWidth, imgHeight);
      pdf.save('santa-ceia.pdf');
      
      setShowPdfPreview(false);
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
      setShowPdfPreview(false);
    }
  };

  const gerarXLS = () => {
    const data = santaCeias.map(sc => ({
      'Data': new Date(sc.data + 'T12:00:00').toLocaleDateString('pt-BR'),
      'Congregação': getCongregacaoNome(sc.congregacaoId || ''),
      'Anciães': sc.anciaoAtende || '—',
      'Diác. Responsável': sc.diaconoResponsavel || '—',
      'Diác. Auxiliares': sc.diaconoAuxiliar || '—',
      'Contagem': sc.responsavelContagem || '—',
    }));

    const ws_data = [
      Object.keys(data[0] || {}),
      ...data.map(row => Object.values(row)),
    ];

    const csv = ws_data.map(row => 
      Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : row
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'santa-ceia.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Santa Ceia - Marcação</h1>
          <p className="text-sm text-muted-foreground mt-1">Marcação e gerenciamento de Santa Ceia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={gerarPDF} disabled={santaCeias.length === 0}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={gerarXLS} disabled={santaCeias.length === 0}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Santa Ceia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agendar Santa Ceia</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Congregação</Label>
                <Select value={form.congregacaoId} onValueChange={(v) => setForm({ ...form, congregacaoId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {congregacoes.map(c => {
                      const displayName = c.nome.toLowerCase().includes('central')
                        ? `${c.nome} - ${c.cidade}`
                        : c.nome;
                      return (
                        <SelectItem key={c.id} value={c.id}>{displayName}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Horário</Label>
                <Input
                  type="time"
                  value={form.horario}
                  onChange={(e) => setForm({ ...form, horario: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Ancião 1</Label>
                <Select value={form.anciaoAtende1} onValueChange={(v) => setForm({ ...form, anciaoAtende1: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ancião" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosAnciaos().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(a => (
                      <SelectItem key={a.id} value={a.nome}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Ancião 2</Label>
                <Select value={form.anciaoAtende2} onValueChange={(v) => setForm({ ...form, anciaoAtende2: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ancião (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosAnciaos().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(a => (
                      <SelectItem key={a.id} value={a.nome}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Diácono Responsável</Label>
                <Select value={form.diaconoResponsavel} onValueChange={(v) => setForm({ ...form, diaconoResponsavel: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diácono" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosD().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(d => (
                      <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Diácono Auxiliar 1</Label>
                <Select value={form.diaconoAuxiliar1} onValueChange={(v) => setForm({ ...form, diaconoAuxiliar1: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diácono" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosD().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(d => (
                      <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Diácono Auxiliar 2</Label>
                <Select value={form.diaconoAuxiliar2} onValueChange={(v) => setForm({ ...form, diaconoAuxiliar2: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diácono (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosD().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(d => (
                      <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-semibold">Responsável pela Contagem</Label>
                <Input
                  type="text"
                  placeholder="Digite o nome do responsável"
                  value={form.responsavelContagem}
                  onChange={(e) => setForm({ ...form, responsavelContagem: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleSubmit} className="flex-1">Agendar</Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Santa Ceias */}
      {santaCeias.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border-2 border-dashed border-border">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Nenhuma Santa Ceia agendada</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-6 border border-border/50">
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Data</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Congregação</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Anciães</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Diác. Responsável</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Diác. Auxiliares</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Contagem</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {santaCeias.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()).map((sc) => {
                  const dataObj = new Date(sc.data + 'T12:00:00');
                  const dataBR = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  return (
                    <tr key={sc.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-foreground">{dataBR}</td>
                      <td className="px-4 py-3 text-foreground">{getCongregacaoNome(sc.congregacaoId || '')}</td>
                      <td className="px-4 py-3 text-foreground">{sc.anciaoAtende || '—'}</td>
                      <td className="px-4 py-3 text-foreground">{sc.diaconoResponsavel || '—'}</td>
                      <td className="px-4 py-3 text-foreground">{sc.diaconoAuxiliar || '—'}</td>
                      <td className="px-4 py-3 text-foreground">{sc.responsavelContagem || '—'}</td>
                      <td className="px-4 py-3 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewDetails(sc)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(sc)}
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSantaCeia(sc);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog de Visualização */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Santa Ceia</DialogTitle>
          </DialogHeader>
          {selectedSantaCeia && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Data</Label>
                <p className="text-foreground">{new Date(selectedSantaCeia.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Horário</Label>
                <p className="text-foreground">{selectedSantaCeia.horario}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-semibold text-muted-foreground">Congregação</Label>
                <p className="text-foreground">{getCongregacaoNome(selectedSantaCeia.congregacaoId)}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-semibold text-muted-foreground">Anciães</Label>
                <p className="text-foreground">{selectedSantaCeia.anciaoAtende || '—'}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Diácono Responsável</Label>
                <p className="text-foreground">{selectedSantaCeia.diaconoResponsavel || '—'}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Diáconos Auxiliares</Label>
                <p className="text-foreground">{selectedSantaCeia.diaconoAuxiliar || '—'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-semibold text-muted-foreground">Responsável pela Contagem</Label>
                <p className="text-foreground">{selectedSantaCeia.responsavelContagem || '—'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Santa Ceia</DialogTitle>
          </DialogHeader>
          {editingForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Congregação</Label>
                <Select value={editingForm.congregacaoId} onValueChange={(v) => setEditingForm({ ...editingForm, congregacaoId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {congregacoes.map(c => {
                      const displayName = c.nome.toLowerCase().includes('central')
                        ? `${c.nome} - ${c.cidade}`
                        : c.nome;
                      return (
                        <SelectItem key={c.id} value={c.id}>{displayName}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Data</Label>
                <Input
                  type="date"
                  value={editingForm.data}
                  onChange={(e) => setEditingForm({ ...editingForm, data: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Horário</Label>
                <Input
                  type="time"
                  value={editingForm.horario}
                  onChange={(e) => setEditingForm({ ...editingForm, horario: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Ancião 1</Label>
                <Select value={editingForm.anciaoAtende1} onValueChange={(v) => setEditingForm({ ...editingForm, anciaoAtende1: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ancião" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosAnciaos().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(a => (
                      <SelectItem key={a.id} value={a.nome}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Ancião 2</Label>
                <Select value={editingForm.anciaoAtende2} onValueChange={(v) => setEditingForm({ ...editingForm, anciaoAtende2: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ancião (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosAnciaos().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(a => (
                      <SelectItem key={a.id} value={a.nome}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Diácono Responsável</Label>
                <Select value={editingForm.diaconoResponsavel} onValueChange={(v) => setEditingForm({ ...editingForm, diaconoResponsavel: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diácono" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosD().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(d => (
                      <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Diácono Auxiliar 1</Label>
                <Select value={editingForm.diaconoAuxiliar1} onValueChange={(v) => setEditingForm({ ...editingForm, diaconoAuxiliar1: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diácono" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosD().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(d => (
                      <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Diácono Auxiliar 2</Label>
                <Select value={editingForm.diaconoAuxiliar2} onValueChange={(v) => setEditingForm({ ...editingForm, diaconoAuxiliar2: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diácono (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembrosD().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(d => (
                      <SelectItem key={d.id} value={d.nome}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-semibold">Responsável pela Contagem</Label>
                <Input
                  type="text"
                  placeholder="Digite o nome do responsável"
                  value={editingForm.responsavelContagem}
                  onChange={(e) => setEditingForm({ ...editingForm, responsavelContagem: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleSaveEdit} className="flex-1">Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(newOpen) => !isDeleting && setDeleteConfirmOpen(newOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta Santa Ceia de <strong>{selectedSantaCeia && getCongregacaoNome(selectedSantaCeia.congregacaoId || '')}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview PDF */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview - Santa Ceia</DialogTitle>
          </DialogHeader>
          <div ref={pdfPreviewRef} className="bg-white p-2">
            <div className="mb-1">
              <h1 className="text-lg font-bold text-center mb-0">SANTA CEIA - MARCAÇÃO</h1>
              <p className="text-center text-gray-600 text-xs leading-none">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Data</th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Hora</th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Congregação</th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Anciões</th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Diác. Resp.</th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Diác. Aux.</th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-bold">Contagem</th>
                </tr>
              </thead>
              <tbody>
                {santaCeias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-gray-300 px-1 py-0.5 text-center text-gray-500 text-xs">
                      Nenhuma marcação registrada
                    </td>
                  </tr>
                ) : (
                  santaCeias.map((santa, idx) => (
                    <tr key={santa.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-1 py-0 text-xs whitespace-nowrap">
                        {new Date(santa.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="border border-gray-300 px-1 py-0 text-xs">{santa.horario || '03:00'}</td>
                      <td className="border border-gray-300 px-1 py-0 text-xs">{getCongregacaoNome(santa.congregacaoId || '')}</td>
                      <td className="border border-gray-300 px-1 py-0 text-xs">
                        {santa.anciaoAtende?.split(', ').join(' / ') || '—'}
                      </td>
                      <td className="border border-gray-300 px-1 py-0 text-xs">{santa.diaconoResponsavel || '—'}</td>
                      <td className="border border-gray-300 px-1 py-0 text-xs">
                        {santa.diaconoAuxiliar?.split(', ').join(' / ') || '—'}
                      </td>
                      <td className="border border-gray-300 px-1 py-0 text-xs">{santa.responsavelContagem || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowPdfPreview(false)}>Cancelar</Button>
            <Button onClick={async () => {
              await gerarPDF();
            }}>Gerar PDF</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
