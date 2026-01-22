import { useRef, useEffect } from 'react';

interface CabinetCanvasProps {
  width: number;
  height: number;
  depth: number;
  material: string;
  plinthHeight: number;
  doorConfig: 'none' | 'left' | 'right' | 'double';
}

const CabinetCanvas = ({ width, height, depth, material, plinthHeight, doorConfig }: CabinetCanvasProps) => {
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
      const wallThickness = 1.6 * scale;
      const backWallThickness = 0.3 * scale;

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

      const outerVertices = [
        project(-w / 2, -h / 2, -d / 2),
        project(w / 2, -h / 2, -d / 2),
        project(w / 2, h / 2, -d / 2),
        project(-w / 2, h / 2, -d / 2),
        project(-w / 2, -h / 2, d / 2),
        project(w / 2, -h / 2, d / 2),
        project(w / 2, h / 2, d / 2),
        project(-w / 2, h / 2, d / 2),
      ];

      const innerVertices = [
        project(-w / 2 + wallThickness, -h / 2 + wallThickness, -d / 2 + wallThickness),
        project(w / 2 - wallThickness, -h / 2 + wallThickness, -d / 2 + wallThickness),
        project(w / 2 - wallThickness, h / 2 - wallThickness, -d / 2 + wallThickness),
        project(-w / 2 + wallThickness, h / 2 - wallThickness, -d / 2 + wallThickness),
        project(-w / 2 + wallThickness, -h / 2 + wallThickness, d / 2 - backWallThickness),
        project(w / 2 - wallThickness, -h / 2 + wallThickness, d / 2 - backWallThickness),
        project(w / 2 - wallThickness, h / 2 - wallThickness, d / 2 - backWallThickness),
        project(-w / 2 + wallThickness, h / 2 - wallThickness, d / 2 - backWallThickness),
      ];

      const walls = [
        { outer: [0, 1, 2, 3], inner: [0, 1, 2, 3], color: colors.main, name: 'front' },
        { outer: [4, 5, 6, 7], inner: [4, 5, 6, 7], color: '#FFFFFF', name: 'back' },
        { outer: [0, 1, 5, 4], inner: [0, 1, 5, 4], color: colors.shadow, name: 'bottom' },
        { outer: [2, 3, 7, 6], inner: [2, 3, 7, 6], color: colors.light, name: 'top' },
        { outer: [1, 2, 6, 5], inner: [1, 2, 6, 5], color: colors.main, name: 'right' },
        { outer: [0, 3, 7, 4], inner: [0, 3, 7, 4], color: colors.shadow, name: 'left' },
      ];

      walls.forEach((wall) => {
        const outerWall = wall.outer.map((i) => outerVertices[i]);
        const innerWall = wall.inner.map((i) => innerVertices[i]);

        ctx.fillStyle = wall.name === 'back' ? wall.color : wall.color + '80';
        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(outerWall[0].x, outerWall[0].y);
        outerWall.forEach((v) => ctx.lineTo(v.x, v.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(innerWall[0].x, innerWall[0].y);
        innerWall.forEach((v) => ctx.lineTo(v.x, v.y));
        ctx.closePath();
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
          const next = (i + 1) % 4;
          ctx.beginPath();
          ctx.moveTo(outerWall[i].x, outerWall[i].y);
          ctx.lineTo(innerWall[i].x, innerWall[i].y);
          ctx.stroke();
        }
      });

      if (plinthHeight > 0) {
        const plinthH = plinthHeight * scale;
        const plinthVertices = [
          project(-w / 2, -h / 2, -d / 2),
          project(w / 2, -h / 2, -d / 2),
          project(w / 2, -h / 2 + plinthH, -d / 2),
          project(-w / 2, -h / 2 + plinthH, -d / 2),
          project(-w / 2, -h / 2, d / 2),
          project(w / 2, -h / 2, d / 2),
          project(w / 2, -h / 2 + plinthH, d / 2),
          project(-w / 2, -h / 2 + plinthH, d / 2),
        ];

        const plinthFaces = [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
          [1, 2, 6, 5],
          [0, 3, 7, 4],
        ];

        plinthFaces.forEach((face) => {
          ctx.fillStyle = colors.shadow;
          ctx.strokeStyle = '#1A1F2C';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plinthVertices[face[0]].x, plinthVertices[face[0]].y);
          face.forEach((idx) => ctx.lineTo(plinthVertices[idx].x, plinthVertices[idx].y));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      }

      if (doorConfig !== 'none') {
        const doorMargin = 0.5 * scale;
        const doorThickness = 1.6 * scale;

        if (doorConfig === 'left' || doorConfig === 'double') {
          const doorWidth = doorConfig === 'double' ? (w - doorMargin * 3) / 2 : w - doorMargin * 2;
          const leftDoorVertices = [
            project(-w / 2 + doorMargin, -h / 2 + (plinthHeight > 0 ? plinthHeight * scale : 0) + doorMargin, -d / 2 - doorThickness),
            project(-w / 2 + doorMargin + doorWidth, -h / 2 + (plinthHeight > 0 ? plinthHeight * scale : 0) + doorMargin, -d / 2 - doorThickness),
            project(-w / 2 + doorMargin + doorWidth, h / 2 - doorMargin, -d / 2 - doorThickness),
            project(-w / 2 + doorMargin, h / 2 - doorMargin, -d / 2 - doorThickness),
          ];

          ctx.fillStyle = colors.main;
          ctx.strokeStyle = '#1A1F2C';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(leftDoorVertices[0].x, leftDoorVertices[0].y);
          leftDoorVertices.forEach((v) => ctx.lineTo(v.x, v.y));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          const handleX = leftDoorVertices[1].x - 10 * scale;
          const handleY = (leftDoorVertices[1].y + leftDoorVertices[2].y) / 2;
          ctx.fillStyle = '#666';
          ctx.fillRect(handleX - 2, handleY - 15, 4, 30);
        }

        if (doorConfig === 'right' || doorConfig === 'double') {
          const doorWidth = doorConfig === 'double' ? (w - doorMargin * 3) / 2 : w - doorMargin * 2;
          const rightOffset = doorConfig === 'double' ? doorMargin * 2 + doorWidth : doorMargin;
          const rightDoorVertices = [
            project(-w / 2 + rightOffset, -h / 2 + (plinthHeight > 0 ? plinthHeight * scale : 0) + doorMargin, -d / 2 - doorThickness),
            project(-w / 2 + rightOffset + doorWidth, -h / 2 + (plinthHeight > 0 ? plinthHeight * scale : 0) + doorMargin, -d / 2 - doorThickness),
            project(-w / 2 + rightOffset + doorWidth, h / 2 - doorMargin, -d / 2 - doorThickness),
            project(-w / 2 + rightOffset, h / 2 - doorMargin, -d / 2 - doorThickness),
          ];

          ctx.fillStyle = colors.main;
          ctx.strokeStyle = '#1A1F2C';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rightDoorVertices[0].x, rightDoorVertices[0].y);
          rightDoorVertices.forEach((v) => ctx.lineTo(v.x, v.y));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          const handleX = doorConfig === 'double' ? rightDoorVertices[0].x + 10 * scale : rightDoorVertices[1].x - 10 * scale;
          const handleY = (rightDoorVertices[0].y + rightDoorVertices[3].y) / 2;
          ctx.fillStyle = '#666';
          ctx.fillRect(handleX - 2, handleY - 15, 4, 30);
        }
      }

      ctx.strokeStyle = '#1A1F2C';
      ctx.fillStyle = '#1A1F2C';
      ctx.lineWidth = 1;
      ctx.font = '14px Inter, sans-serif';

      const heightLine = {
        start: project(w / 2 + 20, -h / 2, 0),
        end: project(w / 2 + 20, h / 2, 0),
      };
      ctx.beginPath();
      ctx.moveTo(heightLine.start.x, heightLine.start.y);
      ctx.lineTo(heightLine.end.x, heightLine.end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(heightLine.start.x - 5, heightLine.start.y);
      ctx.lineTo(heightLine.start.x + 5, heightLine.start.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(heightLine.end.x - 5, heightLine.end.y);
      ctx.lineTo(heightLine.end.x + 5, heightLine.end.y);
      ctx.stroke();
      const heightTextY = (heightLine.start.y + heightLine.end.y) / 2;
      ctx.fillText(`${height} см`, heightLine.end.x + 10, heightTextY);

      const widthLine = {
        start: project(-w / 2, h / 2 + 20, 0),
        end: project(w / 2, h / 2 + 20, 0),
      };
      ctx.beginPath();
      ctx.moveTo(widthLine.start.x, widthLine.start.y);
      ctx.lineTo(widthLine.end.x, widthLine.end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(widthLine.start.x, widthLine.start.y - 5);
      ctx.lineTo(widthLine.start.x, widthLine.start.y + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(widthLine.end.x, widthLine.end.y - 5);
      ctx.lineTo(widthLine.end.x, widthLine.end.y + 5);
      ctx.stroke();
      const widthTextX = (widthLine.start.x + widthLine.end.x) / 2;
      ctx.fillText(`${width} см`, widthTextX - 20, widthLine.end.y + 20);

      const depthLine = {
        start: project(-w / 2 - 20, 0, -d / 2),
        end: project(-w / 2 - 20, 0, d / 2),
      };
      ctx.beginPath();
      ctx.moveTo(depthLine.start.x, depthLine.start.y);
      ctx.lineTo(depthLine.end.x, depthLine.end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(depthLine.start.x - 5, depthLine.start.y);
      ctx.lineTo(depthLine.start.x + 5, depthLine.start.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(depthLine.end.x - 5, depthLine.end.y);
      ctx.lineTo(depthLine.end.x + 5, depthLine.end.y);
      ctx.stroke();
      const depthTextY = (depthLine.start.y + depthLine.end.y) / 2;
      ctx.fillText(`${depth} см`, depthLine.start.x - 50, depthTextY);
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
  }, [width, height, depth, material, plinthHeight, doorConfig]);

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