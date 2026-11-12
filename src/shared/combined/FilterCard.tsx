import React from 'react';
import { RefreshCcw, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormInput } from '@/src/shared/partials/FormInput';

export interface FilterField {
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'selectsearch' | 'daterange' | 'date2' | 'toggle' | 'multiselect' | 'dropdown_checkbox';
  label: string;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  span?: number;
  mdSpan?: number;
  loading?: boolean;
}

export interface FilterCardProps {
  fields: FilterField[];
  modelValue: Record<string, any>;
  onUpdateModelValue: (newVal: Record<string, any>) => void;
  onApply: () => void;
  onReset: () => void;
  resetLabel?: string;
  applyLabel?: string;
  buttonSpan?: number;
  buttonMdSpan?: number;
}

const getSpanClass = (span: number = 3) => {
  const spans: Record<number, string> = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
  };
  return spans[span] || 'lg:col-span-3';
};

const getMdSpanClass = (span?: number) => {
  if (!span) return '';
  const spans: Record<number, string> = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    12: 'md:col-span-12',
  };
  return spans[span] || '';
};

export function FilterCard({
  fields,
  modelValue,
  onUpdateModelValue,
  onApply,
  onReset,
  resetLabel = 'Reset',
  applyLabel = 'Terapkan Filter',
  buttonSpan = 3,
  buttonMdSpan = 2,
}: FilterCardProps) {
  const update = (key: string, value: any) => {
    onUpdateModelValue({ ...modelValue, [key]: value });
  };

  return (
    <div className="mb-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        {fields.map((field) => (
          <div
            key={field.key}
            className={`flex flex-col gap-2 ${getMdSpanClass(field.mdSpan)} ${getSpanClass(field.span)}`}
          >
            <label className="text-xs font-bold text-sky-700 uppercase tracking-wider ml-1">
              {field.label}
            </label>

            {field.type === 'toggle' ? (
              <div className="relative flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full h-[42px]">
                {field.options?.map((opt) => {
                  const isActive = String(modelValue[field.key]) === String(opt.value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => update(field.key, opt.value)}
                      className={`flex-1 relative z-10 text-xs font-bold rounded-lg transition-all duration-300 h-full flex items-center justify-center ${
                        isActive
                          ? 'text-sky-700 shadow-sm bg-white border border-slate-200/50'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <FormInput
                type={
                  field.type === 'selectsearch' || field.type === 'dropdown_checkbox' || field.type === 'multiselect'
                    ? 'combobox'
                    : field.type === 'daterange'
                    ? 'text'
                    : field.type === 'date2'
                    ? 'date'
                    : field.type
                }
                placeholder={field.placeholder || `Semua ${field.label}`}
                value={modelValue[field.key] || ''}
                onChange={(val) => update(field.key, val)}
                options={
                  field.type === 'select' || field.type === 'selectsearch' || field.type === 'dropdown_checkbox' || field.type === 'multiselect'
                    ? [{ label: `Semua ${field.label}`, value: '' }, ...(field.options || [])]
                    : field.options as any
                }
              />
            )}
          </div>
        ))}

        <div className={`flex items-center gap-3 w-full h-[42px] ${getMdSpanClass(buttonMdSpan)} ${getSpanClass(buttonSpan)}`}>
          <button
            onClick={onReset}
            type="button"
            className="flex-1 h-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            title="Reset Filter"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden xl:inline">{resetLabel}</span>
          </button>

          <button
            onClick={onApply}
            type="button"
            className="flex-[2] h-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-bold rounded-xl shadow-sm shadow-sky-200 transition-all flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>{applyLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
