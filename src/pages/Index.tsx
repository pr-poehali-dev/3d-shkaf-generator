import { useState } from 'react';
import CabinetCanvas from '@/components/CabinetCanvas';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const materials = [
  { id: 'oak', name: 'Дуб', pricePerUnit: 150, color: '#D4A574' },
  { id: 'walnut', name: 'Орех', pricePerUnit: 180, color: '#5C4033' },
  { id: 'white', name: 'Белый', pricePerUnit: 120, color: '#F5F5F5' },
  { id: 'black', name: 'Черный', pricePerUnit: 140, color: '#2C2C2C' },
  { id: 'maple', name: 'Клен', pricePerUnit: 160, color: '#E8D5B7' },
];

const Index = () => {
  const [height, setHeight] = useState(210);
  const [width, setWidth] = useState(90);
  const [depth, setDepth] = useState(50);
  const [selectedMaterial, setSelectedMaterial] = useState('oak');

  const calculatePrice = () => {
    const volume = (height * width * depth) / 1000000;
    const material = materials.find((m) => m.id === selectedMaterial);
    return Math.round(volume * (material?.pricePerUnit || 150));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#1A1F2C]">Конфигуратор шкафов</h1>
            <Button variant="outline" className="gap-2">
              <Icon name="Download" size={18} />
              Скачать проект
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-4">
            <Card className="p-6 bg-gray-50">
              <div className="aspect-[4/3] bg-white rounded-lg overflow-hidden shadow-inner">
                <CabinetCanvas
                  width={width}
                  height={height}
                  depth={depth}
                  material={selectedMaterial}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">
                <Icon name="MousePointerClick" size={16} className="inline mr-2" />
                Кликните и перетащите для поворота модели
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-6">Размеры шкафа</h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Высота</Label>
                    <span className="text-sm font-medium text-[#1A1F2C]">{height} см</span>
                  </div>
                  <Slider
                    value={[height]}
                    onValueChange={(v) => setHeight(v[0])}
                    min={180}
                    max={240}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Ширина</Label>
                    <span className="text-sm font-medium text-[#1A1F2C]">{width} см</span>
                  </div>
                  <Slider
                    value={[width]}
                    onValueChange={(v) => setWidth(v[0])}
                    min={60}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Глубина</Label>
                    <span className="text-sm font-medium text-[#1A1F2C]">{depth} см</span>
                  </div>
                  <Slider
                    value={[depth]}
                    onValueChange={(v) => setDepth(v[0])}
                    min={40}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-4">Материал</h2>

              <div className="grid grid-cols-2 gap-3">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedMaterial === material.id
                        ? 'border-[#1A1F2C] shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded mb-2"
                      style={{ backgroundColor: material.color }}
                    />
                    <p className="text-sm font-medium text-[#1A1F2C]">{material.name}</p>
                    <p className="text-xs text-gray-500">{material.pricePerUnit} ₽/м³</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-[#1A1F2C] text-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Стоимость</h2>
                <Icon name="Calculator" size={20} />
              </div>
              <div className="text-4xl font-bold mb-2">{calculatePrice().toLocaleString('ru-RU')} ₽</div>
              <p className="text-sm text-gray-300 mb-6">
                {height} × {width} × {depth} см
              </p>
              <Button className="w-full bg-white text-[#1A1F2C] hover:bg-gray-100">
                <Icon name="ShoppingCart" size={18} className="mr-2" />
                Добавить в корзину
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
