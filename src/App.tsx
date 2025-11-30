import React, { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
import { 
  StickyNote, List, Plus, Trash2, X, 
  Settings, Menu, GripVertical, Download, Upload, AlertTriangle, 
  Moon, Sun, Filter, Pencil, Tag, Copy, Clipboard, Check
} from 'lucide-react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

type ThemeMode = 'dark' | 'light';
type AccentKey = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';

interface AccentProfile {
  name: string; primary: string; hover: string; text: string;
  ring: string; lightBg: string; border: string; gradient: string;
}

interface ThemeProfile {
  bgMain: string; bgCard: string; bgInput: string;
  textMain: string; textSec: string; border: string; modalOverlay: string;
}

interface ThemeContextType extends ThemeProfile {
  accent: AccentProfile;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accentKey: AccentKey;
  setAccentKey: (key: AccentKey) => void;
}

interface Label {
  id: string; name: string; color: string; textColor: string;
}

interface Note {
  id: number; title: string; content: string; labelId: string; date: string;
}

interface TierItem {
  id: number; name: string; tier: string;
}

interface TierList {
  id: number; title: string; items: TierItem[];
}

// ==========================================
// 2. THEME SYSTEM & CONTEXT
// ==========================================

const themes: Record<ThemeMode, ThemeProfile> = {
  dark: {
    bgMain: 'bg-black', bgCard: 'bg-gray-900', bgInput: 'bg-gray-900',
    textMain: 'text-gray-100', textSec: 'text-gray-400',
    border: 'border-gray-800', modalOverlay: 'bg-black/90',
  },
  light: {
    bgMain: 'bg-gray-50', bgCard: 'bg-white', bgInput: 'bg-gray-100',
    textMain: 'text-gray-900', textSec: 'text-gray-500',
    border: 'border-gray-200', modalOverlay: 'bg-gray-900/20',
  }
};

const accents: Record<AccentKey, AccentProfile> = {
  indigo: { name: 'Zen Indigo', primary: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-500/20', border: 'border-indigo-500', gradient: 'from-indigo-500 to-purple-600' },
  rose: { name: 'Rose Red', primary: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-500', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-500/20', border: 'border-rose-500', gradient: 'from-rose-500 to-pink-600' },
  emerald: { name: 'Emerald', primary: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-500', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-500/20', border: 'border-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  amber: { name: 'Amber', primary: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-500/20', border: 'border-amber-500', gradient: 'from-amber-500 to-orange-600' },
  cyan: { name: 'Cyan Future', primary: 'bg-cyan-600', hover: 'hover:bg-cyan-700', text: 'text-cyan-500', ring: 'focus:ring-cyan-500', lightBg: 'bg-cyan-500/20', border: 'border-cyan-500', gradient: 'from-cyan-500 to-blue-600' },
  violet: { name: 'Violet', primary: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-500', ring: 'focus:ring-violet-500', lightBg: 'bg-violet-500/20', border: 'border-violet-500', gradient: 'from-violet-500 to-fuchsia-600' }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('lb_theme_mode') as ThemeMode) || 'dark');
  const [accentKey, setAccentKey] = useState<AccentKey>(() => (localStorage.getItem('lb_theme_accent') as AccentKey) || 'indigo');

  useEffect(() => {
    localStorage.setItem('lb_theme_mode', mode);
    localStorage.setItem('lb_theme_accent', accentKey);
  }, [mode, accentKey]);

  return (
    <ThemeContext.Provider value={{ ...themes[mode], accent: accents[accentKey], mode, setMode, accentKey, setAccentKey }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// ==========================================
// 3. UI COMPONENTS (Atomic)
// ==========================================

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' }> = 
({ children, variant = 'primary', className = '', ...props }) => {
  const { bgCard, textMain, textSec, border, accent } = useTheme();
  const variants = {
    primary: `${accent.primary} text-white shadow-lg hover:opacity-90`,
    secondary: `${bgCard} ${textMain} border ${border} hover:brightness-110`,
    success: `bg-green-600 text-white shadow-lg hover:opacity-90`,
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    ghost: `bg-transparent ${textSec} hover:${textMain} hover:${bgCard}`
  };
  return (
    <button className={`px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  const { bgInput, border, textMain, textSec, accent } = useTheme();
  return (
    <input className={`w-full ${bgInput} border ${border} rounded-xl px-4 py-3 ${textMain} placeholder:${textSec} focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all ${className}`} {...props} />
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode; customTheme?: { bg: string; text: string } }> = 
({ isOpen, onClose, title, children, customTheme }) => {
  const { bgCard, border, textMain, textSec, modalOverlay } = useTheme();
  
  if (!isOpen) return null;
  
  const theme = customTheme || { bg: bgCard, text: textMain };
  const borderClass = customTheme ? 'border-transparent' : border;
  const closeBtnClass = customTheme ? `hover:bg-black/10 ${customTheme.text}` : `${textSec} hover:${textMain}`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${modalOverlay} backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`${theme.bg} w-full max-w-md rounded-2xl border ${borderClass} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors duration-300`}>
        <div className={`flex items-center justify-between p-4 border-b ${customTheme ? 'border-black/5' : border}`}>
          <h3 className={`text-lg font-bold ${theme.text}`}>{title}</h3>
          <button onClick={onClose} className={closeBtnClass}><X size={20} /></button>
        </div>
        <div className={`p-4 ${theme.text}`}>{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SUB-COMPONENTS (Feature Specific)
// ==========================================

const LabelManager: React.FC<{ 
  labels: Label[]; 
  onAdd: (name: string, color: typeof availableColors[0]) => void; 
  onUpdate: (id: string, name: string, color: typeof availableColors[0]) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ labels, onAdd, onUpdate, onDelete, isOpen, onClose }) => {
  const { bgInput, border, textSec, textMain, bgCard, accent } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    setName(label.name);
    const matchingColor = availableColors.find(c => c.bg === label.color) || availableColors[0];
    setColor(matchingColor);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setColor(availableColors[0]);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editingId) {
      onUpdate(editingId, name, color);
      cancelEdit();
    } else {
      onAdd(name, color);
      setName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Labels verwalten">
      <div className="space-y-6">
        <div className={`p-4 rounded-xl border ${border} ${bgInput}`}>
          <h4 className={`text-xs font-bold uppercase mb-3 ${textSec}`}>
            {editingId ? 'Label bearbeiten' : 'Neues Label'}
          </h4>
          <div className="flex gap-2 mb-3">
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Name (z.B. Sport)" 
              className="text-sm py-2" 
            />
            <Button onClick={handleSubmit} disabled={!name.trim()} className="py-2 px-4">
              {editingId ? 'Ok' : <Plus size={18} />}
            </Button>
            {editingId && (
              <Button onClick={cancelEdit} variant="ghost" className="py-2 px-3">
                <X size={18} />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(c => (
              <button 
                key={c.name} 
                onClick={() => setColor(c)} 
                className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-transform ${color.bg === c.bg ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} 
                title={c.name} 
              />
            ))}
          </div>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className={`text-xs font-bold uppercase ${textSec}`}>Vorhandene Labels</h4>
          {labels.map(label => (
            <div key={label.id} className={`flex items-center justify-between p-3 rounded-lg border ${border} ${bgCard}`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${label.color}`}></div>
                <span className={`font-medium ${textMain}`}>{label.name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(label)} className={`${textSec} hover:${accent.text} p-2 rounded-lg hover:bg-black/5 transition-colors`}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(label.id)} className={`${textSec} hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const NoteCard: React.FC<{ note: Note; label: Label; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ note, label, onClick, onDelete }) => (
  <div onClick={onClick} className={`${label.color} p-4 rounded-xl shadow-sm flex flex-col min-h-[160px] relative group transition-transform active:scale-95 cursor-pointer`}>
    {label.id !== 'unlabeled' && (
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/30 ${label.textColor}`}>{label.name}</span>
      </div>
    )}
    <h3 className={`font-bold text-lg mb-1 ${label.textColor} line-clamp-1`}>{note.title}</h3>
    <p className={`text-sm ${label.textColor} opacity-80 line-clamp-4 flex-grow whitespace-pre-wrap`}>{note.content}</p>
    <div className="flex justify-between items-center mt-3">
      <span className={`text-[10px] ${label.textColor} opacity-60`}>{note.date}</span>
      <button onClick={onDelete} className={`p-2 rounded-full hover:bg-black/10 ${label.textColor}`}><Trash2 size={16} /></button>
    </div>
  </div>
);

// ==========================================
// 5. FEATURE VIEWS
// ==========================================

const defaultLabels: Label[] = [
  { id: '1', name: 'Allgemein', color: 'bg-yellow-200', textColor: 'text-yellow-900' },
  { id: '2', name: 'Arbeit', color: 'bg-blue-200', textColor: 'text-blue-900' },
  { id: '3', name: 'Privat', color: 'bg-green-200', textColor: 'text-green-900' },
  { id: '4', name: 'Wichtig', color: 'bg-red-200', textColor: 'text-red-900' },
];

const availableColors = [
  { bg: 'bg-yellow-200', text: 'text-yellow-900', name: 'Gelb' },
  { bg: 'bg-blue-200', text: 'text-blue-900', name: 'Blau' },
  { bg: 'bg-green-200', text: 'text-green-900', name: 'Grün' },
  { bg: 'bg-red-200', text: 'text-red-900', name: 'Rot' },
  { bg: 'bg-purple-200', text: 'text-purple-900', name: 'Lila' },
  { bg: 'bg-orange-200', text: 'text-orange-900', name: 'Orange' },
  { bg: 'bg-gray-200', text: 'text-gray-900', name: 'Grau' },
  { bg: 'bg-pink-200', text: 'text-pink-900', name: 'Pink' },
  { bg: 'bg-teal-200', text: 'text-teal-900', name: 'Türkis' },
];

const unlabeledLabel: Label = { 
  id: 'unlabeled', 
  name: 'Labellos', 
  color: 'bg-gray-700', 
  textColor: 'text-gray-200' 
};

const NotesView: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>(() => JSON.parse(localStorage.getItem('lb_labels') || JSON.stringify(defaultLabels)));
  const [notes, setNotes] = useState<Note[]>(() => {
    const loaded = JSON.parse(localStorage.getItem('lb_notes') || '[]');
    return loaded.map((n: any) => {
        // Ensure unlabeled notes have empty string as ID or handle legacy data
        if (!n.labelId) return { ...n, labelId: '' };
        return n;
    });
  });
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<{ id?: number; title: string; content: string; labelId: string }>({ title: '', content: '', labelId: '' });

  const { textMain, textSec, bgCard, border } = useTheme();

  useEffect(() => localStorage.setItem('lb_notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('lb_labels', JSON.stringify(labels)), [labels]);

  // Helper to find label or return unlabeled style
  const getLabel = (id: string) => {
    if (!id || id === '') return unlabeledLabel;
    return labels.find(l => l.id === id) || unlabeledLabel;
  };

  const activeLabel = getLabel(currentNote.labelId);
  
  const filteredNotes = activeFilters.length === 0 
    ? notes 
    : notes.filter(n => {
        if (activeFilters.includes('unlabeled')) {
            // Check if note matches explicit unlabeled filter or normal labels
            return n.labelId === '' || activeFilters.includes(n.labelId);
        }
        return activeFilters.includes(n.labelId);
    });

  const handleSaveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) return;
    const dateStr = new Date().toLocaleDateString('de-DE');
    
    if (currentNote.id) {
      setNotes(notes.map(n => n.id === currentNote.id ? { ...n, ...currentNote, date: dateStr } : n));
    } else {
      setNotes([{ id: Date.now(), ...currentNote, date: dateStr }, ...notes]);
    }
    setCurrentNote({ title: '', content: '', labelId: '' });
    setIsModalOpen(false);
  };

  const handleCreateLabel = (name: string, color: typeof availableColors[0]) => {
    const newLabel = { id: Date.now().toString(), name, color: color.bg, textColor: color.text };
    setLabels([...labels, newLabel]);
    if (isModalOpen) setCurrentNote(prev => ({ ...prev, labelId: newLabel.id }));
  };

  const handleUpdateLabel = (id: string, name: string, color: typeof availableColors[0]) => {
    setLabels(labels.map(l => l.id === id ? { ...l, name, color: color.bg, textColor: color.text } : l));
  };

  const handleDeleteLabel = (id: string) => {
    if (!confirm("Label wirklich löschen? Zugehörige Notizen werden 'Labellos'.")) return;
    const newLabels = labels.filter(l => l.id !== id);
    setLabels(newLabels);
    // Move notes to unlabeled (empty string)
    setNotes(notes.map(n => n.labelId === id ? { ...n, labelId: '' } : n));
    setActiveFilters(prev => prev.filter(fid => fid !== id));
  };

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h2 className={`text-2xl font-bold ${textMain}`}>Meine Notizen</h2>
        <Button onClick={() => { setCurrentNote({ title: '', content: '', labelId: '' }); setIsModalOpen(true); }}>
          <Plus size={20} /> Neu
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <button onClick={() => setIsLabelManagerOpen(true)} className={`h-9 w-9 flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors ${bgCard} ${border} ${textSec} hover:${textMain}`}>
          <Settings size={18} />
        </button>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-grow items-center">
          <div className={`h-9 w-9 flex items-center justify-center rounded-lg border flex-shrink-0 ${border} ${bgCard}`}>
            <Filter size={16} className={textSec} />
          </div>
          {/* Unlabeled Filter */}
          <button 
            onClick={() => toggleFilter('unlabeled')} 
            className={`h-9 whitespace-nowrap px-3 rounded-lg text-sm font-medium transition-all border flex-shrink-0 flex items-center gap-1 ${activeFilters.includes('unlabeled') ? `bg-gray-700 text-gray-200 border-transparent shadow-sm scale-105` : `${bgCard} ${textSec} ${border} opacity-70 hover:opacity-100`}`}
          >
            <Tag size={14} /> Labellos
          </button>
          
          {labels.map(label => (
            <button key={label.id} onClick={() => toggleFilter(label.id)} 
              className={`h-9 whitespace-nowrap px-3 rounded-lg text-sm font-medium transition-all border flex-shrink-0 flex items-center ${activeFilters.includes(label.id) ? `${label.color} ${label.textColor} border-transparent shadow-sm scale-105` : `${bgCard} ${textSec} ${border} opacity-70 hover:opacity-100`}`}>
              {label.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredNotes.length === 0 && <div className={`col-span-2 text-center py-20 ${textSec} flex flex-col items-center`}><StickyNote size={48} className="mb-4 opacity-20" /><p>Keine Notizen gefunden.</p></div>}
        {filteredNotes.map(note => (
          <NoteCard key={note.id} note={note} label={getLabel(note.labelId)} onClick={() => { setCurrentNote(note); setIsModalOpen(true); }} onDelete={(e) => { e.stopPropagation(); setNotes(notes.filter(n => n.id !== note.id)); }} />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentNote.id ? 'Notiz bearbeiten' : 'Neue Notiz'} customTheme={{ bg: activeLabel.color, text: activeLabel.textColor }}>
        <div className="space-y-4">
          <input type="text" value={currentNote.title} onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })} placeholder="Titel" className={`w-full bg-white/20 border-0 rounded-xl px-4 py-3 ${activeLabel.textColor} placeholder:${activeLabel.textColor}/50 focus:outline-none focus:ring-2 focus:ring-black/10 font-bold text-lg`} />
          <textarea value={currentNote.content} onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })} placeholder="Inhalt..." className={`w-full bg-white/20 border-0 rounded-xl px-4 py-3 ${activeLabel.textColor} placeholder:${activeLabel.textColor}/50 focus:outline-none focus:ring-2 focus:ring-black/10 h-64 resize-none`} />
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold uppercase opacity-60 ${activeLabel.textColor}`}>Label wählen</span>
              <button onClick={() => setIsLabelManagerOpen(true)} className={`text-xs font-bold hover:underline ${activeLabel.textColor}`}>Bearbeiten</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCurrentNote({ ...currentNote, labelId: '' })} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${currentNote.labelId === '' ? `bg-white/40 ${activeLabel.textColor} border-black/10 shadow-sm` : `bg-transparent ${activeLabel.textColor} border-transparent hover:bg-white/10 opacity-60 hover:opacity-100`}`}
              >
                <Tag size={14} className="inline mr-1"/> Kein Label
              </button>
              {labels.map(label => (
                <button key={label.id} onClick={() => setCurrentNote({ ...currentNote, labelId: label.id })} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${currentNote.labelId === label.id ? `bg-white/40 ${label.textColor} border-black/10 shadow-sm` : `bg-transparent ${activeLabel.textColor} border-transparent hover:bg-white/10 opacity-60 hover:opacity-100`}`}>{label.name}</button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveNote} className={`w-full border-0 ${activeLabel.textColor} bg-white/30 hover:bg-white/50 shadow-none`}>{currentNote.id ? 'Speichern' : 'Erstellen'}</Button>
        </div>
      </Modal>

      <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} labels={labels} onAdd={handleCreateLabel} onUpdate={handleUpdateLabel} onDelete={handleDeleteLabel} />
    </div>
  );
};

const TierListView: React.FC = () => {
  const [lists, setLists] = useState<TierList[]>(() => JSON.parse(localStorage.getItem('lb_tierlists') || '[]'));
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingToTier, setAddingToTier] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [draggedItem, setDraggedItem] = useState<TierItem | null>(null);
  const { bgCard, border, textMain, textSec, accent, bgInput } = useTheme();

  useEffect(() => localStorage.setItem('lb_tierlists', JSON.stringify(lists)), [lists]);

  const activeList = lists.find(l => l.id === activeListId);
  const tiers = [{ id: 'S', color: 'bg-red-500' }, { id: 'A', color: 'bg-orange-500' }, { id: 'B', color: 'bg-yellow-500' }, { id: 'C', color: 'bg-green-500' }, { id: 'D', color: 'bg-blue-500' }];

  const handleDrop = (e: React.DragEvent, targetTier: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.tier === targetTier) return;
    setLists(lists.map(list => list.id === activeListId ? { ...list, items: list.items.map(item => item.id === draggedItem.id ? { ...item, tier: targetTier } : item) } : list));
    setDraggedItem(null);
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !addingToTier) return;
    setLists(lists.map(list => list.id === activeListId ? { ...list, items: [...list.items, { id: Date.now(), name: newItemName, tier: addingToTier }] } : list));
    setNewItemName(''); setAddingToTier(null);
  };

  if (!activeList) {
    return (
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${textMain}`}>Meine Tier Lists</h2><Button onClick={() => setIsCreateModalOpen(true)}><Plus size={20} /> Neu</Button></div>
        <div className="grid grid-cols-1 gap-4">
          {lists.length === 0 && <div className={`text-center py-10 ${textSec}`}><List size={48} className="mx-auto mb-4 opacity-20" /><p>Noch keine Tier Lists.</p></div>}
          {lists.map(list => (
            <div key={list.id} onClick={() => setActiveListId(list.id)} className={`${bgCard} p-4 rounded-xl flex items-center justify-between hover:brightness-105 active:scale-95 transition-all cursor-pointer border ${border}`}>
              <div className="flex items-center gap-4"><div className={`p-3 rounded-full ${accent.lightBg} ${accent.text}`}><List size={24} /></div><div><h3 className={`font-bold ${textMain}`}>{list.title}</h3><p className={`text-sm ${textSec}`}>{list.items.length} Einträge</p></div></div>
              <button onClick={(e) => { e.stopPropagation(); setLists(lists.filter(l => l.id !== list.id)); }} className={`${textSec} hover:text-red-400 p-2`}><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Neue Tier List">
          <div className="space-y-4"><Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Name" /><Button onClick={() => { if(!newListTitle.trim()) return; setLists([{ id: Date.now(), title: newListTitle, items: [] }, ...lists]); setNewListTitle(''); setIsCreateModalOpen(false); }} className="w-full">Erstellen</Button></div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 mb-6"><button onClick={() => setActiveListId(null)} className={`${textSec} hover:${textMain}`}><Menu size={24} /></button><h2 className={`text-xl font-bold ${textMain} flex-1 truncate`}>{activeList.title}</h2></div>
      <div className="space-y-2">
        {tiers.map(tier => (
          <div key={tier.id} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }} onDrop={(e) => handleDrop(e, tier.id)} className={`flex min-h-[80px] ${bgCard} rounded-lg overflow-hidden border ${border} transition-colors hover:border-opacity-50`}>
            <div className={`${tier.color} w-14 flex flex-col items-center justify-center flex-shrink-0 gap-1 py-2`}>
              <span className="text-xl font-black text-black/50">{tier.id}</span>
              <button onClick={() => setAddingToTier(tier.id)} className="bg-black/20 hover:bg-black/40 text-white rounded p-0.5 transition-colors"><Plus size={14} /></button>
            </div>
            <div className="p-2 flex-1 flex flex-wrap gap-2 content-start">
              {activeList.items.filter(i => i.tier === tier.id).map(item => (
                <div key={item.id} draggable onDragStart={(e) => { setDraggedItem(item); e.dataTransfer.effectAllowed = "move"; }} className={`${bgInput} px-3 py-1 rounded text-sm ${textMain} flex items-center gap-2 animate-in zoom-in duration-200 cursor-move shadow-sm border ${border}`}>
                  <GripVertical size={12} className={textSec} /><span>{item.name}</span>
                  <button onClick={() => setLists(lists.map(l => l.id === activeListId ? { ...l, items: l.items.filter(i => i.id !== item.id) } : l))} className={`${textSec} hover:text-red-400 ml-1`}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={!!addingToTier} onClose={() => setAddingToTier(null)} title={`Eintrag für Tier ${addingToTier}`}>
        <div className="space-y-4"><Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Name" autoFocus /><Button onClick={handleAddItem} className="w-full">Hinzufügen</Button></div>
      </Modal>
    </div>
  );
};

// ==========================================
// 6. MAIN APP SHELL
// ==========================================

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { mode, setMode, accentKey, setAccentKey, bgInput, textMain, textSec, border } = useTheme();
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getExportData = () => JSON.stringify({ 
    notes: JSON.parse(localStorage.getItem('lb_notes') || '[]'), 
    tierlists: JSON.parse(localStorage.getItem('lb_tierlists') || '[]'), 
    labels: JSON.parse(localStorage.getItem('lb_labels') || '[]'), 
    exportDate: new Date().toISOString(), version: '1.2' 
  });

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(getExportData()).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handlePasteImport = () => {
    try {
        const data = JSON.parse(importText);
        if (confirm("Dies wird deine aktuellen Daten überschreiben. Sicher?")) {
            if (data.notes) localStorage.setItem('lb_notes', JSON.stringify(data.notes));
            if (data.tierlists) localStorage.setItem('lb_tierlists', JSON.stringify(data.tierlists));
            if (data.labels) localStorage.setItem('lb_labels', JSON.stringify(data.labels));
            alert("Daten erfolgreich importiert!");
            window.location.reload();
        }
    } catch {
        alert("Ungültiges Datenformat.");
    }
  };

  const handleFileExport = () => {
    const blob = new Blob([getExportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `LifeBase_Backup_${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (confirm("Dies wird deine aktuellen Daten überschreiben. Sicher?")) {
          if (data.notes) localStorage.setItem('lb_notes', JSON.stringify(data.notes));
          if (data.tierlists) localStorage.setItem('lb_tierlists', JSON.stringify(data.tierlists));
          if (data.labels) localStorage.setItem('lb_labels', JSON.stringify(data.labels));
          alert("Daten erfolgreich importiert!"); window.location.reload();
        }
      } catch { alert("Fehler beim Importieren."); }
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Einstellungen">
      <div className="space-y-8">
        
        {/* Quick Sync Section */}
        <div className="space-y-3">
            <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>Schnell-Transfer (Zwischenablage)</h4>
            <div className="flex gap-2">
                <Button onClick={handleCopyToClipboard} className="flex-1" variant="secondary">
                    {copySuccess ? <Check size={18} className="text-green-500"/> : <Copy size={18} />} 
                    {copySuccess ? "Kopiert!" : "Daten kopieren"}
                </Button>
                <Button onClick={() => setShowImport(!showImport)} className="flex-1" variant="secondary">
                    <Clipboard size={18} /> Einfügen...
                </Button>
            </div>
            
            {showImport && (
                <div className={`p-3 rounded-xl border ${border} ${bgInput} animate-in fade-in slide-in-from-top-2`}>
                    <textarea 
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Füge hier den Code vom anderen Gerät ein..."
                        className={`w-full bg-transparent border-0 text-xs ${textMain} h-20 resize-none focus:outline-none mb-2`}
                    />
                    <Button onClick={handlePasteImport} disabled={!importText} className="w-full h-8 text-xs">Importieren</Button>
                </div>
            )}
            <p className={`text-[10px] ${textSec}`}>
                Kopiere den Code auf dem PC und sende ihn (z.B. per WhatsApp Web) an dein Handy, um ihn dort einzufügen.
            </p>
        </div>

        <div className="space-y-3">
          <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>Datei-Backup</h4>
          <div className="space-y-2">
            <Button onClick={handleFileExport} variant="secondary" className="w-full justify-between"><span>Backup als Datei speichern</span><Download size={18} /></Button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-between"><span>Backup Datei laden</span><Upload size={18} /></Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>Aussehen</h4>
          <div className={`${bgInput} p-1 rounded-xl flex border ${border}`}>
            <button onClick={() => setMode('light')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${mode === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}><Sun size={16} /> Hell</button>
            <button onClick={() => setMode('dark')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${mode === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}><Moon size={16} /> Dunkel</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(accents).map(([key, val]) => (
              <button key={key} onClick={() => setAccentKey(key as AccentKey)} className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${accentKey === key ? `${val.border} ${val.lightBg}` : `${border} ${bgInput} opacity-70 hover:opacity-100`}`}>
                <div className={`w-4 h-4 rounded-full ${val.primary}`}></div><span className={`text-[10px] font-bold ${textMain}`}>{val.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="text-yellow-500 shrink-0" size={20} /><p className="text-xs text-yellow-600 dark:text-yellow-200/80">Daten werden lokal auf diesem Gerät gespeichert. Erstelle regelmäßig Backups.</p>
        </div>
      </div>
    </Modal>
  );
};

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'notes' | 'tierlist'>('notes');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { bgMain, border, textMain, textSec, accent } = useTheme();

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans transition-colors duration-200 selection:bg-opacity-30`}>
      <header className={`${bgMain}/90 backdrop-blur-md sticky top-0 z-10 border-b ${border} px-4 py-3 flex justify-between items-center transition-colors duration-200`}>
        <div className="flex items-center gap-3"><div className={`w-8 h-8 bg-gradient-to-br ${accent.gradient} rounded-lg flex items-center justify-center font-bold text-white shadow-lg`}>LB</div><h1 className={`text-lg font-bold tracking-tight ${textMain}`}>LifeBase</h1></div>
        <button onClick={() => setIsSettingsOpen(true)} className={`${textSec} hover:${textMain} transition-colors`}><Settings size={24} /></button>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        {currentTab === 'notes' && <NotesView />}
        {currentTab === 'tierlist' && <TierListView />}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <nav className={`fixed bottom-0 left-0 right-0 ${bgMain} border-t ${border} pb-safe transition-colors duration-200`}>
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <button onClick={() => setCurrentTab('notes')} className={`p-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'notes' ? accent.text : `${textSec} hover:${textMain}`}`}><StickyNote size={24} strokeWidth={currentTab === 'notes' ? 2.5 : 2} /><span className="text-[10px] font-medium">Notizen</span></button>
          <button onClick={() => setCurrentTab('tierlist')} className={`p-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'tierlist' ? accent.text : `${textSec} hover:${textMain}`}`}><List size={24} strokeWidth={currentTab === 'tierlist' ? 2.5 : 2} /><span className="text-[10px] font-medium">Tiers</span></button>
        </div>
      </nav>
      <style>{`.pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } ::selection { background-color: ${accent.primary}; color: white; }`}</style>
    </div>
  );
};

export default () => <ThemeProvider><AppContent /></ThemeProvider>;