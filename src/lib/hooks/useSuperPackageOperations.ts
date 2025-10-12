'use client';

/**
 * Hook for super package operations with integrated error handling and user feedback
 */

import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
import { ErrorCode } from '@/lib/error-handling';

interface OperationState {
  isLoading: boolean;
  error: string | null;
}

export function useSuperPackageOperations() {
  const { showSuccess, showError, showWarning } = useToast();
  const [operationState, setOperationState] = useState<OperationState>({
    isLoading: false,
    error: null,
  });

  const handleOperation = async <T,>(
    operation: () => Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<T | null> => {
    setOperationState({ isLoading: true, error: null });

    try {
      const result = await operation();

      if (options.successMessage) {
        showSuccess(options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      setOperationState({ isLoading: false, error: null });
      return result;
    } catch (error: any) {
      const errorMessage =
        error.message || options.errorMessage || 'An error occurred';

      showError('Operation Failed', errorMessage, error.code);

      if (options.onError) {
        options.onError(error);
      }

      setOperationState({ isLoading: false, error: errorMessage });
      return null;
    }
  };

  const createPackage = async (data: any) => {
    return handleOperation(
      async () => {
        const response = await fetch('/api/admin/super-packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to create package');
        }

        return response.json();
      },
      {
        successMessage: 'Package created successfully',
        errorMessage: 'Failed to create package',
      }
    );
  };

  const updatePackage = async (id: string, data: any) => {
    return handleOperation(
      async () => {
        const response = await fetch(`/api/admin/super-packages/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to update package');
        }

        return response.json();
      },
      {
        successMessage: 'Package updated successfully',
        errorMessage: 'Failed to update package',
      }
    );
  };

  const deletePackage = async (id: string, force: boolean = false) => {
    return handleOperation(
      async () => {
        const response = await fetch(
          `/api/admin/super-packages/${id}?force=${force}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const error = await response.json();
          if (error.error?.code === ErrorCode.PACKAGE_HAS_LINKED_QUOTES) {
            throw {
              code: ErrorCode.PACKAGE_HAS_LINKED_QUOTES,
              message: error.error.message,
              details: error.error.details,
            };
          }
          throw new Error(error.error?.message || 'Failed to delete package');
        }

        return response.json();
      },
      {
        successMessage: force
          ? 'Package soft-deleted successfully'
          : 'Package deleted successfully',
        errorMessage: 'Failed to delete package',
      }
    );
  };

  const togglePackageStatus = async (id: string, status: 'active' | 'inactive') => {
    return handleOperation(
      async () => {
        const response = await fetch(`/api/admin/super-packages/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error?.message || 'Failed to update package status'
          );
        }

        return response.json();
      },
      {
        successMessage: `Package ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        errorMessage: 'Failed to update package status',
      }
    );
  };

  const importPackage = async (file: File) => {
    return handleOperation(
      async () => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/super-packages/import', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to import package');
        }

        return response.json();
      },
      {
        successMessage: 'Package imported successfully',
        errorMessage: 'Failed to import package',
      }
    );
  };

  const confirmImport = async (data: any) => {
    return handleOperation(
      async () => {
        const response = await fetch(
          '/api/admin/super-packages/import/confirm',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error?.message || 'Failed to confirm import'
          );
        }

        return response.json();
      },
      {
        successMessage: 'Package import confirmed successfully',
        errorMessage: 'Failed to confirm import',
      }
    );
  };

  const calculatePrice = async (params: {
    packageId: string;
    numberOfPeople: number;
    numberOfNights: number;
    arrivalDate: string;
  }) => {
    return handleOperation(
      async () => {
        const response = await fetch(
          '/api/admin/super-packages/calculate-price',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          if (error.error?.code === ErrorCode.PRICE_ON_REQUEST) {
            showWarning(
              'Price on Request',
              'This pricing is available on request. Please enter manually.'
            );
            return { priceOnRequest: true };
          }
          throw new Error(
            error.error?.message || 'Failed to calculate price'
          );
        }

        return response.json();
      },
      {
        errorMessage: 'Failed to calculate price',
      }
    );
  };

  const linkPackageToQuote = async (
    quoteId: string,
    params: {
      packageId: string;
      numberOfPeople: number;
      numberOfNights: number;
      arrivalDate: string;
    }
  ) => {
    return handleOperation(
      async () => {
        const response = await fetch(
          `/api/admin/quotes/${quoteId}/link-package`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error?.message || 'Failed to link package to quote'
          );
        }

        return response.json();
      },
      {
        successMessage: 'Package linked to quote successfully',
        errorMessage: 'Failed to link package to quote',
      }
    );
  };

  return {
    ...operationState,
    createPackage,
    updatePackage,
    deletePackage,
    togglePackageStatus,
    importPackage,
    confirmImport,
    calculatePrice,
    linkPackageToQuote,
    handleOperation,
  };
}
