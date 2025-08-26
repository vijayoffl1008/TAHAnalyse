import { IndicatorDefinition } from '@/types/strategy';

export const indicatorDefinitions: IndicatorDefinition[] = [
  {
    type: 'MA',
    name: 'Moving Average',
    description: 'Simple or Exponential Moving Average',
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
      {
        name: 'ma',
        label: 'Moving Average',
        description: 'The calculated moving average value'
      }
    ]
  },
  {
    type: 'RSI',
    name: 'Relative Strength Index',
    description: 'Momentum oscillator that measures speed and change of price movements',
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
      {
        name: 'rsi',
        label: 'RSI Value',
        description: 'The RSI value between 0 and 100'
      }
    ]
  },
  {
    type: 'MACD',
    name: 'Moving Average Convergence Divergence',
    description: 'Trend-following momentum indicator',
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
      }
    ],
    outputs: [
      {
        name: 'macd',
        label: 'MACD Line',
        description: 'The MACD line (fast EMA - slow EMA)'
      },
      {
        name: 'signal',
        label: 'Signal Line',
        description: 'The signal line (EMA of MACD line)'
      },
      {
        name: 'histogram',
        label: 'Histogram',
        description: 'The histogram (MACD - Signal)'
      }
    ]
  },
  {
    type: 'BB',
    name: 'Bollinger Bands',
    description: 'Volatility bands placed above and below a moving average',
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
      }
    ],
    outputs: [
      {
        name: 'upperBand',
        label: 'Upper Band',
        description: 'The upper Bollinger band'
      },
      {
        name: 'middleBand',
        label: 'Middle Band',
        description: 'The middle band (moving average)'
      },
      {
        name: 'lowerBand',
        label: 'Lower Band',
        description: 'The lower Bollinger band'
      }
    ]
  },
  {
    type: 'STOCH',
    name: 'Stochastic Oscillator',
    description: 'Momentum indicator comparing closing price to price range',
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
      },
      {
        name: 'smooth',
        label: 'Smooth',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 1,
        required: true
      },
      {
        name: 'overbought',
        label: 'Overbought Level',
        type: 'number',
        defaultValue: 80,
        min: 50,
        max: 95,
        step: 1,
        required: false
      },
      {
        name: 'oversold',
        label: 'Oversold Level',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 50,
        step: 1,
        required: false
      }
    ],
    outputs: [
      {
        name: 'k',
        label: '%K',
        description: 'The %K line of stochastic'
      },
      {
        name: 'd',
        label: '%D',
        description: 'The %D line of stochastic'
      }
    ]
  },
  {
    type: 'ADX',
    name: 'Average Directional Index',
    description: 'Measures the strength of a trend',
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
      },
      {
        name: 'trendThreshold',
        label: 'Strong Trend Threshold',
        type: 'number',
        defaultValue: 25,
        min: 10,
        max: 50,
        step: 1,
        required: false
      }
    ],
    outputs: [
      {
        name: 'adx',
        label: 'ADX',
        description: 'The ADX value indicating trend strength'
      },
      {
        name: 'diPlus',
        label: '+DI',
        description: 'Positive directional indicator'
      },
      {
        name: 'diMinus',
        label: '-DI',
        description: 'Negative directional indicator'
      }
    ]
  }
];

export const getIndicatorDefinition = (type: string): IndicatorDefinition | undefined => {
  return indicatorDefinitions.find(def => def.type === type);
};