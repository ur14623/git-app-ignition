import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubnodeVersionWithParametersByNodeVersion } from "@/services/subnodeService";

interface ParameterValuesTableProps {
  selectedVersion: SubnodeVersionWithParametersByNodeVersion | null;
}

export function ParameterValuesTable({ selectedVersion }: ParameterValuesTableProps) {
  if (!selectedVersion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parameter Values</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No version selected</p>
        </CardContent>
      </Card>
    );
  }

  // Check if we have parameter values by node version (detailed view)
  if (selectedVersion.parameter_values_by_nodeversion && selectedVersion.parameter_values_by_nodeversion.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parameter Values by Node Version</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={selectedVersion.parameter_values_by_nodeversion[0].node_version.toString()}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${selectedVersion.parameter_values_by_nodeversion.length}, 1fr)` }}>
              {selectedVersion.parameter_values_by_nodeversion.map((versionData) => (
                <TabsTrigger 
                  key={versionData.node_version} 
                  value={versionData.node_version.toString()}
                >
                  Node Version {versionData.node_version}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {selectedVersion.parameter_values_by_nodeversion.map((versionData) => (
              <TabsContent key={versionData.node_version} value={versionData.node_version.toString()}>
                {versionData.parameter_values.length === 0 ? (
                  <p className="text-muted-foreground">No parameter values found for node version {versionData.node_version}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Default Value</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versionData.parameter_values.map((param, index) => (
                        <TableRow key={`${versionData.node_version}-${param.parameter_key}-${index}`}>
                          <TableCell className="font-medium">{param.parameter_key}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{param.value}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{param.default_value}</Badge>
                          </TableCell>
                          <TableCell>{param.datatype}</TableCell>
                          <TableCell>
                            <Badge variant={param.source === 'version' ? 'default' : 'secondary'}>
                              {param.source}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Fallback to simple parameter values (list view)
  const parameterEntries = selectedVersion?.parameter_values 
    ? Array.isArray(selectedVersion.parameter_values) 
      ? selectedVersion.parameter_values
      : Object.entries(selectedVersion.parameter_values).map(([key, value]) => ({ 
          id: key, 
          parameter_key: key, 
          value: String(value || '') 
        }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameter Values (Version {selectedVersion?.version || 'Unknown'})</CardTitle>
      </CardHeader>
      <CardContent>
        {parameterEntries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter Key</TableHead>
                <TableHead>Parameter Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameterEntries.map((param) => (
                <TableRow key={param.id || param.parameter_key}>
                  <TableCell className="font-medium">
                    {param.parameter_key}
                  </TableCell>
                  <TableCell className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">
                    {param.value ? String(param.value) : <span className="text-muted-foreground italic">Empty</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No parameters defined for this version
          </div>
        )}
      </CardContent>
    </Card>
  );
}