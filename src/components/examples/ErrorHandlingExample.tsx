/**
 * Error Handling Example Component
 * 
 * Demonstrates usage of error handling, loading states, and toast notifications.
 * This file serves as a reference for implementing these patterns across the app.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingState, ProgressBar, AILoadingState } from '@/components/LoadingState';
import { Toast } from '@/components/Toast';
import { useLoadingState, useUploadProgress } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function ErrorHandlingExample() {
  const [showLoading, setShowLoading] = useState(false);
  const { isLoading, error, execute } = useLoadingState({
    showSuccessToast: true,
    successMessage: 'Operation completed!',
  });
  const { progress, isUploading, startUpload, updateProgress, completeUpload, failUpload } = useUploadProgress();

  // Example: Simple API call with loading state
  const handleSimpleOperation = async () => {
    await execute(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    });
  };

  // Example: File upload with progress
  const handleFileUpload = async () => {
    startUpload();
    
    try {
      // Simulate file upload with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(i);
      }
      completeUpload();
      Toast.success('File uploaded successfully!');
    } catch (err) {
      failUpload(err);
    }
  };

  // Example: Toast notifications
  const showToastExamples = () => {
    Toast.success('This is a success message!');
    setTimeout(() => Toast.error('This is an error message!'), 1000);
    setTimeout(() => Toast.warning('This is a warning message!'), 2000);
    setTimeout(() => Toast.info('This is an info message!'), 3000);
  };

  // Example: Promise toast
  const handlePromiseToast = async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: 'Success!' }), 2000);
    });

    Toast.promise(promise, {
      loading: 'Processing...',
      success: 'Operation completed!',
      error: 'Operation failed!',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Handling & Loading States</h1>
        <p className="text-slate-600">Examples of error handling, loading states, and user feedback</p>
      </div>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading States</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Spinner</h3>
            <LoadingState variant="spinner" message="Loading data..." />
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Skeleton</h3>
            <LoadingState variant="skeleton" rows={2} />
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">AI Loading</h3>
            <AILoadingState operation="flashcards" />
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Progress Bar</h2>
        
        <div className="border rounded-lg p-6 space-y-4">
          <ProgressBar 
            progress={progress} 
            label="Uploading file..." 
            showPercentage 
          />
          
          <Button 
            onClick={handleFileUpload} 
            disabled={isUploading}
            isLoading={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Start Upload'}
          </Button>
        </div>
      </section>

      {/* Toast Notifications */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast Notifications</h2>
        
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => Toast.success('Success!')}>
              Success Toast
            </Button>
            <Button onClick={() => Toast.error('Error occurred!')}>
              Error Toast
            </Button>
            <Button onClick={() => Toast.warning('Warning!')}>
              Warning Toast
            </Button>
            <Button onClick={() => Toast.info('Information')}>
              Info Toast
            </Button>
            <Button onClick={showToastExamples} variant="outline">
              Show All
            </Button>
            <Button onClick={handlePromiseToast} variant="secondary">
              Promise Toast
            </Button>
          </div>
        </div>
      </section>

      {/* API Call with Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">API Call with Loading State</h2>
        
        <div className="border rounded-lg p-6 space-y-4">
          <Button 
            onClick={handleSimpleOperation}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Execute API Call
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              Error: {error.message}
            </div>
          )}
        </div>
      </section>

      {/* Long Running Operation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Long Running Operation</h2>
        
        <div className="border rounded-lg p-6 space-y-4">
          <Button onClick={() => setShowLoading(!showLoading)}>
            Toggle Long Loading
          </Button>
          
          {showLoading && (
            <LoadingState 
              variant="spinner" 
              message="Processing your request..."
              showLongRunningMessage
              longRunningThreshold={3000}
            />
          )}
        </div>
      </section>
    </div>
  );
}
