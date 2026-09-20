import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import {
  Paintbrush, Eraser, PaintBucket, SprayCan, Pen, Type, Undo2, Redo2,
  RotateCcw, Download, Save, Loader2, ArrowRight, Palette, Minus, Plus,
  Trash2, X, Check,
} from 'lucide-react';
import { ToastManager, useToasts } from '@components/admin/Toast';

const PALETTE = [
  '#E85D3A', '#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#8B5CF6',
  '#FB923C', '#F87171', '#A78BFA', '#2DD4BF', '#F43F5E', '#1E293B',
  '#FFFFFF', '#94A3B8', '#D97706', '#059669', '#7C3AED', '#2563EB',
  '#000000', '#DC2626', '#16A34A', '#2563EB', '#9333EA', '#EA580C',
];

const BRUSH_SIZES = [2, 4, 8, 14, 22, 36];

const FONTS = [
  'Cairo', 'Tajawal', 'Almarai', 'Amiri', 'Reem Kufi',
  'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana',
];

type Tool = 'pencil' | 'marker' | 'watercolor' | 'spray' | 'eraser' | 'fill' | 'text';

type TextStyle = {
  font: string;
  size: number;
  color: string;
};

export const ColoringCanvasPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  useDocumentTitle('تلوين');
  const { toasts, addToast, removeToast } = useToasts();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Tool state
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#E85D3A');
  const [brushSize, setBrushSize] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [showPalette, setShowPalette] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);

  // Text state
  const [textStyle, setTextStyle] = useState<TextStyle>({ font: 'Cairo', size: 32, color: '#1E293B' });
  const [textContent, setTextContent] = useState('');
  const [textPos, setTextPos] = useState({ x: 100, y: 100 });
  const [isDraggingText, setIsDraggingText] = useState(false);

  // History
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Auto-save to localStorage backup
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveToLocalStorage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !id) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png', 0.6);
        localStorage.setItem(`coloring_draft_${id}`, dataUrl);
      } catch { /* quota exceeded or canvas tainted */ }
    }, 500);
  }, [id]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, []);

  // Non-passive touch event listeners to prevent scroll while coloring
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const getTouchPos = (e: TouchEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      const scaleX = canvasEl.width / rect.width;
      const scaleY = canvasEl.height / rect.height;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const pos = getTouchPos(e);
      isDrawing.current = true;
      lastPos.current = pos;

      if (tool === 'fill') {
        floodFill(pos.x, pos.y);
        isDrawing.current = false;
        return;
      }
      if (tool === 'text') {
        setTextPos({ x: pos.x, y: pos.y });
        setShowTextInput(true);
        isDrawing.current = false;
        return;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current || tool === 'fill' || tool === 'text') return;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
      const pos = getTouchPos(e);
      drawLine(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y);
      lastPos.current = pos;
    };

    const handleTouchEnd = () => {
      if (isDrawing.current) {
        isDrawing.current = false;
        saveToHistory();
      }
    };

    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvasEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      canvasEl.removeEventListener('touchmove', handleTouchMove);
      canvasEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [tool, opacity, brushSize, color]);

  // Load page data + saved artwork
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data: page } = await supabase.from('coloring_pages').select('*').eq('id', id).single();
        if (!page) { navigate('/coloring-online'); return; }
        setPageData(page);

        // Load background image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setBgImage(img);
          setLoading(false);
        };
        img.onerror = () => setLoading(false);
        img.src = page.file_url;
      } catch {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // Initialize canvas when bg image loads, then restore saved artwork
  useEffect(() => {
    if (!bgImage || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current!;
    const container = containerRef.current;

    const w = container.clientWidth;
    const ratio = bgImage.height / bgImage.width;
    const h = Math.min(w * ratio, window.innerHeight - 200);

    canvas.width = w;
    canvas.height = h;
    overlay.width = w;
    overlay.height = h;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bgImage, 0, 0, w, h);

    // 1. Restore from localStorage draft (instant offline recovery)
    const localDraft = localStorage.getItem(`coloring_draft_${id!}`);
    if (localDraft) {
      const draftImg = new Image();
      draftImg.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(draftImg, 0, 0, w, h);
        saveToHistory();
      };
      draftImg.src = localDraft;
    } else {
      saveToHistory();
    }

    // 2. Also restore from Supabase if user is logged in (overrides localStorage)
    if (user?.id) {
      (async () => {
        const { data } = await supabase
          .from('user_artworks')
          .select('canvas_data, preview_url')
          .eq('page_id', id)
          .eq('user_id', user.id)
          .single();
        if (data?.preview_url) {
          const cloudImg = new Image();
          cloudImg.crossOrigin = 'anonymous';
          cloudImg.onload = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(cloudImg, 0, 0, w, h);
            saveToHistory();
          };
          cloudImg.src = data.preview_url;
        }
      })();
    }
  }, [bgImage, id, user?.id]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
    autoSaveToLocalStorage();
  }, [historyIndex, autoSaveToLocalStorage]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [bgImage, saveToHistory]);

  const resetCanvas = useCallback(() => {
    clearCanvas();
  }, [clearCanvas]);

  // Drawing logic
  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawLine = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    } else if (tool === 'marker') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 1.5;
      ctx.globalAlpha = opacity * 0.6;
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    } else if (tool === 'watercolor') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 2;
      ctx.globalAlpha = opacity * 0.15;
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 3; i++) {
        const ox = (Math.random() - 0.5) * brushSize;
        const oy = (Math.random() - 0.5) * brushSize;
        ctx.beginPath();
        ctx.moveTo(x0 + ox, y0 + oy);
        ctx.lineTo(x1 + ox, y1 + oy);
        ctx.stroke();
      }
    } else if (tool === 'spray') {
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity * 0.3;
      ctx.globalCompositeOperation = 'source-over';
      const density = brushSize * 2;
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * brushSize;
        const sx = x1 + Math.cos(angle) * radius;
        const sy = y1 + Math.sin(angle) * radius;
        ctx.fillRect(sx, sy, 1, 1);
      }
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  };

  const floodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    const idx = (Math.floor(startY) * w + Math.floor(startX)) * 4;
    const sr = data[idx], sg = data[idx + 1], sb = data[idx + 2], sa = data[idx + 3];

    // Parse fill color
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1; tempCanvas.height = 1;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillData = tempCtx.getImageData(0, 0, 1, 1).data;
    const fr = fillData[0], fg = fillData[1], fb = fillData[2];

    if (sr === fr && sg === fg && sb === fb) return;

    const tolerance = 32;
    const match = (i: number) =>
      Math.abs(data[i] - sr) <= tolerance &&
      Math.abs(data[i + 1] - sg) <= tolerance &&
      Math.abs(data[i + 2] - sb) <= tolerance &&
      Math.abs(data[i + 3] - sa) <= tolerance;

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set<number>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const i = (y * w + x) * 4;
      const key = y * w + x;

      if (x < 0 || x >= w || y < 0 || y >= h || visited.has(key) || !match(i)) continue;

      visited.add(key);
      data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  const handleStart = (e: React.MouseEvent) => {
    const pos = getPos(e);
    isDrawing.current = true;
    lastPos.current = pos;

    if (tool === 'fill') {
      floodFill(pos.x, pos.y);
      isDrawing.current = false;
      return;
    }
    if (tool === 'text') {
      setTextPos({ x: pos.x, y: pos.y });
      setShowTextInput(true);
      isDrawing.current = false;
      return;
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    if (!isDrawing.current || tool === 'fill' || tool === 'text') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    drawLine(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    lastPos.current = pos;
  };

  const handleEnd = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveToHistory();
    }
  };

  // Add text to canvas
  const addText = () => {
    if (!textContent.trim() || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.globalAlpha = opacity;
    ctx.font = `${textStyle.size}px "${textStyle.font}"`;
    ctx.fillStyle = textStyle.color;
    ctx.textBaseline = 'top';
    ctx.fillText(textContent, textPos.x, textPos.y);
    ctx.globalAlpha = 1;
    setTextContent('');
    setShowTextInput(false);
    saveToHistory();
  };

  // Save artwork
  const handleSave = async () => {
    if (!canvasRef.current || !id) return;
    setSaving(true);
    try {
      const canvas = canvasRef.current;

      // 1. Always persist to localStorage
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      localStorage.setItem(`coloring_draft_${id}`, dataUrl);

      // 2. Upload to Supabase cloud if logged in
      if (user?.id) {
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png', 0.9)
        );
        const filePath = `${user.id}/${id}-${Date.now()}.png`;

        const { data: oldArt } = await supabase
          .from('user_artworks')
          .select('preview_url')
          .eq('page_id', id)
          .eq('user_id', user.id)
          .single();

        if (oldArt?.preview_url) {
          const oldPath = oldArt.preview_url.split('/user_artworks/')[1];
          if (oldPath) await supabase.storage.from('user_artworks').remove([oldPath]);
        }

        const { error: uploadErr } = await supabase.storage
          .from('user_artworks')
          .upload(filePath, blob, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from('user_artworks').getPublicUrl(filePath);

        const { error: dbErr } = await supabase.from('user_artworks').upsert({
          user_id: user.id,
          page_id: id,
          canvas_data: { width: canvas.width, height: canvas.height },
          preview_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,page_id' });
        if (dbErr) throw dbErr;
      }

      addToast('تم حفظ الرسمة محلياً بنجاح', 'success', 3500);
    } catch (err) {
      console.error('Save error:', err);
      addToast('حدث خطأ أثناء الحفظ', 'error', 3500);
    } finally {
      setSaving(false);
    }
  };

  // Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${pageData?.title || 'coloring'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!pageData) return null;

  return (
    <div className="pt-[80px] min-h-screen relative z-0 bg-cream">
      {/* Page Header — not sticky, sits below the main Navbar (z-[100]) */}
      <div className="bg-paper border-b-2 border-line relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/coloring-online')} className="p-2 rounded-lg hover:bg-cream">
              <ArrowRight className="w-5 h-5 text-ink" />
            </button>
            <h1 className="font-bold text-ink text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{pageData.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-terracotta text-white text-sm font-bold rounded-xl border-2 border-ink shadow-[2px_2px_0px_0px_#1E293B] hover:shadow-[3px_3px_0px_0px_#1E293B] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-ink text-sm font-bold rounded-xl border-2 border-line hover:border-terracotta transition-colors">
              <Download className="w-4 h-4" /> تحميل
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4 relative z-0">
        {/* Toolbar */}
        <div className="lg:w-16 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 shrink-0">
          {([
            { id: 'pencil', icon: Pen, label: 'قلم رصاص' },
            { id: 'marker', icon: Paintbrush, label: 'قلم تحديد' },
            { id: 'watercolor', icon: Droplet, label: 'ألوان مائية' },
            { id: 'spray', icon: SprayCan, label: 'ريشة' },
            { id: 'eraser', icon: Eraser, label: 'ممحاة' },
            { id: 'fill', icon: PaintBucket, label: 'تعبئة' },
            { id: 'text', icon: Type, label: 'نص' },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`flex items-center gap-2 lg:justify-center px-3 lg:px-0 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tool === t.id
                  ? 'bg-terracotta text-white shadow-[2px_2px_0px_0px_#1E293B]'
                  : 'bg-white text-ink border-2 border-line hover:border-terracotta'
              }`}
              title={t.label}>
              <t.icon className="w-5 h-5" />
              <span className="lg:hidden">{t.label}</span>
            </button>
          ))}

          <div className="hidden lg:block w-full h-px bg-line my-1" />

          {/* Undo/Redo */}
          <button onClick={undo} disabled={historyIndex <= 0}
            className="p-2.5 rounded-xl bg-white border-2 border-line hover:border-terracotta transition-colors disabled:opacity-30" title="تراجع">
            <Undo2 className="w-5 h-5 text-ink" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}
            className="p-2.5 rounded-xl bg-white border-2 border-line hover:border-terracotta transition-colors disabled:opacity-30" title="إعادة">
            <Redo2 className="w-5 h-5 text-ink" />
          </button>
          <button onClick={clearCanvas}
            className="p-2.5 rounded-xl bg-white border-2 border-line hover:border-red-300 transition-colors" title="مسح">
            <RotateCcw className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div ref={containerRef} className="relative bg-white border-2 border-line rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#E2E8F0] z-10"
            style={{ touchAction: 'none', overscrollBehavior: 'none', userSelect: 'none' } as React.CSSProperties}>
            <canvas ref={canvasRef}
              className="w-full cursor-crosshair"
              style={{ touchAction: 'none', overscrollBehavior: 'none', userSelect: 'none' } as React.CSSProperties}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
            />
            <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-56 space-y-4 shrink-0">
          {/* Color */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[2px_2px_0px_0px_#E2E8F0]">
            <button onClick={() => setShowPalette(!showPalette)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-cream rounded-xl hover:bg-cream/80 transition-colors">
              <div className="w-8 h-8 rounded-lg border-2 border-line" style={{ backgroundColor: color }} />
              <span className="text-sm font-medium text-ink">اللون</span>
            </button>
            {showPalette && (
              <div className="mt-3 grid grid-cols-6 gap-1.5 relative z-20">
                {PALETTE.map((c) => (
                  <button key={c} onClick={() => { setColor(c); setShowPalette(false); }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${color === c ? 'border-ink scale-110 shadow' : 'border-line'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            )}
            <div className="mt-3">
              <label className="text-xs text-muted"> HEX </label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-line" />
            </div>
          </div>

          {/* Brush Size */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[2px_2px_0px_0px_#E2E8F0]">
            <label className="text-xs font-bold text-ink uppercase tracking-wide mb-2 block">حجم الفرشاة</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setBrushSize(Math.max(1, brushSize - 2))} className="p-1 rounded hover:bg-cream">
                <Minus className="w-4 h-4" />
              </button>
              <input type="range" min={1} max={60} value={brushSize} onChange={(e) => setBrushSize(+e.target.value)}
                className="flex-1 accent-terracotta" />
              <button onClick={() => setBrushSize(Math.min(60, brushSize + 2))} className="p-1 rounded hover:bg-cream">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-sm text-muted mt-1">{brushSize}px</p>
            <div className="flex justify-center mt-2">
              <div className="rounded-full bg-ink" style={{ width: brushSize, height: brushSize }} />
            </div>
          </div>

          {/* Opacity */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[2px_2px_0px_0px_#E2E8F0]">
            <label className="text-xs font-bold text-ink uppercase tracking-wide mb-2 block">الشفافية</label>
            <input type="range" min={0.05} max={1} step={0.05} value={opacity}
              onChange={(e) => setOpacity(+e.target.value)} className="w-full accent-terracotta" />
            <p className="text-center text-sm text-muted mt-1">{Math.round(opacity * 100)}%</p>
          </div>

          {/* Text Options */}
          {tool === 'text' && (
            <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[2px_2px_0px_0px_#E2E8F0]">
              <label className="text-xs font-bold text-ink uppercase tracking-wide mb-2 block">خيارات النص</label>
              <select value={textStyle.font} onChange={(e) => setTextStyle({ ...textStyle, font: e.target.value })}
                className="w-full border-2 border-line rounded-lg px-2 py-1.5 text-sm mb-2">
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <div className="flex gap-2 mb-2">
                <input type="number" min={8} max={120} value={textStyle.size}
                  onChange={(e) => setTextStyle({ ...textStyle, size: +e.target.value })}
                  className="w-20 border-2 border-line rounded-lg px-2 py-1.5 text-sm text-center" />
                <input type="color" value={textStyle.color}
                  onChange={(e) => setTextStyle({ ...textStyle, color: e.target.value })}
                  className="w-10 h-9 rounded-lg cursor-pointer border border-line" />
              </div>
              <p className="text-xs text-muted">انقر على اللوحة لوضع النص</p>
            </div>
          )}
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowTextInput(false)} />
          <div className="relative bg-white border-2 border-line rounded-2xl shadow-[8px_8px_0px_0px_#E2E8F0] p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink">إضافة نص</h3>
              <button onClick={() => setShowTextInput(false)} className="p-1 rounded hover:bg-cream"><X className="w-5 h-5" /></button>
            </div>
            <input value={textContent} onChange={(e) => setTextContent(e.target.value)}
              placeholder="اكتب النص هنا..."
              className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm mb-4 focus:border-terracotta focus:outline-none" dir="rtl"
              autoFocus onKeyDown={(e) => { if (e.key === 'Enter') addText(); }} />
            <div className="flex gap-2">
              <button onClick={addText} disabled={!textContent.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-terracotta text-white font-bold rounded-xl text-sm border-2 border-ink shadow-[2px_2px_0px_0px_#1E293B] transition-all disabled:opacity-50">
                <Check className="w-4 h-4" /> إضافة
              </button>
              <button onClick={() => setShowTextInput(false)}
                className="px-4 py-2.5 bg-white text-ink font-bold rounded-xl text-sm border-2 border-line hover:border-terracotta transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

// Droplet icon (not in lucide-react)
const Droplet = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
