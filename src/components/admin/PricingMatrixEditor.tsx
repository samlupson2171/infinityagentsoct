'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { IGroupSizeTier, IPricingEntry, IPricePoint } from '@/models/SuperOfferPackage';

interface PricingMatrixEditorProps {
  groupSizeTiers: IGroupSizeTier[];
  durationOptions: number[];
  pricingMatrix: IPricingEntry[];
  currency: 'EUR' | 'GBP' | 'USD';
  onChange: (pricingMatrix: IPricingEntry[]) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

interface CellKey {
  periodIndex: number;
  tierIndex: number;
  nights: number;
}

const CURRENCY_SYMBOLS = {
  EUR: '€',
  GBP: '£',
  USD: '$'
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PricingMatrixEditor({
  groupSizeTiers,
  durationOptions,
  pricingMatrix,
  currency,
  onChange,
  onValidationChange
}: PricingMatrixEditorProps) {
  const [editingCell, setEditingCell] = useState<CellKey | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    period: '',
    periodType: 'month' as 'month' | 'special',
    startDate: '',
    endDate: ''
  });

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  // Get price for a specific cell
  const getPrice = useCallback((periodIndex: number, tierIndex: number, nights: number): number | 'ON_REQUEST' | null => {
    const entry = pricingMatrix[periodIndex];
    if (!entry) return null;
    
    const pricePoint = entry.prices.find(
      p => p.groupSizeTierIndex === tierIndex && p.nights === nights
    );
    
    return pricePoint ? pricePoint.price : null;
  }, [pricingMatrix]);

  // Update a specific price
  const updatePrice = useCallback((periodIndex: number, tierIndex: number, nights: number, price: number | 'ON_REQUEST') => {
    const newMatrix = [...pricingMatrix];
    const entry = newMatrix[periodIndex];
    
    if (!entry) return;
    
    const pricePointIndex = entry.prices.findIndex(
      p => p.groupSizeTierIndex === tierIndex && p.nights === nights
    );
    
    if (pricePointIndex >= 0) {
      entry.prices[pricePointIndex].price = price;
    } else {
      entry.prices.push({
        groupSizeTierIndex: tierIndex,
        nights,
        price
      });
    }
    
    onChange(newMatrix);
  }, [pricingMatrix, onChange]);

  // Start editing a cell
  const startEditing = useCallback((periodIndex: number, tierIndex: number, nights: number) => {
    const currentPrice = getPrice(periodIndex, tierIndex, nights);
    setEditingCell({ periodIndex, tierIndex, nights });
    setEditValue(currentPrice === null ? '' : currentPrice === 'ON_REQUEST' ? 'ON REQUEST' : String(currentPrice));
  }, [getPrice]);

  // Save edited cell
  const saveEdit = useCallback(() => {
    if (!editingCell) return;
    
    const trimmedValue = editValue.trim().toUpperCase();
    
    if (trimmedValue === '' || trimmedValue === 'ON REQUEST' || trimmedValue === 'ON_REQUEST') {
      updatePrice(editingCell.periodIndex, editingCell.tierIndex, editingCell.nights, 'ON_REQUEST');
    } else {
      const numValue = parseFloat(trimmedValue);
      if (!isNaN(numValue) && numValue >= 0) {
        updatePrice(editingCell.periodIndex, editingCell.tierIndex, editingCell.nights, numValue);
      }
    }
    
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, updatePrice]);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Handle key press in edit mode
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  // Add new period
  const addPeriod = useCallback(() => {
    if (!newPeriod.period.trim()) return;
    
    const entry: IPricingEntry = {
      period: newPeriod.period.trim(),
      periodType: newPeriod.periodType,
      prices: []
    };
    
    if (newPeriod.periodType === 'special' && newPeriod.startDate && newPeriod.endDate) {
      entry.startDate = new Date(newPeriod.startDate);
      entry.endDate = new Date(newPeriod.endDate);
    }
    
    onChange([...pricingMatrix, entry]);
    setNewPeriod({ period: '', periodType: 'month', startDate: '', endDate: '' });
    setShowAddPeriod(false);
  }, [newPeriod, pricingMatrix, onChange]);

  // Remove period
  const removePeriod = useCallback((index: number) => {
    if (confirm('Are you sure you want to remove this period? All pricing data for this period will be lost.')) {
      const newMatrix = pricingMatrix.filter((_, i) => i !== index);
      onChange(newMatrix);
    }
  }, [pricingMatrix, onChange]);

  // Edit period
  const editPeriod = useCallback((index: number) => {
    const entry = pricingMatrix[index];
    const newPeriodName = prompt('Enter new period name:', entry.period);
    
    if (newPeriodName && newPeriodName.trim()) {
      const newMatrix = [...pricingMatrix];
      newMatrix[index].period = newPeriodName.trim();
      onChange(newMatrix);
    }
  }, [pricingMatrix, onChange]);

  // Validate matrix completeness
  const validation = useMemo(() => {
    const errors: string[] = [];
    const totalCells = pricingMatrix.length * groupSizeTiers.length * durationOptions.length;
    let filledCells = 0;
    
    pricingMatrix.forEach((entry, periodIndex) => {
      groupSizeTiers.forEach((tier, tierIndex) => {
        durationOptions.forEach(nights => {
          const price = getPrice(periodIndex, tierIndex, nights);
          if (price !== null) {
            filledCells++;
          }
        });
      });
    });
    
    if (pricingMatrix.length === 0) {
      errors.push('At least one pricing period is required');
    }
    
    if (filledCells < totalCells) {
      errors.push(`${totalCells - filledCells} cells are empty. All cells must have a price or "ON REQUEST".`);
    }
    
    const isValid = errors.length === 0;
    
    if (onValidationChange) {
      onValidationChange(isValid, errors);
    }
    
    return { isValid, errors, filledCells, totalCells };
  }, [pricingMatrix, groupSizeTiers, durationOptions, getPrice, onValidationChange]);

