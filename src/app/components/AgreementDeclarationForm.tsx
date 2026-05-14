import React, { useEffect, useRef, useState } from 'react';

interface AgreementDeclarationFormProps {
  onBack: () => void;
  onSubmit: (signatureDataUrl: string) => void;
  onClearAll: () => void;
  initialSignature?: string;
  submitLabel?: string;
}

const declarations: Array<{ title: string; body: string }> = [
  {
    title: 'Card Issuance:',
    body: 'Please issue a card to me and any additional cardholder indicated above.',
  },
  {
    title: 'Information Warranty:',
    body: 'I warrant that the information given is true and complete, and I authorise you to make any enquiries necessary in connection with this application.',
  },
  {
    title: 'Terms and Conditions:',
    body: 'I accept and agree to be bound by the terms and conditions of use (amended from time to time). I and any authorised user(s) agree that I/We are jointly and severally liable for all charges incurred through use of each card.',
  },
  {
    title: 'Financial Assessment:',
    body: 'I confirm that I have assessed my income and expenditure and I am able to service any debt I will incur from time to time against any card issued to me.',
  },
  {
    title: 'Bank Terms:',
    body: "I accept and agree to be bound by terms and conditions accessible on the Bank's website.",
  },
];

export default function AgreementDeclarationForm({
  onSubmit,
  onClearAll,
  initialSignature,
  submitLabel = 'Submit Registration',
}: AgreementDeclarationFormProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(Boolean(initialSignature));

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = 200;

    const previous = document.createElement('canvas');
    previous.width = canvas.width;
    previous.height = canvas.height;
    const prevCtx = previous.getContext('2d');
    if (prevCtx && canvas.width > 0 && canvas.height > 0) {
      prevCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#101828';

    if (previous.width > 0 && previous.height > 0) {
      ctx.drawImage(previous, 0, 0, cssWidth, cssHeight);
    }
  };

  useEffect(() => {
    resizeCanvas();

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = container.getBoundingClientRect();
        ctx.drawImage(img, 0, 0, rect.width, 200);
      };
      img.src = initialSignature;
    }

    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    const point = getPoint(event);
    lastPointRef.current = point;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#101828';
    ctx.fill();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getPoint(event);
    const last = lastPointRef.current ?? point;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;

    if (!hasSignature) setHasSignature(true);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasSignature(false);
  };

  const handleClearForm = () => {
    clearSignature();
    onClearAll();
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!hasSignature || !canvas) {
      alert('Please provide your signature before submitting.');
      return;
    }
    const signatureDataUrl = canvas.toDataURL('image/png');
    console.log('Signature captured (data URL length):', signatureDataUrl.length);
    onSubmit(signatureDataUrl);
  };

  return (
    <>
      <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="mb-5 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] bg-[#fef3c7] text-[#f59e0b]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 3H14L19 8V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M14 3V8H19" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 13H15M9 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold leading-[1.2] text-[#101828]">Agreement and Declaration</h2>
        </div>

        <div className="rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6] p-5">
          <p className="mb-4 text-[14px] text-[#1f2937]">Please read and agree to the following:</p>
          <div className="space-y-3">
            {declarations.map((item) => (
              <p key={item.title} className="text-[14px] leading-[1.55] text-[#1f2937]">
                <span className="font-semibold">{item.title}</span> {item.body}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="mb-5 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] bg-[#fef2f2] text-[#f93f24]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M16.5 4.5L19.5 7.5L8 19L4 20L5 16L16.5 4.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M14 7L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold leading-[1.2] text-[#101828]">Signature</h2>
        </div>

        <div>
          <label className="mb-1 block text-[14px] font-medium text-[#364153]">
            Applicant Signature <span className="text-[#fb2c36]">*</span>
          </label>
          <p className="mb-3 text-[13px] text-[#6b7280]">
            By signing below, you confirm that you have read and agreed to all terms and conditions stated above.
          </p>

          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-[8px] border border-[#d1d5dc] bg-white"
          >
            {!hasSignature && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[15px] text-[rgba(10,10,10,0.45)]">
                Sign here
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="block h-[200px] w-full touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[12px] text-[#6b7280]">Please provide your signature using your mouse or touch screen</p>
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-[13px] font-medium text-[#dc0032] hover:underline"
              >
                Clear signature
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleClearForm}
          className="rounded-[8px] border border-[#d1d5dc] bg-white px-6 py-[11px] text-[16px] font-semibold text-[#364153] hover:bg-gray-50"
        >
          Clear Form
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-[8px] bg-[#f93f24] px-7 py-[11px] text-[16px] font-semibold text-white hover:bg-[#e02d14]"
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
}
