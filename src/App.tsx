import React, { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
import { 
  StickyNote, List, Plus, Trash2, X, 
  Settings, Menu, Download, Upload, 
  Pencil, Tag, Search, Cloud, CloudOff, LogOut, Lock,
  Eye, Edit3, RefreshCw, Archive
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. CLOUD CONFIGURATION
// ==========================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. TYPES & LOGIC
// ==========================================
type ThemeMode = 'dark' | 'light';
type AccentKey = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';
type Language = 'de' | 'en' | 'tr';

interface Label { id: string; name: string; color: string; textColor: string; }
interface Note { id: number; title: string; content: string; labelId: string; date: string; isDeleted?: boolean; }
interface TierItem { id: number; name: string; tier: string; }
interface TierList { id: number; title: string; items: TierItem[]; }
interface AccentProfile { name: string; primary: string; hover: string; text: string; ring: string; lightBg: string; border: string; gradient: string; }

interface ThemeContextType {
  bgMain: string; bgCard: string; bgInput: string; textMain: string; textSec: string; border: string; modalOverlay: string;
  accent: AccentProfile; mode: ThemeMode; setMode: (m: ThemeMode) => void;
  accentKey: AccentKey; setAccentKey: (k: AccentKey) => void;
  language: Language; setLanguage: (l: Language) => void; t: (k: string) => string;
}

interface DataContextType {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  tierlists: TierList[]; setTierlists: React.Dispatch<React.SetStateAction<TierList[]>>;
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
  de: { appTitle: "LifeBase", navNotes: "Notizen", navTiers: "Rankings", navTrash: "Papierkorb", myNotes: "Meine Notizen", new: "Neu", noNotes: "Keine Notizen.", editNote: "Bearbeiten", newNote: "Neue Notiz", titlePlaceholder: "Titel...", contentPlaceholder: "Inhalt (Markdown unterstützt)...", selectLabel: "Label", edit: "Ändern", noLabel: "Kein Label", save: "Speichern", create: "Erstellen", manageLabels: "Labels", newLabel: "Neu", labelNamePlaceholder: "Name", existingLabels: "Vorhandene", deleteLabelConfirm: "Löschen?", deleteLabelError: "Min. 1 Label!", myTierLists: "Rankings", noTierLists: "Keine Listen.", itemsCount: "Einträge", newTierList: "Neue Liste", tierListNamePlaceholder: "Name", tierItemPlaceholder: "Item", addItem: "Dazu", settings: "Einstellungen", appearance: "Design", light: "Hell", dark: "Dunkel", language: "Sprache", quickSync: "Sync", copyData: "Kopieren", copied: "Kopiert", pasteFromClipboard: "Einfügen", pastePlaceholder: "Code...", import: "Import", syncInfo: "Cloud-Synchronisierung ist aktiv.", backup: "Backup", saveToFile: "Speichern", loadFromFile: "Laden", dataInfo: "Daten in Supabase Cloud gespeichert.", overwriteConfirm: "Überschreiben?", importSuccess: "Erfolg!", importError: "Fehler.", autoImportError: "Manuell einfügen:", mergeSuccess: "Neu importiert:", unlabeled: "Labellos", dashboard: "Übersicht", labels: "Labels", login: "Einloggen", logout: "Abmelden", email: "E-Mail", password: "Passwort", restore: "Wiederherstellen", deletePerm: "Endgültig löschen", emptyTrash: "Papierkorb leeren", lastSaved: "Zuletzt gespeichert:" },
  en: { appTitle: "LifeBase", navNotes: "Notes", navTiers: "Rankings", navTrash: "Trash", myNotes: "My Notes", new: "New", noNotes: "No notes.", editNote: "Edit", newNote: "New Note", titlePlaceholder: "Title...", contentPlaceholder: "Content (Markdown supported)...", selectLabel: "Label", edit: "Edit", noLabel: "None", save: "Save", create: "Create", manageLabels: "Labels", newLabel: "New", labelNamePlaceholder: "Name", existingLabels: "Existing", deleteLabelConfirm: "Delete?", deleteLabelError: "Min 1 label!", myTierLists: "Rankings", noTierLists: "No lists.", itemsCount: "items", newTierList: "New List", tierListNamePlaceholder: "Name", tierItemPlaceholder: "Item", addItem: "Add", settings: "Settings", appearance: "Design", light: "Light", dark: "Dark", language: "Language", quickSync: "Sync", copyData: "Copy", copied: "Copied", pasteFromClipboard: "Paste", pastePlaceholder: "Code...", import: "Import", syncInfo: "Cloud Sync is active.", backup: "Backup", saveToFile: "Save", loadFromFile: "Load", dataInfo: "Stored in Supabase Cloud.", overwriteConfirm: "Overwrite?", importSuccess: "Success!", importError: "Error.", autoImportError: "Paste manually:", mergeSuccess: "Imported:", unlabeled: "Unlabeled", dashboard: "Dashboard", labels: "Labels", login: "Login", logout: "Logout", email: "Email", password: "Password", restore: "Restore", deletePerm: "Delete permanently", emptyTrash: "Empty Trash", lastSaved: "Last saved:" },
  tr: { appTitle: "LifeBase", navNotes: "Notlar", navTiers: "Sıralama", navTrash: "Çöp Kutusu", myNotes: "Notlarım", new: "Yeni", noNotes: "Not yok.", editNote: "Düzenle", newNote: "Yeni Not", titlePlaceholder: "Başlık...", contentPlaceholder: "İçerik (Markdown desteklenir)...", selectLabel: "Etiket", edit: "Düzenle", noLabel: "Yok", save: "Kaydet", create: "Oluştur", manageLabels: "Etiketler", newLabel: "Yeni", labelNamePlaceholder: "İsim", existingLabels: "Mevcut", deleteLabelConfirm: "Sil?", deleteLabelError: "En az 1!", myTierLists: "Listeler", noTierLists: "Liste yok.", itemsCount: "öğe", newTierList: "Yeni Liste", tierListNamePlaceholder: "İsim", tierItemPlaceholder: "İsim", addItem: "Ekle", settings: "Ayarlar", appearance: "Görünüm", light: "Açık", dark: "Koyu", language: "Dil", quickSync: "Senk", copyData: "Kopyala", copied: "Kopyalandı", pasteFromClipboard: "Yapıştır", pastePlaceholder: "Kod...", import: "İçe Aktar", syncInfo: "Bulut senkronizasyonu aktif.", backup: "Yedek", saveToFile: "Kaydet", loadFromFile: "Yükle", dataInfo: "Supabase Cloud'da kayıtlı.", overwriteConfirm: "Üzerine yaz?", importSuccess: "Başarılı!", importError: "Hata.", autoImportError: "Manuel yapıştır:", mergeSuccess: "Eklendi:", unlabeled: "Etiketsiz", dashboard: "Panel", labels: "Etiketler", login: "Giriş Yap", logout: "Çıkış Yap", email: "E-posta", password: "Şifre", restore: "Geri Yükle", deletePerm: "Kalıcı olarak sil", emptyTrash: "Çöpü Boşalt", lastSaved: "Son kaydetme:" }
};

const themes: Record<ThemeMode, Omit<ThemeContextType, 'accent' | 'mode' | 'setMode' | 'accentKey' | 'setAccentKey' | 'language' | 'setLanguage' | 't'>> = {
  dark: { bgMain: 'bg-black', bgCard: 'bg-gray-900', bgInput: 'bg-gray-900', textMain: 'text-gray-100', textSec: 'text-gray-400', border: 'border-gray-800', modalOverlay: 'bg-black/90' },
  light: { bgMain: 'bg-gray-50', bgCard: 'bg-white', bgInput: 'bg-gray-100', textMain: 'text-gray-900', textSec: 'text-gray-500', border: 'border-gray-200', modalOverlay: 'bg-gray-900/20' }
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
  const [labels, setLabels] = useState<Label[]>(defaultLabels);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tierlists, setTierlists] = useState<TierList[]>([]);
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
          setLabels(data.labels || defaultLabels);
          setNotes(data.notes || []);
          setTierlists(data.tierlists || []);
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
        setLabels(payload.new.labels);
        setNotes(payload.new.notes);
        setTierlists(payload.new.tierlists);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const save = async () => {
      setSyncStatus('syncing');
      const { error } = await supabase.from('app_data').update({ notes, labels, tierlists, updated_at: new Date().toISOString() }).eq('id', 1);
      if (!error) {
        setSyncStatus('synced');
        setLastSaved(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}));
      } else {
        setSyncStatus('error');
      }
    };
    const timer = setTimeout(save, 1000);
    return () => clearTimeout(timer);
  }, [notes, labels, tierlists]);

  const toggleFilter = (id: string) => setActiveFilters(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  return <DataContext.Provider value={{ notes, setNotes, tierlists, setTierlists, labels, setLabels, activeFilters, setActiveFilters, toggleFilter, syncStatus, lastSaved }}>{children}</DataContext.Provider>;
};

