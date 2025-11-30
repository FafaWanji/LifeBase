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
type Language = 'de' | 'en' | 'tr';

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
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
// 2. TRANSLATIONS
// ==========================================

const dictionary: Record<Language, Record<string, string>> = {
  de: {
    appTitle: "LifeBase",
    navNotes: "Notizen",
    navTiers: "Tiers",
    myNotes: "Meine Notizen",
    new: "Neu",
    noNotes: "Keine Notizen gefunden.",
    editNote: "Notiz bearbeiten",
    newNote: "Neue Notiz",
    titlePlaceholder: "Titel (z.B. Einkaufsliste)",
    contentPlaceholder: "Schreibe deine Gedanken...",
    selectLabel: "Label wählen",
    edit: "Bearbeiten",
    noLabel: "Kein Label",
    save: "Speichern",
    create: "Erstellen",
    manageLabels: "Labels verwalten",
    newLabel: "Neues Label",
    labelNamePlaceholder: "Name (z.B. Sport)",
    existingLabels: "Vorhandene Labels",
    deleteLabelConfirm: "Label wirklich löschen? Zugehörige Notizen werden 'Labellos'.",
    deleteLabelError: "Ein Label muss mindestens übrig bleiben!",
    myTierLists: "Meine Tier Lists",
    noTierLists: "Noch keine Tier Lists vorhanden.",
    itemsCount: "Einträge",
    newTierList: "Neue Tier List",
    tierListNamePlaceholder: "Name (z.B. Beste Spiele)",
    tierItemPlaceholder: "Name",
    addItem: "Hinzufügen",
    settings: "Einstellungen",
    appearance: "Aussehen",
    light: "Hell",
    dark: "Dunkel",
    language: "Sprache",
    quickSync: "Schnell-Transfer (Zwischenablage)",
    copyData: "Daten kopieren",
    copied: "Kopiert!",
    pasteFromClipboard: "Aus Zwischenablage einfügen",
    pastePlaceholder: "Füge hier den Code ein...",
    import: "Importieren",
    syncInfo: "Kopiere den Code auf dem PC und drücke auf dem Handy 'Einfügen'. Bestehende Daten bleiben erhalten.",
    backup: "Datei-Backup",
    saveToFile: "Backup als Datei speichern",
    loadFromFile: "Backup Datei laden",
    dataInfo: "Daten werden lokal auf diesem Gerät gespeichert. Erstelle regelmäßig Backups.",
    overwriteConfirm: "Dies wird deine aktuellen Daten überschreiben. Sicher?",
    importSuccess: "Daten erfolgreich importiert!",
    importError: "Ungültiges Datenformat.",
    autoImportError: "Automatisches Einfügen nicht möglich. Bitte manuell einfügen:",
    mergeSuccess: "neue Elemente erfolgreich importiert!",
    unlabeled: "Labellos"
  },
  en: {
    appTitle: "LifeBase",
    navNotes: "Notes",
    navTiers: "Tiers",
    myNotes: "My Notes",
    new: "New",
    noNotes: "No notes found.",
    editNote: "Edit Note",
    newNote: "New Note",
    titlePlaceholder: "Title (e.g. Shopping List)",
    contentPlaceholder: "Write your thoughts...",
    selectLabel: "Select Label",
    edit: "Edit",
    noLabel: "No Label",
    save: "Save",
    create: "Create",
    manageLabels: "Manage Labels",
    newLabel: "New Label",
    labelNamePlaceholder: "Name (e.g. Sports)",
    existingLabels: "Existing Labels",
    deleteLabelConfirm: "Delete label? Associated notes will become 'Unlabeled'.",
    deleteLabelError: "At least one label must remain!",
    myTierLists: "My Tier Lists",
    noTierLists: "No Tier Lists yet.",
    itemsCount: "items",
    newTierList: "New Tier List",
    tierListNamePlaceholder: "Name (e.g. Best Games)",
    tierItemPlaceholder: "Name",
    addItem: "Add",
    settings: "Settings",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    language: "Language",
    quickSync: "Quick Transfer (Clipboard)",
    copyData: "Copy Data",
    copied: "Copied!",
    pasteFromClipboard: "Paste from Clipboard",
    pastePlaceholder: "Paste code here...",
    import: "Import",
    syncInfo: "Copy code on PC and press 'Paste' on mobile. Existing data remains safe.",
    backup: "File Backup",
    saveToFile: "Save Backup to File",
    loadFromFile: "Load Backup File",
    dataInfo: "Data is stored locally on this device. Create backups regularly.",
    overwriteConfirm: "This will overwrite your current data. Are you sure?",
    importSuccess: "Data imported successfully!",
    importError: "Invalid data format.",
    autoImportError: "Auto-paste failed. Please paste manually:",
    mergeSuccess: "new items successfully imported!",
    unlabeled: "Unlabeled"
  },
  tr: {
    appTitle: "LifeBase",
    navNotes: "Notlar",
    navTiers: "Sıralama",
    myNotes: "Notlarım",
    new: "Yeni",
    noNotes: "Not bulunamadı.",
    editNote: "Notu Düzenle",
    newNote: "Yeni Not",
    titlePlaceholder: "Başlık (örn. Alışveriş)",
    contentPlaceholder: "Düşüncelerini yaz...",
    selectLabel: "Etiket Seç",
    edit: "Düzenle",
    noLabel: "Etiketsiz",
    save: "Kaydet",
    create: "Oluştur",
    manageLabels: "Etiketleri Yönet",
    newLabel: "Yeni Etiket",
    labelNamePlaceholder: "İsim (örn. Spor)",
    existingLabels: "Mevcut Etiketler",
    deleteLabelConfirm: "Etiket silinsin mi? İlgili notlar 'Etiketsiz' olacak.",
    deleteLabelError: "En az bir etiket kalmalı!",
    myTierLists: "Sıralama Listelerim",
    noTierLists: "Henüz liste yok.",
    itemsCount: "öğe",
    newTierList: "Yeni Liste",
    tierListNamePlaceholder: "İsim (örn. En İyi Oyunlar)",
    tierItemPlaceholder: "İsim",
    addItem: "Ekle",
    settings: "Ayarlar",
    appearance: "Görünüm",
    light: "Açık",
    dark: "Koyu",
    language: "Dil",
    quickSync: "Hızlı Transfer (Pano)",
    copyData: "Verileri Kopyala",
    copied: "Kopyalandı!",
    pasteFromClipboard: "Panodan Yapıştır",
    pastePlaceholder: "Kodu buraya yapıştır...",
    import: "İçe Aktar",
    syncInfo: "PC'de kopyalayın ve mobilde 'Yapıştır'a basın. Mevcut veriler korunur.",
    backup: "Dosya Yedeği",
    saveToFile: "Yedeği Dosyaya Kaydet",
    loadFromFile: "Yedek Dosyası Yükle",
    dataInfo: "Veriler yerel olarak bu cihazda saklanır. Düzenli yedek alın.",
    overwriteConfirm: "Mevcut verilerinizin üzerine yazılacak. Emin misiniz?",
    importSuccess: "Veriler başarıyla içe aktarıldı!",
    importError: "Geçersiz veri formatı.",
    autoImportError: "Otomatik yapıştırma başarısız. Lütfen manuel yapıştırın:",
    mergeSuccess: "yeni öğe başarıyla eklendi!",
    unlabeled: "Etiketsiz"
  }
};

