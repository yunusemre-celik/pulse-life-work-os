'use client';

import React, { useState } from 'react';
import {
  Palette,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
  Filter,
  Trash2,
  FileEdit,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ClientDesignOrder } from '@/types';
import { sanitizeUrl } from '@/lib/security';

interface ClientsViewProps {
  onOpenAddOrder: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onOpenAddOrder }) => {
  const { state, updateClientOrder, deleteClientOrder } = useApp();
  const [selectedStage, setSelectedStage] = useState<string>('Tümü');

  const stages: Array<ClientDesignOrder['status']> = [
    'Brief Alındı',
    'Taslak Hazır',
    'Revizede',
    'Onaylandı',
    'Teslim Edildi',
  ];

  // Financial calculations
  const totalVolume = state.clientOrders.reduce((sum, o) => sum + o.price, 0);
  const totalCollected = state.clientOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const pendingReceivables = totalVolume - totalCollected;

  const filteredOrders = state.clientOrders.filter((order) => {
    if (selectedStage === 'Tümü') return true;
    return order.status === selectedStage;
  });

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleStageChange = (order: ClientDesignOrder, newStatus: ClientDesignOrder['status']) => {
    updateClientOrder({
      ...order,
      status: newStatus,
    });
  };

  const handlePaymentStatusToggle = (order: ClientDesignOrder) => {
    let nextStatus: ClientDesignOrder['paymentStatus'] = 'Bekliyor';
    let newPaid = 0;

    if (order.paymentStatus === 'Bekliyor') {
      nextStatus = 'Kısmi Ödeme';
      newPaid = Math.round(order.price / 2);
    } else if (order.paymentStatus === 'Kısmi Ödeme') {
      nextStatus = 'Ödendi';
      newPaid = order.price;
    } else {
      nextStatus = 'Bekliyor';
      newPaid = 0;
    }

    updateClientOrder({
      ...order,
      paymentStatus: nextStatus,
      paidAmount: newPaid,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Müşteri Tasarım Siparişleri & CRM
          </h2>
          <p className="text-xs text-neutral-500">
            Sosyal medya tasarımları, teslim aşamaları, revizyonlar ve bütçe/alacak takibi.
          </p>
        </div>

        <button
          onClick={onOpenAddOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Yeni Tasarım İşi Ekle</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <span className="text-xs text-neutral-500">Toplam Sipariş Hacmi</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              ₺{totalVolume.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {state.clientOrders.length} müşteri işi
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <span className="text-xs text-neutral-500">Tahsil Edilen (Kasa)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₺{totalCollected.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Alınan avans ve ücretler</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <span className="text-xs text-neutral-500">Bekleyen Alacaklar</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ₺{pendingReceivables.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs text-purple-600 font-medium">Teslimde tahsil edilecek</span>
          </div>
        </div>
      </div>

      {/* Stage Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStage('Tümü')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            selectedStage === 'Tümü'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
              : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
          }`}
        >
          Tümü ({state.clientOrders.length})
        </button>
        {stages.map((stg) => {
          const count = state.clientOrders.filter((o) => o.status === stg).length;
          return (
            <button
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedStage === stg
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
              }`}
            >
              <span>{stg}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
            Bu aşamada herhangi bir tasarım siparişi bulunamadı.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const daysLeft = getDaysDiff(order.deliveryDate);
            return (
              <div
                key={order.id}
                className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar: Client & Company */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {order.clientName}
                      </h4>
                      {order.clientCompany && (
                        <span className="text-[11px] text-neutral-400 block font-medium">
                          {order.clientCompany}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {order.designType}
                    </span>
                  </div>

                  {/* Project Title & Notes */}
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {order.projectTitle}
                    </h5>
                    {order.briefNotes && (
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-3 leading-relaxed">
                        {order.briefNotes}
                      </p>
                    )}
                  </div>

                  {/* Stage Selector */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      Aşama Durumu
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStageChange(order, e.target.value as ClientDesignOrder['status'])
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    >
                      {stages.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing and Payment Status */}
                  <div className="p-2.5 rounded-lg bg-[#fafafa] dark:bg-[#252525] border border-[#e8e8e6] dark:border-[#2e2e2e] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Tutar & Alacak</span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        ₺{order.price.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        (Alınan: ₺{order.paidAmount.toLocaleString('tr-TR')})
                      </span>
                    </div>

                    <button
                      onClick={() => handlePaymentStatusToggle(order)}
                      title="Ödeme durumunu değiştirmek için tıklayın"
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                        order.paymentStatus === 'Ödendi'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : order.paymentStatus === 'Kısmi Ödeme'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </button>
                  </div>
                </div>

                {/* Bottom Bar: Delivery date & Links & Delete */}
                <div className="pt-3 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        daysLeft <= 1 && order.status !== 'Teslim Edildi'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {order.status === 'Teslim Edildi'
                        ? 'Teslim Edildi'
                        : daysLeft === 0
                        ? 'Bugün Teslim'
                        : `${daysLeft} gün kaldı`}
                    </span>

                    {sanitizeUrl(order.deliveryUrl) && (
                      <a
                        href={sanitizeUrl(order.deliveryUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> Figma / Dosyalar
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => deleteClientOrder(order.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                    title="Siparişi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