// ==========================================
// 3. UI COMPONENTS & HELPERS
// ==========================================

// Custom Markdown Parser (Dependency Free)
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let html = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-black/20 rounded px-1 text-sm font-mono">$1</code>');

    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={{__html: html.substring(2)}} />;
    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-3 mb-2" dangerouslySetInnerHTML={{__html: html.substring(3)}} />;
    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-2 mb-1" dangerouslySetInnerHTML={{__html: html.substring(4)}} />;
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-gray-500" dangerouslySetInnerHTML={{__html: html.substring(2)}} />;
    
    return <p key={i} className="min-h-[1.5rem]" dangerouslySetInnerHTML={{__html: html}} />;
  });
};

const SyncIndicator = () => {
  const { syncStatus } = useData();
  if (syncStatus === 'syncing') return <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />;
  return syncStatus === 'error' ? <CloudOff className="text-red-500" size={18} /> : <Cloud className="text-green-500" size={18} />;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const { bgCard, textMain, textSec, border, accent } = useTheme();
  const variants = { primary: `${accent.primary} text-white shadow-lg`, secondary: `${bgCard} ${textMain} border ${border}`, success: `bg-green-600 text-white shadow-lg`, danger: "bg-red-500/10 text-red-400", ghost: `bg-transparent ${textSec} hover:${textMain}` };
  return <button className={`px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>{children}</button>;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { bgInput, border, textMain, textSec, accent } = useTheme();
  return <input className={`w-full ${bgInput} border ${border} rounded-xl px-4 py-3 ${textMain} placeholder:${textSec} focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all ${props.className}`} {...props} />;
};

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; customTheme?: { bg: string; text: string }; }
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, customTheme }) => {
  const { bgCard, border, textMain, textSec, modalOverlay } = useTheme();
  const finalBg = customTheme ? customTheme.bg : bgCard;
  const finalText = customTheme ? customTheme.text : textMain;
  const finalBorder = customTheme ? 'border-transparent' : border;
  const closeBtnClass = customTheme ? `hover:bg-black/10 ${customTheme.text}` : `${textSec} hover:${textMain}`;
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${modalOverlay} backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`${finalBg} w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border ${finalBorder} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors duration-300`}>
        <div className={`flex-shrink-0 flex items-center justify-between p-4 border-b ${customTheme ? 'border-black/5' : border}`}>
          <h3 className={`text-lg font-bold ${finalText}`}>{title}</h3>
          <button onClick={onClose} className={closeBtnClass}><X size={20} /></button>
        </div>
        <div className={`p-4 overflow-y-auto ${finalText}`}>{children}</div>
      </div>
    </div>
  );
};

const NoteCard: React.FC<{ note: Note; label: Label; onClick: () => void; onDelete: (e: React.MouseEvent) => void; isTrash?: boolean; onRestore?: (e: React.MouseEvent) => void }> = ({ note, label, onClick, onDelete, isTrash, onRestore }) => (
  <div onClick={onClick} className={`${label.color} p-4 rounded-xl shadow-sm flex flex-col min-h-[160px] relative group transition-transform active:scale-95 cursor-pointer hover:scale-[1.02] hover:shadow-md ${isTrash ? 'opacity-70 grayscale' : ''}`}>
    {label.id !== 'unlabeled' && <div className="flex justify-between items-start mb-2"><span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/30 ${label.textColor}`}>{label.name}</span></div>}
    <h3 className={`font-bold text-lg mb-1 ${label.textColor} line-clamp-1`}>{note.title}</h3>
    <p className={`text-sm ${label.textColor} opacity-80 line-clamp-4 flex-grow whitespace-pre-wrap`}>{note.content}</p>
    <div className="flex justify-between items-center mt-3">
      <span className={`text-[10px] ${label.textColor} opacity-60`}>{note.date}</span>
      <div className="flex gap-1">
        {isTrash && onRestore && <button onClick={onRestore} className={`p-2 rounded-full hover:bg-black/10 ${label.textColor}`}><RefreshCw size={16} /></button>}
        <button onClick={onDelete} className={`p-2 rounded-full hover:bg-black/10 ${label.textColor}`}><Trash2 size={16} /></button>
      </div>
    </div>
  </div>
);