// ==========================================
// 3. THEME & LANGUAGE SYSTEM
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
  
  // Language Detection Logic
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('lb_language');
    if (saved && ['de', 'en', 'tr'].includes(saved)) return saved as Language;
    
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'de') return 'de';
    if (browserLang === 'tr') return 'tr';
    return 'en'; // Default fallback
  });

  useEffect(() => {
    localStorage.setItem('lb_theme_mode', mode);
    localStorage.setItem('lb_theme_accent', accentKey);
    localStorage.setItem('lb_language', language);
  }, [mode, accentKey, language]);

  const t = (key: string) => dictionary[language][key] || key;

  return (
    <ThemeContext.Provider value={{ ...themes[mode], accent: accents[accentKey], mode, setMode, accentKey, setAccentKey, language, setLanguage, t }}>
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
// 4. UI COMPONENTS (Atomic)
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
// 5. FLAG ICONS (SVG)
// ==========================================

const FlagDE = () => (
  <svg viewBox="0 0 5 3" className="w-6 h-6 rounded overflow-hidden shadow-sm">
    <rect width="5" height="3" y="0" fill="#000"/>
    <rect width="5" height="2" y="1" fill="#D00"/>
    <rect width="5" height="1" y="2" fill="#FFCE00"/>
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 60 30" className="w-6 h-6 rounded overflow-hidden shadow-sm">
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

const FlagTR = () => (
  <svg viewBox="0 0 1200 800" className="w-6 h-6 rounded overflow-hidden shadow-sm">
    <rect width="1200" height="800" fill="#E30A17"/>
    <circle cx="425" cy="400" r="200" fill="#fff"/>
    <circle cx="475" cy="400" r="160" fill="#E30A17"/>
    <polygon points="583.334,400 752.928,455.519 647.712,311.803 647.712,488.197 752.928,344.481" fill="#fff"/>
  </svg>
);

// ==========================================
// 6. SUB-COMPONENTS
// ==========================================

const LabelManager: React.FC<{ 
  labels: Label[]; 
  onAdd: (name: string, color: typeof availableColors[0]) => void; 
  onUpdate: (id: string, name: string, color: typeof availableColors[0]) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ labels, onAdd, onUpdate, onDelete, isOpen, onClose }) => {
  const { bgInput, border, textSec, textMain, bgCard, accent, t } = useTheme();
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('manageLabels')}>
      <div className="space-y-6">
        <div className={`p-4 rounded-xl border ${border} ${bgInput}`}>
          <h4 className={`text-xs font-bold uppercase mb-3 ${textSec}`}>
            {editingId ? t('edit') : t('newLabel')}
          </h4>
          <div className="flex gap-2 mb-3">
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('labelNamePlaceholder')} 
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
          <h4 className={`text-xs font-bold uppercase ${textSec}`}>{t('existingLabels')}</h4>
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

