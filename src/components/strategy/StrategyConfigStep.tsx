import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StrategyType } from '@/types/strategy';

interface StrategyConfigStepProps {
  config: {
    name: string;
    description: string;
    type: StrategyType;
    duration: 'intraday' | 'positional';
    direction: 'buy' | 'sell' | 'both';
  };
  onConfigChange: (config: {
    name: string;
    description: string;
    type: StrategyType;
    duration: 'intraday' | 'positional';
    direction: 'buy' | 'sell' | 'both';
  }) => void;
}

export function StrategyConfigStep({ config, onConfigChange }: StrategyConfigStepProps) {
  const updateConfig = (field: string, value: string) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Strategy Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy-name">Strategy Name *</Label>
            <Input
              id="strategy-name"
              placeholder="Enter strategy name"
              value={config.name}
              onChange={(e) => updateConfig('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy-description">Description *</Label>
            <Textarea
              id="strategy-description"
              placeholder="Describe your strategy logic and goals"
              value={config.description}
              onChange={(e) => updateConfig('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={config.duration} onValueChange={(value) => updateConfig('duration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intraday">Intraday</SelectItem>
                  <SelectItem value="positional">Positional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={config.direction} onValueChange={(value) => updateConfig('direction', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy Only</SelectItem>
                  <SelectItem value="sell">Sell Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Strategy Type</Label>
              <Select value={config.type} onValueChange={(value) => updateConfig('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trend_following">Trend Following</SelectItem>
                  <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                  <SelectItem value="momentum">Momentum</SelectItem>
                  <SelectItem value="breakout">Breakout</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}