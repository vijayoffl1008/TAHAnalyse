import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Layers, TrendingUp } from 'lucide-react';

interface ViewIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicator: any;
}

export function ViewIndicatorDialog({ open, onOpenChange, indicator }: ViewIndicatorDialogProps) {
  if (!indicator) return null;

  const isCustom = indicator.isCustom;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isCustom ? (
                <Calculator className="w-6 h-6 text-primary" />
              ) : (
                <TrendingUp className="w-6 h-6" />
              )}
              {indicator.name}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge variant={isCustom ? "default" : "outline"}>
                {isCustom ? 'Custom' : 'Predefined'}
              </Badge>
              <Badge variant="outline">{indicator.category}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{indicator.description}</p>
            </CardContent>
          </Card>

          {/* Custom Indicator Details */}
          {isCustom && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Indicator Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {indicator.type === 'combination' ? (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Combination Indicator</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4" />
                        <span>Custom Calculation</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Base Indicators for Combination */}
              {indicator.type === 'combination' && indicator.baseIndicators && (
                <Card>
                  <CardHeader>
                    <CardTitle>Base Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {indicator.baseIndicators.map((baseType: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {baseType}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Formula for Calculation */}
              {indicator.type === 'calculation' && indicator.formula && (
                <Card>
                  <CardHeader>
                    <CardTitle>Formula</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                      {indicator.formula}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Creation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm">Created</h4>
                      <p className="text-sm text-muted-foreground">{indicator.createdAt}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Last Updated</h4>
                      <p className="text-sm text-muted-foreground">{indicator.updatedAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Parameters */}
          {indicator.parameters && Object.keys(indicator.parameters).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(indicator.parameters).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                      <Badge variant="outline">{String(value)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Predefined Indicator Details */}
          {!isCustom && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm">Type</h4>
                    <p className="text-sm text-muted-foreground">{indicator.type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Category</h4>
                    <p className="text-sm text-muted-foreground capitalize">{indicator.category}</p>
                  </div>
                </div>
                
                {indicator.outputs && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Outputs</h4>
                    <div className="flex flex-wrap gap-2">
                      {indicator.outputs.map((output: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {output}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {indicator.interpretation && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Interpretation</h4>
                    <p className="text-sm text-muted-foreground">{indicator.interpretation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Usage in Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isCustom ? (
                  <p className="text-sm text-muted-foreground">
                    This custom indicator can be used in strategy creation to provide {' '}
                    {indicator.type === 'combination' ? 
                      'combined signals from multiple technical indicators' : 
                      'custom calculated values based on price and volume data'
                    }.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This indicator is commonly used for {indicator.category} analysis and can be 
                    integrated into trading strategies for signal generation and market analysis.
                  </p>
                )}
                
                <Separator className="my-3" />
                
                <div className="text-xs text-muted-foreground">
                  <strong>Note:</strong> This indicator can be used in the Enhanced Strategy Builder 
                  to create entry and exit conditions for your trading strategies.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}