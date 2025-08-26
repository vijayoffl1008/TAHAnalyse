import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Strategy } from '@/types/strategy';
import { getAllIndicatorDefinition } from '@/data/allIndicatorDefinitions';

interface ViewStrategyDialogProps {
  strategy: Strategy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewStrategyDialog({ strategy, open, onOpenChange }: ViewStrategyDialogProps) {
  if (!strategy) return null;

  const getIndicatorName = (type: string) => {
    const definition = getAllIndicatorDefinition(type);
    return definition?.name || type;
  };

  const getOperatorLabel = (operator: string) => {
    const operatorLabels: Record<string, string> = {
      'greater_than': 'is greater than',
      'less_than': 'is less than',
      'equal': 'equals',
      'crosses_above': 'crosses above',
      'crosses_below': 'crosses below',
      'between': 'is between'
    };
    return operatorLabels[operator] || operator.replace('_', ' ');
  };

  const getReverseOperator = (operator: string) => {
    const reverseMap: Record<string, string> = {
      'greater_than': 'less_than',
      'less_than': 'greater_than',
      'crosses_above': 'crosses_below',
      'crosses_below': 'crosses_above',
      'equal': 'equal',
      'between': 'between'
    };
    return reverseMap[operator] || operator;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{strategy.name}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{strategy.type}</Badge>
              <Badge variant={strategy.duration === 'intraday' ? 'default' : 'secondary'}>
                {strategy.duration}
              </Badge>
              <Badge variant="outline">{strategy.direction.toUpperCase()}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{strategy.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium">Type</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {strategy.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Duration</h4>
                  <p className="text-sm text-muted-foreground capitalize">{strategy.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium">Direction</h4>
                  <p className="text-sm text-muted-foreground uppercase">{strategy.direction}</p>
                </div>
                <div>
                  <h4 className="font-medium">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(strategy.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Indicators ({strategy.indicators.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategy.indicators.map((indicator) => (
                  <div key={indicator.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{getIndicatorName(indicator.type)}</h4>
                    <div className="mt-2 space-y-1">
                      {Object.entries(indicator.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Entry Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Entry Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strategy.entryConditions.reverseSellFromBuy && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium">
                    🔄 Auto-Reverse Enabled: Sell conditions are automatically generated by reversing buy conditions
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Buy Conditions */}
                <div>
                  <h4 className="font-medium mb-3">Buy Entry Conditions</h4>
                  {strategy.entryConditions.buy.map((group, groupIndex) => (
                    <div key={group.id} className="space-y-2 p-3 border rounded-lg">
                      <h5 className="text-sm font-medium">Group {groupIndex + 1}</h5>
                      {group.conditions.map((condition, condIndex) => (
                        <div key={condition.id} className="text-sm p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <div className="font-medium text-blue-900 mb-1">Condition {condIndex + 1}:</div>
                          <div className="text-gray-700">
                            <span className="font-medium">
                              {condition.leftOperand.type === 'indicator' 
                                ? `${condition.leftOperand.indicatorId} (${condition.leftOperand.value})` 
                                : `Value: ${condition.leftOperand.value}`
                              }
                            </span>
                            <span className="mx-2 text-blue-600 font-medium">{getOperatorLabel(condition.operator)}</span>
                            <span className="font-medium">
                              {condition.rightOperand.type === 'indicator' 
                                ? `${condition.rightOperand.indicatorId} (${condition.rightOperand.value})`
                                : `Value: ${condition.rightOperand.value}`
                              }
                            </span>
                          </div>
                          {condIndex < group.conditions.length - 1 && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {condition.logicalOperator || 'AND'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Sell Conditions */}
                <div>
                  <h4 className="font-medium mb-3">Sell Entry Conditions</h4>
                  
                  {/* Show auto-generated reversed conditions */}
                  {strategy.entryConditions.reverseSellFromBuy && strategy.entryConditions.buy.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="p-2 bg-orange-100 border border-orange-200 rounded">
                        <h5 className="text-sm font-medium text-orange-800">🔄 Auto-Generated (Reversed from Buy):</h5>
                      </div>
                      {strategy.entryConditions.buy.map((group, groupIndex) => (
                        <div key={`reversed-${group.id}`} className="space-y-2 p-3 border border-orange-300 rounded-lg bg-orange-50">
                          <h5 className="text-sm font-medium text-orange-800">Reversed Group {groupIndex + 1}</h5>
                          {group.conditions.map((condition, condIndex) => (
                            <div key={condition.id} className="text-sm p-3 bg-white border-l-4 border-orange-500 rounded">
                              <div className="font-medium text-orange-900 mb-1">Reversed Condition {condIndex + 1}:</div>
                              <div className="text-gray-700">
                                <span className="font-medium">
                                  {condition.leftOperand.type === 'indicator' 
                                    ? `${condition.leftOperand.indicatorId} (${condition.leftOperand.value})` 
                                    : `Value: ${condition.leftOperand.value}`
                                  }
                                </span>
                                <span className="mx-2 text-orange-600 font-medium">
                                  {getOperatorLabel(getReverseOperator(condition.operator))}
                                </span>
                                <span className="font-medium">
                                  {condition.rightOperand.type === 'indicator' 
                                    ? `${condition.rightOperand.indicatorId} (${condition.rightOperand.value})`
                                    : `Value: ${condition.rightOperand.value}`
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show manual sell conditions */}
                  {strategy.entryConditions.sell.length > 0 && (
                    <div className="space-y-2">
                      <div className="p-2 bg-red-100 border border-red-200 rounded">
                        <h5 className="text-sm font-medium text-red-800">
                          {strategy.entryConditions.reverseSellFromBuy ? '➕ Additional Custom:' : '📝 Manual Conditions:'}
                        </h5>
                      </div>
                      {strategy.entryConditions.sell.map((group, groupIndex) => (
                        <div key={group.id} className="space-y-2 p-3 border border-red-300 rounded-lg bg-red-50">
                          <h5 className="text-sm font-medium text-red-800">
                            {strategy.entryConditions.reverseSellFromBuy ? `Custom Group ${groupIndex + 1}` : `Group ${groupIndex + 1}`}
                          </h5>
                          {group.conditions.map((condition, condIndex) => (
                            <div key={condition.id} className="text-sm p-3 bg-white border-l-4 border-red-500 rounded">
                              <div className="font-medium text-red-900 mb-1">Condition {condIndex + 1}:</div>
                              <div className="text-gray-700">
                                <span className="font-medium">
                                  {condition.leftOperand.type === 'indicator' 
                                    ? `${condition.leftOperand.indicatorId} (${condition.leftOperand.value})` 
                                    : `Value: ${condition.leftOperand.value}`
                                  }
                                </span>
                                <span className="mx-2 text-red-600 font-medium">{getOperatorLabel(condition.operator)}</span>
                                <span className="font-medium">
                                  {condition.rightOperand.type === 'indicator' 
                                    ? `${condition.rightOperand.indicatorId} (${condition.rightOperand.value})`
                                    : `Value: ${condition.rightOperand.value}`
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!strategy.entryConditions.reverseSellFromBuy && strategy.entryConditions.sell.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                      No sell entry conditions configured
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exit Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Exit Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Buy Exit Conditions */}
                <div>
                  <h4 className="font-medium mb-3">Buy Exit Conditions</h4>
                  {strategy.exitConditions.buy
                    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                    .map((condition) => (
                    <div key={condition.id} className="p-3 border rounded-lg mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant={condition.type === 'SL' ? 'destructive' : 'default'}>
                          {condition.type}
                        </Badge>
                        <Badge variant="outline">Priority {condition.priority}</Badge>
                      </div>
                      {condition.type === 'SL' && (
                        <p className="text-sm">Stop Loss: {condition.percentage}%</p>
                      )}
                      {condition.type === 'TGT' && (
                        <p className="text-sm">Target: {condition.percentage}%</p>
                      )}
                      {condition.type === 'SAR' && (
                        <p className="text-sm">
                          Parabolic SAR {condition.sarSettings?.useOnlySL ? '(SL only)' : ''}
                        </p>
                      )}
                      {condition.type === 'CONDITION' && (
                        <div className="space-y-2 mt-2">
                          {/* Show reversed conditions - only show conditions with reversed_ prefix */}
                          {condition.conditions && condition.conditions.length > 0 && (
                            <div className="space-y-1">
                              {(() => {
                                // Separate reversed conditions from regular conditions
                                const reversedConditions = condition.conditions.filter(cond => cond.id.startsWith('reversed_'));
                                const regularConditions = condition.conditions.filter(cond => !cond.id.startsWith('reversed_'));
                                
                                return (
                                  <>
                                    {/* Show reversed conditions */}
                                    {reversedConditions.length > 0 && (
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-orange-600">🔄 Auto-Generated (Reversed from Entry):</p>
                                        {reversedConditions.map((cond, idx) => (
                                          <div key={cond.id} className="text-xs p-2 bg-orange-50 border-l-2 border-orange-400 rounded">
                                            {cond.leftOperand.type === 'indicator' 
                                              ? `${cond.leftOperand.indicatorId} (${cond.leftOperand.value})` 
                                              : `Value: ${cond.leftOperand.value}`
                                            } {' '}
                                            <span className="font-medium text-orange-700">{getOperatorLabel(cond.operator)}</span> {' '}
                                            {cond.rightOperand.type === 'indicator' 
                                              ? `${cond.rightOperand.indicatorId} (${cond.rightOperand.value})`
                                              : `Value: ${cond.rightOperand.value}`
                                            }
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Show regular conditions as manual if they don't have reversed_ prefix */}
                                    {regularConditions.length > 0 && (
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-green-600">📝 Manual Exit Conditions:</p>
                                        {regularConditions.map((cond, idx) => (
                                          <div key={cond.id} className="text-xs p-2 bg-green-50 border-l-2 border-green-400 rounded">
                                            {cond.leftOperand.type === 'indicator' 
                                              ? `${cond.leftOperand.indicatorId} (${cond.leftOperand.value})` 
                                              : `Value: ${cond.leftOperand.value}`
                                            } {' '}
                                            <span className="font-medium text-green-700">{getOperatorLabel(cond.operator)}</span> {' '}
                                            {cond.rightOperand.type === 'indicator' 
                                              ? `${cond.rightOperand.indicatorId} (${cond.rightOperand.value})`
                                              : `Value: ${cond.rightOperand.value}`
                                            }
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                          
                          {/* Show extra custom conditions */}
                          {condition.extraConditions && condition.extraConditions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-blue-600">➕ Additional Custom Conditions:</p>
                              {condition.extraConditions.map((cond, idx) => (
                                <div key={cond.id} className="text-xs p-2 bg-blue-50 border-l-2 border-blue-400 rounded">
                                  {cond.leftOperand.type === 'indicator' 
                                    ? `${cond.leftOperand.indicatorId} (${cond.leftOperand.value})` 
                                    : `Value: ${cond.leftOperand.value}`
                                  } {' '}
                                  <span className="font-medium text-blue-700">{getOperatorLabel(cond.operator)}</span> {' '}
                                  {cond.rightOperand.type === 'indicator' 
                                    ? `${cond.rightOperand.indicatorId} (${cond.rightOperand.value})`
                                    : `Value: ${cond.rightOperand.value}`
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {(!condition.conditions || condition.conditions.length === 0) && 
                           (!condition.extraConditions || condition.extraConditions.length === 0) && (
                            <p className="text-xs text-muted-foreground">No conditions configured</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sell Exit Conditions */}
                <div>
                  <h4 className="font-medium mb-3">Sell Exit Conditions</h4>
                  {strategy.exitConditions.sell
                    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                    .map((condition) => (
                    <div key={condition.id} className="p-3 border rounded-lg mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant={condition.type === 'SL' ? 'destructive' : 'default'}>
                          {condition.type}
                        </Badge>
                        <Badge variant="outline">Priority {condition.priority}</Badge>
                      </div>
                      {condition.type === 'SL' && (
                        <p className="text-sm">Stop Loss: {condition.percentage}%</p>
                      )}
                      {condition.type === 'TGT' && (
                        <p className="text-sm">Target: {condition.percentage}%</p>
                      )}
                      {condition.type === 'SAR' && (
                        <p className="text-sm">
                          Parabolic SAR {condition.sarSettings?.useOnlySL ? '(SL only)' : ''}
                        </p>
                      )}
                      {condition.type === 'CONDITION' && (
                        <div className="space-y-2 mt-2">
                          {/* Show reversed conditions */}
                          {condition.conditions && condition.conditions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-orange-600">🔄 Auto-Generated (Reversed):</p>
                              {condition.conditions.map((cond, idx) => (
                                <div key={cond.id} className="text-xs p-2 bg-orange-50 border-l-2 border-orange-400 rounded">
                                  {cond.leftOperand.type === 'indicator' 
                                    ? `${cond.leftOperand.indicatorId} (${cond.leftOperand.value})` 
                                    : `Value: ${cond.leftOperand.value}`
                                  } {' '}
                                  <span className="font-medium text-orange-700">{getOperatorLabel(cond.operator)}</span> {' '}
                                  {cond.rightOperand.type === 'indicator' 
                                    ? `${cond.rightOperand.indicatorId} (${cond.rightOperand.value})`
                                    : `Value: ${cond.rightOperand.value}`
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Show extra custom conditions */}
                          {condition.extraConditions && condition.extraConditions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-blue-600">➕ Custom Conditions:</p>
                              {condition.extraConditions.map((cond, idx) => (
                                <div key={cond.id} className="text-xs p-2 bg-blue-50 border-l-2 border-blue-400 rounded">
                                  {cond.leftOperand.type === 'indicator' 
                                    ? `${cond.leftOperand.indicatorId} (${cond.leftOperand.value})` 
                                    : `Value: ${cond.leftOperand.value}`
                                  } {' '}
                                  <span className="font-medium text-blue-700">{getOperatorLabel(cond.operator)}</span> {' '}
                                  {cond.rightOperand.type === 'indicator' 
                                    ? `${cond.rightOperand.indicatorId} (${cond.rightOperand.value})`
                                    : `Value: ${cond.rightOperand.value}`
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {(!condition.conditions || condition.conditions.length === 0) && 
                           (!condition.extraConditions || condition.extraConditions.length === 0) && (
                            <p className="text-xs text-muted-foreground">No conditions configured</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Re-entry Settings */}
          {strategy.reentrySettings.type !== 'none' && (
            <Card>
              <CardHeader>
                <CardTitle>Re-entry Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{strategy.reentrySettings.type.replace('_', ' ')}</span>
                  </div>
                  {strategy.reentrySettings.maxReentries && (
                    <div className="flex justify-between">
                      <span className="font-medium">Max Re-entries:</span>
                      <span>{strategy.reentrySettings.maxReentries}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Scenarios */}
          {strategy.specialScenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Special Scenarios ({strategy.specialScenarios.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategy.specialScenarios.map((scenario) => (
                    <div key={scenario.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{scenario.actions.type}</Badge>
                        {scenario.applicableFor.map((duration) => (
                          <Badge key={duration} variant="secondary" className="text-xs">
                            {duration}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}