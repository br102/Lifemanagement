import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ReceiptLineItem } from '../../types';

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadReceiptModal({ isOpen, onClose, onSuccess }: UploadReceiptModalProps) {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parsedDraft, setParsedDraft] = useState<{ store: string; purchaseDate: string; totalAmount?: number; items: ReceiptLineItem[] } | null>(null);

  const { uploadReceiptImage, parseReceiptImage, confirmReceipt } = useApp();
  const { register, handleSubmit, control, watch, formState } = useForm({
    defaultValues: {
      store: 'Biedronka',
      purchaseDate: new Date().toISOString().split('T')[0],
      totalAmount: '',
      items: parsedDraft?.items || [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10MB');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);
      const url = await uploadReceiptImage(file);
      setImageUrl(url);

      setParseLoading(true);
      const draft = await parseReceiptImage(url);
      setParsedDraft(draft);
      setStep('review');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process receipt');
    } finally {
      setUploadLoading(false);
      setParseLoading(false);
      setFileInputKey((k) => k + 1);
    }
  };

  const onSubmit = async (data: any) => {
    if (!imageUrl || !parsedDraft) return;
    try {
      setUploadLoading(true);
      await confirmReceipt(data.store, data.purchaseDate, data.totalAmount ? parseFloat(data.totalAmount) : undefined, imageUrl, items);
      onSuccess();
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to save receipt');
    } finally {
      setUploadLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-white text-lg font-semibold">Upload Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' ? (
            <div>
              <label className="block">
                <div className="border-2 border-dashed border-amber-200 dark:border-amber-800/50 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-300 transition-colors">
                  <Upload className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Upload a Biedronka receipt</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Supported formats: JPG, PNG, PDF (max 10MB)</p>
                </div>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileSelect}
                  disabled={uploadLoading || parseLoading}
                  className="hidden"
                />
              </label>

              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{uploadError}</p>
                </div>
              )}

              {(uploadLoading || parseLoading) && (
                <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  <p className="text-violet-700 dark:text-violet-300 text-sm font-semibold">
                    {uploadLoading ? 'Uploading receipt...' : 'Analyzing receipt...'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Store & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">Store</label>
                    <input
                      type="text"
                      {...register('store')}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">Purchase Date</label>
                    <input
                      type="date"
                      {...register('purchaseDate')}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">Total Amount (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('totalAmount')}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold">Items</label>
                    <button
                      type="button"
                      onClick={() => append({ name: '', quantity: 1, unit: 'pcs', price: 0 })}
                      className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200"
                    >
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
                        <input
                          placeholder="Name"
                          {...register(`items.${idx}.name`)}
                          className="col-span-2 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Qty"
                          {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                          className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <select
                          {...register(`items.${idx}.unit`)}
                          className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                          <option value="pcs">pcs</option>
                        </select>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="€"
                            {...register(`items.${idx}.price`, { valueAsNumber: true })}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 dark:text-red-300 text-sm">{uploadError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep('upload');
                    setParsedDraft(null);
                    setImageUrl(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || formState.isSubmitting}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Receipt
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
