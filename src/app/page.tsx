"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SuggestResourceConfigurationInput,
  suggestResourceConfiguration,
} from "@/ai/flows/suggest-resource-configuration";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [applicationName, setApplicationName] = useState("my-app");
  const [replicas, setReplicas] = useState(3);
  const [applicationType, setApplicationType] = useState("web");
  const [generatedYaml, setGeneratedYaml] = useState("");
  const [resourceSuggestion, setResourceSuggestion] = useState<{
    cpu: string;
    memory: string;
    reason: string;
  } | null>(null);

  const handleGenerateYaml = () => {
    const deploymentYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${applicationName}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${applicationName}
  template:
    metadata:
      labels:
        app: ${applicationName}
    spec:
      containers:
        - name: ${applicationName}
          image: nginx:latest
          resources:
            requests:
              cpu: ${resourceSuggestion?.cpu || "100m"}
              memory: ${resourceSuggestion?.memory || "128Mi"}
            limits:
              cpu: ${resourceSuggestion?.cpu || "100m"}
              memory: ${resourceSuggestion?.memory || "128Mi"}
---
apiVersion: v1
kind: Service
metadata:
  name: ${applicationName}-service
spec:
  selector:
    app: ${applicationName}
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
`;

    setGeneratedYaml(deploymentYaml);
  };

  const handleSuggestResources = async () => {
    try {
      const input: SuggestResourceConfigurationInput = {
        applicationType: applicationType,
      };
      const suggestion = await suggestResourceConfiguration(input);
      setResourceSuggestion(suggestion);
    } catch (error) {
      console.error("Error suggesting resources:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4">
      <h1 className="text-2xl font-bold mb-4">KubeGenCLI</h1>
      <Card className="w-full max-w-2xl bg-card text-foreground shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Enter the details to generate Kubernetes YAML files.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="applicationName">Application Name</Label>
            <Input
              id="applicationName"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              className="bg-input border-input text-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="replicas">Number of Replicas</Label>
            <Input
              id="replicas"
              type="number"
              value={replicas}
              onChange={(e) => setReplicas(parseInt(e.target.value))}
              className="bg-input border-input text-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="applicationType">Application Type</Label>
            <Input
              id="applicationType"
              type="text"
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="bg-input border-input text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSuggestResources} className="bg-primary text-primary-foreground hover:bg-primary/80">
              Suggest Resources
            </Button>
            <Button onClick={handleGenerateYaml} className="bg-primary text-primary-foreground hover:bg-primary/80">
              Generate YAML
            </Button>
          </div>
        </CardContent>
      </Card>

      {resourceSuggestion && (
        <Card className="w-full max-w-2xl mt-4 bg-card text-foreground shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Suggested Resources</CardTitle>
            <CardDescription>
              Based on application type, AI suggests the following resources:
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>CPU</Label>
              <Badge>{resourceSuggestion.cpu}</Badge>
            </div>
            <div className="grid gap-2">
              <Label>Memory</Label>
              <Badge>{resourceSuggestion.memory}</Badge>
            </div>
            <div className="grid gap-2">
              <Label>Reason</Label>
              <p>{resourceSuggestion.reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedYaml ? (
        <Card className="w-full max-w-2xl mt-4 bg-card text-foreground shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Generated YAML</CardTitle>
            <CardDescription>
              Preview the generated Kubernetes YAML configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Textarea
                readOnly
                value={generatedYaml}
                className="font-mono bg-background text-foreground"
              />
            </ScrollArea>
          </CardContent>
        </Card>
      ) : null}
       </div>
  );
}
