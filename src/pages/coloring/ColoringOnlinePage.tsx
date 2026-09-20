import { useRef, useState, useCallback, useEffect } from 'react';
import { Download, RotateCcw, Eraser, Paintbrush, Trash2, Palette, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const PALETTE = [
  '#E85D3A', '#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#8B5CF6',
  '#FB923C', '#F87171', '#A78BFA', '#2DD4BF', '#F43F5E', '#1E293B',
  '#FFFFFF', '#94A3B8', '#D97706', '#059669', '#7C3AED', '#2563EB',
];

const BRUSH_SIZES = [2, 4, 8, 14, 22];

interface Template {
  id: string;
  name: string;
  nameAr: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const templates: Template[] = [
  {
    id: 'flower',
    name: 'Flower',
    nameAr: 'زهرة',
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Petals
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60, 45, 28, angle, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Center
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.stroke();
      // Stem
      ctx.beginPath();
      ctx.moveTo(cx, cy + 85);
      ctx.quadraticCurveTo(cx + 15, cy + 140, cx - 5, cy + 200);
      ctx.stroke();
      // Leaves
      ctx.beginPath();
      ctx.ellipse(cx + 30, cy + 150, 25, 12, -0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - 25, cy + 170, 22, 10, 0.6, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    nameAr: 'فراشة',
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      // Body
      ctx.beginPath();
      ctx.ellipse(cx, cy, 6, 50, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Upper wings
      ctx.beginPath();
      ctx.ellipse(cx - 60, cy - 20, 55, 40, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 60, cy - 20, 55, 40, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      // Lower wings
      ctx.beginPath();
      ctx.ellipse(cx - 40, cy + 35, 35, 28, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 40, cy + 35, 35, 28, 0.2, 0, Math.PI * 2);
      ctx.stroke();
      // Antennae
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 48);
      ctx.quadraticCurveTo(cx - 25, cy - 80, cx - 35, cy - 75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 48);
      ctx.quadraticCurveTo(cx + 25, cy - 80, cx + 35, cy - 75);
      ctx.stroke();
      // Wing dots
      ctx.beginPath();
      ctx.arc(cx - 55, cy - 20, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 55, cy - 20, 10, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  {
    id: 'star',
    name: 'Star',
    nameAr: 'نجمة',
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Outer star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const outerR = 80, innerR = 35;
        if (i === 0) ctx.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
        else ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
        ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle));
      }
      ctx.closePath();
      ctx.stroke();
      // Face
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 15, cy - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(cx, cy + 5, 18, 0.2, Math.PI - 0.2);
      ctx.stroke();
    },
  },
  {
    id: 'cat',
    name: 'Cat',
    nameAr: 'قطة',
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      // Head
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.stroke();
      // Ears
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 40);
      ctx.lineTo(cx - 55, cy - 85);
      ctx.lineTo(cx - 15, cy - 55);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy - 40);
      ctx.lineTo(cx + 55, cy - 85);
      ctx.lineTo(cx + 15, cy - 55);
      ctx.closePath();
      ctx.stroke();
      // Eyes
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy - 8, 10, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 18, cy - 8, 10, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Pupils
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy - 6, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 18, cy - 6, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx - 6, cy + 16);
      ctx.lineTo(cx + 6, cy + 16);
      ctx.closePath();
      ctx.stroke();
      // Whiskers
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + dir * 20, cy + 12);
        ctx.lineTo(cx + dir * 65, cy + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + dir * 20, cy + 18);
        ctx.lineTo(cx + dir * 65, cy + 20);
        ctx.stroke();
      }
      // Body
      ctx.beginPath();
      ctx.ellipse(cx, cy + 100, 40, 50, 0, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    nameAr: 'قوس قزح',
    draw: (ctx, w, h) => {
      const cx = w / 2, bottom = h * 0.7;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      // Arcs
      for (let i = 0; i < 5; i++) {
        const r = 140 - i * 25;
        ctx.beginPath();
        ctx.arc(cx, bottom, r, Math.PI, 0);
        ctx.stroke();
      }
      // Clouds
      for (const xOff of [-130, 130]) {
        const bx = cx + xOff;
        ctx.beginPath();
        ctx.arc(bx, bottom + 5, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx - 18, bottom + 12, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 18, bottom + 12, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },
  {
    id: 'house',
    name: 'House',
    nameAr: 'بيت',
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2 + 20;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      // Walls
      ctx.strokeRect(cx - 70, cy - 30, 140, 100);
      // Roof
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy - 30);
      ctx.lineTo(cx, cy - 100);
      ctx.lineTo(cx + 90, cy - 30);
      ctx.closePath();
      ctx.stroke();
      // Door
      ctx.strokeRect(cx - 18, cy + 20, 36, 50);
      ctx.beginPath();
      ctx.arc(cx + 12, cy + 48, 3, 0, Math.PI * 2);
      ctx.fill();
      // Windows
      ctx.strokeRect(cx - 55, cy - 15, 28, 28);
      ctx.strokeRect(cx + 27, cy - 15, 28, 28);
      // Window crosses
      ctx.beginPath();
      ctx.moveTo(cx - 41, cy - 15); ctx.lineTo(cx - 41, cy + 13);
      ctx.moveTo(cx - 55, cy - 1); ctx.lineTo(cx - 27, cy - 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 41, cy - 15); ctx.lineTo(cx + 41, cy + 13);
      ctx.moveTo(cx + 27, cy - 1); ctx.lineTo(cx + 55, cy - 1);
      ctx.stroke();
      // Chimney
      ctx.strokeRect(cx + 40, cy - 90, 20, 35);
    },
  },
];