  // Format cell display
  const formatCellValue = useCallback((value: number | 'ON_REQUEST' | null): string => {
    if (value === null) return '-';
    if (value === 'ON_REQUEST') return 'ON REQUEST';
    return `${currencySymbol}${value.toFixed(2)}`;
  }, [currencySymbol]);

  // Check if cell is being edited
  const isCellEditing = useCallback((periodIndex: number, tierIndex: number, nights: number): boolean => {
    return editingCell !== null &&
      editingCell.periodIndex === periodIndex &&
      editingCell.tierIndex === tierIndex &&
      editingCell.nights === nights;
  }, [editingCell]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pricing Matrix</h3>
        <button
          type="button"
          onClick={() => setShowAddPeriod(!showAddPeriod)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {showAddPeriod ? 'Cancel' : 'Add Period'}
        </button>
      </div>

      {/* Validation Status */}
      {!validation.isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm font-medium text-yellow-800 mb-1">Validation Issues:</p>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.isValid && pricingMatrix.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-green-700">
            ✓ Pricing matrix is complete ({validation.filledCells} cells filled)
          </p>
        </div>
      )}

      {/* Add Period Form */}
      {showAddPeriod && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
          <h4 className="font-medium">Add New Period</h4>
          
          <div>
            <label htmlFor="period-type" className="block text-sm font-medium mb-1">Period Type</label>
            <select
              id="period-type"
              value={newPeriod.periodType}
              onChange={(e) => setNewPeriod({ ...newPeriod, periodType: e.target.value as 'month' | 'special' })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="month">Month</option>
              <option value="special">Special Period</option>
            </select>
          </div>

          {newPeriod.periodType === 'month' ? (
            <div>
              <label htmlFor="period-month" className="block text-sm font-medium mb-1">Month</label>
              <select
                id="period-month"
                value={newPeriod.period}
                onChange={(e) => setNewPeriod({ ...newPeriod, period: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select month...</option>
                {MONTHS.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="period-name" className="block text-sm font-medium mb-1">Period Name</label>
                <input
                  id="period-name"
                  type="text"
                  value={newPeriod.period}
                  onChange={(e) => setNewPeriod({ ...newPeriod, period: e.target.value })}
                  placeholder="e.g., Easter 2025"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="period-start-date" className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    id="period-start-date"
                    type="date"
                    value={newPeriod.startDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label htmlFor="period-end-date" className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    id="period-end-date"
                    type="date"
                    value={newPeriod.endDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={addPeriod}
            disabled={!newPeriod.period.trim()}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Period
          </button>
        </div>
      )}

      {/* Pricing Matrix Grid */}
      {pricingMatrix.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pricing periods defined. Click "Add Period" to get started.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r">
                  Period
                </th>
                {groupSizeTiers.map((tier, tierIndex) => (
                  <React.Fragment key={tierIndex}>
                    {durationOptions.map(nights => (
                      <th
                        key={`${tierIndex}-${nights}`}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        <div>{tier.label}</div>
                        <div className="text-gray-500 font-normal">{nights} night{nights !== 1 ? 's' : ''}</div>
                      </th>
                    ))}
                  </React.Fragment>
                ))}
                <th className="sticky right-0 z-10 bg-gray-50 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingMatrix.map((entry, periodIndex) => (
                <tr key={periodIndex} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r whitespace-nowrap">
                    <div>{entry.period}</div>
                    {entry.periodType === 'special' && entry.startDate && entry.endDate && (
                      <div className="text-xs text-gray-500">
                        {new Date(entry.startDate).toLocaleDateString()} - {new Date(entry.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  {groupSizeTiers.map((tier, tierIndex) => (
                    <React.Fragment key={tierIndex}>
                      {durationOptions.map(nights => {
                        const price = getPrice(periodIndex, tierIndex, nights);
                        const isEditing = isCellEditing(periodIndex, tierIndex, nights);
                        
                        return (
                          <td
                            key={`${tierIndex}-${nights}`}
                            className="px-2 py-2 text-sm text-center cursor-pointer hover:bg-blue-50"
                            onClick={() => !isEditing && startEditing(periodIndex, tierIndex, nights)}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="w-full px-2 py-1 border border-blue-500 rounded text-center"
                                placeholder="Price or ON REQUEST"
                              />
                            ) : (
                              <div className={`px-2 py-1 rounded ${price === null ? 'text-gray-400' : price === 'ON_REQUEST' ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                                {formatCellValue(price)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  <td className="sticky right-0 z-10 bg-white px-4 py-3 text-sm text-center border-l whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => editPeriod(periodIndex)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Edit period name"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removePeriod(periodIndex)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove period"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        <p className="font-medium mb-1">How to use:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click any cell to edit the price</li>
          <li>Enter a number for the price, or type "ON REQUEST" for on-request pricing</li>
          <li>Press Enter to save, Escape to cancel</li>
          <li>All cells must be filled for the matrix to be valid</li>
          <li>Use "Add Period" to add months or special date ranges</li>
        </ul>
      </div>
    </div>
  );
}
