import React, { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
import { 
  StickyNote, Plus, Trash2, X, Settings, 
  Pencil, Tag, Search, Cloud, CloudOff, LogOut, Lock,
  Eye, Edit3, RefreshCw, Archive, Pin, Camera
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. CLOUD CONFIGURATION
// ==========================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. TYPES
// ==========================================
type ThemeMode = 'dark' | 'light';
type AccentKey = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';
type Language = 'de' | 'en' | 'tr';

interface Label { id: string; name: string; color: string; textColor: string; }
interface Note { id: number; title: string; content: string; labelId: string; date: string; isDeleted?: boolean; isPinned?: boolean; }
interface AccentProfile { name: string; primary: string; hover: string; text: string; ring: string; lightBg: string; border: string; gradient: string; }

interface ThemeContextType {
  bgMain: string; bgCard: string; bgInput: string; textMain: string; textSec: string; border: string; modalOverlay: string;
  accent: AccentProfile; mode: ThemeMode; setMode: (m: ThemeMode) => void;
  accentKey: AccentKey; setAccentKey: (k: AccentKey) => void;
  language: Language; setLanguage: (l: Language) => void; t: (k: string) => string;
}

interface DataContextType {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  labels: Label[]; setLabels: React.Dispatch<React.SetStateAction<Label[]>>;
  activeFilters: string[]; setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFilter: (id: string) => void;
  syncStatus: 'synced' | 'syncing' | 'error';
  lastSaved: string | null;
}

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

const dictionary: Record<Language, Record<string, string>> = {
  de: { appTitle: "LifeBase", navNotes: "Notizen", navTrash: "Papierkorb", newNote: "Neue Notiz", titlePlaceholder: "Titel...", contentPlaceholder: "Inhalt (Markdown & Bilder)...", save: "Speichern", settings: "Einstellungen", appearance: "Design", language: "Sprache", login: "Einloggen", logout: "Abmelden", restore: "Wiederherstellen", deletePerm: "Löschen", emptyTrash: "Leeren", lastSaved: "Gespeichert:", unlabeled: "Ohne Label", manageLabels: "Labels verwalten", deleteLabelError: "Min. 1 Label!", deleteLabelConfirm: "Label wirklich löschen?" },
  en: { appTitle: "LifeBase", navNotes: "Notes", navTrash: "Trash", newNote: "New Note", titlePlaceholder: "Title...", contentPlaceholder: "Content (Markdown & Images)...", save: "Save", settings: "Settings", appearance: "Design", language: "Language", login: "Login", logout: "Logout", restore: "Restore", deletePerm: "Delete", emptyTrash: "Empty", lastSaved: "Saved:", unlabeled: "Unlabeled", manageLabels: "Manage Labels", deleteLabelError: "Min 1 label!", deleteLabelConfirm: "Delete label?" },
  tr: { appTitle: "LifeBase", navNotes: "Notlar", navTrash: "Çöp Kutusu", newNote: "Yeni Not", titlePlaceholder: "Başlık...", contentPlaceholder: "İçerik (Markdown ve Resim)...", save: "Kaydet", settings: "Ayarlar", appearance: "Görünüm", language: "Dil", login: "Giriş Yap", logout: "Çıkış Yap", restore: "Geri Yükle", deletePerm: "Sil", emptyTrash: "Boşalt", lastSaved: "Kaydedildi:", unlabeled: "Etiketsiz", manageLabels: "Etiketleri Yönet", deleteLabelError: "En az 1!", deleteLabelConfirm: "Sil?" }
};

const accents: Record<AccentKey, AccentProfile> = {
  indigo: { name: 'Zen Indigo', primary: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-500/20', border: 'border-indigo-500', gradient: 'from-indigo-500 to-purple-600' },
  rose: { name: 'Rose Red', primary: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-500', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-500/20', border: 'border-rose-500', gradient: 'from-rose-500 to-pink-600' },
  emerald: { name: 'Emerald', primary: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-500', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-500/20', border: 'border-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  amber: { name: 'Amber', primary: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-500/20', border: 'border-amber-500', gradient: 'from-amber-500 to-orange-600' },
  cyan: { name: 'Cyan Future', primary: 'bg-cyan-600', hover: 'hover:bg-cyan-700', text: 'text-cyan-500', ring: 'focus:ring-cyan-500', lightBg: 'bg-cyan-500/20', border: 'border-cyan-500', gradient: 'from-cyan-500 to-blue-600' },
  violet: { name: 'Violet', primary: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-500', ring: 'focus:ring-violet-500', lightBg: 'bg-violet-500/20', border: 'border-violet-500', gradient: 'from-violet-500 to-fuchsia-600' }
};

const themes: Record<ThemeMode, any> = {
  dark: { bgMain: 'bg-black', bgCard: 'bg-gray-900', bgInput: 'bg-gray-900', textMain: 'text-gray-100', textSec: 'text-gray-400', border: 'border-gray-800', modalOverlay: 'bg-black/90' },
  light: { bgMain: 'bg-gray-50', bgCard: 'bg-white', bgInput: 'bg-gray-100', textMain: 'text-gray-900', textSec: 'text-gray-500', border: 'border-gray-200', modalOverlay: 'bg-gray-900/20' }
};

// ==========================================
// 3. CONTEXTS & PROVIDERS
// ==========================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

const useTheme = () => { const c = useContext(ThemeContext); if (!c) throw new Error('useTheme missing'); return c; };
const useData = () => { const c = useContext(DataContext); if (!c) throw new Error('useData missing'); return c; };

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('lb_theme_mode') as ThemeMode) || 'dark');
  const [accentKey, setAccentKey] = useState<AccentKey>(() => (localStorage.getItem('lb_theme_accent') as AccentKey) || 'indigo');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lb_language') as Language) || 'en');
  
  useEffect(() => {
    localStorage.setItem('lb_theme_mode', mode);
    localStorage.setItem('lb_theme_accent', accentKey);
    localStorage.setItem('lb_language', language);
  }, [mode, accentKey, language]);

  return <ThemeContext.Provider value={{ ...themes[mode], accent: accents[accentKey], mode, setMode, accentKey, setAccentKey, language, setLanguage, t: (k) => dictionary[language][k] || k }}>{children}</ThemeContext.Provider>;
};

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>(defaultLabels);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus('syncing');
      try {
        const { data, error } = await supabase.from('app_data').select('*').eq('id', 1).single();
        if (data && !error) {
          setNotes(data.notes || []);
          setLabels(data.labels || defaultLabels);
          setSyncStatus('synced');
        } else setSyncStatus('error');
      } catch { setSyncStatus('error'); }
      isInitialLoad.current = false;
    };
    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase.channel('db-sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_data' }, (payload: any) => {
      if (payload.new) {
        setNotes(payload.new.notes);
        setLabels(payload.new.labels);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const save = async () => {
      setSyncStatus('syncing');
      const { error } = await supabase.from('app_data').update({ notes, labels, updated_at: new Date().toISOString() }).eq('id', 1);
      if (!error) {
        setSyncStatus('synced');
        setLastSaved(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
      } else {
        setSyncStatus('error');
      }
    };
    const timer = setTimeout(save, 1000);
    return () => clearTimeout(timer);
  }, [notes, labels]);

  const toggleFilter = (id: string) => setActiveFilters(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);

  return <DataContext.Provider value={{ notes, setNotes, labels, setLabels, activeFilters, setActiveFilters, toggleFilter, syncStatus, lastSaved }}>{children}</DataContext.Provider>;
};