export const ColoringOnlinePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#E85D3A');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [isDrawing, setIsDrawing] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(true);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-30), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const drawLine = useCallback((x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [color, brushSize, tool]);

  const handlePointerDown = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    saveState();
    const pos = getPos(e);
    lastPos.current = pos;
    drawLine(pos.x, pos.y, pos.x, pos.y);
  }, [getPos, drawLine, saveState]);

  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    if (lastPos.current) {
      drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    }
    lastPos.current = pos;
  }, [isDrawing, getPos, drawLine]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const loadTemplate = useCallback((template: Template) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveState();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    template.draw(ctx, canvas.width, canvas.height);
    setTemplateOpen(false);
  }, [saveState]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveState();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [saveState]);

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const last = history[history.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `doodle-room-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terracotta/10 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          <span className="text-xs font-body text-terracotta font-medium">مجاني - بدون تسجيل</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-2">
          Online <span className="text-terracotta">Coloring</span> & Doodles
        </h1>
        <p className="text-muted font-body">ارسم بألوانك الخاصة، اختر قالبًا، وابدأ التلوين الآن!</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tools */}
        <div className="lg:w-64 shrink-0 space-y-4">
          {/* Tools */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink text-sm mb-3">الأدوات</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTool('brush')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  tool === 'brush'
                    ? 'border-terracotta bg-terracotta text-white'
                    : 'border-line text-ink hover:border-terracotta/50'
                }`}
              >
                <Paintbrush className="w-4 h-4" /> فرشاة
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  tool === 'eraser'
                    ? 'border-terracotta bg-terracotta text-white'
                    : 'border-line text-ink hover:border-terracotta/50'
                }`}
              >
                <Eraser className="w-4 h-4" /> ممحاة
              </button>
            </div>
          </div>

          {/* Brush Size */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink text-sm mb-3">حجم الفرشاة</h3>
            <div className="flex items-center gap-2">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg border-2 transition-all ${
                    brushSize === size
                      ? 'border-terracotta bg-terracotta/10'
                      : 'border-line hover:border-terracotta/50'
                  }`}
                  title={`${size}px`}
                >
                  <div
                    className="rounded-full bg-ink"
                    style={{ width: Math.min(size + 2, 20), height: Math.min(size + 2, 20) }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-terracotta" /> الألوان
              </h3>
              <div
                className="w-8 h-8 rounded-lg border-2 border-line shadow-sm"
                style={{ backgroundColor: color }}
              />
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setTool('brush'); }}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    color === c && tool === 'brush' ? 'border-ink scale-110 shadow-sm' : 'border-line/50'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); setTool('brush'); }}
              className="w-full mt-3 h-8 rounded-lg border-2 border-line cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink text-sm mb-3">التحكم</h3>
            <div className="space-y-2">
              <button onClick={handleUndo} disabled={history.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-line text-sm font-bold text-ink hover:border-terracotta/50 transition-all disabled:opacity-40">
                <RotateCcw className="w-4 h-4" /> تراجع
              </button>
              <button onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-line text-sm font-bold text-ink hover:border-red-300 hover:text-red-500 transition-all">
                <Trash2 className="w-4 h-4" /> مسح الكل
              </button>
              <button onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terracotta text-white border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] text-sm font-bold transition-all">
                <Download className="w-4 h-4" /> حفظ الصورة
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1">
          {/* Template Picker */}
          <div className="bg-white border-2 border-line rounded-2xl mb-4 shadow-[4px_4px_0px_0px_#E2E8F0] overflow-hidden">
            <button
              onClick={() => setTemplateOpen(!templateOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-ink"
            >
              <span>اختر قالب تلوين</span>
              {templateOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {templateOpen && (
              <div className="px-4 pb-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => loadTemplate(t)}
                    className="p-3 rounded-xl border-2 border-line hover:border-terracotta hover:bg-terracotta/5 transition-all text-center group"
                  >
                    <div className="w-12 h-12 mx-auto mb-1.5 bg-cream rounded-lg flex items-center justify-center group-hover:bg-terracotta/10 transition-colors">
                      <span className="text-lg">{t.id === 'flower' ? '🌸' : t.id === 'butterfly' ? '🦋' : t.id === 'star' ? '⭐' : t.id === 'cat' ? '🐱' : t.id === 'rainbow' ? '🌈' : '🏠'}</span>
                    </div>
                    <span className="text-xs font-bold text-ink">{t.nameAr}</span>
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="p-3 rounded-xl border-2 border-dashed border-line hover:border-terracotta hover:bg-terracotta/5 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-1.5 bg-cream rounded-lg flex items-center justify-center">
                    <span className="text-lg">📄</span>
                  </div>
                  <span className="text-xs font-bold text-ink">فارغ</span>
                </button>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="bg-white border-2 border-line rounded-2xl p-4 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full rounded-xl cursor-crosshair border border-line touch-none"
              style={{ maxWidth: '100%', aspectRatio: '4/3' }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />
          </div>

          <p className="text-center text-xs text-muted mt-3">
            استخدم الفرشاة للرسم والممحاة للمسح • اضغط "حفظ الصورة" لتنزيل عملك كصورة PNG
          </p>
        </div>
      </div>
    </div>
  );
};
