import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { IndicatorConfig, IndicatorDefinition } from '@/types/strategy';
import { getAllIndicatorDefinition } from '@/data/allIndicatorDefinitions';

interface DynamicIndicatorConfigProps {
  indicator: IndicatorConfig;
  onUpdate: (indicator: IndicatorConfig) => void;
  onDelete: (id: string) => void;
}

export function DynamicIndicatorConfig({ indicator, onUpdate, onDelete }: DynamicIndicatorConfigProps) {
  const [config, setConfig] = useState<IndicatorConfig>(indicator);
  const definition = getAllIndicatorDefinition(indicator.type);

  useEffect(() => {
    onUpdate(config);
  }, [config, onUpdate]);

  if (!definition) {
    return null;
  }

  const handleParameterChange = (paramName: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value
      }
    }));
  };

  const renderParameter = (param: IndicatorDefinition['parameters'][0]) => {
    const currentValue = config.parameters[param.name] ?? param.defaultValue;

    switch (param.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            min={param.min}
            max={param.max}
            step={param.step}
            className="w-full"
          />
        );
      
      case 'select':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleParameterChange(param.name, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${param.label}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) => handleParameterChange(param.name, checked)}
          />
        );
      
      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{definition.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{definition.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(indicator.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {definition.parameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <Label htmlFor={`${indicator.id}-${param.name}`} className="text-sm font-medium">
              {param.label}
              {param.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderParameter(param)}
          </div>
        ))}
        
        {definition.outputs.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Label className="text-sm font-medium text-muted-foreground">Available Outputs:</Label>
            <div className="mt-2 space-y-1">
              {definition.outputs.map((output) => (
                <div key={output.name} className="text-sm">
                  <span className="font-medium">{output.label}</span>
                  <span className="text-muted-foreground ml-2">- {output.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}