const LabelManager: React.FC<{ isOpen: boolean; onClose: () => void; labels: Label[]; onAdd: (n: string, c: any) => void; onUpdate: (id: string, n: string, c: any) => void; onDelete: (id: string) => void }> = ({ isOpen, onClose, labels, onAdd, onUpdate, onDelete }) => {
  const { bgInput, border, textSec, textMain, bgCard, accent, t } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const startEdit = (l: Label) => { setEditingId(l.id); setName(l.name); setColor(availableColors.find(c => c.bg === l.color) || availableColors[0]); };
  const handleSave = () => { if (!name.trim()) return; if (editingId) { onUpdate(editingId, name, color); setEditingId(null); } else { onAdd(name, color); } setName(''); };
  const handleDelete = (id: string) => { if (labels.length <= 1) return alert(t('deleteLabelError')); if (!confirm(t('deleteLabelConfirm'))) return; onDelete(id); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('manageLabels')}>
      <div className="space-y-6">
        <div className={`p-4 rounded-xl border ${border} ${bgInput}`}><div className="flex gap-2 mb-3"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('labelNamePlaceholder')} className="text-sm py-2" /><Button onClick={handleSave} disabled={!name.trim()} className="py-2 px-4">{editingId ? 'Ok' : <Plus size={18} />}</Button>{editingId && <Button onClick={() => { setEditingId(null); setName(''); }} variant="ghost" className="py-2 px-3"><X size={18} /></Button>}</div><div className="flex flex-wrap gap-2">{availableColors.map(c => <button key={c.name} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-transform ${color.bg === c.bg ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />)}</div></div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">{labels.map(l => <div key={l.id} className={`flex items-center justify-between p-3 rounded-lg border ${border} ${bgCard}`}><div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full ${l.color}`}></div><span className={`font-medium ${textMain}`}>{l.name}</span></div><div className="flex gap-1"><button onClick={() => startEdit(l)} className={`${textSec} hover:${accent.text} p-2`}><Pencil size={16}/></button><button onClick={() => handleDelete(l.id)} className={`${textSec} hover:text-red-400 p-2`}><Trash2 size={16}/></button></div></div>)}</div>
      </div>
    </Modal>
  );
};

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { mode, setMode, border, language, setLanguage, t, textSec } = useTheme();
  const { notes, tierlists, labels, setNotes, setTierlists, setLabels } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getExportData = () => JSON.stringify({ notes, tierlists, labels, exportDate: new Date().toISOString() });
  const handleImport = (text: string) => {
    try {
      const d = JSON.parse(text);
      setNotes(d.notes || []); setTierlists(d.tierlists || []); setLabels(d.labels || defaultLabels);
      alert(t('importSuccess')); window.location.reload();
    } catch { alert(t('importError')); }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="space-y-8">
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec}`}>{t('appearance')}</h4><div className="flex gap-2"><Button onClick={() => setMode('light')} variant={mode === 'light' ? 'primary' : 'secondary'} className="flex-1 text-sm">{t('light')}</Button><Button onClick={() => setMode('dark')} variant={mode === 'dark' ? 'primary' : 'secondary'} className="flex-1 text-sm">{t('dark')}</Button></div></div>
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec}`}>{t('language')}</h4><div className="flex gap-2">{['de', 'en', 'tr'].map(l => <button key={l} onClick={() => setLanguage(l as any)} className={`flex-1 py-2 rounded-xl border-2 ${language === l ? border : 'border-transparent opacity-50 text-white'}`}>{l.toUpperCase()}</button>)}</div></div>
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec}`}>{t('backup')}</h4><div className="space-y-2"><Button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([getExportData()], {type: 'application/json'})); a.download = 'lifebase_backup.json'; a.click(); }} variant="secondary" className="w-full justify-between"><span>{t('saveToFile')}</span><Download size={18}/></Button><input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => handleImport(ev.target?.result as string); r.readAsText(f); }}} className="hidden" /><Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-between"><span>{t('loadFromFile')}</span><Upload size={18}/></Button></div></div>
         <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex gap-3 items-start"><Cloud className="text-indigo-500 shrink-0" size={20} /><p className="text-xs text-indigo-600 dark:text-indigo-200/80">{t('dataInfo')}</p></div>
         <div className="pt-4 border-t border-red-500/20">
           <Button onClick={handleLogout} variant="danger" className="w-full flex justify-center gap-2 bg-red-500/20"><LogOut size={18} /> {t('logout')}</Button>
         </div>
      </div>
    </Modal>
  );
};

// ==========================================
// 4. AUTH SCREEN
// ==========================================
const AuthScreen = () => {
  const { bgMain, bgCard, textMain, textSec, border, accent, t } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgMain} p-4`}>
      <div className={`w-full max-w-md p-8 rounded-2xl ${bgCard} border ${border} shadow-2xl`}>
        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${accent.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg mb-4`}><Lock size={32} /></div>
          <h1 className={`text-2xl font-bold ${textMain}`}>{t('appTitle')}</h1>
          <p className={`text-sm ${textSec} mt-1`}>Secure Login</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className={`block text-xs font-bold mb-1 ${textSec}`}>{t('email')}</label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className={`block text-xs font-bold mb-1 ${textSec}`}>{t('password')}</label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full mt-4 py-3">{loading ? '...' : t('login')}</Button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. LAYOUTS
// ==========================================
const MobileLayout = () => {
  const { bgMain, border, textMain, textSec, accent, t, bgInput, bgCard } = useTheme();
  const { notes, setNotes, labels, setLabels, activeFilters, toggleFilter, tierlists, setTierlists } = useData();
  const [currentTab, setCurrentTab] = useState<'notes' | 'tierlist' | 'trash'>('notes');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [isPreview, setIsPreview] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isTierListModalOpen, setIsTierListModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [newTierListTitle, setNewTierListTitle] = useState('');

  const activeNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);
  const filteredNotes = activeFilters.length === 0 ? activeNotes : activeNotes.filter(n => activeFilters.includes(n.labelId || 'unlabeled'));
  
  const activeLabel = labels.find(l => l.id === currentNote.labelId) || { color: 'bg-gray-700', textColor: 'text-gray-200' };
  const activeList = tierlists.find(l => l.id === activeListId);

  const saveNote = () => {
    const date = new Date().toLocaleDateString();
    if(currentNote.id) setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, ...currentNote, date } as Note : n));
    else setNotes([{ id: Date.now(), title: currentNote.title || '', content: currentNote.content || '', labelId: currentNote.labelId || '', date } as Note, ...notes]);
    setIsNoteModalOpen(false);
  };

  if (activeListId !== null && activeList) {
    return (
      <div className={`min-h-screen ${bgMain} ${textMain} flex flex-col`}>
        <header className={`p-4 border-b ${border} flex justify-between items-center`}><button onClick={() => setActiveListId(null)} className={textSec}><Menu size={24}/></button><h1 className="font-bold">{activeList.title}</h1><SyncIndicator /></header>
        <div className="p-4 space-y-2">
          {['S','A','B','C','D'].map(tier => (
            <div key={tier} className={`flex min-h-[80px] ${bgCard} rounded-lg border ${border} overflow-hidden`}>
              <div className="bg-red-500 w-12 flex items-center justify-center font-black text-black/50">{tier}</div>
              <div className="flex-1 p-2 flex flex-wrap gap-2">
                {activeList.items.filter(i => i.tier === tier).map(item => (
                  <div key={item.id} className={`${bgInput} px-2 py-1 rounded text-sm flex items-center gap-1 border ${border}`}>{item.name}<button onClick={() => setTierlists(prev => prev.map(l => l.id === activeListId ? { ...l, items: l.items.filter(i => i.id !== item.id) } : l))}><X size={12}/></button></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} flex flex-col`}>
      <header className={`p-4 border-b ${border} flex justify-between items-center`}>
        <div className="flex items-center gap-3 font-bold text-lg"><div className={`w-8 h-8 bg-gradient-to-br ${accent.gradient} rounded-lg flex items-center justify-center text-white`}>LB</div>{t('appTitle')}</div>
        <div className="flex items-center gap-4"><SyncIndicator /><button onClick={() => setIsSettingsOpen(true)} className={textSec}><Settings/></button></div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {currentTab === 'notes' ? (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 items-center">
              <button onClick={() => setIsLabelManagerOpen(true)} className={`h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-lg border ${border} ${bgCard}`}><Settings size={16}/></button>
              <button onClick={() => toggleFilter('unlabeled')} className={`h-9 px-3 rounded-lg border flex items-center gap-1 whitespace-nowrap ${activeFilters.includes('unlabeled') ? bgCard : 'border-transparent'}`}><Tag size={14}/> {t('unlabeled')}</button>
              {labels.map(l => <button key={l.id} onClick={() => toggleFilter(l.id)} className={`h-9 px-3 rounded-lg border whitespace-nowrap ${activeFilters.includes(l.id) ? l.color + ' ' + l.textColor : 'border-transparent'}`}>{l.name}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredNotes.map(n => <NoteCard key={n.id} note={n} label={labels.find(l => l.id === n.labelId) || { id: 'u', name: t('unlabeled'), color: 'bg-gray-700', textColor: 'text-gray-200'}} onClick={() => { setCurrentNote(n); setIsPreview(true); setIsNoteModalOpen(true); }} onDelete={(e) => { e.stopPropagation(); setNotes(prev => prev.map(x => x.id === n.id ? {...x, isDeleted: true} : x)); }} />)}
            </div>
            <button onClick={() => { setCurrentNote({}); setIsPreview(false); setIsNoteModalOpen(true); }} className={`fixed bottom-24 right-6 w-14 h-14 rounded-full ${accent.primary} text-white shadow-lg flex items-center justify-center`}><Plus size={28}/></button>
          </div>
        ) : currentTab === 'tierlist' ? (
          <div className="space-y-4">
            <Button onClick={() => setIsTierListModalOpen(true)} className="w-full"><Plus size={18}/> {t('newTierList')}</Button>
            {tierlists.map(t => <div key={t.id} onClick={() => setActiveListId(t.id)} className={`${bgCard} p-4 rounded-xl border ${border} flex justify-between items-center`}><span className="font-bold">{t.title}</span><button onClick={(e) => { e.stopPropagation(); setTierlists(prev => prev.filter(l => l.id !== t.id)); }} className="text-red-400"><Trash2 size={18}/></button></div>)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="font-bold text-lg">{t('navTrash')} ({trashNotes.length})</span>
              <button onClick={() => setNotes(prev => prev.filter(n => !n.isDeleted))} className="text-red-400 text-sm hover:underline">{t('emptyTrash')}</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trashNotes.map(n => <NoteCard key={n.id} isTrash note={n} label={labels.find(l => l.id === n.labelId) || { id: 'u', name: t('unlabeled'), color: 'bg-gray-700', textColor: 'text-gray-200'}} onClick={() => {}} onRestore={(e) => { e.stopPropagation(); setNotes(prev => prev.map(x => x.id === n.id ? {...x, isDeleted: false} : x)); }} onDelete={(e) => { e.stopPropagation(); setNotes(prev => prev.filter(x => x.id !== n.id)); }} />)}
            </div>
          </div>
        )}
      </main>
      <nav className={`fixed bottom-0 left-0 right-0 ${bgMain} border-t ${border} flex justify-around p-4`}>
        <button onClick={() => setCurrentTab('notes')} className={currentTab === 'notes' ? accent.text : textSec}><StickyNote/></button>
        <button onClick={() => setCurrentTab('tierlist')} className={currentTab === 'tierlist' ? accent.text : textSec}><List/></button>
        <button onClick={() => setCurrentTab('trash')} className={currentTab === 'trash' ? accent.text : textSec}><Archive/></button>
      </nav>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} labels={labels} onAdd={(n, c) => setLabels([...labels, {id:Date.now().toString(), name:n, color:c.bg, textColor:c.text}])} onUpdate={(id, n, c) => setLabels(prev => prev.map(l => l.id === id ? {...l, name:n, color:c.bg, textColor:c.text} : l))} onDelete={id => setLabels(prev => prev.filter(l => l.id !== id))} />
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={currentNote.id ? t('editNote') : t('newNote')} customTheme={{ bg: activeLabel.color, text: activeLabel.textColor }}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <input value={currentNote.title || ''} onChange={e => setCurrentNote({...currentNote, title: e.target.value})} className="flex-1 bg-transparent rounded-lg p-2 font-bold outline-none placeholder:text-black/50" placeholder="Title" />
             <button onClick={() => setIsPreview(!isPreview)} className="p-2 bg-black/10 rounded-lg">{isPreview ? <Edit3 size={18}/> : <Eye size={18}/>}</button>
          </div>
          {isPreview ? (
             <div className="w-full bg-black/5 rounded-lg p-3 min-h-[16rem] overflow-y-auto prose prose-sm prose-p:leading-snug">{renderMarkdown(currentNote.content || '*Kein Inhalt*')}</div>
          ) : (
             <textarea value={currentNote.content || ''} onChange={e => setCurrentNote({...currentNote, content: e.target.value})} className="w-full bg-black/5 rounded-lg p-3 h-64 resize-none outline-none placeholder:text-black/50 font-mono text-sm" placeholder="Content (Markdown)" />
          )}
          <div className="flex gap-2 flex-wrap">{labels.map(l => <button key={l.id} onClick={() => setCurrentNote({...currentNote, labelId: l.id})} className={`px-2 py-1 rounded-full text-xs ${l.color} ${l.textColor} ${currentNote.labelId === l.id ? 'ring-2 ring-black/30' : ''}`}>{l.name}</button>)}</div>
          <Button onClick={saveNote} className="w-full bg-white/20 text-black shadow-none border border-black/10">Save</Button>
        </div>
      </Modal>
      <Modal isOpen={isTierListModalOpen} onClose={() => setIsTierListModalOpen(false)} title="New List"><div className="space-y-4"><Input value={newTierListTitle} onChange={e => setNewTierListTitle(e.target.value)} /><Button onClick={() => { if(!newTierListTitle.trim()) return; setTierlists([{id:Date.now(), title:newTierListTitle, items:[]}, ...tierlists]); setIsTierListModalOpen(false); }} className="w-full">Create</Button></div></Modal>
    </div>
  );
};

