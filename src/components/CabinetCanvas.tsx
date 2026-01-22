import { useRef, useEffect } from 'react';

interface CabinetCanvasProps {
  width: number;
  height: number;
  depth: number;
  material: string;
}

const CabinetCanvas = ({ width, height, depth, material }: CabinetCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleXRef = useRef(0.3);
  const angleYRef = useRef(0.4);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const materialColors: Record<string, { main: string; shadow: string; light: string }> = {
      oak: { main: '#D4A574', shadow: '#8B6F47', light: '#E8C9A0' },
      walnut: { main: '#5C4033', shadow: '#3E2723', light: '#8B6F47' },
      white: { main: '#F5F5F5', shadow: '#BDBDBD', light: '#FFFFFF' },
      black: { main: '#2C2C2C', shadow: '#1A1A1A', light: '#404040' },
      maple: { main: '#E8D5B7', shadow: '#C7B299', light: '#F5E6D3' },
    };

    const colors = materialColors[material] || materialColors.oak;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = width * scale;
      const h = height * scale;
      const d = depth * scale;

      const cos = Math.cos(angleYRef.current);
      const sin = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);

      const project = (x: number, y: number, z: number) => {
        const rotY_x = x * cos - z * sin;
        const rotY_z = x * sin + z * cos;
        const rotX_y = y * cosX - rotY_z * sinX;
        const rotX_z = y * sinX + rotY_z * cosX;
        return {
          x: centerX + rotY_x,
          y: centerY + rotX_y,
          z: rotX_z,
        };
      };

      const vertices = [
        project(-w / 2, -h / 2, -d / 2),
        project(w / 2, -h / 2, -d / 2),
        project(w / 2, h / 2, -d / 2),
        project(-w / 2, h / 2, -d / 2),
        project(-w / 2, -h / 2, d / 2),
        project(w / 2, -h / 2, d / 2),
        project(w / 2, h / 2, d / 2),
        project(-w / 2, h / 2, d / 2),
      ];

      const faces = [
        { indices: [0, 1, 2, 3], color: colors.main },
        { indices: [4, 5, 6, 7], color: colors.light },
        { indices: [0, 1, 5, 4], color: colors.shadow },
        { indices: [2, 3, 7, 6], color: colors.light },
        { indices: [1, 2, 6, 5], color: colors.main },
        { indices: [0, 3, 7, 4], color: colors.shadow },
      ];

      faces.forEach((face) => {
        const faceVertices = face.indices.map((i) => vertices[i]);
        const avgZ = faceVertices.reduce((sum, v) => sum + v.z, 0) / faceVertices.length;

        ctx.fillStyle = face.color;
        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(faceVertices[0].x, faceVertices[0].y);
        faceVertices.forEach((v) => ctx.lineTo(v.x, v.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;

      angleYRef.current += deltaX * 0.01;
      angleXRef.current += deltaY * 0.01;

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      draw();
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    draw();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [width, height, depth, material]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full cursor-move select-none"
      style={{ touchAction: 'none' }}
    />
  );
};

export default CabinetCanvas;
