import { useState, useEffect } from 'react';
import { useApiConfigStore } from '@/store/apiConfigStore';
import { useToast } from '@/hooks/useToast'; // Corrected import path

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add a type definition for the model data
interface ModelData {
  id: string;
  // Replace any with a more specific type
  [key: string]: string | number | boolean | null | undefined;
}

export default function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
  const { 
    baseUrl, 
    apiKey, 
    setBaseUrl, 
    setApiKey, 
    setAvailableModels, 
    setSelectedModel,
    setIsConfigured 
  } = useApiConfigStore();
  
  const { showToast } = useToast();
  
  const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setLocalBaseUrl(baseUrl);
      setLocalApiKey(apiKey);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, baseUrl, apiKey]);
  
  const normalizeBaseUrl = (url: string): string => {
    if (!url) return '';
    
    // Remove trailing slashes
    let normalized = url.trim().replace(/\/+$/, '');
    
    // Ensure URL has http:// or https:// prefix
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    
    // Don't add /v1 as it's already included in the baseUrl from the server
    // or will be added by the specific endpoints
    
    return normalized;
  };
  
  const handleCheckModels = async () => {
    setIsChecking(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const normalizedBaseUrl = normalizeBaseUrl(localBaseUrl);
      const endpoint = `${normalizedBaseUrl}/models`;
      console.log(`Checking models at: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localApiKey}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = '';
        
        // Handle specific error codes with user-friendly messages
        if (response.status === 401) {
          errorMessage = 'Authentication failed: Please check your API key.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied: You don\'t have permission to access this resource.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found: Please check your API URL.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded: Too many requests. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = `Server error (${response.status}): The API provider is experiencing issues.`;
        } else {
          errorMessage = `API request failed with status ${response.status}`;
        }
        
        // Instead of throwing, handle the error directly
        setError(errorMessage);
        showToast(`API Configuration Error: ${errorMessage}`, 'error');
        setIsChecking(false);
        return;
      }
      
      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        const errorMessage = 'Invalid response format from API. Please check your API URL.';
        setError(errorMessage);
        showToast(`API Configuration Error: ${errorMessage}`, 'error');
        setIsChecking(false);
        return;
      }
      
      const models = data.data.map((model: ModelData) => ({
        id: model.id,
        name: model.id
      }));
      
      if (models.length === 0) {
        const errorMessage = 'No models found. Please check your API configuration.';
        setError(errorMessage);
        showToast(`API Configuration Error: ${errorMessage}`, 'error');
        setIsChecking(false);
        return;
      }
      
      const successMsg = `Successfully found ${models.length} models!`;
      setSuccessMessage(successMsg);
      showToast(successMsg, 'success');
      setAvailableModels(models);
      setSelectedModel(models[0].id);
    } catch (err) {
      console.error('Error checking models:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to API';
      setError(errorMsg);
      showToast(`API Configuration Error: ${errorMsg}`, 'error');
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleSave = () => {
    const normalizedBaseUrl = normalizeBaseUrl(localBaseUrl);
    setBaseUrl(normalizedBaseUrl);
    setApiKey(localApiKey);
    setIsConfigured(true);
    showToast('API configuration saved successfully!', 'success');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-850 rounded-xl max-w-md w-full p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">API Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Base URL
            </label>
            <input
              id="baseUrl"
              type="text"
              value={localBaseUrl}
              onChange={(e) => setLocalBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the base URL for your API (e.g., https://api.example.com/v1)
            </p>
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-sm text-green-200">
              {successMessage}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCheckModels}
              disabled={!localBaseUrl || !localApiKey || isChecking}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center ${
                !localBaseUrl || !localApiKey || isChecking
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isChecking ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (
                'Check Models'
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={!successMessage || isChecking}
              className={`flex-1 py-2 px-4 rounded-lg ${
                !successMessage || isChecking
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Save
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 px-4 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 