const NotesView: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>(() => JSON.parse(localStorage.getItem('lb_labels') || JSON.stringify(defaultLabels)));
  const [notes, setNotes] = useState<Note[]>(() => {
    const loaded = JSON.parse(localStorage.getItem('lb_notes') || '[]');
    return loaded.map((n: any) => {
        if (!n.labelId) return { ...n, labelId: '' };
        return n;
    });
  });
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<{ id?: number; title: string; content: string; labelId: string }>({ title: '', content: '', labelId: '' });

  const { textMain, textSec, bgCard, border, t } = useTheme();

  useEffect(() => localStorage.setItem('lb_notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('lb_labels', JSON.stringify(labels)), [labels]);

  const unlabeledLabel: Label = { 
    id: 'unlabeled', 
    name: t('unlabeled'), 
    color: 'bg-gray-700', 
    textColor: 'text-gray-200' 
  };

  const getLabel = (id: string) => {
    if (!id || id === '') return unlabeledLabel;
    return labels.find(l => l.id === id) || unlabeledLabel;
  };

  const activeLabel = getLabel(currentNote.labelId);
  
  const filteredNotes = activeFilters.length === 0 
    ? notes 
    : notes.filter(n => {
        if (activeFilters.includes('unlabeled')) {
            return n.labelId === '' || activeFilters.includes(n.labelId);
        }
        return activeFilters.includes(n.labelId);
    });

  const handleSaveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) return;
    const dateStr = new Date().toLocaleDateString(navigator.language);
    
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
    if (!confirm(t('deleteLabelConfirm'))) return;
    const newLabels = labels.filter(l => l.id !== id);
    setLabels(newLabels);
    setNotes(notes.map(n => n.labelId === id ? { ...n, labelId: '' } : n));
    setActiveFilters(prev => prev.filter(fid => fid !== id));
  };

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h2 className={`text-2xl font-bold ${textMain}`}>{t('myNotes')}</h2>
        <Button onClick={() => { setCurrentNote({ title: '', content: '', labelId: '' }); setIsModalOpen(true); }}>
          <Plus size={20} /> {t('new')}
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
          <button 
            onClick={() => toggleFilter('unlabeled')} 
            className={`h-9 whitespace-nowrap px-3 rounded-lg text-sm font-medium transition-all border flex-shrink-0 flex items-center gap-1 ${activeFilters.includes('unlabeled') ? `bg-gray-700 text-gray-200 border-transparent shadow-sm scale-105` : `${bgCard} ${textSec} ${border} opacity-70 hover:opacity-100`}`}
          >
            <Tag size={14} /> {t('unlabeled')}
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
        {filteredNotes.length === 0 && <div className={`col-span-2 text-center py-20 ${textSec} flex flex-col items-center`}><StickyNote size={48} className="mb-4 opacity-20" /><p>{t('noNotes')}</p></div>}
        {filteredNotes.map(note => (
          <NoteCard key={note.id} note={note} label={getLabel(note.labelId)} onClick={() => { setCurrentNote(note); setIsModalOpen(true); }} onDelete={(e) => { e.stopPropagation(); setNotes(notes.filter(n => n.id !== note.id)); }} />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentNote.id ? t('editNote') : t('newNote')} customTheme={{ bg: activeLabel.color, text: activeLabel.textColor }}>
        <div className="space-y-4">
          <input type="text" value={currentNote.title} onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })} placeholder={t('titlePlaceholder')} className={`w-full bg-white/20 border-0 rounded-xl px-4 py-3 ${activeLabel.textColor} placeholder:${activeLabel.textColor}/50 focus:outline-none focus:ring-2 focus:ring-black/10 font-bold text-lg`} />
          <textarea value={currentNote.content} onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })} placeholder={t('contentPlaceholder')} className={`w-full bg-white/20 border-0 rounded-xl px-4 py-3 ${activeLabel.textColor} placeholder:${activeLabel.textColor}/50 focus:outline-none focus:ring-2 focus:ring-black/10 h-64 resize-none`} />
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold uppercase opacity-60 ${activeLabel.textColor}`}>{t('selectLabel')}</span>
              <button onClick={() => setIsLabelManagerOpen(true)} className={`text-xs font-bold hover:underline ${activeLabel.textColor}`}>{t('edit')}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCurrentNote({ ...currentNote, labelId: '' })} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${currentNote.labelId === '' ? `bg-white/40 ${activeLabel.textColor} border-black/10 shadow-sm` : `bg-transparent ${activeLabel.textColor} border-transparent hover:bg-white/10 opacity-60 hover:opacity-100`}`}
              >
                <Tag size={14} className="inline mr-1"/> {t('noLabel')}
              </button>
              {labels.map(label => (
                <button key={label.id} onClick={() => setCurrentNote({ ...currentNote, labelId: label.id })} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${currentNote.labelId === label.id ? `bg-white/40 ${label.textColor} border-black/10 shadow-sm` : `bg-transparent ${activeLabel.textColor} border-transparent hover:bg-white/10 opacity-60 hover:opacity-100`}`}>{label.name}</button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveNote} className={`w-full border-0 ${activeLabel.textColor} bg-white/30 hover:bg-white/50 shadow-none`}>{currentNote.id ? t('save') : t('create')}</Button>
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
  const { bgCard, border, textMain, textSec, accent, bgInput, t } = useTheme();

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
        <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${textMain}`}>{t('myTierLists')}</h2><Button onClick={() => setIsCreateModalOpen(true)}><Plus size={20} /> {t('new')}</Button></div>
        <div className="grid grid-cols-1 gap-4">
          {lists.length === 0 && <div className={`text-center py-10 ${textSec}`}><List size={48} className="mx-auto mb-4 opacity-20" /><p>{t('noTierLists')}</p></div>}
          {lists.map(list => (
            <div key={list.id} onClick={() => setActiveListId(list.id)} className={`${bgCard} p-4 rounded-xl flex items-center justify-between hover:brightness-105 active:scale-95 transition-all cursor-pointer border ${border}`}>
              <div className="flex items-center gap-4"><div className={`p-3 rounded-full ${accent.lightBg} ${accent.text}`}><List size={24} /></div><div><h3 className={`font-bold ${textMain}`}>{list.title}</h3><p className={`text-sm ${textSec}`}>{list.items.length} {t('itemsCount')}</p></div></div>
              <button onClick={(e) => { e.stopPropagation(); setLists(lists.filter(l => l.id !== list.id)); }} className={`${textSec} hover:text-red-400 p-2`}><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('newTierList')}>
          <div className="space-y-4"><Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder={t('tierListNamePlaceholder')} /><Button onClick={() => { if(!newListTitle.trim()) return; setLists([{ id: Date.now(), title: newListTitle, items: [] }, ...lists]); setNewListTitle(''); setIsCreateModalOpen(false); }} className="w-full">{t('create')}</Button></div>
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
      <Modal isOpen={!!addingToTier} onClose={() => setAddingToTier(null)} title={`${t('addItem')} - ${addingToTier}`}>
        <div className="space-y-4"><Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={t('tierItemPlaceholder')} autoFocus /><Button onClick={handleAddItem} className="w-full">{t('addItem')}</Button></div>
      </Modal>
    </div>
  );
};

// ==========================================
// 6. MAIN APP SHELL
// ==========================================

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { mode, setMode, accentKey, setAccentKey, bgInput, textMain, textSec, border, language, setLanguage, t } = useTheme();
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

  const mergeAndSave = (incomingData: any) => {
    try {
      const currentNotes: Note[] = JSON.parse(localStorage.getItem('lb_notes') || '[]');
      const currentTierlists: TierList[] = JSON.parse(localStorage.getItem('lb_tierlists') || '[]');
      const currentLabels: Label[] = JSON.parse(localStorage.getItem('lb_labels') || '[]');

      const newNotes = incomingData.notes.filter((n: Note) => !currentNotes.some(cn => cn.id === n.id));
      const newTierlists = incomingData.tierlists.filter((t: TierList) => !currentTierlists.some(ct => ct.id === t.id));
      const newLabels = incomingData.labels.filter((l: Label) => !currentLabels.some(cl => cl.id === l.id));

      const mergedNotes = [...currentNotes, ...newNotes];
      const mergedTierlists = [...currentTierlists, ...newTierlists];
      const mergedLabels = [...currentLabels, ...newLabels];

      localStorage.setItem('lb_notes', JSON.stringify(mergedNotes));
      localStorage.setItem('lb_tierlists', JSON.stringify(mergedTierlists));
      localStorage.setItem('lb_labels', JSON.stringify(mergedLabels));

      const count = newNotes.length + newTierlists.length + newLabels.length;
      alert(`${count} ${t('mergeSuccess')}`);
      window.location.reload();

    } catch (e) {
      alert(t('importError'));
      console.error(e);
    }
  };

  const handleAutoImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert("Clipboard empty");
        setShowImport(true);
        return;
      }
      const data = JSON.parse(text);
      if (!data.notes && !data.tierlists) throw new Error("Invalid Format");
      mergeAndSave(data);
    } catch (err) {
      console.error("Auto-Import failed:", err);
      setShowImport(true);
    }
  };

  const handlePasteImport = () => {
    try {
        const data = JSON.parse(importText);
        mergeAndSave(data);
    } catch {
        alert(t('importError'));
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
        if (confirm(t('overwriteConfirm'))) {
          if (data.notes) localStorage.setItem('lb_notes', JSON.stringify(data.notes));
          if (data.tierlists) localStorage.setItem('lb_tierlists', JSON.stringify(data.tierlists));
          if (data.labels) localStorage.setItem('lb_labels', JSON.stringify(data.labels));
          alert(t('importSuccess')); window.location.reload();
        }
      } catch { alert(t('importError')); }
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="space-y-8">
        
        {/* Appearance Section */}
        <div className="space-y-3">
           <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>{t('appearance')}</h4>
           <div className={`${bgInput} p-1 rounded-xl flex border ${border}`}>
              <button onClick={() => setMode('light')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${mode === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}><Sun size={16} /> {t('light')}</button>
              <button onClick={() => setMode('dark')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${mode === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}><Moon size={16} /> {t('dark')}</button>
           </div>
           <div className="grid grid-cols-3 gap-2">
              {Object.entries(accents).map(([key, val]) => (
                <button key={key} onClick={() => setAccentKey(key as AccentKey)} className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${accentKey === key ? `${val.border} ${val.lightBg}` : `${border} ${bgInput} opacity-70 hover:opacity-100`}`}>
                  <div className={`w-4 h-4 rounded-full ${val.primary}`}></div><span className={`text-[10px] font-bold ${textMain}`}>{val.name}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Language Section - NEW */}
        <div className="space-y-3">
           <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>{t('language')}</h4>
           <div className="flex gap-2">
              <button 
                onClick={() => setLanguage('de')} 
                className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center transition-all ${language === 'de' ? `${border} bg-white/10` : 'border-transparent bg-transparent hover:bg-white/5'}`}
              >
                <FlagDE />
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center transition-all ${language === 'en' ? `${border} bg-white/10` : 'border-transparent bg-transparent hover:bg-white/5'}`}
              >
                <FlagEN />
              </button>
              <button 
                onClick={() => setLanguage('tr')} 
                className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center transition-all ${language === 'tr' ? `${border} bg-white/10` : 'border-transparent bg-transparent hover:bg-white/5'}`}
              >
                <FlagTR />
              </button>
           </div>
        </div>

        {/* Quick Sync Section */}
        <div className="space-y-3">
            <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>{t('quickSync')}</h4>
            <div className="flex gap-2">
                <Button onClick={handleCopyToClipboard} className="flex-1" variant="secondary">
                    {copySuccess ? <Check size={18} className="text-green-500"/> : <Copy size={18} />} 
                    {copySuccess ? t('copied') : t('copyData')}
                </Button>
                <Button onClick={handleAutoImport} className="flex-1" variant="secondary">
                    <Clipboard size={18} /> {t('pasteFromClipboard')}
                </Button>
            </div>
            
            {showImport && (
                <div className={`p-3 rounded-xl border ${border} ${bgInput} animate-in fade-in slide-in-from-top-2`}>
                    <p className={`text-[10px] text-red-400 mb-2`}>{t('autoImportError')}</p>
                    <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={t('pastePlaceholder')} className={`w-full bg-transparent border-0 text-xs ${textMain} h-20 resize-none focus:outline-none mb-2`} />
                    <Button onClick={handlePasteImport} disabled={!importText} className="w-full h-8 text-xs">{t('import')}</Button>
                </div>
            )}
            <p className={`text-[10px] ${textSec}`}>{t('syncInfo')}</p>
        </div>

        <div className="space-y-3">
          <h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>{t('backup')}</h4>
          <div className="space-y-2">
            <Button onClick={handleFileExport} variant="secondary" className="w-full justify-between"><span>{t('saveToFile')}</span><Download size={18} /></Button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-between"><span>{t('loadFromFile')}</span><Upload size={18} /></Button>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="text-yellow-500 shrink-0" size={20} /><p className="text-xs text-yellow-600 dark:text-yellow-200/80">{t('dataInfo')}</p>
        </div>
      </div>
    </Modal>
  );
};

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'notes' | 'tierlist'>('notes');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { bgMain, border, textMain, textSec, accent, t } = useTheme();

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans transition-colors duration-200 selection:bg-opacity-30`}>
      <header className={`${bgMain}/90 backdrop-blur-md sticky top-0 z-10 border-b ${border} px-4 py-3 flex justify-between items-center transition-colors duration-200`}>
        <div className="flex items-center gap-3"><div className={`w-8 h-8 bg-gradient-to-br ${accent.gradient} rounded-lg flex items-center justify-center font-bold text-white shadow-lg`}>LB</div><h1 className={`text-lg font-bold tracking-tight ${textMain}`}>{t('appTitle')}</h1></div>
        <button onClick={() => setIsSettingsOpen(true)} className={`${textSec} hover:${textMain} transition-colors`}><Settings size={24} /></button>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        {currentTab === 'notes' && <NotesView />}
        {currentTab === 'tierlist' && <TierListView />}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <nav className={`fixed bottom-0 left-0 right-0 ${bgMain} border-t ${border} pb-safe transition-colors duration-200`}>
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <button onClick={() => setCurrentTab('notes')} className={`p-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'notes' ? accent.text : `${textSec} hover:${textMain}`}`}><StickyNote size={24} strokeWidth={currentTab === 'notes' ? 2.5 : 2} /><span className="text-[10px] font-medium">{t('navNotes')}</span></button>
          <button onClick={() => setCurrentTab('tierlist')} className={`p-4 flex flex-col items-center gap-1 transition-colors ${currentTab === 'tierlist' ? accent.text : `${textSec} hover:${textMain}`}`}><List size={24} strokeWidth={currentTab === 'tierlist' ? 2.5 : 2} /><span className="text-[10px] font-medium">{t('navTiers')}</span></button>
        </div>
      </nav>
      <style>{`.pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } ::selection { background-color: ${accent.primary}; color: white; }`}</style>
    </div>
  );
};

export default () => <ThemeProvider><AppContent /></ThemeProvider>;