// ==========================================
// 4. UI COMPONENTS
// ==========================================
const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let html = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-2 max-w-full h-auto shadow-lg" />')
      .replace(/`([^`]+)`/g, '<code class="bg-black/20 rounded px-1 text-sm">$1</code>');

    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-4 mb-2">{html.substring(2)}</h1>;
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{__html: html.substring(2)}} />;
    return <p key={i} className="min-h-[1.2rem]" dangerouslySetInnerHTML={{__html: html}} />;
  });
};

const Button: React.FC<any> = ({ children, variant = 'primary', className = '', ...props }) => {
  const { bgCard, textMain, textSec, border, accent } = useTheme();
  const variants: any = { primary: `${accent.primary} text-white shadow-md`, secondary: `${bgCard} ${textMain} border ${border}`, danger: "bg-red-500/10 text-red-500 font-bold", ghost: `${textSec} hover:${textMain}` };
  return <button className={`px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Input: React.FC<any> = (props) => {
  const { bgInput, border, textMain, textSec, accent } = useTheme();
  return <input className={`w-full ${bgInput} border ${border} rounded-xl px-4 py-3 ${textMain} placeholder:${textSec} focus:outline-none focus:ring-2 ${accent.ring} transition-all ${props.className}`} {...props} />;
};

const Modal: React.FC<any> = ({ isOpen, onClose, title, children, customTheme }) => {
  const { bgCard, border, textMain, textSec, modalOverlay } = useTheme();
  if (!isOpen) return null;
  const finalBg = customTheme ? customTheme.bg : bgCard;
  const finalText = customTheme ? customTheme.text : textMain;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${modalOverlay} backdrop-blur-sm animate-in fade-in`}>
      <div className={`${finalBg} w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border ${customTheme ? 'border-transparent' : border} shadow-2xl overflow-hidden`}>
        <div className={`flex justify-between p-5 border-b ${customTheme ? 'border-black/10' : border}`}>
          <h3 className={`font-bold text-lg ${finalText}`}>{title}</h3>
          <button onClick={onClose} className={`hover:bg-black/10 p-1 rounded-lg transition-colors ${customTheme ? finalText : textSec}`}><X size={20}/></button>
        </div>
        <div className={`p-5 overflow-y-auto ${finalText}`}>{children}</div>
      </div>
    </div>
  );
};

const LabelManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { bgInput, border, textSec, textMain, bgCard, accent, t } = useTheme();
  const { labels, setLabels, setNotes } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => { 
    if (!name.trim()) return; 
    if (editingId) { 
      setLabels(prev => prev.map(l => l.id === editingId ? { ...l, name, color: color.bg, textColor: color.text } : l));
      setEditingId(null); 
    } else { 
      setLabels(prev => [...prev, { id: Date.now().toString(), name, color: color.bg, textColor: color.text }]); 
    } 
    setName(''); 
  };

  const handleDelete = (id: string) => { 
    if (labels.length <= 1) return alert(t('deleteLabelError')); 
    if (!confirm(t('deleteLabelConfirm'))) return; 
    setLabels(prev => prev.filter(l => l.id !== id));
    setNotes(prev => prev.map(n => n.labelId === id ? { ...n, labelId: '' } : n));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('manageLabels')}>
      <div className="space-y-6">
        <div className={`p-4 rounded-xl border ${border} ${bgInput}`}>
          <div className="flex gap-2 mb-3">
            <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Name..." className="text-sm py-2" />
            <Button onClick={handleSave} disabled={!name.trim()} className="py-2 px-4">{editingId ? 'Ok' : <Plus size={18} />}</Button>
            {editingId && <Button onClick={() => { setEditingId(null); setName(''); }} variant="ghost" className="py-2 px-3"><X size={18} /></Button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(c => <button key={c.name} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-transform ${color.bg === c.bg ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />)}
          </div>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {labels.map(l => (
            <div key={l.id} className={`flex items-center justify-between p-3 rounded-lg border ${border} ${bgCard}`}>
              <div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full ${l.color}`}></div><span className={`font-medium ${textMain}`}>{l.name}</span></div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(l.id); setName(l.name); setColor(availableColors.find(c => c.bg === l.color) || availableColors[0]); }} className={`${textSec} hover:${accent.text} p-2`}><Pencil size={16}/></button>
                <button onClick={() => handleDelete(l.id)} className={`${textSec} hover:text-red-400 p-2`}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// ==========================================
