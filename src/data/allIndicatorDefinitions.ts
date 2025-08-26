import { IndicatorDefinition } from '@/types/strategy';

export const allIndicatorDefinitions: IndicatorDefinition[] = [
  // Moving Averages
  {
    type: 'MA',
    name: 'Moving Average',
    description: 'Simple, Exponential, or Weighted Moving Average',
    category: 'Trend',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 1,
        max: 200,
        step: 1,
        required: true
      },
      {
        name: 'type',
        label: 'MA Type',
        type: 'select',
        defaultValue: 'SMA',
        options: [
          { label: 'Simple Moving Average', value: 'SMA' },
          { label: 'Exponential Moving Average', value: 'EMA' },
          { label: 'Weighted Moving Average', value: 'WMA' }
        ],
        required: true
      },
      {
        name: 'source',
        label: 'Price Source',
        type: 'select',
        defaultValue: 'close',
        options: [
          { label: 'Close', value: 'close' },
          { label: 'Open', value: 'open' },
          { label: 'High', value: 'high' },
          { label: 'Low', value: 'low' },
          { label: 'HL2', value: 'hl2' },
          { label: 'HLC3', value: 'hlc3' },
          { label: 'OHLC4', value: 'ohlc4' }
        ],
        required: true
      }
    ],
    outputs: [
      { name: 'ma', label: 'Moving Average', description: 'The calculated moving average value' }
    ]
  },
  
  // Oscillators
  {
    type: 'RSI',
    name: 'Relative Strength Index',
    description: 'Momentum oscillator measuring speed and change of price movements',
    category: 'Momentum',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        step: 1,
        required: true
      },
      {
        name: 'source',
        label: 'Price Source',
        type: 'select',
        defaultValue: 'close',
        options: [
          { label: 'Close', value: 'close' },
          { label: 'Open', value: 'open' },
          { label: 'High', value: 'high' },
          { label: 'Low', value: 'low' }
        ],
        required: true
      },
      {
        name: 'overbought',
        label: 'Overbought Level',
        type: 'number',
        defaultValue: 70,
        min: 50,
        max: 90,
        step: 1,
        required: false
      },
      {
        name: 'oversold',
        label: 'Oversold Level',
        type: 'number',
        defaultValue: 30,
        min: 10,
        max: 50,
        step: 1,
        required: false
      }
    ],
    outputs: [
      { name: 'rsi', label: 'RSI Value', description: 'The RSI value between 0 and 100' }
    ]
  },

  {
    type: 'MACD',
    name: 'Moving Average Convergence Divergence',
    description: 'Trend-following momentum indicator',
    category: 'Momentum',
    parameters: [
      {
        name: 'fastPeriod',
        label: 'Fast Period',
        type: 'number',
        defaultValue: 12,
        min: 1,
        max: 50,
        step: 1,
        required: true
      },
      {
        name: 'slowPeriod',
        label: 'Slow Period',
        type: 'number',
        defaultValue: 26,
        min: 1,
        max: 100,
        step: 1,
        required: true
      },
      {
        name: 'signalPeriod',
        label: 'Signal Period',
        type: 'number',
        defaultValue: 9,
        min: 1,
        max: 50,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'macd', label: 'MACD Line', description: 'The MACD line (fast EMA - slow EMA)' },
      { name: 'signal', label: 'Signal Line', description: 'The signal line (EMA of MACD line)' },
      { name: 'histogram', label: 'Histogram', description: 'The histogram (MACD - Signal)' }
    ]
  },

  // Volatility Indicators
  {
    type: 'BB',
    name: 'Bollinger Bands',
    description: 'Volatility bands around moving average',
    category: 'Volatility',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 2,
        max: 100,
        step: 1,
        required: true
      },
      {
        name: 'standardDeviations',
        label: 'Standard Deviations',
        type: 'number',
        defaultValue: 2,
        min: 0.1,
        max: 5,
        step: 0.1,
        required: true
      }
    ],
    outputs: [
      { name: 'upperBand', label: 'Upper Band', description: 'The upper Bollinger band' },
      { name: 'middleBand', label: 'Middle Band', description: 'The middle band (moving average)' },
      { name: 'lowerBand', label: 'Lower Band', description: 'The lower Bollinger band' }
    ]
  },

  {
    type: 'ATR',
    name: 'Average True Range',
    description: 'Measures market volatility',
    category: 'Volatility',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'atr', label: 'ATR', description: 'Average True Range value' }
    ]
  },

  // Volume Indicators
  {
    type: 'OBV',
    name: 'On Balance Volume',
    description: 'Volume-price trend indicator',
    category: 'Volume',
    parameters: [],
    outputs: [
      { name: 'obv', label: 'OBV', description: 'On Balance Volume value' }
    ]
  },

  {
    type: 'MFI',
    name: 'Money Flow Index',
    description: 'Volume-weighted RSI',
    category: 'Volume',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'mfi', label: 'MFI', description: 'Money Flow Index value' }
    ]
  },

  {
    type: 'VWAP',
    name: 'Volume Weighted Average Price',
    description: 'Average price weighted by volume',
    category: 'Volume',
    parameters: [
      {
        name: 'period',
        label: 'Period Type',
        type: 'select',
        defaultValue: 'session',
        options: [
          { label: 'Session', value: 'session' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' }
        ],
        required: true
      }
    ],
    outputs: [
      { name: 'vwap', label: 'VWAP', description: 'Volume Weighted Average Price' }
    ]
  },

  // Support/Resistance
  {
    type: 'PIVOT',
    name: 'Pivot Points',
    description: 'Support and resistance levels',
    category: 'Support/Resistance',
    parameters: [
      {
        name: 'type',
        label: 'Pivot Type',
        type: 'select',
        defaultValue: 'standard',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Fibonacci', value: 'fibonacci' },
          { label: 'Woodie', value: 'woodie' },
          { label: 'Camarilla', value: 'camarilla' }
        ],
        required: true
      }
    ],
    outputs: [
      { name: 'pivot', label: 'Pivot Point', description: 'Main pivot point' },
      { name: 'r1', label: 'Resistance 1', description: 'First resistance level' },
      { name: 'r2', label: 'Resistance 2', description: 'Second resistance level' },
      { name: 's1', label: 'Support 1', description: 'First support level' },
      { name: 's2', label: 'Support 2', description: 'Second support level' }
    ]
  },

  // Add more indicators to reach 20 total
  {
    type: 'STOCH',
    name: 'Stochastic Oscillator',
    description: 'Momentum indicator comparing closing price to price range',
    category: 'Momentum',
    parameters: [
      {
        name: 'kPeriod',
        label: '%K Period',
        type: 'number',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        required: true
      },
      {
        name: 'dPeriod',
        label: '%D Period',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 50,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'k', label: '%K', description: 'The %K line of stochastic' },
      { name: 'd', label: '%D', description: 'The %D line of stochastic' }
    ]
  },

  {
    type: 'CCI',
    name: 'Commodity Channel Index',
    description: 'Momentum oscillator',
    category: 'Momentum',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'cci', label: 'CCI', description: 'Commodity Channel Index value' }
    ]
  },

  {
    type: 'ROC',
    name: 'Rate of Change',
    description: 'Price change momentum indicator',
    category: 'Momentum',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 12,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'roc', label: 'ROC', description: 'Rate of Change percentage' }
    ]
  },

  {
    type: 'WILLIAMS_R',
    name: 'Williams %R',
    description: 'Momentum oscillator',
    category: 'Momentum',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'williamsR', label: 'Williams %R', description: 'Williams %R value' }
    ]
  },

  {
    type: 'ADX',
    name: 'Average Directional Index',
    description: 'Trend strength indicator',
    category: 'Trend',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'adx', label: 'ADX', description: 'Average Directional Index value' },
      { name: 'diPlus', label: '+DI', description: 'Positive Directional Indicator' },
      { name: 'diMinus', label: '-DI', description: 'Negative Directional Indicator' }
    ]
  },

  {
    type: 'AROON',
    name: 'Aroon Oscillator',
    description: 'Trend change indicator',
    category: 'Trend',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'aroonUp', label: 'Aroon Up', description: 'Aroon Up line' },
      { name: 'aroonDown', label: 'Aroon Down', description: 'Aroon Down line' },
      { name: 'aroonOsc', label: 'Aroon Oscillator', description: 'Aroon Up - Aroon Down' }
    ]
  },

  {
    type: 'KELTNER',
    name: 'Keltner Channels',
    description: 'Volatility-based channels',
    category: 'Volatility',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
        required: true
      },
      {
        name: 'multiplier',
        label: 'ATR Multiplier',
        type: 'number',
        defaultValue: 2,
        min: 0.1,
        max: 5,
        step: 0.1,
        required: true
      }
    ],
    outputs: [
      { name: 'upperChannel', label: 'Upper Channel', description: 'Upper Keltner channel' },
      { name: 'middleLine', label: 'Middle Line', description: 'EMA middle line' },
      { name: 'lowerChannel', label: 'Lower Channel', description: 'Lower Keltner channel' }
    ]
  },

  {
    type: 'DONCHIAN',
    name: 'Donchian Channels',
    description: 'Breakout indicator using highest high and lowest low',
    category: 'Volatility',
    parameters: [
      {
        name: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'upperChannel', label: 'Upper Channel', description: 'Highest high over period' },
      { name: 'middleLine', label: 'Middle Line', description: 'Average of upper and lower' },
      { name: 'lowerChannel', label: 'Lower Channel', description: 'Lowest low over period' }
    ]
  },

  {
    type: 'PARABOLIC_SAR',
    name: 'Parabolic SAR',
    description: 'Stop and reverse trend indicator',
    category: 'Trend',
    parameters: [
      {
        name: 'step',
        label: 'Step',
        type: 'number',
        defaultValue: 0.02,
        min: 0.01,
        max: 0.1,
        step: 0.01,
        required: true
      },
      {
        name: 'maximum',
        label: 'Maximum',
        type: 'number',
        defaultValue: 0.2,
        min: 0.1,
        max: 1,
        step: 0.01,
        required: true
      }
    ],
    outputs: [
      { name: 'sar', label: 'SAR', description: 'Parabolic SAR value' }
    ]
  },

  {
    type: 'ICHIMOKU',
    name: 'Ichimoku Cloud',
    description: 'Comprehensive trend and momentum indicator',
    category: 'Trend',
    parameters: [
      {
        name: 'tenkanSen',
        label: 'Tenkan-sen Period',
        type: 'number',
        defaultValue: 9,
        min: 1,
        max: 50,
        step: 1,
        required: true
      },
      {
        name: 'kijunSen',
        label: 'Kijun-sen Period',
        type: 'number',
        defaultValue: 26,
        min: 1,
        max: 100,
        step: 1,
        required: true
      },
      {
        name: 'senkouSpanB',
        label: 'Senkou Span B Period',
        type: 'number',
        defaultValue: 52,
        min: 1,
        max: 200,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'tenkanSen', label: 'Tenkan-sen', description: 'Conversion line' },
      { name: 'kijunSen', label: 'Kijun-sen', description: 'Base line' },
      { name: 'senkouSpanA', label: 'Senkou Span A', description: 'Leading span A' },
      { name: 'senkouSpanB', label: 'Senkou Span B', description: 'Leading span B' },
      { name: 'chikouSpan', label: 'Chikou Span', description: 'Lagging span' }
    ]
  },

  {
    type: 'FIBO',
    name: 'Fibonacci Retracement',
    description: 'Fibonacci retracement levels',
    category: 'Support/Resistance',
    parameters: [
      {
        name: 'highPeriod',
        label: 'High Lookback Period',
        type: 'number',
        defaultValue: 50,
        min: 10,
        max: 200,
        step: 1,
        required: true
      },
      {
        name: 'lowPeriod',
        label: 'Low Lookback Period',
        type: 'number',
        defaultValue: 50,
        min: 10,
        max: 200,
        step: 1,
        required: true
      }
    ],
    outputs: [
      { name: 'fib236', label: '23.6% Level', description: 'Fibonacci 23.6% retracement' },
      { name: 'fib382', label: '38.2% Level', description: 'Fibonacci 38.2% retracement' },
      { name: 'fib500', label: '50% Level', description: 'Fibonacci 50% retracement' },
      { name: 'fib618', label: '61.8% Level', description: 'Fibonacci 61.8% retracement' },
      { name: 'fib786', label: '78.6% Level', description: 'Fibonacci 78.6% retracement' }
    ]
  }
];

export const getIndicatorsByCategory = () => {
  const categories: Record<string, IndicatorDefinition[]> = {};
  
  allIndicatorDefinitions.forEach(indicator => {
    const category = indicator.category || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(indicator);
  });
  
  return categories;
};

export const getAllIndicatorDefinition = (type: string): IndicatorDefinition | undefined => {
  return allIndicatorDefinitions.find(def => def.type === type);
};