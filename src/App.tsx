import React, { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { 
  StickyNote, 
  List, 
  Plus, 
  Trash2, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Settings,
  Menu,
  GripVertical,
  Download,
  Upload,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';

// --- Type Definitions ---

type ThemeMode = 'dark' | 'light';
type AccentKey = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';

interface AccentProfile {
  name: string;
  primary: string;
  hover: string;
  text: string;
  ring: string;
  lightBg: string;
  border: string;
  gradient: string;
}

interface ThemeProfile {
  bgMain: string;
  bgCard: string;
  bgInput: string;
  textMain: string;
  textSec: string;
  border: string;
  modalOverlay: string;
}

interface ThemeContextType extends ThemeProfile {
  accent: AccentProfile;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accentKey: AccentKey;
  setAccentKey: (key: AccentKey) => void;
}

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  date: string;
}

interface TierItem {
  id: number;
  name: string;
  tier: string;
}

interface TierList {
  id: number;
  title: string;
  items: TierItem[];
}

interface ExportData {
  notes: Note[];
  tierlists: TierList[];
  exportDate: string;
  version: string;
}

// --- Theme System ---

const themes: Record<ThemeMode, ThemeProfile> = {
  dark: {
    bgMain: 'bg-black',
    bgCard: 'bg-gray-900',
    bgInput: 'bg-gray-900',
    textMain: 'text-gray-100',
    textSec: 'text-gray-400',
    border: 'border-gray-800',
    modalOverlay: 'bg-black/90',
  },
  light: {
    bgMain: 'bg-gray-50',
    bgCard: 'bg-white',
    bgInput: 'bg-gray-100',
    textMain: 'text-gray-900',
    textSec: 'text-gray-500',
    border: 'border-gray-200',
    modalOverlay: 'bg-gray-900/20',
  }
};

const accents: Record<AccentKey, AccentProfile> = {
  indigo: {
    name: 'Zen Indigo',
    primary: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-500',
    ring: 'focus:ring-indigo-500',
    lightBg: 'bg-indigo-500/20',
    border: 'border-indigo-500',
    gradient: 'from-indigo-500 to-purple-600'
  },
  rose: {
    name: 'Rose Red',
    primary: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    text: 'text-rose-500',
    ring: 'focus:ring-rose-500',
    lightBg: 'bg-rose-500/20',
    border: 'border-rose-500',
    gradient: 'from-rose-500 to-pink-600'
  },
  emerald: {
    name: 'Emerald',
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-500',
    ring: 'focus:ring-emerald-500',
    lightBg: 'bg-emerald-500/20',
    border: 'border-emerald-500',
    gradient: 'from-emerald-500 to-teal-600'
  },
  amber: {
    name: 'Amber',
    primary: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    text: 'text-amber-500',
    ring: 'focus:ring-amber-500',
    lightBg: 'bg-amber-500/20',
    border: 'border-amber-500',
    gradient: 'from-amber-500 to-orange-600'
  },
  cyan: {
    name: 'Cyan Future',
    primary: 'bg-cyan-600',
    hover: 'hover:bg-cyan-700',
    text: 'text-cyan-500',
    ring: 'focus:ring-cyan-500',
    lightBg: 'bg-cyan-500/20',
    border: 'border-cyan-500',
    gradient: 'from-cyan-500 to-blue-600'
  },
  violet: {
    name: 'Violet',
    primary: 'bg-violet-600',
    hover: 'hover:bg-violet-700',
    text: 'text-violet-500',
    ring: 'focus:ring-violet-500',
    lightBg: 'bg-violet-500/20',
    border: 'border-violet-500',
    gradient: 'from-violet-500 to-fuchsia-600'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('lb_theme_mode') as ThemeMode) || 'dark');
  const [accentKey, setAccentKey] = useState<AccentKey>(() => (localStorage.getItem('lb_theme_accent') as AccentKey) || 'indigo');

  useEffect(() => {
    localStorage.setItem('lb_theme_mode', mode);
    localStorage.setItem('lb_theme_accent', accentKey);
  }, [mode, accentKey]);

  const theme = {
    ...themes[mode],
    accent: accents[accentKey],
    mode,
    setMode,
    accentKey,
    setAccentKey
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
  const { bgCard, textMain, textSec, border, accent } = useTheme();
  
  const baseStyle = "px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: `${accent.primary} text-white shadow-lg hover:opacity-90`,
    secondary: `${bgCard} ${textMain} border ${border} hover:brightness-110`,
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    ghost: `bg-transparent ${textSec} hover:${textMain} hover:${bgCard}`
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, className = '', autoFocus = false }) => {
  const { bgInput, border, textMain, textSec, accent } = useTheme();
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`w-full ${bgInput} border ${border} rounded-xl px-4 py-3 ${textMain} placeholder:${textSec} focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all ${className}`}
    />
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const { bgCard, border, textMain, textSec, modalOverlay } = useTheme();
  
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${modalOverlay} backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`${bgCard} w-full max-w-md rounded-2xl border ${border} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className={`flex items-center justify-between p-4 border-b ${border}`}>
          <h3 className={`text-lg font-bold ${textMain}`}>{title}</h3>
          <button onClick={onClose} className={`${textSec} hover:${textMain}`}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Feature: Notes ---

const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('lb_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Omit<Note, 'id' | 'date'>>({ title: '', content: '', color: 'bg-yellow-200' });
  const { textMain, textSec } = useTheme();

  useEffect(() => localStorage.setItem('lb_notes', JSON.stringify(notes)), [notes]);

  const addNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) return;
    setNotes([{ ...currentNote, id: Date.now(), date: new Date().toLocaleDateString() }, ...notes]);
    setCurrentNote({ title: '', content: '', color: 'bg-yellow-200' });
    setIsModalOpen(false);
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const colors = [
    { bg: 'bg-yellow-200', text: 'text-yellow-900' },
    { bg: 'bg-green-200', text: 'text-green-900' },
    { bg: 'bg-blue-200', text: 'text-blue-900' },
    { bg: 'bg-purple-200', text: 'text-purple-900' },
    { bg: 'bg-red-200', text: 'text-red-900' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textMain}`}>My Notes</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> New Note
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {notes.length === 0 && (
          <div className={`col-span-2 text-center py-20 ${textSec} flex flex-col items-center`}>
            <StickyNote size={48} className="mb-4 opacity-20" />
            <p>No notes yet. Tap 'New Note' to start.</p>
          </div>
        )}
        {notes.map(note => {
          const theme = colors.find(c => c.bg === note.color) || colors[0];
          return (
            <div key={note.id} className={`${note.color} p-4 rounded-xl shadow-sm flex flex-col min-h-[160px] relative group transition-transform active:scale-95`}>
              <h3 className={`font-bold text-lg mb-2 ${theme.text} line-clamp-1`}>{note.title}</h3>
              <p className={`text-sm ${theme.text} opacity-80 line-clamp-4 flex-grow whitespace-pre-wrap`}>{note.content}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${theme.text} opacity-60`}>{note.date}</span>
                <button onClick={() => deleteNote(note.id)} className={`p-2 rounded-full hover:bg-black/10 ${theme.text}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Note">
        <div className="space-y-4">
          <Input 
            value={currentNote.title} 
            onChange={(v) => setCurrentNote({...currentNote, title: v})} 
            placeholder="Title (e.g., Game Ideas)" 
          />
          <textarea
            value={currentNote.content}
            onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
            placeholder="Write your thoughts here..."
            className={`w-full bg-transparent border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 h-32 resize-none ${useTheme().bgInput} ${useTheme().border} ${useTheme().textMain} ${useTheme().accent.ring}`}
          />
          <div className="flex gap-2 justify-center">
            {colors.map((c) => (
              <button
                key={c.bg}
                onClick={() => setCurrentNote({...currentNote, color: c.bg})}
                className={`w-8 h-8 rounded-full ${c.bg} border-2 ${currentNote.color === c.bg ? 'border-black/50 scale-110' : 'border-transparent'}`}
              />
            ))}
          </div>
          <Button onClick={addNote} className="w-full">Save Note</Button>
        </div>
      </Modal>
    </div>
  );
};

// --- Feature: Tier Lists ---

const TierListView: React.FC = () => {
  const [lists, setLists] = useState<TierList[]>(() => {
    const saved = localStorage.getItem('lb_tierlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingToTier, setAddingToTier] = useState<string | null>(null); 
  const [newItemName, setNewItemName] = useState('');
  const [draggedItem, setDraggedItem] = useState<TierItem | null>(null);
  const { bgCard, border, textMain, textSec, accent, bgInput } = useTheme();

  useEffect(() => {
    localStorage.setItem('lb_tierlists', JSON.stringify(lists));
  }, [lists]);

  const createList = () => {
    if (!newListTitle.trim()) return;
    const newList: TierList = {
      id: Date.now(),
      title: newListTitle,
      items: [] 
    };
    setLists([newList, ...lists]);
    setActiveListId(newList.id);
    setNewListTitle('');
    setIsCreateModalOpen(false);
  };

  const deleteList = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLists(lists.filter(l => l.id !== id));
    if (activeListId === id) setActiveListId(null);
  };

  const activeList = lists.find(l => l.id === activeListId);

  const addItem = () => {
    if (!newItemName.trim() || !addingToTier) return;
    const updatedLists = lists.map(list => {
        if (list.id === activeListId) {
            return {
                ...list,
                items: [...list.items, { id: Date.now(), name: newItemName, tier: addingToTier }]
            };
        }
        return list;
    });
    setLists(updatedLists);
    setNewItemName('');
    setAddingToTier(null);
  };

  const moveItem = (itemId: number, direction: 'up' | 'down') => {
      const tiers = ['S', 'A', 'B', 'C', 'D'];
      const updatedLists = lists.map(list => {
          if (list.id === activeListId) {
              return {
                  ...list,
                  items: list.items.map(item => {
                      if (item.id === itemId) {
                          const currentIdx = tiers.indexOf(item.tier);
                          let newIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
                          if (newIdx < 0) newIdx = 0;
                          if (newIdx >= tiers.length) newIdx = tiers.length - 1;
                          return { ...item, tier: tiers[newIdx] };
                      }
                      return item;
                  })
              };
          }
          return list;
      });
      setLists(updatedLists);
  };

  const deleteItem = (itemId: number) => {
      const updatedLists = lists.map(list => {
          if (list.id === activeListId) {
              return { ...list, items: list.items.filter(i => i.id !== itemId) };
          }
          return list;
      });
      setLists(updatedLists);
  };

  const handleDragStart = (e: React.DragEvent, item: TierItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetTier: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.tier === targetTier) {
        setDraggedItem(null);
        return;
    }
    const updatedLists = lists.map(list => {
      if (list.id === activeListId) {
          return {
              ...list,
              items: list.items.map(item => 
                item.id === draggedItem.id ? { ...item, tier: targetTier } : item
              )
          };
      }
      return list;
    });
    setLists(updatedLists);
    setDraggedItem(null);
  };

  if (!activeList) {
    return (
      <div className="space-y-6 pb-24">
         <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${textMain}`}>My Tier Lists</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={20} /> New List
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {lists.length === 0 && (
                 <div className={`text-center py-10 ${textSec}`}>
                    <List size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No tier lists yet.</p>
                </div>
            )}
            {lists.map(list => (
                <div 
                    key={list.id} 
                    onClick={() => setActiveListId(list.id)}
                    className={`${bgCard} p-4 rounded-xl flex items-center justify-between hover:brightness-105 active:scale-95 transition-all cursor-pointer border ${border}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${accent.lightBg} ${accent.text}`}>
                            <List size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${textMain}`}>{list.title}</h3>
                            <p className={`text-sm ${textSec}`}>{list.items.length} items</p>
                        </div>
                    </div>
                    <button onClick={(e) => deleteList(e, list.id)} className={`${textSec} hover:text-red-400 p-2`}>
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
        </div>

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Tier List">
            <div className="space-y-4">
                <Input value={newListTitle} onChange={setNewListTitle} placeholder="List Name (e.g., Best RPGs)" />
                <Button onClick={createList} className="w-full">Create</Button>
            </div>
        </Modal>
      </div>
    );
  }

  const tiers = [
      { id: 'S', color: 'bg-red-500' },
      { id: 'A', color: 'bg-orange-500' },
      { id: 'B', color: 'bg-yellow-500' },
      { id: 'C', color: 'bg-green-500' },
      { id: 'D', color: 'bg-blue-500' },
  ];

  return (
      <div className="pb-24">
          <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setActiveListId(null)} className={`${textSec} hover:${textMain}`}>
                  <Menu size={24} /> 
              </button>
              <h2 className={`text-xl font-bold ${textMain} flex-1 truncate`}>{activeList.title}</h2>
          </div>

          <div className="space-y-2">
              {tiers.map(tier => (
                  <div 
                    key={tier.id} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, tier.id)}
                    className={`flex min-h-[80px] ${bgCard} rounded-lg overflow-hidden border ${border} transition-colors hover:border-opacity-50`}
                  >
                      <div className={`${tier.color} w-14 flex flex-col items-center justify-center flex-shrink-0 gap-1 py-2`}>
                          <span className="text-xl font-black text-black/50">{tier.id}</span>
                          <button 
                            onClick={() => setAddingToTier(tier.id)}
                            className="bg-black/20 hover:bg-black/40 text-white rounded p-0.5 transition-colors"
                          >
                              <Plus size={14} />
                          </button>
                      </div>
                      
                      <div className="p-2 flex-1 flex flex-wrap gap-2 content-start">
                          {activeList.items.filter(i => i.tier === tier.id).map(item => (
                              <div 
                                key={item.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                className={`${bgInput} px-3 py-1 rounded text-sm ${textMain} flex items-center gap-2 animate-in zoom-in duration-200 cursor-move shadow-sm border ${border}`}
                              >
                                  <GripVertical size={12} className={textSec} />
                                  <span>{item.name}</span>
                                  
                                  <div className={`flex flex-col gap-0.5 border-l ${border} pl-1 ml-1`}>
                                      <button onClick={() => moveItem(item.id, 'up')} disabled={tier.id === 'S'} className={`hover:${accent.text} disabled:opacity-20`}><ChevronUp size={10}/></button>
                                      <button onClick={() => moveItem(item.id, 'down')} disabled={tier.id === 'D'} className={`hover:${accent.text} disabled:opacity-20`}><ChevronDown size={10}/></button>
                                  </div>
                                  <button onClick={() => deleteItem(item.id)} className={`${textSec} hover:text-red-400 ml-1`}><X size={12}/></button>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
          
          <Modal isOpen={!!addingToTier} onClose={() => setAddingToTier(null)} title={`Add to Tier ${addingToTier}`}>
            <div className="space-y-4">
                <Input 
                    value={newItemName} 
                    onChange={setNewItemName} 
                    placeholder="Item Name" 
                    autoFocus
                />
                <Button onClick={addItem} className="w-full">Add Item</Button>
            </div>
          </Modal>
      </div>
  );
};

// --- Feature: Settings / Data Management ---

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mode, setMode, accentKey, setAccentKey, bgInput, textMain, textSec, border } = useTheme();

  const exportData = () => {
    const data: ExportData = {
      notes: JSON.parse(localStorage.getItem('lb_notes') || '[]'),
      tierlists: JSON.parse(localStorage.getItem('lb_tierlists') || '[]'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeBase_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        if (!Array.isArray(data.notes) && !Array.isArray(data.tierlists)) throw new Error('Invalid format');
        if (confirm("This will overwrite your current data. Are you sure?")) {
          if (data.notes) localStorage.setItem('lb_notes', JSON.stringify(data.notes));
          if (data.tierlists) localStorage.setItem('lb_tierlists', JSON.stringify(data.tierlists));
          alert("Data imported successfully!");
          window.location.reload();
        }
      } catch (err) {
        alert("Error importing file: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-8">
        
        {/* Appearance Section */}
        <div className="space-y-3">
           <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>Appearance</h4>
           
           <div className={`${bgInput} p-1 rounded-xl flex border ${border}`}>
              <button 
                onClick={() => setMode('light')} 
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${mode === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
              >
                <Sun size={16} /> Light
              </button>
              <button 
                onClick={() => setMode('dark')} 
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${mode === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <Moon size={16} /> Dark
              </button>
           </div>

           <div className="grid grid-cols-3 gap-2">
              {Object.entries(accents).map(([key, val]) => (
                <button 
                  key={key}
                  onClick={() => setAccentKey(key as AccentKey)}
                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${accentKey === key ? `${val.border} ${val.lightBg}` : `${border} ${bgInput} opacity-70 hover:opacity-100`}`}
                >
                  <div className={`w-4 h-4 rounded-full ${val.primary}`}></div>
                  <span className={`text-[10px] font-bold ${textMain}`}>{val.name}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Data Section */}
        <div className="space-y-3">
            <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>Data</h4>
            <div className="space-y-2">
                <Button onClick={exportData} variant="secondary" className="w-full justify-between">
                    <span>Export Backup</span>
                    <Download size={18} />
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-between">
                    <span>Import Backup</span>
                    <Upload size={18} />
                </Button>
            </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start">
            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
            <p className="text-xs text-yellow-600 dark:text-yellow-200/80">
                Data is stored on this device. Export regularly to keep it safe.
            </p>
        </div>

      </div>
    </Modal>
  );
};

// --- Main App Shell ---

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'notes' | 'tierlist'>('notes'); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { bgMain, border, textMain, textSec, accent } = useTheme();

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans transition-colors duration-200 selection:bg-opacity-30`}>
      {/* Top Bar */}
      <header className={`${bgMain}/90 backdrop-blur-md sticky top-0 z-10 border-b ${border} px-4 py-3 flex justify-between items-center transition-colors duration-200`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${accent.gradient} rounded-lg flex items-center justify-center font-bold text-white shadow-lg`}>
            LB
          </div>
          <h1 className={`text-lg font-bold tracking-tight ${textMain}`}>
            LifeBase
          </h1>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className={`${textSec} hover:${textMain} transition-colors`}>
            <Settings size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        {currentTab === 'notes' && <NotesView />}
        {currentTab === 'tierlist' && <TierListView />}
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${bgMain} border-t ${border} pb-safe transition-colors duration-200`}>
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <button 
            onClick={() => setCurrentTab('notes')}
            className={`p-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'notes' ? accent.text : `${textSec} hover:${textMain}`}`}
          >
            <StickyNote size={24} strokeWidth={currentTab === 'notes' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Notes</span>
          </button>
          
          <button 
            onClick={() => setCurrentTab('tierlist')}
            className={`p-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'tierlist' ? accent.text : `${textSec} hover:${textMain}`}`}
          >
            <List size={24} strokeWidth={currentTab === 'tierlist' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Tiers</span>
          </button>
        </div>
      </nav>
      
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        ::selection { background-color: ${accent.primary}; color: white; }
      `}</style>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;