// 5. MAIN LAYOUT
// ==========================================
const MainLayout = () => {
  const { bgMain, bgCard, border, textMain, textSec, accent, t, bgInput, mode, setMode, language, setLanguage } = useTheme();
  const { notes, setNotes, labels, activeFilters, toggleFilter, syncStatus, lastSaved } = useData();
  
  const [currentTab, setCurrentTab] = useState<'notes' | 'trash'>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  const activeNotes = notes.filter(n => !n.isDeleted).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  const trashNotes = notes.filter(n => n.isDeleted);
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const displayNotes = currentTab === 'notes' ? activeNotes : trashNotes;
  const filteredNotes = displayNotes.filter(n => 
    (activeFilters.length === 0 || activeFilters.includes(n.labelId || 'unlabeled')) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
  );

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNoteId && currentTab === 'notes') {
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: true} : n));
        setSelectedNoteId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const id = Date.now();
        setNotes(prev => [{id, title:'', content:'', labelId: '', date: new Date().toLocaleDateString()}, ...prev]);
        setSelectedNoteId(id);
        setIsPreview(false);
      }
      if (e.key === 'Escape' && selectedNoteId) {
        setSelectedNoteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, setNotes, currentTab]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNoteId) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('note-images').upload(fileName, file);
    if (error) { alert("Upload fehlgeschlagen."); return; }
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(fileName);
      const imgMarkdown = `\n![image](${publicUrl})\n`;
      setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, content: n.content + imgMarkdown} : n));
    }
  };

  return (
    <div className={`min-h-screen flex ${bgMain} ${textMain} font-sans overflow-hidden`}>
      {/* SIDEBAR */}
      <aside className={`w-20 md:w-64 border-r ${border} flex flex-col ${bgCard}`}>
        <div className="p-6 font-bold text-xl flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl ${accent.primary} flex items-center justify-center text-white shadow-lg`}>LB</div>
          <span className="hidden md:block">LifeBase</span>
        </div>
        
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
          <button onClick={() => {setCurrentTab('notes'); setSelectedNoteId(null);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'notes' ? accent.lightBg + ' ' + accent.text : textSec + ' hover:' + bgMain}`}><StickyNote size={20}/> <span className="hidden md:block font-medium">{t('navNotes')}</span></button>
          <button onClick={() => {setCurrentTab('trash'); setSelectedNoteId(null);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'trash' ? 'bg-red-500/10 text-red-500' : textSec + ' hover:' + bgMain}`}><Archive size={20}/> <span className="hidden md:block font-medium">{t('navTrash')}</span></button>
          
          {currentTab === 'notes' && (
            <div className="hidden md:block">
              <div className={`pt-6 pb-2 px-3 text-xs font-bold uppercase tracking-wider ${textSec} flex justify-between items-center`}>
                Labels <button onClick={() => setIsLabelManagerOpen(true)} className={`hover:${textMain}`}><Settings size={14}/></button>
              </div>
              <button onClick={() => toggleFilter('unlabeled')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeFilters.includes('unlabeled') ? 'bg-black/10 dark:bg-white/10' : textSec + ' hover:' + bgMain}`}><Tag size={14}/> {t('unlabeled')}</button>
              {labels.map(l => (
                <button key={l.id} onClick={() => toggleFilter(l.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeFilters.includes(l.id) ? l.color + ' ' + l.textColor + ' font-bold' : textSec + ' hover:' + bgMain}`}>
                  <div className={`w-3 h-3 rounded-full ${l.color}`}/> <span className="truncate">{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
        
        <div className={`p-4 border-t ${border}`}><button onClick={() => setIsSettingsOpen(true)} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${textSec} hover:${textMain} hover:${bgMain}`}><Settings size={20}/> <span className="hidden md:block">{t('settings')}</span></button></div>
      </aside>

      {/* LIST COLUMN */}
      <div className={`w-full md:w-80 border-r ${border} flex flex-col ${selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className={`p-4 border-b ${border} flex gap-2`}>
          <div className="relative flex-1"><Search size={16} className={`absolute left-3 top-3 ${textSec}`}/><input value={search} onChange={e => setSearch(e.target.value)} className={`w-full ${bgInput} rounded-xl pl-10 pr-4 py-2 text-sm outline-none ${textMain}`} placeholder="Suche..."/></div>
          <button onClick={() => { const id = Date.now(); setNotes(prev => [{id, title:'', content:'', labelId:'', date:new Date().toLocaleDateString()}, ...prev]); setSelectedNoteId(id); setIsPreview(false); }} className={`p-2 rounded-xl ${accent.primary} text-white`}><Plus/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotes.map(n => {
            const l = labels.find(lab => lab.id === n.labelId);
            return (
              <div key={n.id} onClick={() => setSelectedNoteId(n.id)} className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedNoteId === n.id ? accent.border + ' shadow-md scale-[1.02]' : 'border-transparent hover:border-gray-500/30'} ${l ? l.color + ' ' + l.textColor : bgCard} ${currentTab === 'trash' ? 'opacity-50 grayscale' : ''}`}>
                {l && <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">{l.name}</div>}
                <div className="flex justify-between items-center"><h4 className="font-bold truncate">{n.title || 'Untitled'}</h4>{n.isPinned && <Pin size={14} fill="currentColor"/>}</div>
                <p className="text-xs opacity-70 truncate mt-1">{n.content || 'Kein Inhalt...'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDITOR COLUMN */}
      <main className={`flex-1 flex flex-col relative ${selectedNoteId ? 'flex' : 'hidden md:flex'}`}>
        {selectedNote ? (
          <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full flex flex-col gap-4 overflow-y-auto">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isPinned: !n.isPinned} : n))} className={`p-2 rounded-xl transition-colors ${selectedNote.isPinned ? 'bg-yellow-500/20 text-yellow-500' : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10'}`}><Pin size={20}/></button>
                <button onClick={() => setIsPreview(!isPreview)} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10">{isPreview ? <Edit3 size={20}/> : <Eye size={20}/>}</button>
                {!isPreview && currentTab === 'notes' && <label className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10 cursor-pointer"><Camera size={20}/><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/></label>}
              </div>
              <div className={`flex items-center gap-4 text-xs font-mono ${textSec}`}>
                {syncStatus === 'syncing' ? <RefreshCw size={14} className="animate-spin text-indigo-500"/> : (syncStatus === 'error' ? <CloudOff size={14} className="text-red-500"/> : <Cloud size={14}/>)} {t('lastSaved')} {lastSaved}
                {currentTab === 'trash' ? (
                  <button onClick={() => { setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: false} : n)); setSelectedNoteId(null); }} className="px-3 py-2 bg-green-500/20 text-green-500 rounded-xl font-bold flex gap-2"><RefreshCw size={16}/> {t('restore')}</button>
                ) : (
                  <button onClick={() => { setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: true} : n)); setSelectedNoteId(null); }} className="text-red-400 hover:bg-red-500/10 p-2 rounded-xl"><Trash2 size={20}/></button>
                )}
              </div>
            </div>

            {/* Label Color Selector */}
            {currentTab === 'notes' && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, labelId: ''} : n))} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!selectedNote.labelId ? 'bg-black/20 dark:bg-white/20' : 'bg-black/5 dark:bg-white/5 opacity-50 hover:opacity-100'}`}>Ohne Label</button>
                {labels.map(l => (
                  <button key={l.id} onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, labelId: l.id} : n))} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${l.color} ${l.textColor} ${selectedNote.labelId === l.id ? 'ring-2 ring-black/30 dark:ring-white/50 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}>{l.name}</button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <input disabled={currentTab === 'trash'} value={selectedNote.title} onChange={e => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, title: e.target.value} : n))} className={`text-4xl font-bold bg-transparent outline-none ${currentTab === 'trash' ? textSec : textMain}`} placeholder={t('titlePlaceholder')}/>
            
            {isPreview || currentTab === 'trash' ? (
              <div className={`flex-1 text-lg leading-relaxed space-y-2 ${textSec} overflow-y-auto`}>{renderMarkdown(selectedNote.content)}</div>
            ) : (
              <textarea value={selectedNote.content} onChange={e => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, content: e.target.value} : n))} className={`flex-1 bg-transparent outline-none text-lg resize-none font-mono ${textSec}`} placeholder={t('contentPlaceholder')}/>
            )}
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center opacity-10 ${textMain}`}>
            {currentTab === 'trash' ? <Archive size={120}/> : <StickyNote size={120}/>}
            <p className="mt-4 font-bold tracking-widest uppercase">Keine Auswahl</p>
          </div>
        )}
      </main>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={t('settings')}>
        <div className="space-y-8">
           <div><h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${textSec}`}>{t('appearance')}</h4><div className="flex gap-2"><Button onClick={() => setMode('light')} variant={mode === 'light' ? 'primary' : 'secondary'} className="flex-1">Light</Button><Button onClick={() => setMode('dark')} variant={mode === 'dark' ? 'primary' : 'secondary'} className="flex-1">Dark</Button></div></div>
           <div><h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${textSec}`}>{t('language')}</h4><div className="flex gap-2">{['de', 'en', 'tr'].map(l => <Button key={l} onClick={() => setLanguage(l as any)} variant={language === l ? 'primary' : 'secondary'} className="flex-1 uppercase">{l}</Button>)}</div></div>
           <div className="pt-4 border-t border-red-500/20"><Button onClick={() => supabase.auth.signOut()} variant="danger" className="w-full"><LogOut size={18}/> {t('logout')}</Button></div>
        </div>
      </Modal>
      
      <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} />
    </div>
  );
};

// ==========================================
// 6. AUTH & APP ENTRY
// ==========================================
const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex flex-col items-center mb-6"><div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(79,70,229,0.3)]"><Lock size={32} color="white"/></div><h1 className="text-3xl font-black tracking-tight text-white">LifeBase</h1></div>
        <input className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-colors" type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-colors" type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 mt-2">{loading ? '...' : 'Secure Login'}</button>
      </form>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><RefreshCw className="animate-spin text-indigo-500" size={32}/></div>;

  return (
    <ThemeProvider>
      {!session ? <AuthScreen /> : <DataProvider><MainLayout /></DataProvider>}
    </ThemeProvider>
  );
}