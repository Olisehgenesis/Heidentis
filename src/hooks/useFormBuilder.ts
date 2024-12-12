// hooks/useFormBuilder.ts
import { useState, useCallback } from 'react';
import { useWalletInterface } from '@/services/wallets/useWalletInterface';

// Form templates
export const formTemplates = {
  educational: {
    name: 'Educational Certificate',
    fields: [
      { name: 'Student Name', type: 'text', required: true },
      { name: 'Course', type: 'text', required: true },
      { name: 'Grade', type: 'select', required: true, options: ['A', 'B', 'C', 'D', 'F'] },
      { name: 'Completion Date', type: 'date', required: true },
      { name: 'Certificate ID', type: 'text', required: true }
    ]
  },
  employment: {
    name: 'Employment Verification',
    fields: [
      { name: 'Employee Name', type: 'text', required: true },
      { name: 'Position', type: 'text', required: true },
      { name: 'Start Date', type: 'date', required: true },
      { name: 'End Date', type: 'date', required: false },
      { name: 'Department', type: 'text', required: true }
    ]
  },
  // Add more templates as needed
};

export const useFormBuilder = (storage) => {
  const { accountId } = useWalletInterface();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createForm = async (formData) => {
    try {
      setLoading(true);
      const form = {
        ...formData,
        issuerId: accountId,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      const transactionId = await storage.storeForm(form);
      return { ...form, transactionId };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadFormTemplate = (templateName) => {
    return formTemplates[templateName];
  };

  const updateForm = async (formId, updates) => {
    try {
      setLoading(true);
      const formData = {
        ...updates,
        id: formId,
        updatedAt: new Date().toISOString()
      };
      
      const transactionId = await storage.updateForm(formData);
      return { ...formData, transactionId };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFormsByIssuer = useCallback(async () => {
    try {
      setLoading(true);
      return await storage.getFormsByIssuer(accountId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId, storage]);

  const getSubmissions = async (formId) => {
    try {
      setLoading(true);
      return await storage.getFormSubmissions(formId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createForm,
    updateForm,
    loadFormTemplate,
    getFormsByIssuer,
    getSubmissions,
    loading,
    error
  };
};