const DesktopLayout = () => {
  const { bgMain, bgCard, border, textMain, textSec, accent, t, bgInput } = useTheme();
  const { notes, setNotes, labels, setLabels, activeFilters, toggleFilter, tierlists, setTierlists, lastSaved } = useData();
  const [currentTab, setCurrentTab] = useState<'notes' | 'tiers' | 'trash'>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addingToTier, setAddingToTier] = useState<string | null>(null);
  const [newTierItemName, setNewTierItemName] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const activeNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);
  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const activeList = tierlists.find(l => l.id === activeListId);
  
  const displayNotes = currentTab === 'trash' ? trashNotes : activeNotes;
  const filteredNotes = displayNotes.filter(n => (activeFilters.length === 0 || activeFilters.includes(n.labelId || 'unlabeled')) && (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())));

  // NEU: Keyboard Shortcuts (Ohne Sicherheits-Check, wie gewünscht)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNoteId !== null && currentTab === 'notes') {
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? { ...n, isDeleted: true } : n));
        setSelectedNoteId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && currentTab === 'notes') {
        e.preventDefault(); 
        const id = Date.now();
        setNotes(prev => [{id, title:'', content:'', labelId:'', date:new Date().toLocaleDateString()}, ...prev]);
        setSelectedNoteId(id);
        setIsPreview(false);
      }
      if (e.key === 'Escape' && selectedNoteId !== null) {
        setSelectedNoteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, setNotes, currentTab]);

  return (
    <div className={`min-h-screen flex ${bgMain} ${textMain} font-sans overflow-hidden`}>
      <aside className={`w-64 border-r ${border} flex flex-col ${bgCard}`}>
        <div className="p-6 flex items-center justify-between"><div className="font-bold flex items-center gap-3"><div className={`w-10 h-10 bg-gradient-to-br ${accent.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>LB</div>LifeBase</div><SyncIndicator /></div>
        <nav className="flex-1 px-3 space-y-1">
          <button onClick={() => { setCurrentTab('notes'); setSelectedNoteId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${currentTab === 'notes' ? accent.lightBg + ' ' + accent.text : textSec}`}>{t('navNotes')}</button>
          <button onClick={() => { setCurrentTab('tiers'); setSelectedNoteId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${currentTab === 'tiers' ? accent.lightBg + ' ' + accent.text : textSec}`}>{t('navTiers')}</button>
          <button onClick={() => { setCurrentTab('trash'); setSelectedNoteId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-2 ${currentTab === 'trash' ? 'bg-red-500/10 text-red-400' : textSec}`}><Archive size={18}/> {t('navTrash')} ({trashNotes.length})</button>
          
          {currentTab === 'notes' && (
            <div className="pt-4 px-3 text-xs font-bold uppercase opacity-40 flex justify-between mt-4">Labels<button onClick={() => setIsLabelManagerOpen(true)}><Settings size={12}/></button></div>
          )}
          {currentTab === 'notes' && labels.map(l => <button key={l.id} onClick={() => toggleFilter(l.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeFilters.includes(l.id) ? l.color + ' ' + l.textColor : textSec}`}><div className={`w-2 h-2 rounded-full ${l.color}`}/>{l.name}</button>)}
        </nav>
        <div className="p-4"><button onClick={() => setIsSettingsOpen(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${textSec}`}><Settings size={18}/>{t('settings')}</button></div>
      </aside>

      <div className={`w-80 border-r ${border} flex flex-col bg-opacity-50`}>
        <div className={`p-4 border-b ${border} flex gap-2`}>
          {currentTab === 'notes' ? (
            <><div className="relative flex-1"><Search size={16} className={`absolute left-3 top-3 ${textSec}`} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className={`w-full ${bgInput} rounded-lg pl-9 pr-3 py-2 text-sm outline-none ${textMain}`} /></div><button onClick={() => { const id = Date.now(); setNotes([{id, title:'', content:'', labelId:'', date:new Date().toLocaleDateString()}, ...notes]); setSelectedNoteId(id); setIsPreview(false); }} className={`p-2 rounded-lg ${accent.primary} text-white`}><Plus size={20}/></button></>
          ) : currentTab === 'tiers' ? (
            <Button onClick={() => { const id = Date.now(); setTierlists([{id, title:'New Ranking', items:[]}, ...tierlists]); setActiveListId(id); }} className="w-full">New Ranking</Button>
          ) : (
            <Button onClick={() => setNotes(prev => prev.filter(n => !n.isDeleted))} variant="danger" className="w-full text-xs">{t('emptyTrash')}</Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {currentTab === 'notes' || currentTab === 'trash' ? filteredNotes.map(n => { const l = labels.find(lab => lab.id === n.labelId); return <div key={n.id} onClick={() => { setSelectedNoteId(n.id); setIsPreview(true); }} className={`p-3 rounded-xl cursor-pointer border ${selectedNoteId === n.id ? 'ring-2 ring-indigo-500' : 'border-transparent'} ${l ? l.color + ' ' + l.textColor : bgCard} ${currentTab === 'trash' ? 'opacity-70 grayscale' : ''}`}><h4 className="font-bold truncate">{n.title || 'Untitled'}</h4></div>})
          : tierlists.map(list => <div key={list.id} onClick={() => setActiveListId(list.id)} className={`p-3 rounded-xl cursor-pointer flex justify-between ${activeListId === list.id ? accent.lightBg : bgCard}`}><span className="font-bold">{list.title}</span><button onClick={(e) => { e.stopPropagation(); setTierlists(prev => prev.filter(l => l.id !== list.id)); }} className="text-red-400"><Trash2 size={16}/></button></div>)}
        </div>
      </div>

      <main className="flex-1 flex flex-col relative">
        {currentTab === 'notes' || currentTab === 'trash' ? (
          selectedNote ? (
            <div className="flex-1 p-10 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto pb-20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <button onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, labelId:''} : n))} className={`px-2 py-1 rounded text-xs border ${!selectedNote.labelId ? 'bg-white/10' : 'border-transparent opacity-50'}`}>No Label</button>
                  {labels.map(l => <button key={l.id} onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, labelId:l.id} : n))} className={`w-6 h-6 rounded-full ${l.color} border-2 ${selectedNote.labelId === l.id ? 'border-white' : 'border-transparent opacity-50'}`}/>)}
                </div>
                <div className="flex gap-2 items-center">
                  {currentTab === 'trash' ? (
                    <>
                      <button onClick={() => { setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: false} : n)); setSelectedNoteId(null); }} className="px-3 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-bold flex items-center gap-2"><RefreshCw size={16}/> {t('restore')}</button>
                      <button onClick={() => { setNotes(prev => prev.filter(n => n.id !== selectedNoteId)); setSelectedNoteId(null); }} className="px-3 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2"><Trash2 size={16}/> {t('deletePerm')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsPreview(!isPreview)} className={`p-2 rounded-lg ${isPreview ? bgCard : accent.primary + ' text-white'}`}>{isPreview ? <Edit3 size={20}/> : <Eye size={20}/>}</button>
                      <button onClick={() => { setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: true} : n)); setSelectedNoteId(null); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={20}/></button>
                    </>
                  )}
                </div>
              </div>
              <input value={selectedNote.title} onChange={e => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, title:e.target.value} : n))} disabled={currentTab === 'trash'} className="text-4xl font-bold bg-transparent outline-none w-full" placeholder="Title..." />
              {isPreview || currentTab === 'trash' ? (
                <div className={`flex-1 w-full bg-transparent text-lg leading-relaxed ${textSec}`}>{renderMarkdown(selectedNote.content)}</div>
              ) : (
                <textarea value={selectedNote.content} onChange={e => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, content:e.target.value} : n))} className={`flex-1 w-full bg-transparent outline-none text-lg resize-none font-mono ${textSec}`} placeholder="Content (Markdown supported)..." />
              )}
              {/* Auto Save Feedback */}
              {lastSaved && currentTab === 'notes' && <div className="absolute bottom-4 right-8 text-xs opacity-40 font-mono">{t('lastSaved')} {lastSaved}</div>}
            </div>
          ) : <div className="flex-1 flex items-center justify-center opacity-20">{currentTab === 'trash' ? <Archive size={100}/> : <StickyNote size={100}/>}</div>
        ) : activeList ? (
          <div className="flex-1 p-8 overflow-y-auto"><h2 className="text-3xl font-bold mb-6">{activeList.title}</h2><div className="space-y-4">{['S','A','B','C','D'].map(tier => <div key={tier} className={`flex min-h-[100px] ${bgCard} rounded-xl border ${border} overflow-hidden`}><div className="bg-red-500 w-24 flex flex-col items-center justify-center"><span className="text-2xl font-black text-black/50">{tier}</span><button onClick={() => setAddingToTier(tier)} className="bg-black/20 text-white p-1 rounded mt-2"><Plus size={16}/></button></div><div className="flex-1 p-4 flex flex-wrap gap-3">{activeList.items.filter(i => i.tier === tier).map(item => <div key={item.id} className={`${bgInput} px-4 py-2 rounded-lg border ${border} flex items-center gap-2`}>{item.name}<button onClick={() => setTierlists(prev => prev.map(l => l.id === activeListId ? {...l, items:l.items.filter(it => it.id !== item.id)} : l))} className="text-red-400"><X size={14}/></button></div>)}</div></div>)}</div><Modal isOpen={!!addingToTier} onClose={() => setAddingToTier(null)} title="Add Item"><div className="space-y-4"><Input value={newTierItemName} onChange={e => setNewTierItemName(e.target.value)} autoFocus /><Button onClick={() => { if(!newTierItemName.trim() || !addingToTier) return; setTierlists(prev => prev.map(l => l.id === activeListId ? {...l, items:[...l.items, {id:Date.now(), name:newTierItemName, tier:addingToTier}]} : l)); setNewTierItemName(''); setAddingToTier(null); }} className="w-full">Add</Button></div></Modal></div>
        ) : <div className="flex-1 flex items-center justify-center opacity-30"><List size={64}/></div>}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} labels={labels} onAdd={(n, c) => setLabels([...labels, {id:Date.now().toString(), name:n, color:c.bg, textColor:c.text}])} onUpdate={(id, n, c) => setLabels(prev => prev.map(l => l.id === id ? {...l, name:n, color:c.bg, textColor:c.text} : l))} onDelete={id => setLabels(prev => prev.filter(l => l.id !== id))} />
    </div>
  );
};

// ==========================================
// 6. MAIN APP (WITH AUTH GATE)
// ==========================================
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <ThemeProvider>
      {!session ? (
        <AuthScreen />
      ) : (
        <DataProvider>
          <div className="md:hidden h-screen w-screen overflow-hidden"><MobileLayout /></div>
          <div className="hidden md:block h-screen w-screen overflow-hidden"><DesktopLayout /></div>
        </DataProvider>
      )}
    </ThemeProvider>
  );
};

export default App;