'use client';

import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, TrendingDown, Minus, Eye, EyeOff, RefreshCw, Activity, Clock, Target, Brain, Zap } from 'lucide-react';

const CryptoDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [showJsonDebug, setShowJsonDebug] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch predictions from API
  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/receive-prediction');
      const data = await response.json();
      
      if (data.success) {
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const requestLatestPrediction = async () => {
  setIsLoading(true);
  try {
    // Call your own backend API route (which proxies the n8n webhook)
    const response = await fetch('/api/trigger-n8n', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: true }) // Send minimal payload if needed
    });

    const result = await response.json();
    console.log('n8n trigger result:', result);

    if (response.ok) {
      showNotification('Prediction requested via n8n!', 'success');
      fetchPredictions(); // Optional: reload predictions after webhook completes
    } else {
      showNotification('Failed to trigger n8n workflow', 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Error triggering workflow', 'error');
  } finally {
    setIsLoading(false);
  }
};



  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'bullish': return 'bg-green-500';
      case 'bearish': return 'bg-red-500';
      case 'neutral': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />;
      case 'bearish': return <TrendingDown className="w-4 h-4" />;
      case 'neutral': return <Minus className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch(recommendation) {
      case 'Trade': return 'bg-blue-500 hover:bg-blue-600';
      case 'Wait': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Hold': return 'bg-green-500 hover:bg-green-600';
      case 'Exit': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Load predictions on component mount
  useEffect(() => {
    fetchPredictions();
    
    // Set up polling for new predictions every 30 seconds
    const interval = setInterval(fetchPredictions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Dark mode persistence
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white flex items-center gap-2`}>
          <Bell className="w-5 h-5" />
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Crypto Predictions</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-time market intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? '🌙' : '☀️'}
              </button>
              
              <button
                onClick={requestLatestPrediction}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Request Prediction'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Predictions</p>
                <p className="text-2xl font-bold">{predictions.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {predictions.length > 0 ? Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length) : 0}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Update</p>
                <p className="text-2xl font-bold">
                  {predictions.length > 0 ? formatTimestamp(predictions[0].timestamp).split(',')[1] : '--:--'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Predictions Grid */}
        <div className="space-y-6">
          {predictions.length === 0 ? (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-12 text-center shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Click "Request Prediction" to get started
              </p>
            </div>
          ) : (
            predictions.map((prediction, index) => (
              <div
                key={prediction.prediction_id}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${getSentimentColor(prediction.sentiment)}`}>
                      {getSentimentIcon(prediction.sentiment)}
                      {prediction.sentiment.charAt(0).toUpperCase() + prediction.sentiment.slice(1)}
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(prediction.recommendation)} text-white`}>
                      {prediction.recommendation}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTimestamp(prediction.timestamp)}
                      </span>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      ID: {prediction.prediction_id.split('_')[1]}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Reasoning
                    </h4>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {prediction.reasoning}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Confidence Level
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accuracy</span>
                        <span className="text-sm font-medium">{prediction.confidence}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* JSON Debug Viewer */}
        <div className="mt-8">
          <button
            onClick={() => setShowJsonDebug(!showJsonDebug)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {showJsonDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showJsonDebug ? 'Hide' : 'Show'} JSON Debug
          </button>
          
          {showJsonDebug && predictions.length > 0 && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h4 className="font-semibold mb-2">Latest Prediction JSON:</h4>
              <pre className={`text-sm overflow-x-auto ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {JSON.stringify(predictions[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;